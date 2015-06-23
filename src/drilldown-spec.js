'use strict';

var dd = require('./drilldown');
var _ = require('lodash');

describe('drilldown', function() {
    var example;
    beforeEach(function() {
        example = {
            foo: 'foo value',
            bar: sinon.spy(),
            baz: [
                {name: 'item 0'},
                {name: 'item 1'},
                {name: 'item 2'}
            ],
            quux: {
                ping: {
                    pong: true
                }
            }
        };
    });

    it('should access top-level properties', function() {
        expect(dd(example)('foo').val).to.equal(example.foo);
    });
    it('should access deeply-nested properties', function() {
        expect(dd(example)('quux')('ping').val).to.equal(example.quux.ping);
    });
    it('should not fail when accessing non-object properties', function() {
        expect(dd(example)('nothing')('here').val).to.be.undefined();
    });
    it('should not fail when the first dd argument is undefined', function() {
        expect(dd(undefined)(null)(false).val).to.be.undefined();
    });
    it('should be able to access array indices', function() {
        expect(dd(example)('baz')(1)('name').val).to.equal(example.baz[1].name);
    });
    it('should be able to change the value of a deeply-nested property', function() {
        var originalValue = example.quux.ping.pong;
        expect(dd(example)('quux')('ping')('pong').val).to.equal(originalValue);
        var newValue = false;
        var newResult = dd(example)('quux')('ping')('pong').set(newValue);
        expect(newResult).to.equal(newValue);
        expect(example.quux.ping.pong).to.equal(newValue);
    });
    it('should not change the value of a nonexistent property', function() {
        var original = _.cloneDeep(example);
        var newResult = dd(example)('quux')('abc')('xyz').set(5);
        expect(example).to.eql(original);
        expect(newResult).to.be.undefined();
    });
    it('should indicate whether a property exists', function() {
        expect(dd(example)('foo').exists).to.be.true();
        expect(dd(example)('oof').exists).to.be.false();
    });
    it('should call functions which exist', function() {
        var exampleBar = dd(example)('bar');
        var arg = 'string argument';
        exampleBar.func(arg);
        expect(exampleBar.val.calledWith(arg)).to.be.true();
    });
    xit('should call the stub function for functions which do not exist', function() {
        var exampleBar = dd(example)('bar')('zzzz');
        sinon.spy(console, 'log');  // FIXME spying on console.log interferes with must
        var arg = 'string argument';
        exampleBar.func(arg);
        expect(console.log.called).to.be.true();
        console.log.restore();
    });
});