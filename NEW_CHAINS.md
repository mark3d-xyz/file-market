When adding a new chain

* Contracts
  * add .{`network`}-secret
  * add .{`network`}-secret to gitignore
  * add {`network`} to hardhat networks and add cfg
  * check logic for this network in deploy-full
  * change Admin address in PublicCollection and FileMarketCollectionV2
  * deploy contracts
  * test if logs are empty
* Add
  * multiChanConfig
  * indexer cfg
  * .env files on server
  * compose 
* edit workflow
* add A record in Cloudflare
* add certs
* add nginx cfg
* Push
  * edit some file (like readme) in EVERY service to trigger every rebuild 
  * push (will break because of missing postgres)
  * re-run jobs until success
* Server
  * stop service, add redis key (indexer-redis) "last_block:<mode>" for last block number, start service
  * add public collection record in db `change address and owner`
  ```sql
  INSERT INTO collections(address, creator, owner, name, token_id, meta_uri, description, image, block_number)
  VALUES (
          lower('address'),
          lower('owner'),
          lower('owner'),
          'FileMarket',
          '0',
          'ipfs://QmZm4oLQoyXZLJzioYCjGtGXGHqsscKvWJmWXMVhTXZtc9',
          'This is a publicly accessible default collection within FileMarket, available for all users. Any authorized user has the ability to contribute their EFT files to this collection. If the owner of an EFT does not specifically choose a personal collection, it automatically becomes part of this default collection. It is important to note that the EFTs created and placed in this collection are not owned by FileMarket Labs, and the company does not accept any responsibility or provide guarantees concerning the content of these EFT files.',
          'ipfs://QmaetjyGp3GN18FcJWZ6X315Ri8Cq8ZGMMCc4iJjEnhUoJ',
          1
         );
  ```
  * add token ids to redis for public collection sequencer. `change address and range`
  ```bash
      for i in $(seq 1 1000); do redis-cli SADD "sequencer.${lower_address}" $i; done
  ```
  * add public collection address to oracle redis
  ```bash
  docker exec -it file-market-${network}-oracle-redis-1 redis-cli SADD "collections" "${lower_address}"
  ```