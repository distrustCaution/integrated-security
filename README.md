# Integrated-Security-Testing (NodeJS)
Useful tools to help you turn integration tests into security tests. 

# Use as part of your test framework 

## Install

To add it to your project run:

```npm install --save-dev integrated-security```

## Use

### XSS

``` 
//require the xss module
var xss = require('integrated-security').xss

//in your before each statement

xss.reset(); // This clears what the xss injector is looking for

//inside your test, create your payload

var username = xss.create("myName");

//after using the payload as part of the test, verify the value by passing in the web driver object

// await syntax:

var results = await xss.verify(webDriver)

// promise syntax

xss.verify(webDriver).then(function(results){ 
    //Throw any assertions you want here based on the results
});
