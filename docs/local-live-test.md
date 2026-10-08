# Veyra live TV end-to-end development smoke test

This adds a **real HLS signal generator** using locally installed FFmpeg and the CC BY 3.0 Big Buck Bunny test clip, looped indefinitely. It is not a real broadcaster or commercially licensed channel feed. Flutter is unchanged.

Requirements: Windows, Node/NestJS installed, local MySQL seeded, **FFmpeg** in PATH, `XTREAM_COMPAT_ENABLED=true`, `NODE_ENV=development`, `VEYRA_LOCAL_LIVE_DEMO=true`, and `XTREAM_PUBLIC_URL=http://LAN_PC_IP:3000`.

1. `npm install`, `npx prisma generate`, database migrations, `npm run prisma:seed` as appropriate.
2. `npm run demo:seed` to register movie and episode samples.
3. `npm run demo:live:seed` to register the local test channel.
4. Download the **480p 30-second Big Buck Bunny** MP4 from:
   https://github.com/bower-media-samples/big-buck-bunny-480p-30s/blob/master/video.mp4
   Save to `tmp/sample.mp4`. License: CC BY 3.0, (c) copyright 2008 Blender Foundation / www.bigbuckbunny.org.
5. In CMD, create directory `mkdir tmp\\live-demo` and start this command (KEEP RUNNING):

```bat
ffmpeg -re -stream_loop -1 -i tmp\\sample.mp4 -c:v libx264 -preset veryfast -pix_fmt yuv420p -c:a aac -f hls -hls_time 4 -hls_list_size 6 -hls_flags delete_segments+omit_endlist tmp\\live-demo\\live.m3u8
```

6. In another terminal start `npm run start:dev`.
7. Open `http://LAN_PC_IP:3000/local-live-demo/live.m3u8` in an HLS-capable test player. Then connect Lumen as Xtream using `http://LAN_PC_IP:3000`, admin email/password and an ACTIVE test subscription.

This proves the channel list and that a video stream can be delivered. The demo `/live/USER/PASSWORD/ID.ts` currently redirects to the HLS URL; some IPTV clients may require .m3u8 extension or a TS-specific implementation. **Actual on-device success has not been verified.** Do not expose this development-only feature to the Internet: Xtream passwords are embedded in URL paths, and the live files have no media-session authentication. Future gateway is required for commercial deployment.
