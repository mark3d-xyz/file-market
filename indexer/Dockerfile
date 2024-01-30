FROM file-market-indexer-base:latest as build-deps

WORKDIR /usr/src/backend
ARG env

COPY .env .env

FROM ubuntu:18.04

RUN apt-get -y update && apt-get -y install ca-certificates

WORKDIR /usr/src/app
ARG env

COPY --from=build-deps /usr/src/backend/run.sh run.sh
COPY --from=build-deps /usr/src/backend/main main
COPY --from=build-deps /usr/src/backend/.env .env
COPY --from=build-deps /usr/src/backend/resources/ resources/
COPY --from=build-deps /usr/src/backend/configs/$env.json config.json

ENV LOG_PATH=/logs/file-market-indexer.log

ENTRYPOINT ["./run.sh"]