#!/bin/bash
if [[ $1 = "1" ]]
then
echo "edit readme: "$1 
node ./index.js
fi

git add .
if [ -n "$2" ]
then
echo "custom commit: "$2
git commit -m "$2"
else
dt=$(date +"%Y-%m-%d %H:%M:%S")
echo "date commit: "$dt
fi

git commit -m "$dt"

echo "$?"
if [[ "$?" != "0" ]]; then
  echo "No update !"
  # exit
fi

if [[ $3 = "gitee" ]]
then
echo "push remote gitee !"
git push gitee master
elif [[ $3 = "origin" ]]
echo "push remote github !"
git push origin master
else
echo "push remote both !"
git push gitee master
git push origin master
fi
# ./git.sh
# ./git.sh 1
# ./git.sh 0 commit
# ./git.sh 1 commit
# chmod 777 ./git.sh
# chmod +x ./git.sh
exec /bin/bash