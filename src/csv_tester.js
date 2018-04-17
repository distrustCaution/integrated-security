const base = require('./base_tester');
const breakoutConfig = require('./config/csvBreakouts.json');

//For reading the csv file
var fs = require('fs');
const escapeStringRegexp = require('escape-string-regexp');

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

    this.useName = base.useNameHandler(useName, false);

    this.breakout = base.breakoutConfigHandler(breakout,breakoutConfig)
    var tempPayload = this.breakout(buildPayload(this.number));

    //Build search text:
    this.searchText = tempPayload[0]; //basically the first letter in the payload

    //Build regex
    var escapedString = escapeStringRegexp(tempPayload);
    this.searchRegex = new RegExp("(^[^,]"+escapedString+")|,([^,]*"+escapedString+")","mgi");

    //Build payload
    if (this.useName){
        this.payload = tempPayload + this.name;
    } else {
        this.payload = tempPayload;
    }

}
/**
 * Verifies if the injection exists, we don't need csv parsing to do this, just check that the breakout isn't left as is
 * @param {csvInjection} item 
 * @param {string} csvString 
 * @returns {boolean}
 */
var verifyCsv = async function(item,csvString){
    // find the search text
    var matches = csvSring.match(item.searchRegex);
    // if no matches, return false
    if(!matches || !matches.length) return false; 
    // for each match verify the csv injection
    for(var match in matches){
        if(matches[match].startsWith(this.searchText)){
            return true;
        }
    }
    // if nothing is found, then return false
    return false;
}
/**
 * Simply reads the csv file, does no parsing
 * @param {string} filepath - path to file, name says it all
 */
var readCsv = async function(filepath){
    return await fs.readFile(filepath)
}

module.exports = new base(csvInjection,verifyCsv,readCsv);