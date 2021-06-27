#!/usr/bin/bash

yarn cache clean
yarn
yarn build
pm2 delete yukikaze || :
yarn start
