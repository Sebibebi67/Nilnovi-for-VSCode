#!/bin/bash

repo="./nna ./nnp"

for dir in $repo; do
	files=$(ls $dir)
	for file in $files; do
		newFileName="${file%?}"
		# echo $newFileName
		mv $dir"/"$file $dir"/"$newFileName
	done
done