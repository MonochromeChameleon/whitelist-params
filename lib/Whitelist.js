'use strict'

var checkForUnsafeParameters = require('./checkForUnsafeParameters')
var functionNames = ['optional', 'required']

function Whitelist () {
  // Initialize our store of parameters
  var parameters = functionNames.reduce(function (acc, func) {
    acc[func] = []
    return acc
  }, {})

  var handler = function (req, res, next) {
    // per https://tools.ietf.org/html/rfc2616#section-4.3 - presence of either transfer encoding or content length
    // should be taken as being indicative of a request with body content.
    var reqParams = (!!req.headers['transfer-encoding'] || !!req.headers['content-length']) ? req.body : req.query

    var hasAllRequiredProps = parameters.required.reduce(function (acc, param) {
      return acc && reqParams.hasOwnProperty(param)
    }, true)

    if (!hasAllRequiredProps) {
      return res.status(400).send()
    }

    var validParameterNames = functionNames.reduce(function (acc, func) {
      return acc.concat(parameters[func])
    }, [])

    var wl = validParameterNames.reduce(function (acc, param) {
      acc[param] = reqParams[param]
      return acc
    }, {})

    var isSafeRequest = checkForUnsafeParameters(wl)

    if (!isSafeRequest) {
      return res.status(400).send()
    }

    req.wl = wl

    next()
  }

  functionNames.forEach(function (func) {
    handler[func] = function () {
      Array.prototype.forEach.call(arguments, function (param) {
        parameters[func].push(param)
      })

      return handler
    }
  })

  // Initialize the original arguments as the starting whitelist
  handler.optional.apply(handler, arguments)

  return handler
}

functionNames.forEach(function (func) {
  Whitelist[func] = function () {
    var wl = Whitelist()
    return wl[func].apply(wl, arguments)
  }
})

module.exports = Whitelist
