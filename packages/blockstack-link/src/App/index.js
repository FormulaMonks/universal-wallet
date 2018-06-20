import React, { Fragment } from 'react';
import qr from 'qr-encode';

export default () => {
  const params = new URLSearchParams(document.location.search);
  const url = params.get('url');

  return (
    <Fragment>
      <img src={qr(url)} alt={url} title={url} />
      <div>{url}</div>
    </Fragment>
  );
};
