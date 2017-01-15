var jsdom = require('jsdom');
var async = require('async');

var config = {
  'Accept-Encoding': 'gzip, deflate, sdch',
  'Accept-Language': 'en-US,en;q=0.8,zh-CN;q=0.6,zh;q=0.4,zh-TW;q=0.2,es;q=0.2',
  'Upgrade-Insecure-Requests': '1',
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.95 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Cache-Control': 'max-age=0',
  'Cookie': 'abtest=2|eXaDR%2BgEvl%2Bd%2B4t9; __gads=ID=cb098f6e4a9c19fd:T=1450979253:S=ALNI_MYEuloxqOXHJ_TFuBO7_J9BQssyUw; ki_t=1450979255098%3B1450979255098%3B1450979255098%3B1%3B1; ki_r=; zguid=23|%24e225ace8-04a5-4e01-bfba-0f489664c379; logglytrackingsession=07a68c86-03d8-4726-8b83-f576c6e61adc; ipe_s=2375a85a-24d6-0fce-8eb4-af7a302cfa44; G_ENABLED_IDPS=google; _mkto_trk=id:324-WZA-498&token:_mch-zillow.com-1484439578549-37213; fbm_172285552816089=base_domain=.zillow.com; userid=X|3|40a4c9ba99cf8d96%7C5%7CfuTZW7CxH8DazAhbM5GXV7scn1XC4OedE-bZ-evFJrs%3D; F5P=2686502922.0.0000; JSESSIONID=20292B14A5878C317D41F41A06F0623A; _ga=GA1.2.100059231.1450979238; ipe.29115.pageViewedCount=36; search=6|1487049541286%7Crect%3D32.926716%252C-96.63763%252C32.637207%252C-97.006016%26zm%3D11%26disp%3Dmap%26mdm%3Dauto%26p%3D1%26sort%3Dglobalrelevanceex%26z%3D1%26baths%3D2.0-%26beds%3D3-%26type%3Dhouse%252Ccondo%252Ctownhouse%26price%3D100000-500000%26mp%3D379-1894%26hoa%3D0-300%26fs%3D1%26fr%3D0%26mmm%3D0%26rs%3D0%26ah%3D0%26singlestory%3D0%26size%3D1000-%26built%3D1980-%09%01%0938128%09%09%092%090%09US_%09; AWSALB=Rp681Suf8IZvWfo6kP6A3CJL389YG0j7SZRe+8Z7Qo7M/K8PeS6fyoczyNTEG1aokR1mEsYtra08EpGndduq2iGH5yVLK48APRlRdJui7Xxb8GzvSxJ5fLDXX97t',
  'Connection': 'keep-alive'
};

function getHouseList(url, cb) {
  var lst = [];
  jsdom.env(url, config, function(err, window) {
    if (err) {
      cb(err);
      return;
    }

    var document = window.document;
    // console.log('document', document);
    var elems = document.querySelectorAll('a.zsg-photo-card-overlay-link.routable.hdp-link.routable.mask.hdp-link');
    // console.log('el', elems.length);
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
  // var baseUrl = 'http://www.zillow.com/homes/for_sale/San-Jose-CA/' + [
  //   '33839_rid',
  //   '2-_beds',
  //   '1-_baths',
  //   '0-1000000_price',
  //   '0-3788_mp',
  //   '900-_size',
  //   '1950-_built',
  //   '0-400_hoa',
  //   'globalrelevanceex_sort',
  //   '37.570705,-121.449051,37.022839,-122.185822_rect',
  //   '10_zm'
  // ].join('/');

  // var baseUrl = 'http://www.zillow.com/homes/for_sale/Dallas-TX/house_type/38128_rid/3-_beds/2-_baths/100000-500000_price/379-1894_mp/1000-_size/1980-_built/0-300_hoa/globalrelevanceex_sort/33.106497,-96.40915,32.52771,-97.14592_rect/10_zm/0_mmm';
  // var baseUrl = 'http://www.zillow.com/homes/for_sale/house_type/3-_beds/2-_baths/100000-500000_price/379-1894_mp/1000-_size/1980-_built/0-300_hoa/globalrelevanceex_sort/33.119725,-96.747666,32.830846,-97.116051_rect/11_zm/0_mmm';

  // var baseUrl = 'http://www.zillow.com/homes/for_sale/Dallas-TX/house,condo,townhouse_type/38128_rid/3-_beds/2-_baths/100000-500000_price/379-1894_mp/1000-_size/1980-_built/0-300_hoa/globalrelevanceex_sort/33.106497,-96.40915,32.52771,-97.14592_rect/10_zm/0_mmm/';

  // var baseUrl = 'http://www.zillow.com/homes/for_sale/Dallas-TX/house,condo,townhouse_type/38128_rid/2-_beds/2-_baths/100000-500000_price/379-1894_mp/1000-_size/1950-_built/0-300_hoa/globalrelevanceex_sort/33.106497,-96.40915,32.52771,-97.14592_rect/10_zm/0_mmm/';

  // var baseUrl = 'http://www.zillow.com/homes/for_sale/Richardson-TX/house,condo,townhouse_type/54121_rid/2-_beds/2-_baths/100000-500000_price/379-1894_mp/1000-_size/1950-_built/0-300_hoa/globalrelevanceex_sort/33.036154,-96.599007,32.891696,-96.7832_rect/12_zm/';

  // var baseUrl = 'http://www.zillow.com/homes/for_sale/Carrollton-TX/house,condo,townhouse_type/17321_rid/2-_beds/2-_baths/100000-500000_price/379-1894_mp/1000-_size/1950-_built/0-300_hoa/globalrelevanceex_sort/33.058601,-96.807404,32.914179,-96.991597_rect/12_zm/';

  var baseUrl = 'http://www.zillow.com/homes/for_sale/Irving-TX/house,condo,townhouse_type/12065_rid/2-_beds/2-_baths/100000-500000_price/379-1894_mp/1000-_size/1950-_built/0-300_hoa/globalrelevanceex_sort/33.007511,-96.777192,32.718265,-97.145577_rect/11_zm/';

  var numPages = 8;

  getHouseLinksMultiPage(baseUrl, numPages, function(link) {
    console.log(link);
  });

  // getHouseList(baseUrl, function(link) {
  //   console.log(link);
  // });
}
