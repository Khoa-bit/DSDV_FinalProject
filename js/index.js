// Sizing
var width;
var height;

// Elements
var svg;

// Countries
var countryName;
var countryCode;

// Date
var choosenDate;

// Date
var choosenDate;

// NETFLIX TITLES Cases
var covidCase;

//////////////////////////////////////////////////////

// Render the result in the panel
async function showPanel() {
    // Render country
    document.getElementById("result-country").innerText = countryName + ` (${countryCode})`;

    // Get NETFLIX TITLES Case
    let csvDate = await getCsvDate();
    let covidCase = await getCountryData(countryName, csvDate);

    // Render the result case
    document.getElementById("result-case").innerHTML = `NetFlix titles: <b>${covidCase.toLocaleString('en-US')}</b>`;
}

async function getJSONData(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        console.log('An error occurred while loading the data: ', error);
        throw error;
    }
}

async function getSpecificColumnsFromCSV(recordDate) {
    let columns = ['Country/Region'];
    columns.push(recordDate);
    let csvFile = 'https://raw.githubusercontent.com/Khoa-bit/DSDV_FinalProject/main/data/netflix_titles_global.csv';
    const data = await d3.csv(csvFile);

    const summedData = data.reduce((result, item) => {
        const country = item['Country/Region'];
        const cases = parseInt(item[recordDate]);

        if (!result[country]) {
            result[country] = cases;
        } else {
            result[country] += cases;
        }

        return result;
    }, {});

    const extractedData = Object.entries(summedData).map(([country, cases]) => ({
        'Country/Region': country,
        Cases: cases
    }));

    return extractedData;
}


async function getChoosenDate() {
    let rawDate = document.getElementById("datepicker").value;
    choosenDate = rawDate;
    return rawDate;
}

async function getFormattedDate() {
    let rawDate = document.getElementById("datepicker").value;
    choosenDate = rawDate;
    return `Record date: ${rawDate[8]}${rawDate[9]}/${rawDate[5]}${rawDate[6]}/${rawDate[0]}${rawDate[1]}${rawDate[2]}${rawDate[3]}`;
}

async function getCsvDate() {
    let rawDate = new Date(document.getElementById("datepicker").value);

    return `10/10/${rawDate.getFullYear() % 100}`;
}

async function loadLegend() {

    document.getElementById("map-container-2").innerHTML = '';

    // Set up the map container
    const container2 = d3.select("#map-container-2");

    // Define the width and height of the map
    let width2 = 200;
    let height2 = 180;

    // Create an SVG element within the container
    let svg2 = container2
        .append("svg")
        .attr("width", width2)
        .attr("height", height2);

    const colorCategories = [{
        color: '#fee2e2',
        label: '< 50'
    },
    {
        color: '#fecaca',
        label: '51 - 100'
    },
    {
        color: '#fca5a5',
        label: '101 - 300'
    },
    {
        color: '#ef4444',
        label: '301 - 600'
    },
    {
        color: '#b91c1c',
        label: '> 601'
    }
    ];

    const legendWidth = 20;
    const legendHeight = 20;
    const legendX = 10;
    const legendY = 20;
    const legendSpacing = 10;

    // Create the legend group
    const legend = svg2.append('g')
        .attr('class', 'legend')
        .attr('transform', `translate(${legendX}, ${legendY})`);

    // Create legend rectangles and labels
    const legendItems = legend.selectAll('.legend-item')
        .data(colorCategories)
        .enter()
        .append('g')
        .attr('class', 'legend-item')
        .attr('transform', (d, i) => `translate(0, ${i * (legendHeight + legendSpacing)})`);

    legendItems.append('rect')
        .attr('width', legendWidth)
        .attr('height', legendHeight)
        .attr('fill', (d) => d.color);

    legendItems.append('text')
        .attr('x', legendWidth + 10)
        .attr('y', legendHeight / 2)
        .attr('dy', '0.35em')
        .text((d) => d.label);
}

// Init and Load SVG
async function loadSVG() {
    // Hide the map
    document.getElementById('main').hidden = true;

    // Set up the map container
    const container = d3.select("#map-container");

    // Define the width and height of the map
    width = parseInt(container.style("width"));
    height = parseInt(container.style("height")) + 250;

    // Create an SVG element within the container
    svg = container
        .append("svg")
        .attr("width", width)
        .attr("height", height);
}

// Load the map
async function loadMap(data, caseData) {
    if (document.getElementById("loading") != null) {
        document.getElementById("loading").remove();
    }
    document.getElementById('main').hidden = false;

    document.getElementsByTagName('svg')[0].innerHTML = '';

    // Create a projection for the map
    const projection = d3.geoMercator()
        .fitSize([width, height], data);

    // Create a path generator
    const path = d3.geoPath().projection(projection);

    // Render the map
    svg.selectAll("path")
        .data(data.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("class", "country")
        .attr("fill", (d) => {
            const country = d.properties.ADMIN;
            const countryData = caseData.find((item) => item['Country/Region'] === country);
            const cases = countryData ? countryData.Cases : 0;
            if (cases <= 100) {
                return '#fee2e2';
            } else if (cases <= 500) {
                return '#fecaca';
            } else if (cases <= 1000) {
                return '#fca5a5';
            } else if (cases <= 2000) {
                return '#ef4444';
            } else {
                return '#b91c1c';
            }
        });

    let zoom = d3.zoom()
        .scaleExtent([1, 8])
        .on('zoom', function (event, d) {
            svg.selectAll('path').attr('transform', event.transform);
        });

    svg.call(zoom);

    // Add hover interaction to the country elements
    svg.selectAll(".country")
        .on("mouseover", function (event, d) {
            //d3.select(this).attr("fill", "red");
            countryName = d.properties.ADMIN;
            countryCode = d.properties.ISO_A2;

            // console.log(countryName + ` (${countryCode})`);
            showPanel();
        })
}


async function getCountryData(country, recordDate) {
    // CSV file URL
    const csvFile = 'https://raw.githubusercontent.com/Khoa-bit/DSDV_FinalProject/main/data/netflix_titles_global.csv';

    try {
        const data = await d3.csv(csvFile);

        // Filter data by country
        const filteredData = data.filter(row => row['Country/Region'] === country);

        // Sum up the cases for the country
        const totalCases = filteredData.reduce((sum, row) => {
            const cases = parseInt(row[recordDate.toString()]);
            return sum + cases;
        }, 0);

        // Return the total cases
        return totalCases;
    } catch (error) {
        return 0;
    }
}
