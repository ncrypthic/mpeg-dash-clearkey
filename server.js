const express = require('express')
const app = express()
const base64url = require('base64url')
const cors = require('cors')
const queryString = require('query-string')
const fetch = require('node-fetch')

var whitelist = ['https://shaka-player-demo.appspot.com', 'https://bitmovin.com']
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}

app.use(cors(whitelist))
app.use(express.static('public'))
app.use(express.text())


const clearKeyHandler = (req, res) => {
  // Possible to check user token and access control before
  // returning key
  try {
    const payload = base64url.decode(req.body)
    const body = JSON.parse(payload)
    const key  = {
      kty: 'oct',
      kid: body.kids[0],
      k: base64url.encode(Buffer.from("XYZ", 'hex')),
        //k: base64url.encode(Buffer.from(process.env.KEY.trim(), 'hex')),
      type: body.type,
    }
    res.status(200).send(base64url.encode(Buffer.from(JSON.stringify({ keys: [key], type: body.type }))))
  } catch (e) {
    res.status(400).send("Invalid payload")
  }
}

const generateWidevineToken = async (customerKey, kid, key) => {
  try {
    const payload = {
      errorFormat: 'json',
      kid: kid,
      contentKey: key,
      securityLevel: 1,
      hdcpOutputControl: 0,
    }
    const tokenUrl = `${process.env.WIDEVINE_TOKEN_GENERATE_URL}?customerAuthenticator=${customerKey}&${queryString.stringify(payload)}`
    console.log(`tokenUrl: ${tokenUrl}`)
    const res = await fetch(tokenUrl)
    return res.text()
  } catch (e) {
    /* handle error */
    return e
  }
}

const generatePlayreadyToken = async (customerKey, kid, key) => {
  try {
    const payload = {
      errorFormat: 'json',
      kid: kid,
      contentKey: key,
      rightsType: 'BuyToOwn',
      analogVideoOPL: 100,
      compressedDigitalAudioOPL: 100,
      compressedDigitalVideoOPL: 100,
      uncompressedDigitalAudioOPL: 100,
      uncompressedDigitalVideoOPL: 100
    }
    const tokenUrl = `${process.env.PLAYREADY_TOKEN_GENERATE_URL}?customerAuthenticator=${customerKey}&${queryString.stringify(payload)}`
    console.log(`tokenUrl: ${tokenUrl}`)
    const res = await fetch(tokenUrl)
    const playreadyToken = await res.json()
    return `${playreadyToken.licenseAcquisitionUrl}?ExpressPlayToken=${playreadyToken.token}`
  } catch (e) {
    /* handle error */
    return e
  }
}

const drmHandler = async (req, res) => {
  try {
    const {EXPRESS_PLAY_CUSTOMER_AUTHENTICATOR, KID, KEY} = process.env
    const tokens = await Promise.all([
      generateWidevineToken(EXPRESS_PLAY_CUSTOMER_AUTHENTICATOR, KID, KEY),
      generatePlayreadyToken(EXPRESS_PLAY_CUSTOMER_AUTHENTICATOR, KID, KEY)
    ], (tokenResponses) => tokenResponses)
    console.log("Tokens:", tokens)
    const licenses = {
      'com.widevine.alpha': tokens[0],
      'com.microsoft.playready': tokens[1]
    }
    console.log("Licenses:", licenses)
    res.json(licenses)
  } catch (e) {
    /* handle error */
    res.status(500).send(e)
  }
}

app.get('/video-license', drmHandler)

app.listen(process.env.port||3000, function() {
  console.log('Server starting')
})
