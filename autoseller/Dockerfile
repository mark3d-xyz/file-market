FROM golang:1.20 as build-deps

ENV GO111MODULE=on

WORKDIR /usr/src/backend
COPY go.mod go.mod
COPY go.sum go.sum
RUN go mod download

COPY . .

WORKDIR /usr/src/backend

RUN CGO_ENABLED=0 go build cmd/app/main.go

FROM ubuntu:18.04

RUN apt-get -y update && apt-get -y install ca-certificates

WORKDIR /usr/src/app

COPY --from=build-deps /usr/src/backend/run.sh run.sh
COPY --from=build-deps /usr/src/backend/main main
COPY --from=build-deps /usr/src/backend/.env .env

ENV LOG_PATH=/logs/file-market-autoseller.log

ENTRYPOINT ["./run.sh"]
