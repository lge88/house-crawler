var rl = require('readline');
var jsdom = require('jsdom');
var headers = require('./headers.json');

function getHouseLinks(url, cbForEachLink) {
  jsdom.env(url, {
		headers: headers
	}, function(err, window) {
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

if (!module.parent) {
  var numPages = 20;
  var lineReader = rl.createInterface({
		terminal: false,
    input: process.stdin
  });

  lineReader.on('line', function (baseUrl) {
		getHouseLinksMultiPage(baseUrl, numPages, function(link) {
			console.log(link);
		});
  });
}
