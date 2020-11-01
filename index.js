// Import of necessary modules
const puppeteer = require('puppeteer');
const Sheet = require('./sheet');

(async () => {

    // 1. Get seloger.com's url to scrape and filter keywords on GS, + create list that will contain objects with scrapped datas
    const sheet = new Sheet();
    await sheet.load();
    
    const urlRows = await sheet.getRows(0);
    const selogerUrl = urlRows[0].seloger;

    const filterRows = await sheet.getRows(1);
    const filterKeywords = (await filterRows[0].filters).split(', ');
    
    const announces = [];

    // 2. Connect to the url, and , while there is a page: 
    const browser = await puppeteer.launch({headless:false, args: ['--start-fullscreen'], defaultViewport: null});
    const page = await browser.newPage();
    await page.goto(selogerUrl);
    await page.waitForSelector('.djVfZb');
    
    while(true){
        //     a. Get array of anounces on this page
        let anounces = await page.$$('.djVfZb');

        //     b. for each anounce in the array, open next anounce:
        for(let anounce of anounces){
            console.log('YEE');

            //     c. refilter based on certain criterias (keywords, ...);
    
            //     d. create object that will contain scrapped datas
            const datas = {};
    
            //     e. scrape datas on récupère les données pour chaque annonce


        }

        // f. close browser
        await browser.close();
        break
    }
    
    


})();
