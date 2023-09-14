#!/usr/bin/env bash
while read p; do git tag $p $1; done < NEW_TAGS.txt 
git push --tags