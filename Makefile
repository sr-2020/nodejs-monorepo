build:
	yarn run --cwd=packages/billing docker:build
	yarn run --cwd=packages/push docker:build

push:
	yarn run --cwd=packages/billing docker:push
	yarn run --cwd=packages/push docker:push

deploy:
	{ \
	sshpass -p $(password) ssh -o StrictHostKeyChecking=no deploy@$(server) "cd /var/services/platform ;\
	docker-compose pull billing-app ;\
	docker-compose up -d --no-deps billing-app" ;\
	}
