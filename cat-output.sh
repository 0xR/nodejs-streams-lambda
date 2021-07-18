#!/usr/bin/env bash

bucket=nodejs-streams-dev
files=$(aws s3 ls "s3://$bucket/")

lastFile=$(echo "$files" | tail -1 | tr -s ' ' | cut -d' ' -f4)

aws s3 cp "s3://$bucket/$lastFile" -
