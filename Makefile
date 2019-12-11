deploy:
	{ \
	sshpass -p $(password) ssh -o StrictHostKeyChecking=no deploy@$(server) "cd /var/services/platform &&\
	docker image prune --all --force &&\
	docker-compose pull model-engine-app models-manager-app push-app &&\
	docker-compose up -d --no-deps model-engine-app models-manager-app push-app" ;\
	}
