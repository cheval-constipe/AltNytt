const puppeteer = require('puppeteer');

async function scrapeNRK() {
    try {
        const url = 'https://www.nrk.no/';

        const browser = await puppeteer.launch({ headless: 'new' });
        const page = await browser.newPage();

        await page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36'
        );
        await page.setViewport({ width: 1920, height: 1080 });
        await page.goto(url);
        await page.waitForSelector('.kur-room__title');

        const headlineElements = await page.$$('.kur-room');
        const headlines = [];

        for (const element of headlineElements) {
            const title = await element.$eval('.kur-room__title', (node) => node.textContent.trim());
            const articleLink = await element.$eval('a', (node) => node.getAttribute('href'));
            const imageLinks = await element.$$eval('img[data-srcset], source[data-srcset]', (nodes) =>
                nodes.flatMap((node) => {
                    const srcset = node.getAttribute('data-srcset');
                    const sources = srcset.split(',');
                    return sources.map((source) => source.trim().split(' ')[0]);
                })
            );
            const imageLink = imageLinks[imageLinks.length - 1];

            const headline = {
                title: title,
                articleLink: articleLink,
                imageLink: imageLink
            };

            headlines.push(headline);
        }

        await browser.close();

        return JSON.stringify(headlines, null, 2);
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

async function scrapeVG() {
    try {
        const url = 'https://www.vg.no/';

        const browser = await puppeteer.launch({ headless: 'new' });
        const page = await browser.newPage();

        await page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36'
        );
        await page.setViewport({ width: 1920, height: 1080 });
        await page.goto(url);
        await page.waitForSelector('.article.article-extract');

        const headlineElements = await page.$$('.article.article-extract');
        const headlines = [];

        for (const element of headlineElements) {
            try {
                const title = await element.$eval('.headline', (node) =>
                    node.textContent.trim().replace(/\n/g, ' ').replace(/\s{2,}/g, ' ')
                );
                const articleLink = await element.$eval('a', (node) => node.getAttribute('href'));
                const imageLink = await element.$eval('img.article-image', (node) => node.getAttribute('src'));

                const headline = {
                    title: title,
                    articleLink: articleLink,
                    imageLink: imageLink
                };

                headlines.push(headline);
            } catch (error) {
                // Ignore article if image element is not found
                continue;
            }
        }

        await browser.close();

        return JSON.stringify(headlines, null, 2);
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

scrapeVG()
    .then((data) => {
        console.log(data);
    })
    .catch((error) => {
        console.error('Error:', error);
    });


/*
scrapeNRK()
    .then((data) => {
        console.log(data);
    })
    .catch((error) => {
        console.error('Error:', error);
    });
*/