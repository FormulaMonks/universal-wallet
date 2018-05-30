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
