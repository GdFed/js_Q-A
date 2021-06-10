#!/bin/bash
if [ $1="1" ]; then
echo 'edit readme'
node ./index.js
fi

git add .
if [ -n $2 ]; then
echo 'custom commit'
git commit -m "$2"
else
echo 'date commit'
dt=$(date +"%Y-%m-%d %H:%M:%S")
fi
git commit -m "$dt"
git push