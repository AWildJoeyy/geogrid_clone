// Function to load country data from the new lightweight JSON file
async function loadCountryData() {
    try {
        const response = await fetch('lightweight_countries_data.json');
        if (!response.ok) throw new Error(`Failed to load country data: ${response.status}`);
        const countriesData = await response.json();
        return countriesData;
    } catch (error) {
        console.error('Error loading country data:', error);
        return null;
    }
}

// Function to generate random conditions for row and column headers
function generateRandomConditions() {
    const possibleConditions = [
        { type: 'tourists', description: "Number of tourists greater than", threshold: () => Math.floor(Math.random() * 50000 + 10000) },
        { type: 'gdp_per_capita', description: "GDP per capita greater than $", threshold: () => Math.floor(Math.random() * 30000 + 5000) },
        { type: 'population', description: "Population over", threshold: () => Math.floor(Math.random() * 50000 + 10000) },
        { type: 'co2_emissions', description: "CO2 emissions over", threshold: () => Math.floor(Math.random() * 5000 + 500) },
        { type: 'region', description: "Region in", threshold: () => ["Asia", "Europe", "Africa", "Northern America", "South America", "Oceania"][Math.floor(Math.random() * 6)] }
    ];

    const selectedConditions = [];
    while (selectedConditions.length < 6) {
        const randomCondition = possibleConditions[Math.floor(Math.random() * possibleConditions.length)];
        if (!selectedConditions.some(cond => cond.type === randomCondition.type)) {
            const condition = { ...randomCondition, value: randomCondition.threshold() };
            selectedConditions.push(condition);
        }
    }

    const rowConditions = selectedConditions.slice(0, 3);
    const columnConditions = selectedConditions.slice(3, 6);
    return { rowConditions, columnConditions };
}

// Function to create the grid dynamically based on conditions
function createGrid(rowConditions, columnConditions, countriesData) {
    const gridContainer = document.getElementById('grid-container');
    if (!gridContainer) {
        console.error("Grid container not found.");
        return;
    }
    gridContainer.innerHTML = ''; // Clear existing content

    // Create the top-left corner (invisible placeholder)
    const invisibleCell = document.createElement('div');
    invisibleCell.className = 'invisible-cell';
    gridContainer.appendChild(invisibleCell);

    // Create column headers
    columnConditions.forEach((condition, index) => {
        const header = document.createElement('div');
        header.className = 'category-header column-header';
        header.textContent = `${condition.description} ${condition.value}`;
        header.dataset.condition = JSON.stringify(condition); // Store condition for checking
        header.id = `column-header-${index + 1}`;
        gridContainer.appendChild(header);
    });

    // Create rows with row headers and cells
    rowConditions.forEach((rowCondition, rowIndex) => {
        // Row header
        const rowHeader = document.createElement('div');
        rowHeader.className = 'category-header row-header';
        rowHeader.textContent = `${rowCondition.description} ${rowCondition.value}`;
        rowHeader.dataset.condition = JSON.stringify(rowCondition); // Store condition for checking
        rowHeader.id = `row-header-${rowIndex + 1}`;
        gridContainer.appendChild(rowHeader);

        // Create cells for each column in this row
        columnConditions.forEach((colCondition, colIndex) => {
            const cell = document.createElement('div');
            cell.className = 'guess-cell';
            cell.dataset.country = ""; // Placeholder for country guesses
            gridContainer.appendChild(cell);

            // Add event listener for guessing
            cell.addEventListener('click', () => {
                const guess = prompt("Enter your guess for the country:");
                if (guess) {
                    const isCorrect = checkCountryConditions(guess, countriesData, rowCondition, colCondition);
                    if (isCorrect) {
                        const countryData = countriesData.find(country => country.name.toLowerCase() === guess.toLowerCase());
                        if (countryData && countryData.iso2) {
                            // Set background to the corresponding flag from `flags_svg` folder
                            cell.style.backgroundImage = `url('flags_svg/${countryData.iso2.toLowerCase()}.svg')`;
                        }
                        cell.classList.add('correct');
                        cell.style.pointerEvents = 'none'; // Make cell non-interactive
                    } else {
                        cell.classList.add('incorrect');
                        setTimeout(() => cell.classList.remove('incorrect'), 500);
                    }
                }
            });
        });
    });
}

// Function to evaluate if a country's data meets a given condition
function evaluateCondition(countryData, condition) {
    switch (condition.type) {
        case 'tourists':
            return parseInt(countryData.tourists || 0) > condition.value;
        case 'gdp_per_capita':
            return parseInt(countryData.gdp_per_capita || 0) > condition.value;
        case 'population':
            return parseInt(countryData.population || 0) > condition.value;
        case 'co2_emissions':
            return parseFloat(countryData.co2_emissions || 0) > condition.value;
        case 'region':
            return countryData.region === condition.value;
        default:
            return false;
    }
}

// Function to check if a guessed country meets the row and column conditions
function checkCountryConditions(countryName, countriesData, rowCondition, colCondition) {
    const countryData = countriesData.find(country => country.name.toLowerCase() === countryName.toLowerCase());
    if (!countryData) {
        alert(`Country data not found for ${countryName}.`);
        return false;
    }

    const rowCheck = evaluateCondition(countryData, rowCondition);
    const colCheck = evaluateCondition(countryData, colCondition);
    return rowCheck && colCheck;
}

// Initialize the game by loading country data and creating the grid
document.addEventListener("DOMContentLoaded", async () => {
    const countriesData = await loadCountryData();
    if (countriesData) {
        const { rowConditions, columnConditions } = generateRandomConditions();
        createGrid(rowConditions, columnConditions, countriesData);
    }
});
