var rl = require('readline');

function parseNumber(str) {
  return parseInt(str.replace(/[^0-9]/g, ''));
}

function sum(arr) {
	return arr.reduce(function(sofar, cur) {
		return sofar + cur;
	}, 0);
}

function avg(arr) {
	return sum(arr) / arr.length;
}

function max(arr) {
	return arr.reduce(function(sofar, cur) {
		return Math.max(sofar, cur);
	}, -Infinity);
}

function postExtract(house) {
	extractCityStateZipcode(house);
	extractFacts(house);
	extractSchoolRatings(house);
	extractHOA(house);
	extractROI(house);
}

function extractCityStateZipcode(house) {
	var m = null;

	// Try extract from address
	if (house.address) {
		m = house.address.match(/^[^,]*, +([^,]*), +([A-Z]{2}) +([0-9]{5})$/);
		if (m !== null) {
			house.city = m[1];
			house.state = m[2];
			house.zipCode = parseNumber(m[3]);
			return;
		}
	}

	// Try extract from url
	m = house.link.match(/.*-([0-9]{5})\/.*/);
	if (m !== null) {
		house.zipCode = parseNumber(m[1]);
	}
}

function extractFacts(house) {
	house.facts = {};

	var facts = house.facts;
	facts.buildTime = null;
	facts.daysOnZillow = null;
	facts.singleFamily = null;
	facts.hoa = null;

	house.factText.forEach(function(text) {

		var m = null;

		m = text.match(/^Built in ([0-9]+)/);
		if (m !== null) {
			facts.buildTime = parseInt(m[1]);
			return;
		}

		m = text.match(/^([0-9]+) days? on Zillow$/);
		if (m !== null) {
			facts.daysOnZillow = parseInt(m[1]);
			return;
		}

		m = text.match(/^Single Family$/);
		if (m !== null) {
			facts.singleFamily = true;
			return;
		}

		m = text.match(/^HOA Fee: \$([0-9]+)\/mo$/);
		if (m !== null) {
			facts.hoa = parseInt(m[1]);
			return;
		}
	});
}

function extractSchoolRatings(house) {
	house.avgSchoolRating = sum(house.schoolRatings) /
		house.schoolRatings.length;
	house.maxSchoolRating = max(house.schoolRatings);
}

function extractHOA(house) {
	if (house.facts.hoa === null && house.facts.singleFamily === true) {
		house.facts.hoa = 0.0;
	}
}

function extractROI(house) {
	var taxRate = 0.01;
  var paid = house.listingPriceUSD;
  var hoa = house.facts.hoa;
  var rent = house.zestimate.rent;
  var appreciation = house.zestimate.forecastChangePercent;

	var roi = null;
	try {
		roi = computeROI(taxRate, paid, hoa, rent, appreciation);
	} catch (e) {}
	house.roi = roi;
}

function assertNumberInRange(x, a, b) {
	console.assert(typeof x === 'number' && x >= a && x <= b);
}

function computeROI(taxRate, paid, hoa, rent, appreciation) {
	assertNumberInRange(taxRate, 0.0, 1.0);
	assertNumberInRange(paid, 0.0, 1e9);
	assertNumberInRange(hoa, 0.0, 10000);
	assertNumberInRange(rent, 0.0, 10000);
	assertNumberInRange(appreciation, 0.0, 1.0);

  var tax = taxRate * paid;
  var earning = appreciation * paid + 12 * (rent - hoa) - tax;
  var roi = earning / paid;
	return roi;
}

if (!module.parent) {
  var lineReader = rl.createInterface({
		terminal: false,
    input: process.stdin
  });

  lineReader.on('line', function (line) {
    var house = JSON.parse(line);
		postExtract(house);
    console.log(JSON.stringify(house));
  });
}
