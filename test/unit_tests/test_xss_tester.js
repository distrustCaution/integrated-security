'use strict'

var expect = require('chai').expect;
var xss = require('../../xss_tester');
var xssConfig = require('../../config/xssBreakouts.json');

describe('xss tester unit tests',function(){

    beforeEach(function(){
        xss.clear();
    });

    it('should be in a good state on start', function() {
        expect(xss.payloads.length).to.equal(0);
    });

    it('should add some xss', function(){
        var first = xss.create();
        expect(typeof first).to.equal('string');
        expect(xss.payloads.length).to.equal(1);
        expect(first.indexOf('console.log') != -1).to.equal(true);
    });

    it('should start with the name by default', function(){
        var name = "foobar";
        var payload = xss.create(name);
        expect(payload.startsWith(name)).to.equal(true);
    })

    it('should not have the name if if you specify', function(){
        var name = "aardvark";
        var payload = xss.create(name, null, false);
        expect(payload.indexOf(name)).to.equal(-1);
    });

    it('should be able to use a custom break out', function(){
        var start = "../";
        var breakout = function(str){
            return start + str
        }
        var payload = xss.create(null, breakout, false);
        expect(payload.startsWith(start)).to.equal(true);
    });

    it('should have built in breakouts', function(){
        Object.keys(xssConfig).forEach(function(key){
            var payload = xss.create(null,key,false);
            expect(payload.startsWith(xssConfig[key]["start"])).to.equal(true);
            expect(payload.endsWith(xssConfig[key]["end"])).to.equal(true);
        });
    });

});

describe('xss tester integration tests', function(){
    beforeEach(function(){
        xss.clear();
    });
});