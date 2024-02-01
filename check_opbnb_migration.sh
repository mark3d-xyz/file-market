while true; do
    if [ $(docker inspect file-market-opbnb-indexer-postgres-migration-1 --format='{{.State.Status}}') == "exited" ]; then
        echo $(docker inspect file-market-opbnb-indexer-postgres-migration-1 --format='{{.State.Status}}')
        break
    fi
    done

echo $(docker inspect file-market-opbnb-indexer-postgres-migration-1 --format='{{.State.ExitCode}}')
docker logs file-market-opbnb-indexer-postgres-migration-1
exit $(docker inspect file-market-opbnb-indexer-postgres-migration-1 --format='{{.State.ExitCode}}')