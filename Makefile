.PHONY: help network bin chaincode tools
.DEFAULT_GOAL := help
CRYPTO = /opt/gopath/src/github.com/hyperledger/fabric/peer/
CHAINCODE_VERSION = $(shell cat ./src/chaincode-nestjs/package.json | jq '.version')

cli: ## Run bash in docker cli container
	@docker-compose exec cli bash

start:
	docker-compose up -d
	docker-compose ps

network: ## Initialize fabric network (Channels, peers etc.)
	docker-compose exec cli configtxgen -profile OneOrgChannel -configPath . -channelID mychannel -outputCreateChannelTx mychannel.tx
	docker-compose exec cli peer channel create -o orderer.example.com:7050 -f ./mychannel.tx -c mychannel
	docker-compose exec cli configtxgen -profile OneOrgChannel -configPath . -channelID mychannel -outputAnchorPeersUpdate=./Org1MSPanchors.tx -asOrg Org1MSP
	docker-compose exec cli peer channel join -b mychannel.block
	docker-compose exec cli peer channel update -o orderer.example.com:7050 -c mychannel -f ./config/Org1MSPanchors.tx

chaincode: ## Deploy real chaincode to network
	sudo rm -rf ./src/chaincode_compiled_nestjs
	docker-compose run --rm chaincode sh -c "npm install"
	docker-compose run --rm chaincode sh -c "npm run build"
	docker-compose exec cli peer chaincode install -l node -p /opt/gopath/src/github.com/chaincode/chaincode_compiled_nestjs -n main -v ${CHAINCODE_VERSION}
	docker-compose exec cli peer chaincode instantiate -o orderer.example.com:7050 -l node -c '{"Args":["Init"]}' -n main -v ${CHAINCODE_VERSION} -C mychannel
	echo 'deployed' > src/chaincode-nestjs/chaincode_deployed

delete_chaincode:
	docker ps -aq --filter name=dev-peer | xargs docker rm -fv || true
	docker-compose exec peer0.org1.example.com sh -c "rm -rf /var/hyperledger/production/chaincodes/*"

down_chaincode:
	docker ps -aq --filter name=dev-peer | xargs docker rm -fv || true

reset: down ## Stop and run all from scratch
	sudo rm -rf src/chaincode-nestjs/node_modules
	sudo rm -rf src/chaincode-nestjs/chaincode_deployed
	docker-compose up -d
	make network
	make chaincode

down: ## Kill all containers, including dev*.peer's (created by instantiating chaincode)
	docker-compose down -v
	docker ps -aq --filter name=dev-peer | xargs docker rm -fv || true
	docker volume prune -f || true
	docker images -q dev-peer* | xargs docker rmi || true

build: ## Build docker images with werf
	werf build --stages-storage :local --introspect-error

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
