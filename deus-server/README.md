DeusEx LARP Webserver API
[![Build Status](https://travis-ci.org/sth-larp/deus-server.svg?branch=master)](https://travis-ci.org/sth-larp/deus-server)

Steps to set up development environment:
  
    npm install mocha chai ts-node -g
    git clone https://github.com/sth-larp/deus-server.git
    npm install

To run tests:

    npm test

To run test in watch (auto-rerun on changes) mode:

    npm test -- --watch

To start as a daemon:

    npm run start

To stop:

    npm run stop

To start as attached process:

    npm run build && node build/main.js
