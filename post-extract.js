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
	extractHOA(house);
	extractSchoolRatings(house);
	extractDaysOnZillow(house);
	extractZipcode(house);
	extractROI(house);
}

function extractHOA(house) {
  var facts = house.factText.filter(function(text) {
    return /HOA Fee:/.test(text);
  });
  var hoa = facts.length > 0 ?
			parseNumber(facts[0]) : 0.0;
	house.hoa = hoa;
}

function extractSchoolRatings(house) {
	house.avgSchoolRating = sum(house.schoolRatings) /
		house.schoolRatings.length;
	house.maxSchoolRating = max(house.schoolRatings);
}

function extractDaysOnZillow(house) {
	var fact = house.factText.filter(function(text) {
		return /days? on Zillow/.test(text);
	});
	var days = fact.length > 0 ?
			parseNumber(fact[0].split(' ')[0]) : null;
	house.daysOnZillow = days;
}

function extractZipcode(house) {
	var m = house.link.match(/.*-TX-(75[0-9]{3}).*/);
	if (m !== null) {
		house.zipCode = parseNumber(m[1]);
	}
}

function extractROI(house) {
  var paid = house.listingPriceUSD;
  var hoa = house.hoa;
  var rent = house.zestimateRentUSD;
  var appreciation = (house.zestimateForecastUSD - house.zestimatePriceUSD) /
      house.zestimatePriceUSD;
  var tax = 0.01 * paid;
  var earning = appreciation * paid + 12 * (rent - hoa) - tax;
  var roi = earning / paid;
  house.roi = roi;
}

if (!module.parent) {
  var lineReader = rl.createInterface({
    input: process.stdin
  });

  lineReader.on('line', function (line) {
    var house = JSON.parse(line);
		postExtract(house);
    console.log(JSON.stringify(house));
  });

  // lineReader.on('close', function() {
  //   houses = houses.filter(function(house) {
  //     return house.roi > 0.0 && house.roi < 1.0;
  //   });

  //   houses = houses.filter(function(house) {
  //     return house.facts.buildTime > 1900 &&
	// 			house.facts.buildTime < 2100;
  //   });

  //   houses = houses.filter(function(house) {
  //     return house.zipCode !== undefined;
  //   });

    // houses = houses.filter(function(house) {
    //   return house.facts.numBeds === 3;
    // });

    // houses = houses.filter(function(house) {
    //   return house.facts.buildTime > 2000;
    // });

		// var roiByZipCode = houses.reduce(function(sofar, house) {
		// 	if (sofar[house.zipCode] === undefined) {
		// 		sofar[house.zipCode] = [];
		// 	}
		// 	sofar[house.zipCode].push(house.roi);
		// 	return sofar;
		// }, {});

		// Object.keys(roiByZipCode).forEach(function(key) {
		// 	console.log(key + '\t' + avg(roiByZipCode[key]));
		// });

    // houses.sort(function(a, b) {
    //   return b.roi - a.roi;
    // });

		// houses = houses.filter(function(house) {
		// 	return house.maxSchoolRating > 8.0;
    // }).filter(function(house) {
		// 	return house.daysOnZillow < 10;
		// });

		// houses = houses.filter(function(house) {
		// 	return house.zestimateRentUSD > 3000.0;
		// });

		// var houseByBuildTime = houses.reduce(function(sofar, house) {
		// 	sofar[house.facts.buildTime] = house;
		// }, {});

    // houses.forEach(function(house) {
    //   console.log(JSON.stringify(house));
    // });
  // });
}
