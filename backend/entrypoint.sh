#!/bin/sh

set -e
# npm install 

until nc -z $DB_HOST $DB_PORT; do
  sleep 1
done

exec npm run dev