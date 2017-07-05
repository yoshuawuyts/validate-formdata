var spok = require('spok')
var tape = require('tape')

var validate = require('./')

tape('should create default values', function (assert) {
  var validator = validate()
  validator.field('foo')
  validator.file('bar')
  spok(assert, validator.state, {
    pristine: {
      foo: true,
      bar: true
    },
    errors: {
      foo: null,
      bar: null
    },
    values: {
      foo: '',
      bar: null
    }
  })
  assert.end()
})

tape('should update state on update', function (assert) {
  var validator = validate()
  validator.field('foo')
  validator.file('bar')
  validator.validate('foo', 'bar')
  spok(assert, validator.state, {
    pristine: {
      foo: false,
      bar: true
    },
    errors: {
      foo: null,
      bar: null
    },
    values: {
      foo: 'bar',
      bar: null
    }
  })
  assert.end()
})

tape('should expose a "changed" value', function (assert) {
  var validator = validate()
  validator.field('foo', function (val) {
    if (val === 'beep') return new Error('nope')
  })
  validator.file('bar')

  assert.equal(validator.changed, false, 'no change')
  assert.equal(validator.state.changed, false, 'no change')

  validator.validate('foo', 'bar')
  assert.equal(validator.changed, true, 'change')
  assert.equal(validator.state.changed, true, 'change')

  validator.validate('foo', 'bar')
  assert.equal(validator.changed, false, 'no change')
  assert.equal(validator.state.changed, false, 'no change')

  validator.validate('foo', 'beep')
  assert.equal(validator.changed, true, 'change')
  assert.equal(validator.state.changed, true, 'change')

  validator.validate('foo', 'beep')
  assert.equal(validator.changed, false, 'no change')
  assert.equal(validator.state.changed, false, 'no change')

  assert.end()
})
