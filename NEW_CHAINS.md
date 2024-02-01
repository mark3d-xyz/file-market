when adding new chain

* add redis key (indexer-redis) "last_block:<mode>"
* add public collection record in db
```sql
INSERT INTO collections(address, creator, owner, name, token_id, meta_uri, description, image, block_number)
VALUES (
        lower('0x61e6453AA67feb577946eC9669Ed21eda2666192'),
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