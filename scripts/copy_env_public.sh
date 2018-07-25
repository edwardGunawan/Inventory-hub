#!/bin/bash

mkdir ./public/config
cd ./config
for all_file in *.js
do
  cp "$all_file" ../public/config
done
