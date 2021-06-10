#!/bin/bash
if [ $1 = "1" ]; then
echo 'edit readme'
node ./index.js
fi
dt=$(date +"%Y-%m-%d %H:%M:%S")
#echo $dt
git add ./
git commit -m "$dt"
git push