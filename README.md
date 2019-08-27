## 1. Pre-Requisite

1. Encrypted MPEG-DASH file `*.mpd`
2. Decryption KeyID & KEY

*OR* create an encrypted video

`brew install bento4`

```
$ cd public/video
$ mp4fragment file.mp4 file_frag.mp4

$ mp4encrypt --method MPEG-CENC --key 1:c0c1c2c3c4c5c6c7c8c9cacbcccdcecf:0123456789abcdef --property 1:KID:d0d1d2d3d4d5d6d7d8d9dadbdcdddedf --global-option mpeg-cenc.eme-pssh:true file_frag.mp4 file_encrypted.mp4

$ python ~/workspace/Bento4/Source/Python/utils/mp4-dash.py --exec-dir <bento4_installation_dir> -o media file_encrypted.mp4
```

## 2. Install deps

`yarn install`

## 3. Change video url in public/index.html

## 4. Start server

`node server.js`
