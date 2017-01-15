var jsdom = require('jsdom');
var async = require('async');

function getHouseList(url, cb) {
  var lst = [];
  jsdom.env(url, function(err, window) {
    if (err) {
      cb(err);
      return;
    }

    var document = window.document;
    var elems = document.querySelectorAll('a.zsg-photo-card-overlay-link.routable.hdp-link.routable.mask.hdp-link');
    for (var i = 0, len = elems.length; i < len; ++i) {
      var el = elems[i];
      lst.push('http://www.zillow.com' + el.getAttribute('href'));
    }

    cb(null, lst);
  });
}

function getHouseLinksMultiPage(baseUrl, numPages, cbForEachLink) {
  var i, urls = [];
  for (i = 1; i <= numPages; ++i) {
    urls.push(baseUrl + '/' + i + '_p/');
  }

  var tasks = urls.map(function(url) {
    return function(cb) {
      getHouseList(url, function(err, links) {
        if (err) {
          cb(err);
          return;
        }
        cb(null, links);
      });
    };
  });

  async.parallel(tasks, function(err, results) {
    results.forEach(function(links) {
      links.forEach(cbForEachLink);
    });
  });
}

if (!module.parent) {
  var baseUrl = 'http://www.zillow.com/homes/for_sale/San-Jose-CA/' + [
    '33839_rid',
    '2-_beds',
    '1-_baths',
    '0-1000000_price',
    '0-3788_mp',
    '900-_size',
    '1950-_built',
    '0-400_hoa',
    'globalrelevanceex_sort',
    '37.570705,-121.449051,37.022839,-122.185822_rect',
    '10_zm'
  ].join('/');

  var numPages = 20;

  getHouseLinksMultiPage(baseUrl, numPages, function(link) {
    console.log(link);
  });
}
