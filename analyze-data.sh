# Filter roi is null
cat data/houses*.txt | node post-extract.js | jq -c 'select(.roi!=null)'

# Get top 10 zip codes with most houses for sale
cat data/houses*.txt | node post-extract.js | jq -c 'select(.roi!=null)' | jq '.zipCode' | sort | uniq -c | awk '{print $2,$1}' | sort -k2,2nr | head
