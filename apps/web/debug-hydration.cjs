const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    page.on('console', msg => {
        console.log(`[${msg.type().toUpperCase()}] ${msg.text()}`);
    });

    console.log('Navigating to quick-login...');
    await page.goto('http://localhost:5005/quick-login');

    await page.waitForSelector('button[type="submit"]');
    console.log('Clicking login...');
    await page.click('button[type="submit"]');

    console.log('Waiting 4s for navigation...');
    await new Promise(r => setTimeout(r, 4000));

    console.log('Current URL: ' + page.url());
    const html = await page.evaluate(() => document.documentElement.outerHTML);
    console.log('--- HYDRATED HTML ---');
    console.log(html);

    await browser.close();
})();
