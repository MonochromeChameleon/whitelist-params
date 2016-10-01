'use strict'

var assert = require('assert')

var checkForUnsafeParameters = require('../lib/checkForUnsafeParameters')

describe('The checkForUnsafeParameters utility', function () {
  var safeTypes = [
    { name: 'falsey', values: [undefined, null, false, 0, NaN, ''] },
    { name: 'number', values: [1] },
    { name: 'boolean', values: [true] }
  ]

  safeTypes.forEach(function (spec) {
    it('Should return true for ' + spec.name + ' values', function () {
      spec.values.forEach(function (value) {
        assert(checkForUnsafeParameters(value))
      })
    })
  })

  it('should only return true for strings if they don\'t begin with a $', function () {
    assert(checkForUnsafeParameters('foo'))
    assert(!checkForUnsafeParameters('$foo'))
  })

  it('should recurse over arrays', function () {
    assert(checkForUnsafeParameters(['foo', 'bar', 'baz', 'bam']))
    assert(!checkForUnsafeParameters(['foo', 'bar', '$baz', 'bam']))
  })

  it('should recurse over objects', function () {
    assert(checkForUnsafeParameters({ foo: 'foo', bar: { baz: 'baz', bam: ['foo', 'bar', 'baz'] } }))
    assert(!checkForUnsafeParameters({ foo: 'foo', bar: { baz: 'baz', bam: ['foo', 'bar', '$baz'] } }))
  })
})
