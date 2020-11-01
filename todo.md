1. Get seloger.com's url to scrape and filter keywords on GS, + create list that will contain objects with scrapped datas
2. Connect to the url, and , while there is a page:
    a. Get array of anounces on this page
    a. For each anounce in the array, open next anounce
    b. refilter based on certain criterias (keywords, ...);
    c. on crée l'objet qui va contenir les données scrappées
    d. on récupère les données pour chaque annonce
    e. on push l'objet dans la liste
3. On classe les données scrapées dans la liste (définir la méthode, s'ils existent déja dans le tableau que faire, ...)