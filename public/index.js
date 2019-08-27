// const protData = {
//   "org.w3.clearkey": {
//     "clearkeys": {
//       "oW5AK5BW43HzbTSKpiu3SQ": "hyN9IKGfWKdAwFaE5pm0qg"
//     }
//   }
// };
const init = async function init() {
  const url = "/video/ibu_pertiwi/stream.mpd"
  const video = document.querySelector("video")
  video.pendingSessionData = []
  video.addEventListener('encrypted', handleEncryption(video))
  const player = dashjs.MediaPlayer().create()
  player.initialize(video, video.src, true)
  // player.setProtectionData(protData);
}

const handleEncryption = (video) => async (evt) => {
  const config = [{
    initDataTypes: [],
    videoCapabilities: []
  }];
  const keySystem = await navigator.requestMediaKeySystemAccess("org.w3.clearkey", config)
  const mediaKeys = await keySystem.createMediaKeys()
  await video.setMediaKeys(mediaKeys)
  createSession(video, mediaKeys, evt.initDataType, evt.initData)
}

const createSession = async (video, mediaKeys, initDataType, initData) => {
  // TODO: add queue, while attaching media key
  // SEE: https://www.w3.org/TR/encrypted-media/#setMediaKeys
  const session = await mediaKeys.createSession()
  session.addEventListener('message', validateLicense, false)
  session.generateRequest(initDataType, initData)
}

const validateLicense = async (evt) => {
  // Direct license
  // const keys  = {"keys": [{"kty": "oct", "kid": "oW5AK5BW43HzbTSKpiu3SQ", "k": "hyN9IKGfWKdAwFaE5pm0qg","type": "temporary"}],"type":"temporary"};
  // try {
  //   const license = new TextEncoder().encode(JSON.stringify(keys))
  //   await evt.target.update(license)
  // } catch (e) {
  //   console.log(e)
  // }

  // Get license from server
  const payload = btoa(String.fromCharCode.apply(null, new Uint8Array(evt.message)))
  try {
    const res = await fetch('/video-license', {method: 'post', body: payload})
    const key = await res.text()
    await evt.target.update(new TextEncoder().encode(atob(key)))
  } catch (e) {
    console.log(e)
  }
}
