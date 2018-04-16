# Steps to start all needed components:

Clone this repo:

    git clone https://github.com/sth-larp/deus-configs.git
    cd deus-configs

Create persistent volumes:

    docker volume create couchdb_data
    docker volume create elasticsearch_data

Create .env file with environment variables. Use .env.example as template

It needs to be done once per docker host.

To start all services using images uploaded to [https://cloud.docker.com/swarm/alexeyeremin/repository](https://cloud.docker.com/swarm/alexeyeremin/repository) (they are built automatically from GitHub master branches, but it takes about 10-15 minutes):

    docker-compose up

Second command will use cloud/docker-compose.yml, which defines needed services and relations between them.

Ctrl+C can be used to stop instances. If there some error messages about duplicated mounts during 'docker-compose up', use 'docker-compose down -v' to completely bring down all containers from previous run and do 'docker-compose up' again.

# Google Cloud Container-Optimized OS specifics
As docker-compose is not installed and installation of new software is problematic, docker-compose needs to be run inside (!) docker by using corresponding image.

Use following command instead of docker-compose:

    bash docker-compose.sh

# Some useful links

[Documentation on docker-compose.yml file format](https://docs.docker.com/compose/compose-file)


