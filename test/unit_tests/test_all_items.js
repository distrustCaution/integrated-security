var integratedSecurity = require('../../index');
var expect = require('chai').expect;

describe('integrated security', function(){
    it('all payloads should start as zero length', function(){
        expect(integratedSecurity.angular.payloads.length).to.equal(0);
        expect(integratedSecurity.xss.payloads.length).to.equal(0);
    });
});