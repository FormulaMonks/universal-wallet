import React, { Fragment } from 'react';
import qr from 'qr-encode';

export default ({ wallet }) => {
  if (!wallet || !wallet.publicAddress) {
    return null;
  }
  const { publicAddress } = wallet;

  return (
    <Fragment>
      <div>
        <img src={qr(publicAddress)} alt="QR code public address" />
      </div>
      <div>{publicAddress}</div>
    </Fragment>
  );
};
