#!/bin/bash
git status
git add .
git commit -m "test.sh"

echo $?
echo "haha"
exec /bin/bash