# Steps to start all needed components:

Initialize docker volume couchdb_data with example data:

    docker run --mount src=couchdb_data,target=/data --name couchdb_init alexeyeremin/deus-couchdb-init:latest
    docker rm couchdb_init

First command starts couchdb_init container using alexeyeremin/deus-couchdb-init:latest image and copies /data folder from it to couchdb_data volume.
Second removes couchdb_init, as it's not needed anymore.
It needs to be done once per docker host.

To start all services using images uploaded to [https://cloud.docker.com/swarm/alexeyeremin/repository](https://cloud.docker.com/swarm/alexeyeremin/repository) (they are built automatically from GitHub master branches, but it takes about 10-15 minutes):

    docker-compose -f cloud/docker-compose.yml up

Second command will use cloud/docker-compose.yml, which defines needed services and relations between them.

To start all services using locally-built images:

    docker-compose -f local/docker-compose.yml up

Ctrl+C can be used to stop instances. If there some error messages about duplicated mounts during 'docker-compose up', use 'docker-compose down' to completely bring down all containers from previous run and do 'docker-compose up' again.

# Google Cloud Container-Optimized OS specifics
As docker-compose is not installed and installation of new software is problematic, docker-compose needs to be run inside (!) docker by using corresponding image.

Initial setup:

    sudo curl -L --fail https://github.com/docker/compose/releases/download/1.20.1/run.sh -o ~/docker-compose

Then use following command instead of docker-compose:

    bash ~/docker-compose

# Some useful links

[Documentation on docker-compose.yml file format](https://docs.docker.com/compose/compose-file)


