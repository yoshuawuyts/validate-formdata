# validate-formdata
Data structure for validating form data.

## Features
- minimal GC pressure
- optimized for unidirectional rendering
- framework agnostic
- only a data structure, no opinions on UI
- about 50 lines of code
- creates a `window.FormData` object, ready for XHR

## Usage
```js
var html = require('choo/html')
var choo = require('choo')
var xhr = require('xhr')

var validateFormdata = require('validate-formdata')

var app = choo()
app.route('/', function (state, emitter) {
  var pristine = state.form.pristine
  var errors = state.form.errors
  var values = state.form.values

  return html`
    <body>
      <form onsubmit=${emitter.bind(emitter, 'submit')}>
        <label for="name">
          ${errors.name && !pristine.name ? errors.name.message : 'valid'}
        </label>
        <input name="name"
          type="text"
          autofocus
          value=${values.name}
          placeholder="name"
          onchange=${validate}>
        <label for="password">
          ${errors.password && !pristine.password ? errors.password.message : 'valid'}
        </label>
        <input name="password"
          type="password"
          value=${values.password}
          placeholder="password"
          onchange=${validate}>
        <input name="submit"
          disabled=${!state.form.valid}
          type="submit"
          value="Login">
      </form>
    </body>
  `

  function validate (e) {
    emitter.emit('validate', e)
  }
})

app.use(function (state, emitter) {
  var validator = validateFormdata()
  state.form = validator.state

  validator.add('name', function (data) {
    if (!data) return new Error("name can't be empty")
    if (!(data instanceof String)) return new Error('name should be a string')
    if (data.length < 6) return new Error('name should be at least 6 characters')
  })

  validator.add('password', function (data) {
    if (!data) return new Error("password can't be empty")
    if (!(data instanceof String)) return new Error('password should be a string')
    if (data.length < 6) return new Error('password should be at least 6 characters')
  })

  emitter.on('validate', function (e) {
    validator.validate(e.target.name, e.target.value)
    emitter.emit('render')
  })

  emitter.on('submit', function (e) {
    if (!state.form.valid) throw new Error('form not valid')

    var opts = { body: validator.formData() }
    xhr.post('/my-url', opts, function (err, res) {
      if (err) throw err
      console.log(res)
    })
  })
})
app.mount('body')
```

## API
### `validator = validateFormdata()`
Create a new instance.

### validator.state
The state object is meant to be passed directly into the UI for rendering:

- __validator.state.pristine[key]:__ Check if the key has been validated before.
- __validator.state.errors[key]:__ Check if there's an error for the key.
- __validator.state.values[key]:__ Get the value from the key.
- __validator.state.valid:__ Check if the form is valid.

### `validator.add(key, validateFunction)`
Create a new validate function for the given key. The validation functions
should either return nothing, or an `Error` object. The `.message` property
from the error can be used when rendering.

### `validator.validate(key, value)`
Validate data. The first time the validate function is called for a key it sets
the corresponding `state.pristine[key]` to `false`. `state.valid` is set to
`true` when all values are valid.

### `validator.formData()`
Return a `window.FormData` instance from the form. Can be used to send
Multipart data into an XHR request. Make sure `state.valid` is `true` before
calling this.

## See Also
- [yoshuawuyts/formdata-to-object](https://github.com/yoshuawuyts/formdata-to-object/)

## License
[MIT](https://tldrlegal.com/license/mit-license)
