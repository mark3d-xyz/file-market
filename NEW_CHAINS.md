When adding a new chain

* add cfg, .env files on server
* add compose and edit workflow
* change Admin address in PublicCollection and FileMarketCollectionV2
* deploy contracts
* test if logs are empty
* add A record
* add certs
* add nginx cfg
* push 1 time (will break because of missing postgres)
* edit some file like readme in EVERY service
* push second time (if fails repeat prev step and push again till success)
* stop service, add redis key (indexer-redis) "last_block:<mode>" for last block number, start service
* add public collection record in db `change address and owner`
```sql
INSERT INTO collections(address, creator, owner, name, token_id, meta_uri, description, image, block_number)
VALUES (
        lower('0x1Fd27571fc7db6F4773aa9a1f0dBb61EDf786762'),
        lower('0x29957549fcfdd278C72D92721A263C57F603663b'),
        lower('0x29957549fcfdd278C72D92721A263C57F603663b'),
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
    for i in $(seq 1 10); do redis-cli SADD "sequencer.{$address}" $i; done
```
