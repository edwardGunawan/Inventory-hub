#!/bin/bash

if [ -d "./public/config" ]; then
  echo "Directory ./public/config exist"
else
  mkdir ./public/config
fi

cd ./config
for all_file in *.js
do
  cp "$all_file" ../public/config
done
