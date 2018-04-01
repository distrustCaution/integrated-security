const base = require('./base_tester');
const breakoutConfig = require('./config/angularBreakouts.json')
/**
 * Builds the most basic payload using a multiplier
 * @param {number} num 
 */
var buildPayload = function(num){
    return num+"*"+num;
}

var angularInjection = function(name, breakout, useName, maxLength, maxNumLength){
    this.name = name ? name : base.randomString(maxLength);
    if(!maxNumLength) maxNumLength = 2; // usually use 2 digit numbers
    this.number = base.numHash(this.name, maxNumLength);
    this.searchText = (this.number * this.number).toString();
    

    this.useName = base.useNameHandler(useName);

    this.breakout = base.breakoutConfigHandler(breakout,breakoutConfig)

    var tempPayload = this.breakout(buildPayload(this.number));
    if (this.useName){
        this.payload = this.name + tempPayload;
    } else {
        this.payload = tempPayload;
    }

}

var verifyAngular = async function(item,html){
    return html.indexOf(item.searchText) != -1 //if the multiplied number exists in html, then return true
}

var getHtml = async function(driver){
    return await driver.executeScript("return document.body.innerHTML"); //get all the html
}

module.exports = new base(angularInjection,verifyAngular,getHtml);