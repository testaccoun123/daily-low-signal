# Privacy Policy — Low Signal Uploader

_Last updated: November 19, 2026_

**Low Signal Uploader** is an internal tool used only by the owner of the Daily Low Signal channels
(YouTube channel `UCTIpW12MYMBgnCnZXVeViDg`, Instagram `@daily.low.signal`). Its only purpose is to
upload the channel's own short videos to the channel owner's own YouTube channel.

## Use of YouTube API Services
This tool uses the **YouTube API Services** (YouTube Data API v3, `videos.insert`, scope
`https://www.googleapis.com/auth/youtube.upload`). By using it, the channel owner agrees to the
[YouTube Terms of Service](https://www.youtube.com/t/terms). Google's handling of data is described in the
[Google Privacy Policy](https://policies.google.com/privacy).

## What data the tool accesses
- An OAuth refresh token for the channel owner's own Google account, used only to upload videos to that
  account's channel. It is stored privately as a secret environment variable and is never shared.
- The tool does **not** read, collect, store, analyze or share any data about YouTube users, viewers or
  other channels. It has no other users and no public interface.

## Data retention and deletion
The only stored credential is the channel owner's own refresh token. It can be revoked at any time at
[Google Account → Security → Third-party apps](https://myaccount.google.com/connections) (or
https://security.google.com/settings/security/permissions), after which the tool can no longer access YouTube.

## Contact
Questions about this policy: send a direct message to [@daily.low.signal](https://www.instagram.com/daily.low.signal/) on Instagram.
