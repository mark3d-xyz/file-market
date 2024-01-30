FROM file-market-oracle-base:latest as build-deps

WORKDIR /usr/src/mark3d-oracle

COPY backend/.env .env

FROM rust:1.63

RUN apt-get -y update && apt-get -y install ca-certificates gcc

WORKDIR /usr/src/app

COPY --from=build-deps /usr/src/mark3d-oracle/backend/target/release/backend main
COPY --from=build-deps /usr/src/mark3d-oracle/backend/.env .env
COPY --from=build-deps /usr/src/mark3d-oracle/contracts/artifacts/contracts/FilemarketCollectionV2.sol/FilemarketCollectionV2.json FilemarketCollectionV2.json
COPY --from=build-deps /usr/src/mark3d-oracle/contracts/artifacts/contracts/FraudDeciderWeb2V2.sol/FraudDeciderWeb2V2.json FraudDeciderWeb2V2.json
COPY --from=build-deps /usr/src/mark3d-oracle/contracts/artifacts/contracts/Mark3dAccessTokenV2.sol/Mark3dAccessTokenV2.json Mark3dAccessTokenV2.json
COPY --from=build-deps /usr/src/mark3d-oracle/zk-contracts/artifacts/contracts/ZkFilemarketCollectionV2.sol/FilemarketCollectionV2.json ZkFilemarketCollectionV2.json
COPY --from=build-deps /usr/src/mark3d-oracle/zk-contracts/artifacts/contracts/ZkMark3dAccessTokenV2.sol/Mark3dAccessTokenV2.json ZkMark3dAccessTokenV2.json
COPY --from=build-deps /usr/src/mark3d-oracle/backend/run.sh run.sh

ENV LOG_PATH=/logs/mark3d-oracle.log

ENTRYPOINT ["./run.sh"]