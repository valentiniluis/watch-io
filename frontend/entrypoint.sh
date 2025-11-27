#!/bin/sh
set -e

npm cache clean --force

npm install

exec npm run dev -- --host