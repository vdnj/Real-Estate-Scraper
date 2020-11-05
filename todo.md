1. Get seloger.com's url to scrape and filter keywords on GS, + create list that will contain objects with scrapped datas of the last page (to get only recents anounces)
2. Connect to the url, and, while there are anounces on the page:
3. Get array of all anounces on the page, and for each anounce in the array:
    a. Open next anounce
    b. create object that will contain scrapped datas + scrape datas 
    c. if description doesn't contain filter keyword, push object in array
4. Delete existing rows in SS and add new ones