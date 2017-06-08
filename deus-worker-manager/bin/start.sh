#!/bin/bash

npm run build
forever start --pidFile deus-worker-manager.pid build/worker_manager_runner.js -c '../config.js'
