const fs = require('fs');

// Define simplified region mappings
const regionMappings = {
    "northern europe": "Europe",
    "western europe": "Europe",
    "eastern europe": "Europe",
    "southern europe": "Europe",
    "central europe": "Europe",
    "europe": "Europe",
    "northern asia": "Asia",
    "western asia": "Asia",
    "eastern asia": "Asia",
    "southern asia": "Asia",
    "central asia": "Asia",
    "asia": "Asia",
    "northern africa": "Africa",
    "western africa": "Africa",
    "eastern africa": "Africa",
    "southern africa": "Africa",
    "central africa": "Africa",
    "africa": "Africa",
    "micronesia": "Oceania",
    "polynesia": "Oceania",
    "central america": "North America",
    "caribbean": "North America"
};

// Function to simplify a region string based on the mappings
function simplifyRegion(region) {
    // Convert region to lowercase to match mappings
    const regionLower = region.toLowerCase();

    // Check if the region matches any mapping and return the simplified region
    for (const key in regionMappings) {
        if (regionLower.includes(key)) {
            return regionMappings[key];
        }
    }

    // Return the original region if no match is found (for unknown regions)
    return region;
}

// Read the existing lightweight_countries_data.json file
fs.readFile('lightweight_countries_data.json', 'utf8', (err, data) => {
    if (err) {
        console.error("Error reading lightweight_countries_data.json:", err);
        return;
    }

    // Parse the JSON data
    let countriesData = JSON.parse(data);

    // Update the region field for each country
    countriesData = countriesData.map(country => {
        country.region = simplifyRegion(country.region);
        return country;
    });

    // Convert updated data to JSON string
    const output = JSON.stringify(countriesData, null, 2);

    // Write the modified data back to lightweight_countries_data.json
    fs.writeFile('lightweight_countries_data.json', output, 'utf8', err => {
        if (err) {
            console.error("Error writing to lightweight_countries_data.json:", err);
        } else {
            console.log("Regions simplified and saved to lightweight_countries_data.json");
        }
    });
});
