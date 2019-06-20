deploy:
	{ \
	sshpass -p $(password) ssh -o StrictHostKeyChecking=no deploy@$(server) "cd /var/services/platform ;\
	docker-compose pull billing-app ;\
	docker-compose up -d --no-deps billing-app ;\
	docker-compose pull push-app ;\
	docker-compose up -d --no-deps push-app" ;\
	}
