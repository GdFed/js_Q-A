#!/bin/bash
if [$1='1']; then
node ./index.js
fi
dt=$(date +"%Y-%m-%d %H:%M:%S")
#echo $dt
git add ./
git commit -m "$dt"
git push