const base = require('./base_tester');
const breakoutConfig = require('./config/csvBreakouts.json');

var defaultBasePayload = function(str){
    return "console.error("+str+")";
}

/*
CSV Injection

CSV Injection is simple, yet devastating. The principle is as follows:
Send in a payload with a formula like =2+2+cmd|' /C calc..blablabla
If Excel opens the csv, it will evaluate the formula if the sign is not escaped. This can be used to get remote code execution.

*/

/**
 * Builds the most basic payload using a multiplier
 * @param {number} num 
 */
var buildPayload = function(num){
    return num+"*"+num;
}

var csvInjection = function(name, breakout, useName, maxLength, maxNumLength){
    this.name = name ? name : base.randomString(maxLength);
    if(!maxNumLength) maxNumLength = 3; // usually use 3 digit numbers
    this.number = base.numHash(this.name, maxNumLength);
    this.searchText = (this.number * this.number).toString();
    

    this.useName = base.useNameHandler(useName, false);

    this.breakout = base.breakoutConfigHandler(breakout,breakoutConfig)

    var tempPayload = this.breakout(buildPayload(this.number));
    if (this.useName){
        this.payload = tempPayload + this.name;
    } else {
        this.payload = tempPayload;
    }

}

var verifyCsv = async function(item,html){
}

var readCsv = async function(driver){
}

module.exports = new base(csvInjection,verifyCsv,readCsv);