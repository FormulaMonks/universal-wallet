# Blockstack link

This electron app "links" the local `blockstack browser` running on port 8888 (default) to a publicly available URL. Once the local `blockstack browser` is been offered publicly the user can open the URL and setup their blockstack info on devices other than their local computer (e.g. smartphone and/or tablet) or from other electron apps running locally.

The app must me kept running and connected to the Internet if the user wishes to connect to their local `blockstack browser`.

This app uses [`localtunnel`](https://localtunnel.github.io/www/) to expose the local port to the world.

**BEWARE** this is purely experimental.

## Dev

```sh
npm i
npm run start

# or

SUBDOMAIN=some-subdomain npm run start
```

When the app is run with the `SUBDOMAIN` env var the user will receive the appropriate URL only if it is available. If the subdomain was not available the user will receive a random URL (as they would when executing the app without the env var).

The user will have to go through the blockstack setup every time they use a different subdomain.


## Build

```sh
npm run ebuild
```