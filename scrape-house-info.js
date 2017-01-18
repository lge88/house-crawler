var jsdom = require('jsdom');
var async = require('async');
var rl = require('readline');
var headers = require('./headers.json');

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

	try {
		info.address = document.querySelector('.zsg-content-header.addr h1').textContent.trim();
	} catch (e) {}

	var squareFeetAndBBs;
  try {
    squareFeetAndBBs = map(document.querySelectorAll('.zsg-content-header.addr .addr_bbs'), function(x) {
			return x.textContent;
		});
  } catch (e) {}

  try { info.beds = parseNumber(squareFeetAndBBs[0]); } catch (e) {}
  try { info.baths = parseNumber(squareFeetAndBBs[1]); } catch (e) {}
  try { info.squareFeet = parseNumber(squareFeetAndBBs[2]); } catch (e) {}

  info.factText = [];
  map(document.querySelectorAll('.top-facts li, .z-moreless-content li'), function(el) {
    var text = el.textContent;
    if (!/targetDiv/.test(text)) {
      info.factText.push(text);
    }
  });

  try {
    info.listingPrice = document
      .querySelector('div.main-row.home-summary-row span').textContent.trim();
    info.listingPriceUSD = parseNumber(info.listingPrice);
  } catch (e) {}

	info.zestimate = {};
  var zestValueElems = document.querySelectorAll('div.zest-value');
  try {
    info.zestimate.rawPrice = zestValueElems[0].textContent.trim();
    info.zestimate.price = parseNumber(info.zestimate.rawPrice);
  } catch (e) {}

  try {
    info.zestimate.rawRent = zestValueElems[1].textContent.trim();
    info.zestimate.rent = parseNumber(info.zestimate.rawRent);
  } catch (e) {}

  try {
    info.zestimate.rawForecast = zestValueElems[2].textContent.trim();
    info.zestimate.forecast = parseNumber(info.zestimate.rawForecast);
  } catch (e) {}

  try {
    info.zestimate.rawForecastChangePercent = document.querySelector('div.zest-forecast-change-percent').textContent;
    info.zestimate.forecastChangePercent = parseFloat(info.zestimate.rawForecastChangePercent.replace(/%/, '')) / 100.0;
  } catch (e) {}

  try {
    var schoolRatings = document.querySelectorAll('.nearby-schools-list .nearby-school.assigned-school.clearfix .nearby-schools-rating span.gs-rating-number');
    info.schoolRatings = map(schoolRatings, function(x) { return parseNumber(x.textContent); });
  } catch (e) {}

  return info;
}

function scrapeHouseInfo(link, cb) {
  jsdom.env(link, {
		headers: headers
	}, function(err, window) {
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
		terminal: false,
    input: process.stdin
  });

  lineReader.on('line', function (link) {
    scrapeHouseInfo(link, function(err, info) {
      if (err) return;
      console.log(JSON.stringify(info));
    });
  });
}
