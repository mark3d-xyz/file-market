FROM golang:1.20

ENV GO111MODULE=on

WORKDIR /usr/src/backend
COPY go.mod go.mod
COPY go.sum go.sum
RUN go mod download

COPY . .

WORKDIR /usr/src/backend

RUN CGO_ENABLED=0 go build cmd/app/main.go
