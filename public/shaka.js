var manifestUri = '' // Fill your manifest url

function initApp() {
  // Install built-in polyfills to patch browser incompatibilities.
  shaka.polyfill.installAll();

  // Check to see if the browser supports the basic APIs Shaka needs.
  if (shaka.Player.isBrowserSupported()) {
    // Everything looks good!
    initPlayer(); // initFairPlay();
  } else {
    // This browser does not have the minimum set of APIs we need.
    console.error('Browser not supported!');
  }
}

async function initFairPlay() {
  // Create a Player instance.
  const req = await fetch('/fpcert');
  const cert = await req.arrayBuffer();
  const licenseRequest = await fetch('/video-license');
  const servers = await licenseRequest.json();
  var video = document.getElementById('video');
  var player = new shaka.Player(video);

  //player.configure(playerConfig)
  player.configure('drm.advanced.com\\.apple\\.fps\\.1_0.serverCertificate', new Uint8Array(cert))
  player.configure({drm: { servers, fairPlayTransform: false }})

  player.configure('drm.initDataTransform', (initData) => {
    const contentId = shaka.util.FairPlayUtils.defaultGetContentId(initData);
    const cert = player.drmInfo().serverCertificate;
    return shaka.util.FairPlayUtils.initDataTransform(initData, contentId, cert);
  });

  player.getNetworkingEngine().registerRequestFilter(async (type, request) => {
    if (type != shaka.net.NetworkingEngine.RequestType.LICENSE) {
      return
    }
    // const base64Payload =
    //       shaka.util.Uint8ArrayUtils.toBase64(new Uint8Array(request.body));
    // const params = 'spc=' + base64Payload;
    // console.log('params', params)
    request.headers['Content-Type'] = 'application/octet-stream'
    // request.body = shaka.util.StringUtils.toUTF8(params);
  });

  // Attach player to the window to make it easy to access in the JS console.
  window.player = player;

  // Listen for error events.
  player.addEventListener('error', onErrorEvent);

  // Try to load a manifest.
  // This is an asynchronous process.
  player.load(manifestUri).then(function() {
    // This runs if the asynchronous load is successful.
    console.log('The video has now been loaded!');
  }).catch(onError);  // onError is executed if the asynchronous load fails.
}

async function initPlayer() {
  // Create a Player instance.
  const licenseRequest = await fetch('/video-license');
  const servers = await licenseRequest.json();
  var video = document.getElementById('video');
  var player = new shaka.Player(video);
  var playerConfig = {drm: {servers}};
  player.configure(playerConfig)

  // Attach player to the window to make it easy to access in the JS console.
  window.player = player;

  // Listen for error events.
  player.addEventListener('error', onErrorEvent);

  // Try to load a manifest.
  // This is an asynchronous process.
  player.load(manifestUri).then(function() {
    // This runs if the asynchronous load is successful.
    console.log('The video has now been loaded!');
  }).catch(onError);  // onError is executed if the asynchronous load fails.
}

function onErrorEvent(event) {
  // Extract the shaka.util.Error object from the event.
  onError(event.detail);
}

function onError(error) {
  // Log the error.
  console.error('Error code', error.code, 'object', error);
}

document.addEventListener('DOMContentLoaded', initApp);
