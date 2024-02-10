FROM rust:1.63 as build-deps

WORKDIR /usr/src/protoc
RUN apt-get -y update && apt-get -y install wget unzip

WORKDIR /usr/src/mark3d-oracle
COPY backend backend

WORKDIR /usr/src/mark3d-oracle/backend
RUN cargo build --release

WORKDIR /usr/src/mark3d-oracle/contracts
COPY sol-contracts/artifacts artifacts

WORKDIR /usr/src/mark3d-oracle/zk-contracts
COPY sol-contracts/artifacts-zk artifacts
