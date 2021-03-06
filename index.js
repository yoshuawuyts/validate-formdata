var assert = require('assert')

module.exports = ValidateFormdata

function ValidateFormdata () {
  if (!(this instanceof ValidateFormdata)) return new ValidateFormdata()

  this.totalLength = 0
  this.validLength = 0
  this.errorLength = 0
  this.validators = {}
  this.changed = false
  this.state = {
    changed: false,
    valid: true,
    pristine: {},
    required: {},
    values: {},
    errors: {}
  }
}

ValidateFormdata.prototype.field = function (key, opts, validator) {
  if (!validator && typeof opts === 'function') {
    validator = opts
    opts = {}
  }

  validator = validator || noop
  opts = opts || {}

  assert.equal(typeof key, 'string', 'ValidateFormdata.field: key should be type string')
  assert.equal(typeof opts, 'object', 'ValidateFormdata.field: opts should be type object')
  assert.equal(typeof validator, 'function', 'ValidateFormdata.field: validator should be type function')

  this.validators[key] = validator
  this.state.pristine[key] = true
  this.state.errors[key] = null
  this.state.values[key] = ''
  this.state.changed = false

  if (opts.required === false) {
    this.state.required[key] = false
  } else {
    this.state.required[key] = true
    this.state.valid = false
    this.totalLength += 1
  }
}

ValidateFormdata.prototype.file = function (key, opts, validator) {
  if (!validator && typeof opts === 'function') {
    validator = opts
    opts = {}
  }

  validator = validator || noop
  opts = opts || {}

  assert.equal(typeof key, 'string', 'ValidateFormdata.file: key should be type string')
  assert.equal(typeof opts, 'object', 'ValidateFormdata.file: opts should be type object')
  assert.equal(typeof validator, 'function', 'ValidateFormdata.file: validator should be type function')

  this.validators[key] = validator
  this.state.pristine[key] = true
  this.state.errors[key] = null
  this.state.values[key] = null

  if (opts.required === false) {
    this.state.required[key] = false
  } else {
    this.state.required[key] = true
    this.state.valid = false
    this.totalLength += 1
  }
}

ValidateFormdata.prototype.validate = function (key, value) {
  var validator = this.validators[key]

  assert.equal(typeof key, 'string', 'ValidateFormdata.validate: key should be type string')
  assert.ok(validator, 'ValidateFormdata.validate: no validator found for key ' + key)

  var pristine = this.state.pristine[key]
  var required = this.state.required[key]
  var hadError = this.state.errors[key]

  var error = validator(value)

  this.state.errors[key] = error || null
  this.state.values[key] = value
  this._toggleChange(false)

  if (pristine) {
    this._toggleChange(true)
    this.state.pristine[key] = false
  }

  // we had an error, we no longer have an error: change
  // we had an error, we still have an error: do nothing
  // we didn't have an error, we now have an error: change
  // we didn't have an error, we still don't have an error: do nothing
  if (error) {
    if (!hadError) {
      if (required && !pristine) this.validLength -= 1
      this._toggleChange(true)
      this.errorLength += 1
    }
  } else {
    if (hadError) {
      this._toggleChange(true)
      this.errorLength -= 1
      if (required) this.validLength += 1
    } else if (!hadError && pristine) {
      if (required) this.validLength += 1
    }
  }

  if (this.validLength === this.totalLength && this.errorLength === 0) {
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

ValidateFormdata.prototype._toggleChange = function (bool) {
  this.state.changed = bool
  this.changed = bool
}

function noop () {}
