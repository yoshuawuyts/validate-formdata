var spok = require('spok')
var tape = require('tape')

var validate = require('./')

tape('should be valid by default', function (assert) {
  var validator = validate()
  assert.equal(validator.state.valid, true, 'form valid')
  assert.end()
})

tape('should create default values', function (assert) {
  var validator = validate()
  validator.field('foo')
  validator.file('bar')
  spok(assert, validator.state, {
    pristine: {
      foo: true,
      bar: true
    },
    required: {
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
  assert.equal(validator.state.valid, false, 'form not valid')
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
    required: {
      foo: true,
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

tape('should validate forms', function (assert) {
  var validator = validate()
  var err = new Error('nope')
  validator.field('foo', function (val) {
    if (val === 'beep') return err
  })
  validator.file('bar')
  validator.validate('foo', 'beep')
  spok(assert, validator.state, {
    pristine: {
      foo: false,
      bar: true
    },
    required: {
      foo: true,
      bar: true
    },
    errors: {
      foo: err,
      bar: null
    },
    values: {
      foo: 'beep',
      bar: null
    }
  })
  assert.equal(validator.state.valid, false, 'form not valid')
  assert.end()
})

tape('should handle validation changes', function (assert) {
  var validator = validate()
  var err = new Error('nope')
  validator.field('foo', function (val) {
    if (val === 'beep') return err
  })
  validator.field('bar')
  assert.equal(validator.state.valid, false, '1. form not valid')

  validator.validate('foo', 'beep')
  spok(assert, validator.state, {
    pristine: {
      foo: false,
      bar: true
    },
    required: {
      foo: true,
      bar: true
    },
    errors: {
      foo: err,
      bar: null
    },
    values: {
      foo: 'beep',
      bar: ''
    }
  })
  assert.equal(validator.state.valid, false, '2. form not valid')

  validator.validate('foo', 'boop')
  spok(assert, validator.state, {
    pristine: {
      foo: false,
      bar: true
    },
    required: {
      foo: true,
      bar: true
    },
    errors: {
      foo: null,
      bar: null
    },
    values: {
      foo: 'boop',
      bar: ''
    }
  })
  assert.equal(validator.state.valid, false, '3. form not valid')

  validator.validate('bar', 'boop')
  spok(assert, validator.state, {
    pristine: {
      foo: false,
      bar: false
    },
    required: {
      foo: true,
      bar: true
    },
    errors: {
      foo: null,
      bar: null
    },
    values: {
      foo: 'boop',
      bar: 'boop'
    }
  })
  assert.equal(validator.state.valid, true, '4. form is valid')

  assert.end()
})

tape('should handle the { required: false } option', function (assert) {
  var validator = validate()
  var err = new Error('nope')
  validator.field('foo', { required: false }, function (val) {
    if (val === 'beep') return err
  })
  validator.file('bar', { required: false })
  assert.equal(validator.state.valid, true, '1. form is valid')

  validator.validate('foo', 'beep')
  spok(assert, validator.state, {
    pristine: {
      foo: false,
      bar: true
    },
    required: {
      foo: false,
      bar: false
    },
    errors: {
      foo: err,
      bar: null
    },
    values: {
      foo: 'beep',
      bar: null
    }
  })
  assert.equal(validator.state.valid, false, '2. form not valid')

  validator.validate('foo', 'boop')
  spok(assert, validator.state, {
    pristine: {
      foo: false,
      bar: true
    },
    required: {
      foo: false,
      bar: false
    },
    errors: {
      foo: null,
      bar: null
    },
    values: {
      foo: 'boop',
      bar: null
    }
  })
  assert.equal(validator.state.valid, true, '3. form is valid')

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
