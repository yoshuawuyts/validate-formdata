var html = require('choo/html')
var choo = require('choo')
var xhr = require('xhr')

var validateFormdata = require('./')

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

    var formData = validator.formData()
    var opts = {
      url: '/my-url',
      method: 'POST',
      body: formData
    }
    xhr(opts, function (err, res) {
      if (err) throw err
      console.log(res)
    })
  })
})
app.mount('body')
