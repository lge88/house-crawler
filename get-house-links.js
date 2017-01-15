var jsdom = require('jsdom');
var headersConfig = require('./headers.json');

function getHouseLinks(url, cbForEachLink) {
  jsdom.env(url, headersConfig, function(err, window) {
    if (err) { return; }

    var document = window.document;
    var elems = document.querySelectorAll('a.zsg-photo-card-overlay-link.routable.hdp-link.routable.mask.hdp-link');
		var i, len, el, link;
    for (i = 0, len = elems.length; i < len; ++i) {
      el = elems[i];
      link = 'http://www.zillow.com' + el.getAttribute('href');
			cbForEachLink(link);
    }
  });
}

function getHouseLinksMultiPage(baseUrl, numPages, cbForEachLink) {
  var i, url;
  for (i = 1; i <= numPages; ++i) {
		url = baseUrl + '/' + i + '_p/';
    getHouseLinks(url, cbForEachLink);
  }
}

function printUsage() {
	console.log('Usage: node ' + __filename + ' <zillow_url>');
	console.log('Example:');
	console.log('node ' + __filename + ' "http://www.zillow.com/homes/for_sale/Dallas-TX/house,condo,townhouse_type/38128_rid/2-_beds/2-_baths/100000-500000_price/379-1894_mp/1000-_size/1950-_built/0-300_hoa/globalrelevanceex_sort/33.106497,-96.40915,32.52771,-97.14592_rect/10_zm/0_mmm/"');
}

if (!module.parent) {
	if (process.argv.length < 3) {
		printUsage();
		process.exit();
	}

  var baseUrl = process.argv[2];
  var numPages = 20;
  getHouseLinksMultiPage(baseUrl, numPages, function(link) {
    console.log(link);
  });
}
