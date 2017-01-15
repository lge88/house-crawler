var jsdom = require('jsdom');
var async = require('async');
var rl = require('readline');

var CONFIGS = {
  headers: {
    'Accept-Encoding': 'gzip, deflate, sdch',
    'Accept-Language': 'en-US,en;q=0.8,zh-CN;q=0.6,zh;q=0.4,zh-TW;q=0.2,es;q=0.2',
    'Upgrade-Insecure-Requests': '1',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.95 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Cache-Control': 'max-age=0',
    'Cookie': 'abtest=2|eXaDR%2BgEvl%2Bd%2B4t9; __gads=ID=cb098f6e4a9c19fd:T=1450979253:S=ALNI_MYEuloxqOXHJ_TFuBO7_J9BQssyUw; ki_t=1450979255098%3B1450979255098%3B1450979255098%3B1%3B1; ki_r=; JSESSIONID=F393EC3CB862545451DD072D5458EAC6; zguid=23|%24e225ace8-04a5-4e01-bfba-0f489664c379; logglytrackingsession=07a68c86-03d8-4726-8b83-f576c6e61adc; ipe_s=2375a85a-24d6-0fce-8eb4-af7a302cfa44; G_ENABLED_IDPS=google; _mkto_trk=id:324-WZA-498&token:_mch-zillow.com-1484439578549-37213; search=6|1487032723103%7Crect%3D37.567439%252C-121.450425%252C37.019549%252C-122.187195%26zm%3D10%26rid%3D33839%26disp%3Dmap%26mdm%3Dauto%26p%3D1%26sort%3Dglobalrelevanceex%26z%3D1%26baths%3D1.0-%26beds%3D2-%26price%3D0-1000000%26mp%3D0-3788%26hoa%3D0-400%26fs%3D1%26fr%3D0%26mmm%3D1%26rs%3D0%26ah%3D0%26singlestory%3D0%26size%3D900-%26built%3D1950-%09%01%0933839%09%09%092%090%09US_%09; fbm_172285552816089=base_domain=.zillow.com; fbsr_172285552816089=_-MMexhgn_Y_cYoZrLgeHs16TA9oVoQWtX-ZGrURmU8.eyJhbGdvcml0aG0iOiJITUFDLVNIQTI1NiIsImNvZGUiOiJBUUNoYldaQ180NzFjX0pMR1pkYlJKMWtIYWdRSmh6S29FLXZxQnF3S0c3ZF9haTZCUmhCN0ZDekQ4bDJmS2xoMm4zOEZKbVBndGhXNHBmYTVkQzlqU1JfOG5qa0NraUlDa0hEQUtMQWNaYzBJR1EwRU1VMWxrWDNRVEdvUHl1c3pwZXVOVXMxNEdlbHhCOFdrYjg2SGRwbkJXcXVxcUpTNDIydVVIRmRQd3BLNW93ZHNLQWhQLU1WcVBBRzRhYTc0UFFIN1ZNanVCN1NsNVl4d3duQ2pIMlpnamFfXzFtQ3JXU0k5a0ZyNnFPV3VvaURmR2JJR09JejFhTk1WcDA1SXo2eXhZRXZNczFMLWhqRVk1TWRwY0dzT3ZQaVJHMmRqT0V4R2JVdGpFZmpoRzdQRFU1RVhuV2ZTRFRUeE82XzVYanlNUzZ0aTJHZXVUZzAxX2d2UFNNeThJTVVfQ0xoWVo1UGVkaXdlNnlpVHciLCJpc3N1ZWRfYXQiOjE0ODQ0NDI0OTQsInVzZXJfaWQiOiIxMDIxMDI4OTMyNDE0MjIwMSJ9; userid=X|3|40a4c9ba99cf8d96%7C5%7CfuTZW7CxH8DazAhbM5GXV7scn1XC4OedE-bZ-evFJrs%3D; _ga=GA1.2.100059231.1450979238; ipe.29115.pageViewedCount=10; AWSALB=5gWoYsTpp57kK6D1tencOaEDf+dPfvYS8qqvOQre2i20tkB++HUrwS4jsnu8l8pM97PqM73LicXEq8I0yqkuvpP/I+hzqbDLmyRpgtbfroR2MhnC0xYTdsqB4+mL',
    'Connection': 'keep-alive'
  }
};

function map(elems, fn) {
  return Array.prototype.map.call(elems, fn);
}

function parseNumber(numberLike) {
  return parseInt(numberLike.replace(/[^0-9]/g, ''));
}

function normalizedFieldName(field) {
  return field.repace(/[ :]/g, '');
}

function extractFactText(text, facts) {
  var m = null;

  m = text.match(/Built in ([0-9]+)/);
  if (m !== null) {
    facts.buildTime = parseNumber(m[1]);
    return;
  }
}

function extractHouseInfo(document) {
  var info = {};

  info.facts = {};
  try {
    info.headerFactText = map(document.querySelectorAll('.zsg-content-header.addr .addr_bbs'), function(x) { return x.textContent; });
  } catch (e) {}

  try { info.facts.numBeds = parseNumber(info.headerFactText[0]); } catch (e) {}
  try { info.facts.numBaths = parseNumber(info.headerFactText[1]); } catch (e) {}
  try { info.facts.area = parseNumber(info.headerFactText[2]); } catch (e) {}

  info.factText = [];
  map(document.querySelectorAll('.fact-group-container.zsg-content-component.top-facts ul.zsg-list_square li'), function(el) {
    var text = el.textContent;
    extractFactText(text, info.facts);
    if (!/targetDiv/.test(text)) {
      info.factText.push(text);
    }
  });

  try {
    info.listingPrice = document
      .querySelector('div.main-row.home-summary-row span').textContent.trim();
    info.listingPriceUSD = parseNumber(info.listingPrice);
  } catch (e) {}

  var zestValueElems = document.querySelectorAll('div.zest-value');
  try {
    info.zestimatePrice = zestValueElems[0].textContent.trim();
    info.zestimatePriceUSD = parseNumber(info.zestimatePrice);
  } catch (e) {}

  try {
    info.zestimateRent = zestValueElems[1].textContent.trim();
    info.zestimateRentUSD = parseNumber(info.zestimateRent);
  } catch (e) {}

  try {
    info.zestimateForecast = zestValueElems[2].textContent.trim();
    info.zestimateForecastUSD = parseNumber(info.zestimateForecast);
  } catch (e) {}

  try {
    var schoolRatings = document.querySelectorAll('.nearby-schools-list .nearby-school.assigned-school.clearfix .nearby-schools-rating span.gs-rating-number');
    info.schoolRatings = map(schoolRatings, function(x) { return parseNumber(x.textContent); });
  } catch (e) {}

  return info;
}

function scrapeHouseInfo(link, cb) {
  jsdom.env(link, CONFIGS, function(err, window) {
    if (err) {
      cb(err);
      return;
    }
    var document = window.document;
    var info = extractHouseInfo(document);
    info.link = link;
    cb(null, info);
  });
}

if (!module.parent) {
  var lineReader = rl.createInterface({
    input: require('fs').createReadStream(__dirname + '/data/san-jose-310.txt')
  });

  lineReader.on('line', function (link) {
    scrapeHouseInfo(link, function(err, info) {
      if (err) return;
      console.log(JSON.stringify(info));
    });
  });
}
