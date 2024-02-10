FROM file-market-healthcheck-base:latest as build-deps

WORKDIR /usr/src/backend

COPY .env .env

FROM ubuntu:18.04

RUN apt-get -y update && apt-get -y install ca-certificates

WORKDIR /usr/src/app

COPY --from=build-deps /usr/src/backend/run.sh run.sh
COPY --from=build-deps /usr/src/backend/main main
COPY --from=build-deps /usr/src/backend/.env .env

ENV LOG_PATH=/logs/file-market-healthcheck.log

ENTRYPOINT ["./run.sh"]