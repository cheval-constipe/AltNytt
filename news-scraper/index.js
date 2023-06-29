const puppeteer = require('puppeteer');

async function scrapeNRK() {
    try {
        const url = 'https://www.nrk.no/';

        // Launch a headless browser in the new headless mode
        const browser = await puppeteer.launch({ headless: 'new' });
        const page = await browser.newPage();

        // Set the user agent to mimic a regular browser
        await page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36'
        );

        // Emulate a device with a larger screen resolution
        await page.setViewport({ width: 1920, height: 1080 });

        // Navigate to the NRK.no website
        await page.goto(url);

        // Wait for the headline elements to load
        await page.waitForSelector('.kur-room__title');

        // Get all the headline elements
        const headlineElements = await page.$$('.kur-room');

        // Print only the first 10 headline elements for analysis
        const limitedHeadlineElements = headlineElements.slice(0, 10);

        // Iterate over each limited headline element and extract the title, article link, and picture element HTML
        for (const element of limitedHeadlineElements) {
            const title = await element.$eval('.kur-room__title', (node) => node.textContent.trim());
            const articleLink = await element.$eval('a', (node) => node.getAttribute('href'));
            const pictureHTML = await element.$eval('picture', (node) => node.outerHTML);

            console.log('Title:', title);
            console.log('Article Link:', articleLink);
            console.log('Picture Element HTML:', pictureHTML);

            // Extract the last image source from data-srcset in <img> or <source> elements
            let imageSrc = null;

            // Look for url in data-srcset in <img>
            imageSrc = await element.$eval('img[data-srcset]', (node) => {
                console.log('Image Source: Found in <img> data-srcset');
                const srcset = node.getAttribute('data-srcset');
                const sources = srcset.split(',');
                const lastSource = sources[sources.length - 1];
                return lastSource.split(' ')[0].trim();
            }).catch(() => { });

            // If none found, look for url in data-srcset in <source>
            if (!imageSrc) {
                imageSrc = await element.$eval('source[data-srcset]', (node) => {
                    console.log('Image Source: Found in <source> data-srcset');
                    const srcset = node.getAttribute('data-srcset');
                    const sources = srcset.split(',');
                    const lastSource = sources[sources.length - 1];
                    return lastSource.split(' ')[0].trim();
                }).catch(() => { });
            }

            // If none of the above worked, use src in <img> (last resort option)
            if (!imageSrc) {
                imageSrc = await element.$eval('img[src]', (node) => {
                    console.log('Image Source: Found in <img> src');
                    return node.getAttribute('src');
                }).catch(() => {
                    console.log('Image Source: None of the fallback options worked. No image source found.');
                });
            }

            console.log('Image Link:', imageSrc);
            console.log('-----------------------------');
        }

        // Close the browser
        await browser.close();
    } catch (error) {
        console.error('Error:', error);
    }
}

scrapeNRK();
