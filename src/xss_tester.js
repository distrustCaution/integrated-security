const base = require('./base_tester');
const breakoutConfig = require('./config/xssBreakouts.json');
const webdriver = require('selenium-webdriver');

var defaultBasePayload = function(str){
    return "console.error("+str+")";
}

/**
 * Builds an xss search object
 * @constructor
 * @param {*} name 
 * @param {*} breakout 
 * @param {*} useName 
 * @param {*} maxLength 
 * @param {*} basePayload 
 */
function xssTest(name,breakout,useName,maxLength,basePayload){
    //set up
    this.name = name ? name : base.randomString(maxLength);
    this.searchText = base.numHash(this.name,maxLength);
    this.breakout = base.breakoutConfigHandler(breakout,breakoutConfig); //To do select escape sequences from object

    this.useName = base.useNameHandler(useName);

    this.basePayload = basePayload ? basePayload : defaultBasePayload
    
    var tempPayload = this.breakout(this.basePayload(this.searchText));
    if (this.useName){
        this.payload = this.name + tempPayload;
    } else {
        this.payload = tempPayload
    }
}

/**
 * Gets the logs out of the web driver
 * @param {*} driver - Web driver object 
 */
var getLogs = async function(driver){
    return await driver.manage().logs().get(webdriver.logging.Type.BROWSER);
}

var verifyXss = async function(item, logs){
    if(!logs || !logs.length) return false; // if no logs, there is no issue to be found
    for (i in logs){
        if (logs[i].message.indexOf(item.searchText) > -1) return true;
    }
    return false;
}

module.exports = new base(xssTest,verifyXss,getLogs);