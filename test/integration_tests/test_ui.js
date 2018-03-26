var webdriver = require("selenium-webdriver");
const {Builder, By, Key, until} = require('selenium-webdriver');
var expect = require('chai').expect;
let server = require('../example_server/example_server');

var requestPromise = require('request-promise');


var capabilities = {
    'browserName': 'chrome',
    'proxy': {
        'proxyType': 'manual',
        'httpProxy': 'localhost:8080',
        'httpsProxy': 'localhost:8080',
        'sslProxy': 'localhost:8080'
      }
}

const port = 8000;
const standardTimeout = 2000;
const testTimeout = standardTimeout * 20;
const baseUri = "http://localhost:"+port
var proxyUri = "http://localhost:8080"

var sleep = function(ms) {
    if(!ms) ms = standardTimeout;
    return new Promise(resolve => setTimeout(resolve, ms));
}

//with proxy 
var r = requestPromise.defaults({'proxy':proxyUri});
//without proxy 
// var r = requestPromise;

async function createDriver() {
   var driver = new webdriver.Builder()
    //    .withCapabilities(webdriver.Capabilities.chrome()) //without proxy
       .withCapabilities(capabilities) // with proxy
       .build();
   return driver;
}      

describe("UI test to share an item ", function(){
    var driver;

    var fooUser = {"username":"Foo","password":"foo"};
    var barUser = {"username":"Bar","password":"bar"};

    var note = {"title":"my note title!!", "data":"my note itself. "};

    before(async function(){
        await server.start(port);
    });

    after(function(){
        if(driver && driver.quit) driver = driver.quit();
        server.server.close();        
    });
    
    it('should start the driver', async function(){
        driver = await createDriver();  
    }).timeout(testTimeout);

    it('should let make users via the api', async function(){
        var fooResult = await r({
            method: 'POST',
            uri:baseUri+"/api/account/",
            body: fooUser,
            json: true
        })
        expect(fooResult.message).to.not.be.null;
        var barResult = await r({
            method: 'POST',
            uri:baseUri+"/api/account/",
            body: barUser,
            json: true
        })
        expect(barResult.message).to.not.be.null;
    }).timeout(testTimeout);

    it('should let you log in', async function(){

        driver.get("localhost:"+port+"/login"); 
        await sleep();
        var result = await driver.wait(webdriver.until.elementLocated(webdriver.By.name('username')));
        await sleep();
        var username = await driver.findElement(webdriver.By.name("username"));
        username.sendKeys(fooUser.username);
        await sleep();
        var password = await driver.findElement(webdriver.By.name("password"));
        password.sendKeys(fooUser.password);
        await sleep();
        var submit = await driver.findElement(By.id("login"));
        submit.click();
        await sleep();
        await driver.wait(webdriver.until.elementLocated(webdriver.By.id('allNotesTitle')));
        await sleep(); 

    }).timeout(testTimeout);

    it('should let you make a note', async function(){        
        var newNote = await driver.findElement(By.id("newNote"));
        newNote.click();

        await sleep();

        await driver.wait(webdriver.until.elementLocated(webdriver.By.id('notetitle')));

        await sleep();

    }).timeout(testTimeout);

    it('should let you change the note', async function(){
        
        var notetitle = await driver.findElement(webdriver.By.id("notetitle"));
        await notetitle.sendKeys(Key.CONTROL,"a");
        await notetitle.sendKeys(Key.DELETE);
        await notetitle.sendKeys(note.title);
        
        await sleep();

        var notebody = await driver.findElement(webdriver.By.id("notebody"));
        await notebody.sendKeys(Key.CONTROL,"a");
        await notebody.sendKeys(Key.DELETE);
        await notebody.sendKeys(note.data);

        await sleep();        

        var saveButton = await driver.findElement(By.id("saveButton"));
        saveButton.click();

        await sleep();

        notebody = await driver.findElement(webdriver.By.id("notebody")).getText().then((text) => {
          return text
        });

        expect(notebody).to.equal(note.data);

        notetitle = await driver.findElement(webdriver.By.id("notetitle")).getText().then((text) => {
            return text
        });
  
        expect(notetitle).to.equal(note.title);
        
    }).timeout(testTimeout);

    it('should let you share a note with someone', async function(){
        var share = await driver.findElement(By.id("share"));
        await share.sendKeys(barUser.username);
        var shareButton = await driver.findElement(By.id("shareButton"));
        await shareButton.click();
        await sleep();
        var shareResult = await driver.findElement(webdriver.By.id("shareresult")).getText().then((text) => {
            return text
        });
        await sleep()
        expect(shareResult).to.include('Successfully');
        await sleep();
    }).timeout(testTimeout);

    it('should have the shared note on the other user\'s page', async function(){

        driver.get("localhost:"+port+"/login"); 
        await sleep();
        var result = await driver.wait(webdriver.until.elementLocated(webdriver.By.name('username')));
        await sleep();
        var username = await driver.findElement(webdriver.By.name("username"));
        username.sendKeys(barUser.username);
        await sleep();
        var password = await driver.findElement(webdriver.By.name("password"));
        password.sendKeys(barUser.password);
        await sleep();
        var submit = await driver.findElement(By.id("login"));
        submit.click();
        await sleep();
    }).timeout(testTimeout);
    
    it('should be accessible to the other user', async function(){ 

        var item = await driver.executeScript("return Array.from(document.querySelectorAll('a')).find(el => el.textContent === '"+note.title+"');")
        await sleep();
        await item.click();
        await sleep();

        var notebody = await driver.findElement(webdriver.By.id("notebody")).getText().then((text) => {
            return text
        });
        expect(notebody).to.equal(note.data);
        await sleep();

        var notetitle = await driver.findElement(webdriver.By.id("notetitle")).getText().then((text) => {
            return text
        });
        expect(notetitle).to.equal(note.title);
        await sleep();

    }).timeout(testTimeout);

});