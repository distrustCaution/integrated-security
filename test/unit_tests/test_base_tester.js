'use strict'

var expect = require('chai').expect;
var base_tester = require('../../src/base_tester');

describe('base_tester helper functions', function(){
    it('should give me a random string of n length',function(){
        var len = 7;
        var str = base_tester.randomString(len);
        expect(typeof str).to.equal('string');
        expect(str.length).to.equal(len);
    });

    it('should give me a hash of my string', function(){
        var len = 8;
        var str = base_tester.randomString();
        var hash = base_tester.numHash(str,len);
        expect(hash).to.not.equal(str);
        expect(hash.length <= len).to.equal(true);
    });

    it('should be able to make breakout functions', function(){
        var start = "start:";
        var middle = "middle";
        var end = ":end";
        var payloadMaker = base_tester.buildBreakout(start,end);
        expect(typeof payloadMaker).to.equal('function')
        var payload = payloadMaker(middle);
        expect(payload.startsWith(start)).to.equal(true);
        expect(payload.endsWith(end)).to.equal(true);
        expect(payload.indexOf(middle)).to.equal(start.length);
    });

    it('should handle breakout configs', function(){
        var start = "start:";
        var middle = "middle";
        var end = ":end";
        var name = "name"
        var config = {
             name : {
                "start": start,
                "end": end
            }
        }

        var payloadMaker = base_tester.breakoutConfigHandler(name,config);
        expect(typeof payloadMaker).to.equal('function');
        var payload = payloadMaker(middle);
        expect(payload.startsWith(start)).to.equal(true);
        expect(payload.endsWith(end)).to.equal(true);
        expect(payload.indexOf(middle)).to.equal(start.length);

    });

    it('should handle usename nicely', function(){
        expect(base_tester.useNameHandler(undefined)).to.equal(true);
        expect(base_tester.useNameHandler(null)).to.equal(true);
        expect(base_tester.useNameHandler(true)).to.equal(true);
        expect(base_tester.useNameHandler(false)).to.equal(false);
        expect(base_tester.useNameHandler(1)).to.equal(true);
        expect(base_tester.useNameHandler(0)).to.equal(false);
    });

});

describe('base_tester constructor',async function(){

    it('should be able to create a tester object correctly without a before all function', async function(){
        var create = function(name){
            this.payload = name; // must have the payload object
            this.name = name;
        }
        var verify = function(item, resource){
            return resource.indexOf(item.name) != -1;
        }
        var baseTester = new base_tester(create,verify);
        expect(baseTester.payloads.length).to.equal(0);

        var firstString = "first";
        var secondString = "second";
        
        var firstPayload = baseTester.create(firstString);
        expect(firstPayload).to.equal(firstString);
        expect(baseTester.payloads.length).to.equal(1);

        expect((await baseTester.verify(firstString+secondString)).length).to.equal(1); //expect it to find one error
        expect((await baseTester.verify("foobar")).length).to.equal(0); //expect it to find none

        var secondPayload = baseTester.create(secondString);
        expect(secondPayload).to.equal(secondString);
        expect(baseTester.payloads.length).to.equal(2);
        expect((await baseTester.verify(firstString+secondString)).length).to.equal(2); //expect it to find two errors
        expect((await baseTester.verify("adsfadsfadsfads"+firstString)).length).to.equal(1); //expect it to find one errors
        expect((await baseTester.verify("foobar")).length).to.equal(0); //expect it to find none
        
        baseTester.clear();
        expect(baseTester.payloads.length).to.equal(0);
        
    });
    
    it('should be able to create a tester object correctly with a before all function', async function(){
        var create = function(name){
            this.payload = name; // must have the payload object
            this.name = name;
        }
        var verify = function(item, resource){
            return resource.indexOf(item.name) != -1;
        }
        var beforeAll = function(resource){
            return resource.toString();
        }
        var baseTester = new base_tester(create,verify,beforeAll);
        expect(baseTester.payloads.length).to.equal(0);

        var firstString = "first";
        var secondString = "second";
        
        var firstPayload = baseTester.create(firstString);
        expect(firstPayload).to.equal(firstString);
        expect(baseTester.payloads.length).to.equal(1);
        expect((await baseTester.verify(firstString+secondString)).length).to.equal(1); //expect it to find one error
        expect((await baseTester.verify("foobar")).length).to.equal(0); //expect it to find none

        var secondPayload = baseTester.create(secondString);
        expect(secondPayload).to.equal(secondString);
        expect(baseTester.payloads.length).to.equal(2);
        expect((await baseTester.verify(firstString+secondString)).length).to.equal(2); //expect it to find two errors
        expect((await baseTester.verify("adsfadsfadsfads"+firstString)).length).to.equal(1); //expect it to find one errors
        expect((await baseTester.verify("foobar")).length).to.equal(0); //expect it to find none
        
        baseTester.clear();
        expect(baseTester.payloads.length).to.equal(0);
    });
});