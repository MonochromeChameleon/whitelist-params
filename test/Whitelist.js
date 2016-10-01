'use strict'

var assert = require('assert')

var wl = require('..')

var functionNames = ['optional', 'required']
var bodyHeaders = ['transfer-encoding', 'content-length']

var specs = [
  {
    name: 'Whitelist',
    func: function () {
      return wl
    },
    required: false
  },
  {
    name: 'Whitelist.optional',
    func: function () {
      return wl.optional
    },
    required: false
  },
  {
    name: 'Whitelist().optional',
    func: function () {
      return wl().optional
    },
    required: false
  },
  {
    name: 'Whitelist.required',
    func: function () {
      return wl.required
    },
    required: true
  },
  {
    name: 'Whitelist().required',
    func: function () {
      return wl().required
    },
    required: true
  },
  {
    name: 'Mixed optional and required parameters',
    func: function () {
      return wl('foo').required
    },
    required: true
  }
]

specs.forEach(function (spec) {
  describe(spec.name, function () {
    it('Should add all arguments to a list of permitted parameters', function () {
      var request = { headers: {}, query: { foo: 'foo', bar: 'bar', baz: 'baz' } }
      spec.func()('foo', 'bar')(request, undefined, function () {
        assert(request.hasOwnProperty('wl'))
        assert(request.wl.hasOwnProperty('foo'))
        assert(request.wl.hasOwnProperty('bar'))
        assert(!request.wl.hasOwnProperty('baz'))

        assert(request.wl.foo === 'foo')
        assert(request.wl.bar === 'bar')
      })
    })

    if (spec.required) {
      it('Should return a 400 response if the required parameters are not all present', function (done) {
        var request = { headers: {}, query: { foo: 'foo' } }
        var response = {
          status: function (code) {
            assert(code === 400)
            return response
          },
          send: done
        }

        spec.func()('foo', 'bar')(request, response)
      })
    }

    it('Should return a chainable wrapper', function () {
      var result = spec.func()()
      functionNames.forEach(function (func) {
        assert(result.hasOwnProperty(func))
        assert(typeof result[func] === 'function')
        assert(result[func]() === result)
      })
    })

    it('Should read params from the request body when either the transfer-encoding or content-length header is present', function () {
      bodyHeaders.forEach(function (header) {
        var headers = {}
        headers[header] = 'SET'

        var request = { headers: headers, body: { foo: 'foo', bar: 'bar', baz: 'baz' } }
        spec.func()('foo', 'bar')(request, undefined, function () {
          assert(request.hasOwnProperty('wl'))
          assert(request.wl.hasOwnProperty('foo'))
          assert(request.wl.hasOwnProperty('bar'))
          assert(!request.wl.hasOwnProperty('baz'))

          assert(request.wl.foo === 'foo')
          assert(request.wl.bar === 'bar')
        })
      })
    })
  })
})
