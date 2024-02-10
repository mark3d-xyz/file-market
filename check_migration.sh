#!/bin/bash

container_name="file-market-indexer-postgres-migration-1"

if [ ! -z "$1" ]; then
    container_name="file-market-$1-indexer-postgres-migration-1"
fi

while true; do
    if [ $(docker inspect $container_name --format='{{.State.Status}}') == "exited" ]; then
        echo $(docker inspect $container_name --format='{{.State.Status}}')
        break
    fi
    done

echo $(docker inspect $container_name --format='{{.State.ExitCode}}')
docker logs $container_name
exit $(docker inspect $container_name --format='{{.State.ExitCode}}')