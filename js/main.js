var mapData;

async function index() {
    // Init + Create SVG
    await loadSVG();

    // get GeoJSON Data
    let data = await getJSONData("https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson");

    // Load legend
    await loadLegend();

    // Assign to global mapData
    mapData = data;

    // Get cases data
    let caseData = await getSpecificColumnsFromCSV('10/10/20');

    // Load the map
    await loadMap(data, caseData);

    // First load NETFLIX TITLES Case Result
    let csvDate = await getCsvDate();
    covidCasesResultList = await getCountryData(csvDate);
}

async function rawdata() {
    await loadRawDataTableByDate('1/22/20');
}

async function analyzeddata(recordDate) {
    document.getElementById('main').hidden = true;

    // Get top 5 countries having mose NETFLIX TITLES cases
    let topCountries = await getTopCountriesData(recordDate);

    // Load the chart
    await loadChart(topCountries);
}