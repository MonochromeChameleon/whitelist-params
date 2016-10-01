'use strict'

function isUnsafeString (string) {
  return /^\$/.test(string)
}

function checkForUnsafeParameters (parameter) {
  if (!parameter) {
    return true
  }

  var type = typeof parameter

  if (type === 'function') {
    return false
  }

  if (type === 'number' || type === 'boolean') {
    return true
  }

  if (typeof parameter === 'string') {
    return !isUnsafeString(parameter)
  }

  if (parameter instanceof Array) {
    return parameter.reduce(function (acc, param) {
      return acc && checkForUnsafeParameters(param)
    }, true)
  }

  return Object.keys(parameter).reduce(function (acc, key) {
    return acc && !isUnsafeString(key) && checkForUnsafeParameters(parameter[key])
  }, true)
}

module.exports = checkForUnsafeParameters
