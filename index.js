var assert = require('assert')

module.exports = ValidateFormdata

function ValidateFormdata () {
  if (!(this instanceof ValidateFormdata)) return new ValidateFormdata()

  this.validLength = 0
  this.validators = {}
  this.length = 0
  this.state = {
    valid: false,
    pristine: {},
    values: {},
    errors: {}
  }
}

ValidateFormdata.prototype.add = function (key, validator) {
  assert.equal(typeof key, 'string', 'ValidateFormdata.add: key should be type string')
  assert.equal(typeof validator, 'function', 'ValidateFormdata.add: validator should be type function')

  this.validators[key] = validator
  this.state.pristine[key] = true
  this.length += 1
}

ValidateFormdata.prototype.validate = function (key, value) {
  var validator = this.validators[key]
  assert.ok(validator, 'ValidateFormdata.validate: no validator found for key ' + key)

  var pristine = this.state.pristine[key]
  var hadError = this.state.errors[key]
  var error = validator(value)

  this.state.pristine[key] = false
  this.state.errors[key] = error
  this.state.values[key] = value

  if (!pristine) {
    if (hadError && !error) this.validLength += 1
  } else {
    if (!error) this.validLength += 1
  }

  if (this.validLength === this.length) {
    this.state.valid = true
  } else {
    this.state.valid = false
  }
}

ValidateFormdata.prototype.formData = function () {
  assert.ok(typeof window !== 'undefined', "ValidateFormdata.formData: window should exist. Make sure you're running this package in the browser")

  var values = this.state.values
  return Object.keys(values).reduce(function (form, key) {
    form.append(key, values[key])
    return form
  }, new window.FormData())
}
