run:
	go run cmd/app/main.go -cfg configs/local

build-contracts:
	mkdir -p contracts/build
	(cd ../sol-contracts && yarn && yarn hardhat compile && cp -r artifacts/contracts/* ../indexer/contracts/build)
	mkdir -p contracts/access_token
	mkdir -p contracts/collection
	mkdir -p contracts/likeEmitter
	mkdir -p contracts/publicCollection
	mkdir -p contracts/filebunniesCollection
	mkdir -p contracts/exchange
	jq ".abi" contracts/build/Mark3dAccessTokenV2.sol/Mark3dAccessTokenV2.json > contracts/build/Mark3dAccessTokenV2.sol/Mark3dAccessTokenV2.abi
	jq ".abi" contracts/build/FilemarketCollectionV2.sol/FilemarketCollectionV2.json > contracts/build/FilemarketCollectionV2.sol/FilemarketCollectionV2.abi
	jq ".abi" contracts/build/PublicCollection.sol/PublicCollection.json > contracts/build/PublicCollection.sol/PublicCollection.abi
	jq ".abi" contracts/build/FileBunniesCollection.sol/FileBunniesCollection.json > contracts/build/FileBunniesCollection.sol/FileBunniesCollection.abi
	jq ".abi" contracts/build/FilemarketExchangeV2.sol/FilemarketExchangeV2.json > contracts/build/FilemarketExchangeV2.sol/FilemarketExchangeV2.abi
	jq ".abi" contracts/build/LikeEmitter.sol/LikeEmitter.json > contracts/build/LikeEmitter.sol/LikeEmitter.abi
	abigen --abi contracts/build/Mark3dAccessTokenV2.sol/Mark3dAccessTokenV2.abi \
		--pkg access_token \
		--type Mark3dAccessTokenV2 \
		--out contracts/access_token/access_token.go
	abigen --abi contracts/build/FilemarketCollectionV2.sol/FilemarketCollectionV2.abi \
        --pkg collection \
        --type FilemarketCollectionV2 \
        --out contracts/collection/collection.go
	abigen --abi contracts/build/PublicCollection.sol/PublicCollection.abi \
        --pkg publicCollection \
        --type PublicCollection \
        --out contracts/publicCollection/publicCollection.go
	abigen --abi contracts/build/FileBunniesCollection.sol/FileBunniesCollection.abi \
        --pkg filebunniesCollection \
        --type FileBunniesCollection \
        --out contracts/filebunniesCollection/filebunniesCollection.go
	abigen --abi contracts/build/FilemarketExchangeV2.sol/FilemarketExchangeV2.abi \
        --pkg exchange \
        --type FilemarketExchangeV2 \
        --out contracts/exchange/exchange.go
	abigen --abi contracts/build/LikeEmitter.sol/LikeEmitter.abi \
        --pkg likeEmitter \
        --type LikeEmitter \
        --out contracts/likeEmitter/likeEmitter.go

build-zk-contracts:
	mkdir -p contracts/build
	(cd ../sol-contracts && yarn && HARDHAT_NETWORK=zksync yarn hardhat compile && cp -r artifacts-zk/contracts/* ../indexer/contracts/build)
	mkdir -p contracts/access_token
	mkdir -p contracts/collection
	mkdir -p contracts/publicCollection
	mkdir -p contracts/filebunniesCollection
	mkdir -p contracts/exchange
	mkdir -p contracts/likeEmitter
	jq ".abi" contracts/build/ZkMark3dAccessTokenV2.sol/Mark3dAccessTokenV2.json > contracts/build/ZkMark3dAccessTokenV2.sol/Mark3dAccessTokenV2.abi
	jq ".abi" contracts/build/ZkFilemarketCollectionV2.sol/FilemarketCollectionV2.json > contracts/build/ZkFilemarketCollectionV2.sol/FilemarketCollectionV2.abi
	jq ".abi" contracts/build/ZkPublicCollection.sol/PublicCollection.json > contracts/build/ZkPublicCollection.sol/PublicCollection.abi
	jq ".abi" contracts/build/FileBunniesCollection.sol/FileBunniesCollection.json > contracts/build/FileBunniesCollection.sol/FileBunniesCollection.abi
	jq ".abi" contracts/build/ZkFilemarketExchangeV2.sol/FilemarketExchangeV2.json > contracts/build/ZkFilemarketExchangeV2.sol/FilemarketExchangeV2.abi
	jq ".abi" contracts/build/LikeEmitter.sol/LikeEmitter.json > contracts/build/LikeEmitter.sol/LikeEmitter.abi
	abigen --abi contracts/build/ZkMark3dAccessTokenV2.sol/Mark3dAccessTokenV2.abi \
		--pkg access_token \
		--type Mark3dAccessTokenV2 \
		--out contracts/access_token/access_token.go
	abigen --abi contracts/build/ZkFilemarketCollectionV2.sol/FilemarketCollectionV2.abi \
        --pkg collection \
        --type FilemarketCollectionV2 \
        --out contracts/collection/collection.go
	abigen --abi contracts/build/ZkPublicCollection.sol/PublicCollection.abi \
        --pkg publicCollection \
        --type PublicCollection \
        --out contracts/publicCollection/publicCollection.go
	abigen --abi contracts/build/FileBunniesCollection.sol/FileBunniesCollection.abi \
        --pkg filebunniesCollection \
        --type FileBunniesCollection \
        --out contracts/filebunniesCollection/filebunniesCollection.go
	abigen --abi contracts/build/ZkFilemarketExchangeV2.sol/FilemarketExchangeV2.abi \
        --pkg exchange \
        --type FilemarketExchangeV2 \
        --out contracts/exchange/exchange.go
	abigen --abi contracts/build/LikeEmitter.sol/LikeEmitter.abi \
        --pkg likeEmitter \
        --type LikeEmitter \
        --out contracts/likeEmitter/likeEmitter.go

build-models:
	docker run --rm --user $(shell id -u):$(shell id -g) -e GOPATH=$(go env GOPATH):/go -v ${HOME}:${HOME} -w $(shell pwd) quay.io/goswagger/swagger generate model --spec=./swagger.yaml
	go mod tidy

proto:
	@if [ `basename \`pwd\`` != "indexer" ]; then \
		echo "cd to indexer dir first. `pwd`"; \
	else \
		rm -r proto 2> /dev/null || true && \
		mkdir -p proto && \
		cd ../proto/auth && \
		protoc --go_out=`pwd`/../../indexer/proto \
			--go_opt=paths=source_relative \
			--go-grpc_out=`pwd`/../../indexer/proto \
			--go-grpc_opt=paths=source_relative \
			*.proto && \
		cd ../../indexer; \
  	fi

postgres.start:
	if [ ! "$(shell docker ps -q -f name=test-postgres)" ]; then \
        if [ "$(shell docker ps -aq -f status=exited -f name=test-postgres)" ]; then \
            docker rm test-postgres; \
        fi; \
		docker run --restart unless-stopped -d -p 1338:5432 -e POSTGRES_PASSWORD=1337 --name test-postgres postgres:13 ;\
        sleep 5s; \
    fi;
	-docker exec test-postgres psql -U postgres -c "create user indexer password '1337'"
	-docker exec test-postgres psql -U postgres -c "create database mark3d_indexer"
	-docker exec test-postgres psql -U postgres -c "grant all privileges on database mark3d_indexer to indexer"

migrate.up:
	goose -dir migrations postgres "host=localhost port=1338 user=indexer password=1337 dbname=mark3d_indexer sslmode=disable" up

migrate.down:
	goose -dir migrations postgres "host=localhost port=1338 user=indexer password=1337 dbname=mark3d_indexer sslmode=disable" down

migrate.status:
	goose -dir migrations  postgres "host=localhost port=1338 user=indexer password=1337 dbname=mark3d_indexer sslmode=disable" status

swagger.start:
	cp swagger.yaml swagger.local.yaml
	sed -i "s/mark3d.xyz/localhost:9202/g" swagger.local.yaml
	sed -i "s/https/http/g" swagger.local.yaml
	docker run --restart unless-stopped -d --name mark3d-indexer-swagger -p 9201:8080 -e SWAGGER_JSON=/swagger.local.yaml -v $(shell pwd)/swagger.local.yaml:/swagger.local.yaml swaggerapi/swagger-ui

swagger.stop:
	docker stop mark3d-indexer-swagger
	docker rm mark3d-indexer-swagger

.PHONY: proto
