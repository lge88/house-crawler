# Run searches
# 1) Make directory under ./searches: my-new-search-20160116-0050
# 2) Create a text file searches/my-new-search-20160116-0050/searches.txt
#    - Each line of searches.txt file contains a zillow url to search.
# 3) Run command:
./run-search.sh 'searches/my-new-search-20160116-0050'

# Search houses in dallas TX
echo 'http://www.zillow.com/homes/for_sale/Dallas-TX/house_type/38128_rid/3-_beds/2-_baths/100000-500000_price/379-1894_mp/1000-_size/1980-_built/0-300_hoa/globalrelevanceex_sort/33.106497,-96.40915,32.52771,-97.14592_rect/10_zm/0_mmm' | node get-house-links.js

. searches/dallas.sh | node get-house-links.js

# Fire the search using the 3rd line of searches/searches.txt
sed '3q;d' searches/searches.txt | node get-house-links.js

# Fetch house info for 7th link in data/richardson-117.txt file
sed '7q;d' data/links-richardson-117.txt | node scrape-house-info.js >/tmp/res-richardson-7.txt

# Post extract scraped data
cat /tmp/res-richardson-7.txt | node post-extract.js

# Filter roi is null
cat res.txt | jq -c 'select(.roi!=null)'

# Get top 10 zip codes with most houses for sale
cat res.txt | jq -c 'select(.roi!=null)' | jq '.zipCode' | sort | uniq -c | awk '{print $2,$1}' | sort -k2,2nr | head

# Get top 50 results by roi reverse
cat searches/tx-20160116-0050/output/raw.txt | node post-extract.js | jq -c 'select(.roi!=null)' | ./to-json.awk | jq -c 'sort_by(-.roi)|.[]' | head -n 50 searches/tx-20160116-0050/output/top-50.txt

