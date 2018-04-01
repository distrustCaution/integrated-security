var sha1 = require('sha1');

const commonLength = 5; //default 5 length

/**
 * Represents a tester object
 * @constructor
 * @param {function} myCreate - The constructor that creates your payloads 
 * @param {function} myVerify - The verify function that returns a boolean
 * @param {function} myBeforeAll - Function to run before all 
 * @param {string} myConfigFile 
 */
function baseTester(myCreate,myVerify,myBeforeAll,myConfigFile){

    this.payloads = []; 

    this.clear = function() {
        this.payloads = [];
    }

    this.create = function(){
        var item = Object.create(myCreate.prototype);
        myCreate.apply(item,arguments);
        this.payloads.push(item);
        return item.payload;
    }

    var beforeAll = this.beforeAll = myBeforeAll ? myBeforeAll : async function(resource){ return resource; }

    this.verify = async function(resource){
        var fullResource = await beforeAll(resource);
        var result = [];
        for (var item in this.payloads){
            if (await myVerify(this.payloads[item],fullResource)){
                result.push(this.payloads[item]);
            }
        }
        return result;
    }
}

/**
 * Returns a (non-cryptographically secure) random string
 * @param {number=} [len=5] - length of desired number 
 */
baseTester.randomString = function(len){
    if(!len) len = commonLength; 
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  
    for (var i = 0; i < len; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  
    return text;
}

/**
 * Returns a (non-cryptographically secure) random number as a string
 * @param {number=} [len=5] - length of desired number 
 */
baseTester.randomNumber = function(len){
    if(!len) len = commonLength; 
    var text = "";
    var possible = "0123456789";
  
    for (var i = 0; i < len; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  
    return text;
}

/**
 * Turns a string into a numeric hash, then cuts down the numeric hash to a short length to output to a string
 * @param {string} str - The string you can key off of
 * @param {number=} [maxLen=5] - The maximum length of the string 
 */
baseTester.numHash = function(str, maxLen){
    var strHash = sha1(str);
    if(!maxLen) maxLen = commonLength;
    var hash = 0;
	if (strHash.length == 0) return hash;
	for (i = 0; i < strHash.length; i++) {
		char = strHash.charCodeAt(i);
		hash = ((hash<<5)-hash)+char;
		hash = hash & hash; // Convert to 32bit integer
    }

    //convert number to string and shorten it to the desired length
    var output = Math.abs(hash).toString();
    //take the first n letters
	return output.slice(0,maxLen);
}

/**
 * Returns a function that will append the start and end to a string. This is useful for building breakout sequences.
 * @param {string} start 
 * @param {string} end 
 */
baseTester.buildBreakout = function(start, end){
    return function(str){
        return start + str + end;
    }
}

/**
 * Handles a list of breakouts
 * @param {string=|Function=} breakout 
 * @param {Object} config 
 */
baseTester.breakoutConfigHandler = function(breakout, config){
    if(!breakout){
        var standard = "standard";
        return baseTester.buildBreakout(config[standard]["start"], config[standard]["end"]);
    } else if (typeof breakout == 'string' && breakout in config){
        return baseTester.buildBreakout(config[breakout]["start"], config[breakout]["end"]);
    } else if (typeof breakout == 'function'){
        return breakout;
    } else {
        throw new TypeError();
    }
}

/**
 * Helper function that turns garbage into a true boolean 
 * @param {*=} useName 
 */
baseTester.useNameHandler = function(useName){
    if(useName == null){
        return true; //use it by default
    } else {
       return useName ? true : false; //so garbage becomes a boolean
    }
}

module.exports = baseTester;