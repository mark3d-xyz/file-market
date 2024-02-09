mod helpers;
mod structs;

use helpers::{
    add_in_set, call_late_decision, decrypt_file, decrypt_password, fetch_file, get_block_no_extra,
    get_collection_creation_event, get_contract, get_events, get_latest_block_num_no_extra
};
use openssl::rsa::Rsa;
use redis::{aio::Connection, AsyncCommands, Client};
use secp256k1::SecretKey;
use std::{collections::HashSet, env, error::Error, str::FromStr};
use structs::OraculConf;
use web3::types::H160;
use std::{thread, time::Duration};
use env_logger;

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    env_logger::init();
    dotenvy::dotenv().expect("Failed to read .env file");

    let eth_api_url_to_log = env::var("ETH_API_URL").expect("env err");
    println!("eth api: {eth_api_url_to_log}");

    let mut con: Connection = Client::open(env::var("REDIS_CON").expect("redis env err"))?
        .get_tokio_connection()
        .await?;

    let mut set: HashSet<String> = con.smembers("collections").await?;

    let conf = OraculConf {
        eth_api_url: env::var("ETH_API_URL").expect("env err"),
        mark_3d_collection_contract: get_contract("MARK_3D_COLLECTION_PATH").await,
        fraud_decider_web2_contract: get_contract("FRAUD_DECIDER_WEB2_PATH").await,
        fraud_decider_web2_address: {
            let mut addr = env::var("FRAUD_DECIDER_WEB2_ADDRESS")
                .expect("env err")
                .to_lowercase();
            if !addr.starts_with("0x") {
                addr = format!("0x{}", addr);
            }
            addr
        },
        mark_3d_access_token_contract: get_contract("MARK_3D_ACCESS_TOKEN_PATH").await,
        mark_3d_access_token_address: {
            let mut addr = env::var("MARK_3D_ACCESS_TOKEN_ADDRESS")
                .expect("env err")
                .to_lowercase();
            if !addr.starts_with("0x") {
                addr = format!("0x{}", addr);
            }
            addr
        },
        fraud_decider_web2_key: SecretKey::from_str(
            &env::var("FRAUD_DECIDER_WEB2_KEY").expect("env err"),
        )
        .expect("secret key create err"),
    };

    let transport = web3::transports::Http::new(&conf.eth_api_url).unwrap();
    let transport2 = transport.clone();
    let web3 = web3::Web3::new(transport);
    let mut old_block_num: u64 = match get_latest_block_num_no_extra(&transport2).await {
        Ok(n) => n,
        Err(e) => panic!("{}", e),
    };

    let upgraded_fraud_decider_web2_contract = web3::contract::Contract::new(
        web3.eth(),
        H160::from_str(&conf.fraud_decider_web2_address).unwrap(),
        conf.fraud_decider_web2_contract.clone(),
    );

    // TransferFraudReported listening
    loop {
        thread::sleep(Duration::from_millis(2500));
        // get latest block
        let new_block_num: u64 = match get_latest_block_num_no_extra(&transport2).await {
            Ok(n) => {
                if n == old_block_num {
                    continue;
                }
                n
            }
            Err(e) => {
                println!("get latest block num error: {e}");
                continue;
            }
        };

        // blocks enumeration (from old to latest)
        for i in old_block_num + 1..=new_block_num {
            let block = match get_block_no_extra(i, &transport2).await {
                Ok(b) => b,
                Err(e) => {
                    println!("get block error: {e}");
                    continue;
                }
            };

            // TX enumeration
            for tx in block.transactions {
                let to = format!(
                    "0x{:x}",
                    match tx.to {
                        Some(to) => to,
                        None => {
                            continue;
                        }
                    }
                );

                if to == conf.mark_3d_access_token_address {
                    let c_c_event = match get_collection_creation_event(
                        tx.hash,
                        &web3,
                        &conf.mark_3d_access_token_contract,
                    )
                    .await
                    {
                        Ok(e) => e,
                        Err(e) => {
                            println!("get event logs error: {e}");
                            continue;
                        }
                    };

                    println!("new collection: {:?}", c_c_event.instance);
                    add_in_set(&mut con, c_c_event.instance, &mut set).await?;
                    continue;
                } else if !set.contains(&to) {
                    continue;
                }

                println!("collection event");
                let (_report_flag, report) =
                    match get_events(
                    tx.hash,
                    &web3,
                    &conf.mark_3d_collection_contract,
                        &conf.fraud_decider_web2_contract).await {
                    Ok(events) => events,
                    Err(e) => {
                        println!("parse events failed: {e}");
                        continue;
                    }
                };
                println!("fraud events: {:?} {:?}", _report_flag, report);

                let private_key = match Rsa::private_key_from_der(&report.private_key) {
                    Ok(k) => k,
                    Err(_) => {
                        println!("not approved, because invalid private key");
                        match call_late_decision(
                            &transport2,
                            &upgraded_fraud_decider_web2_contract,
                            false,
                            &report,
                            &conf.fraud_decider_web2_key,
                        )
                        .await
                        {
                            Ok(tx) => {
                                println!("{tx:#?}");
                                continue;
                            }
                            Err(e) => {
                                println!("call lateDecision error: {e}");
                                continue;
                            }
                        }
                    }
                };

                let public_key = match private_key.public_key_to_der_pkcs1() {
                    Ok(key) => key,
                    Err(_) => continue,
                };

                let are_keys_equal = report.public_key == public_key;

                if !are_keys_equal {
                    println!("not approved, because of unmatching keys");
                    match call_late_decision(
                        &transport2,
                        &upgraded_fraud_decider_web2_contract,
                        false,
                        &report,
                        &conf.fraud_decider_web2_key,
                    )
                    .await
                    {
                        Ok(tx) => {
                            println!("{tx:#?}");
                            continue;
                        }
                        Err(e) => {
                            println!("call lateDecision error: {e}");
                            continue;
                        }
                    }
                }

                // Если есть совпадение ключей, то пытаемся расшифровать пароль.
                // Если удачно (под удачностью подразумевается, что код не свалился с ошибкой), то идем к следующему шагу.
                let decrypted_password = match decrypt_password(&private_key, &report) {
                    Ok(p) => p,
                    Err(_) => {
                        println!("approved, because password decryption failed");
                        match call_late_decision(
                            &transport2,
                            &upgraded_fraud_decider_web2_contract,
                            true,
                            &report,
                            &conf.fraud_decider_web2_key,
                        )
                        .await
                        {
                            Ok(tx) => {
                                println!("{tx:#?}");
                                continue;
                            }
                            Err(e) => {
                                println!("call lateDecision error: {e}");
                                continue;
                            }
                        }
                    }
                };

                // Стягивание файла из ipfs
                let hidden_file: Vec<u8> = match fetch_file(&report).await {
                    Ok(f) => f,
                    Err(_) => {
                        println!("approved, because of invalid hidden file");
                        match call_late_decision(
                            &transport2,
                            &upgraded_fraud_decider_web2_contract,
                            true,
                            &report,
                            &conf.fraud_decider_web2_key,
                        )
                        .await
                        {
                            Ok(tx) => {
                                println!("{tx:#?}");
                                continue;
                            }
                            Err(e) => {
                                println!("call lateDecision error: {e}");
                                continue;
                            }
                        }
                    }
                };

                // Расшифровать файл с помощью пароля
                // need: hidden file, decrypted password
                let hash_matched = match decrypt_file(&hidden_file, &decrypted_password) {
                    Ok(res) => res,
                    Err(_) => {
                        println!("approved, because file decryption failed");
                        match call_late_decision(
                            &transport2,
                            &upgraded_fraud_decider_web2_contract,
                            true,
                            &report,
                            &conf.fraud_decider_web2_key,
                        )
                        .await
                        {
                            Ok(tx) => {
                                println!("{tx:#?}");
                                continue;
                            }
                            Err(e) => {
                                println!("call lateDecision error: {e}");
                                continue;
                            }
                        }
                    }
                };
                println!("hash matched: {:?}", hash_matched);
                match call_late_decision(
                    &transport2,
                    &upgraded_fraud_decider_web2_contract,
                    !hash_matched,
                    &report,
                    &conf.fraud_decider_web2_key,
                )
                .await
                {
                    Ok(tx) => {
                        println!("lateDecision: {tx:#?}");
                        continue;
                    }
                    Err(e) => {
                        println!("call lateDecision error: {e}");
                        continue;
                    }
                }
            }

            // prepare next loop step
            old_block_num = new_block_num;
        }

        tokio::time::sleep(tokio::time::Duration::from_millis(200)).await;
    }
}