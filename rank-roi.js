var rl = require('readline');

function getHOA(house) {
  var facts = house.factText.filter(function(text) {
    return /HOA Fee:/.test(text);
  });
  return facts.length > 0 ?
    parseInt(facts[0].replace(/[^0-9]/g, '')) : 0.0;
}

function calROI(house) {
  var paid = house.listingPriceUSD;
  var hoa = house.hoa;
  var rent = house.zestimateRentUSD;
  var appreciation = (house.zestimateForecastUSD - house.zestimatePriceUSD) /
      house.zestimatePriceUSD;
  var tax = 0.01 * paid;
  var earning = appreciation * paid + 12 * (rent - hoa) - tax;
  var roi = earning / paid;
  return roi;
}

if (!module.parent) {
  var lineReader = rl.createInterface({
    input: require('fs').createReadStream(__dirname + '/data/facts-san-jose-310.txt')
  });

  var houses = [];
  lineReader.on('line', function (line) {
    var house = JSON.parse(line);
    var hoa = getHOA(house);
    house.hoa = hoa;

    var roi = calROI(house);
    house.roi = roi;
    houses.push(house);
  });

  lineReader.on('close', function() {
    houses = houses.filter(function(house) {
      return house.roi > 0.0 && house.roi < 1.0;
    });

    houses.sort(function(a, b) {
      return b.roi - a.roi;
    });

    houses.forEach(function(house) {
      console.log(JSON.stringify(house));
    });
  });
}
