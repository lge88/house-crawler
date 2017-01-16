#! /usr/bin/env bash

if [[ $# != 1 ]]; then
    echo "Usage: $0 <search_dir>"
    echo "See howto.sh for more info"
    exit
fi

d="$1"

mkdir -p $d/output
rm -fr $d/output/*

node get-house-links.js <$d/searches.txt | tee $d/output/links.txt

cat $d/output/links.txt | node scrape-house-info.js | tee $d/output/raw.txt

echo 'Results are saved to:'
echo "$d/ouput/raw.txt"
