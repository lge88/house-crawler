# Search houses in dallas TX
node get-house-links 'http://www.zillow.com/homes/for_sale/Dallas-TX/house_type/38128_rid/3-_beds/2-_baths/100000-500000_price/379-1894_mp/1000-_size/1980-_built/0-300_hoa/globalrelevanceex_sort/33.106497,-96.40915,32.52771,-97.14592_rect/10_zm/0_mmm'
node get-house-links 'http://www.zillow.com/homes/for_sale/house_type/3-_beds/2-_baths/100000-500000_price/379-1894_mp/1000-_size/1980-_built/0-300_hoa/globalrelevanceex_sort/33.119725,-96.747666,32.830846,-97.116051_rect/11_zm/0_mmm'
node get-house-links 'http://www.zillow.com/homes/for_sale/Dallas-TX/house,condo,townhouse_type/38128_rid/3-_beds/2-_baths/100000-500000_price/379-1894_mp/1000-_size/1980-_built/0-300_hoa/globalrelevanceex_sort/33.106497,-96.40915,32.52771,-97.14592_rect/10_zm/0_mmm/'
node get-house-links 'http://www.zillow.com/homes/for_sale/Dallas-TX/house,condo,townhouse_type/38128_rid/2-_beds/2-_baths/100000-500000_price/379-1894_mp/1000-_size/1950-_built/0-300_hoa/globalrelevanceex_sort/33.106497,-96.40915,32.52771,-97.14592_rect/10_zm/0_mmm/'
node get-house-links 'http://www.zillow.com/homes/for_sale/Richardson-TX/house,condo,townhouse_type/54121_rid/2-_beds/2-_baths/100000-500000_price/379-1894_mp/1000-_size/1950-_built/0-300_hoa/globalrelevanceex_sort/33.036154,-96.599007,32.891696,-96.7832_rect/12_zm/'
node get-house-links 'http://www.zillow.com/homes/for_sale/Carrollton-TX/house,condo,townhouse_type/17321_rid/2-_beds/2-_baths/100000-500000_price/379-1894_mp/1000-_size/1950-_built/0-300_hoa/globalrelevanceex_sort/33.058601,-96.807404,32.914179,-96.991597_rect/12_zm/'
node get-house-links 'http://www.zillow.com/homes/for_sale/Irving-TX/house,condo,townhouse_type/12065_rid/2-_beds/2-_baths/100000-500000_price/379-1894_mp/1000-_size/1950-_built/0-300_hoa/globalrelevanceex_sort/33.007511,-96.777192,32.718265,-97.145577_rect/11_zm/'

# Fetch house info for 7th link in data/richardson-117.txt file
tail -n +7 data/links-richardson-117.txt | head -n 1 | node scrape-house-info.js >/tmp/res-richardson-7.txt

# Post extract scraped data
tail -n +7 data/res-richardson-117.txt | head -n 1 | node post-extract.js

