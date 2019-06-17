DOCKER_COMPOSE_VERSION=1.24.0
NAMESPACE=sr2020
SERVICE := platform
TAG := :$(or ${tag},${tag},latest)
ENV := $(or ${env},${env},local)
cest := $(or ${cest},${cest},)

current_dir = $(shell pwd)

build:
	docker build -t ${NAMESPACE}/billing${TAG} -f ./packages/billing/Dockerfile .
	docker build -t ${NAMESPACE}/push${TAG} -f ./packages/push/Dockerfile .

push:
	docker push ${NAMESPACE}/billing
	docker push ${NAMESPACE}/push

deploy:
	{ \
	sshpass -p $(password) ssh -o StrictHostKeyChecking=no deploy@$(server) "cd /var/services/$(SERVICE) ;\
	docker-compose pull billing-app ;\
	docker-compose up -d --no-deps billing-app" ;\
	}

up:
	docker-compose up -d

down:
	docker-compose down

reload:
	make down
	make up

restart:
	docker-compose down -v
	docker-compose up -d
