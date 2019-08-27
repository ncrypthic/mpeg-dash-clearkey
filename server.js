const express = require('express')
const app = express()
const base64url = require('base64url')

app.use(express.static('public'))
app.use(express.text())

app.post('/video-license', (req, res) => {
  // Possible to check user token and access control before
  // returning key
  try {
    const payload = base64url.decode(req.body)
    const body = JSON.parse(payload)
    const key  = {
      kty: 'oct',
      kid: body.kids[0],
      k: base64url.encode(Buffer.from(process.env.KEY.trim(), 'hex')),
      type: body.type,
    }
    res.status(200).send(base64url.encode(Buffer.from(JSON.stringify({ keys: [key], type: body.type }))))
  } catch (e) {
    res.status(400).send("Invalid payload")
  }
})

app.listen(process.env.port||3000, function() {
  console.log('Server starting')
})
