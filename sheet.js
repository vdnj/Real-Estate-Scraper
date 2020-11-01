const { GoogleSpreadsheet } = require('google-spreadsheet');

module.exports = class Sheet{

    constructor(){
        this.doc = new GoogleSpreadsheet('1v3bVqCtnPNXY85iZL2RG_LxR806nKUsGzfdSuEeWvZo');
    }

    async load(){
        await this.doc.useServiceAccountAuth(require('./credentials.json'));
        await this.doc.loadInfo();
    }

    async addRows(rows, i){
        const sheet = this.doc.sheetsByIndex[i];
        await sheet.addRows(rows);
    }

    async getRows(i){
        const sheet = this.doc.sheetsByIndex[i];
        const rows = await sheet.getRows();
        return rows;
    }

    async addSheet(title, headerValues){
        await this.doc.addSheet({ title , headerValues});
        return this.doc.sheetsByIndex.length -1;
    }

}