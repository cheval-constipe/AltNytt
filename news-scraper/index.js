const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeNRKHeadlines() {
    try {
        const response = await axios.get('https://www.nrk.no/');
        const $ = cheerio.load(response.data);

        const headlines = [];

        $('.kur-room--standard.kur-room-wrapper').each((index, element) => {
            const $headline = $(element).find('.kur-room__title span');
            const $image = $(element).find('.kur-room__artwork img');

            const title = $headline.text().trim();
            const imageUrl = $image.attr('src');

            // Store the title and image URL in an object
            const headlineData = {
                title,
                imageUrl,
            };

            headlines.push(headlineData);
        });

        console.log(headlines); // Example: Log the scraped headlines to the console
    } catch (error) {
        console.error('Error scraping NRK headlines:', error);
    }
}

// Invoke the function to start scraping
scrapeNRKHeadlines();
