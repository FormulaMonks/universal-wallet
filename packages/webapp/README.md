# Universal wallet webapp

## Dev

```sh
npm i
npm run start:cors
```

### Testnet(s)

In order to test transactions against the `test networks` (be aware Wallets should be created for the test networks too, and currently the app lacks this functionality when generating wallets) use the `env` var `REACT_APP_TESTNET` with the start script: `REACT_APP_TESTNET=1 npm run start:cors`

### Error: More than one instance of bitcore-lib found

Because of [bitpay/bitcore#1457](https://github.com/bitpay/bitcore/issues/1457#issuecomment-314048583) in order to make this work the patch needs to be added to both `bitcore-lib/index.js` files.

## Build

```sh
npm run build
```

### Blockstack link

To enable the link to the local `blockstack browser` the following steps need to be executed:

1. Install all dependencies: `npm i`.
2. Remove `custom-protocol-detection-blockstack` from the `node_modules` folder: `rm -rf  -> ./node_modules/custom-protocol-detection-blockstack`.
3. [`npm link`](https://docs.npmjs.com/cli/link) the `custom-protocol-detection-blockstack` lib to the `webapp`:
    1. cd into `packages/custom-protocol-detection-blockstack`.
    2. `npm link` (if there is an error, the command might have to be run using `sudo`).
    3. cd into `packages/webapp`.
    4. `npm link custom-protocol-detection-blockstack`.
4. Execute the electron app `blockstack link` (as described [here](../blockstack-link/)) (by hovering over the qr code you will see a URL).
    - Setup your blockstack account by accessing the URL from your smartphone.
5. Start this `webapp`: `npm run start:cors`. The QR reader feature requires `https` to be enabled, so in order to be able to use the feature you need to access the webapp URL from an `https` enabled URL.
    - [`localtunnel`](https://localtunnel.github.io/www/) provides a way to tunnel a local port to an `https` enabled URL.
6. Access the `webapp` URL from your smartphone and go through the `setup` flow (if you hadn't done so from #4).
7. Access the `webapp` URL from your smartphone and go through the `link` flow.
8. You are ready to sign in. The app will use your local `blockstack browser` and you will be able to use all the features from the `webapp`.
