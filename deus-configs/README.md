# Steps to start all needed components:

Initialize docker volume couchdb_data with example data:

    docker run --mount src=couchdb_data,target=/data --name couchdb_init alexeyeremin/deus-couchdb-init:latest
    docker rm couchdb_init

First command starts couchdb_init container using alexeyeremin/deus-couchdb-init:latest image and copies /data folder from it to couchdb_data volume.
Second removes couchdb_init, as it's not needed anymore.
It needs to be done once per docker host.

To start all services using images uploaded to [https://cloud.docker.com/swarm/alexeyeremin/repository](https://cloud.docker.com/swarm/alexeyeremin/repository) (they are built automatically from GitHub master branches, but it takes about 10-15 minutes):

    cd cloud
    docker-compose up

Second command will use cloud/docker-compose.yml, which defines needed services and relations between them.

To start all services using locally-built images:

    cd local
    docker-compose up

Ctrl+C can be used to stop instances. If there some error messages about duplicated mounts during 'docker-compose up', use 'docker-compose down' to completely bring down all containers from previous run and do 'docker-compose up' again.

# Some useful links

[Documentation on docker-compose.yml file format](https://docs.docker.com/compose/compose-file)