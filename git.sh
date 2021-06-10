#!/bin/bash
if [ $1="1" ]; then
echo "edit readme: "$1 
node ./index.js
fi

git add .
if [ -n $2 ]; then
echo "custom commit: "$2
git commit -m "$2"
else
dt=$(date +"%Y-%m-%d %H:%M:%S")
echo "date commit: "$dt
fi
git commit -m "$dt"
git push