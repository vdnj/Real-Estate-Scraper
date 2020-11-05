// Import of necessary modules
const puppeteer = require('puppeteer');
const Sheet = require('./sheet');

(async () => {

    // 1. Get seloger.com's url to scrape and filter keywords on GS, + create list that will contain objects with scrapped datas of the last page (to get only recents anounces)
    const sheet = new Sheet();
    await sheet.load();
    
    const urlRows = await sheet.getRows(0);
    const selogerUrl = urlRows[0].seloger;

    const filterRows = await sheet.getRows(1);
    const filterKeywords = (await filterRows[0].filters).split(', ');
    
    const scrapedAnounces = [];

    // 2. Connect to the url: 
    const browser = await puppeteer.launch({headless:false, args: ['--start-fullscreen'], defaultViewport: null});
    const page = await browser.newPage();
    await page.goto(selogerUrl);
    await page.waitForSelector('.djVfZb');

    // 3. Get array of all anounces on the page, and for each anounce in the array:
    let anounces = await page.$$('.djVfZb');

    for (let anounce of anounces) {
        //      a. open next anounce:
        await anounce.click();
        await page.waitForTimeout(3000);
        let anouncePage = (await browser.pages())[2];
        if(anouncePage.url().includes('selogerneuf')){
            await anouncePage.close();
            continue;
        }
        await anouncePage.waitForSelector('.sWNHa');
        
        //     b. create object that will contain scrapped datas + scrape datas
        const url = anouncePage.url();
        const ref = await anouncePage.$eval('.sWNHa', el => el.textContent.split(': ')[1]);
        const type = await anouncePage.$eval('.bQVvuG', el => el.textContent);
        const location = await anouncePage.$eval('.jqlODu', el => el.textContent);

        const vendorName = await anouncePage.$eval('.lnUnld', el => el.textContent);
        await anouncePage.click('.kCjgMH'); // to display phone number
        await anouncePage.waitForTimeout(200);
        const vendorNum = await anouncePage.$eval('.kCjgMH', el => el.textContent);
        const vendor = vendorName + ' : ' + vendorNum

        const rooms = await anouncePage.$eval('.fmGXPj div:nth-child(2)', el => el.textContent.split(' ')[0]);
        let areaIndex = chambersIndex = ppmIndex = 0 ; // If there is only 1 room, number of chambers won't be displayed, so the nth-child will not be the same :
        if(Number(rooms)===1){
            areaIndex = 2;
            ppmIndex = 3;
        } else {
            chambersIndex = 2;
            areaIndex = 3;
            ppmIndex = 4;
        }
        let chambers;
        if(chambersIndex===2){
            chambers = await anouncePage.$eval(`.fmGXPj:nth-child(${chambersIndex}) div:nth-child(2)`, el => el.textContent.split(' ')[0]);
        }
        const area = await anouncePage.$eval(`.fmGXPj:nth-child(${areaIndex}) div:nth-child(2)`, el => el.textContent.split(' ')[0]);
        const price = await anouncePage.$eval('.dVzJN', el => el.textContent);
        const pricePerMeter = await anouncePage.$eval(`.fmGXPj:nth-child(${ppmIndex}) div:nth-child(2)`, el => el.textContent.split(' / ')[0]);
        
        const moreBtns = await anouncePage.$$('.gDEVQY'); // Click on all 'Afficher plus' btns
        if(moreBtns){
            for (moreBtn of moreBtns){
                await moreBtn.click();
            }
        }

        const description = await anouncePage.$eval('.fHzMfE', el =>{
            let desc = 'Description : ';
            Array.from(el.querySelectorAll('p')).forEach(e => desc += e.textContent);
            return desc; 
        });

        let characteristics = '';
        const characsDivs = await anouncePage.$$('.fHzMfE');
        for (let characsDiv of characsDivs){

            // check if the div contains characteristics by inspecting h3 with given words that should be included
            let isCharacsDiv = await characsDiv.$eval('h3', el => {
                const checkIfIncludes = (str, arr) => {
                    let contains = false;
                    for (let item of arr){
                        if(str.includes(item)){
                            contains = true;
                        }
                    }
                    return contains;
                }
                const words = ['Général', 'plus' , 'intérieur', 'extérieur', 'Autres'];
                if(checkIfIncludes(el.textContent, words)){
                    return true;
                } else {
                    return false;
                }
            })

            if(isCharacsDiv){
                characteristics += await characsDiv.$eval('h3', el => el.textContent + ' : ');
                let figcaptions = await characsDiv.$$('figcaption');
                let lis = await characsDiv.$$('li');
                if(figcaptions.length>0){
                    for(let figcaption of figcaptions){
                        let charac = await (await figcaption.getProperty('textContent')).jsonValue();
                        characteristics += charac + ', ';
                    }
                    characteristics = characteristics.slice(0,-2);
                    characteristics += '\n';
                } else {
                    for(let li of lis){
                        let charac = await (await li.getProperty('textContent')).jsonValue();
                        characteristics += charac + ', ';
                    }
                    characteristics = characteristics.slice(0,-2);
                    characteristics += '\n';
                }
            }
        }

        const datas = {url, ref, type, location, rooms, area, price, pricePerMeter, description, characteristics, vendor};
        chambers ? datas.chambers = chambers : datas.chambers = 'NA';
        console.log({datas});
        await anouncePage.close();

        //      c. if description and characteristics don't contain filter keyword, push object in array
        let banned = false;
        for(let filterKeyword of filterKeywords){
            if(datas.description.toLowerCase().includes(filterKeyword.toLowerCase()) || datas.characteristics.toLowerCase().includes(filterKeyword.toLowerCase())){
                banned = true;
            }
        }
        if(!banned){
            scrapedAnounces.push(datas);
        }
        
    }
    console.log('all anounces checked');
    await browser.close();

    // 4. Delete existing rows in SS and add new ones:
    let oldRows = await sheet.getRows(2);
    while(oldRows.length>0){
        console.log(oldRows.length, ' oldrows');
        for(let oldRow of oldRows){
            await oldRow.delete();
        }
        oldRows = await sheet.getRows(2);
    }
    await sheet.addRows(scrapedAnounces, 2);

})();
