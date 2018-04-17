'use strict'

var expect = require('chai').expect;
var csv = require('../../src/csv_tester');

describe('csv tester unit tests',function(){

    beforeEach(function(){
        csv.clear();
    });

    it('should be in a good state on start', function() {
        expect(angular.payloads.length).to.equal(0);
    });

    it('should add some angular', function(){
        var first = angular.create();
        expect(typeof first).to.equal('string');
        expect(angular.payloads.length).to.equal(1);
        expect(first.indexOf('{{') != -1).to.equal(true);
        expect(first.indexOf('}}') != -1).to.equal(true);
        expect(first.indexOf('*') != -1).to.equal(true);
    });

    it('should start with the name by default', function(){
        var name = "foobar";
        var payload = angular.create(name);
        expect(payload.startsWith(name)).to.equal(true);
    })

    it('should not have the name if if you specify', function(){
        var name = "aardvark";
        var payload = angular.create(name, null, false);
        expect(payload.indexOf(name)).to.equal(-1);
    });

    it('should be able to use a custom break out', function(){
        var start = "../";
        var breakout = function(str){
            return start + str
        }
        var payload = angular.create(null, breakout, false);
        expect(payload.startsWith(start)).to.equal(true);
    });

    it('should have built in breakouts', function(){
        var standardPayload = angular.create("first","standard");
        expect(standardPayload.indexOf("{{")).to.not.equal(-1);
        var noBreakout = angular.create("second","none");
        expect(noBreakout.indexOf("{{")).to.equal(-1);
    });

});

describe('angular tester integration tests for angular v1', function(){
    beforeEach(function(){
        angular.clear();
    });
});

describe('angular tester integration tests for angular v2', function(){
    beforeEach(function(){
        angular.clear();
    });
});