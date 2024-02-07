#!/bin/bash
  
checkStoredog() {
  wget --quiet -O - $APP_URL |grep -qi techstories
}

printf "\nWaiting for application to be ready at $APP_URL\n\n"

until checkStoredog; do
  printf .
  sleep 2
done

while :
do
  printf "Starting session...\n"
  node puppeteer.js $APP_URL
done
