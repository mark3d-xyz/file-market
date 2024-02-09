build-contracts:
	(cd ../sol-contracts && yarn && yarn hardhat compile) && \
	(cd ../sol-contracts && yarn && HARDHAT_NETWORK=zksync yarn hardhat compile)

redis.start:
	docker run --name mark3d-backend-redis -p 9203:6379 -d redis redis-server --save 60 1

redis.stop:
	docker stop mark3d-backend-redis
	docker rm mark3d-backend-redis
