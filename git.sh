#!/bin/bash
node ./index.js
dt=$(date +"%Y-%m-%d %H:%M:%S")
#echo $dt
git add ./
git commit -m "$dt"
git push