#!/bin/bash

if [ ! -d ./models ]; then
    git clone https://github.com/sth-larp/deus-models.git models
else
    cd ./models
    git fetch
    git reset --hard HEAD
fi
