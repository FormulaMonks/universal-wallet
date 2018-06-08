import React, { Component, Fragment, Children, cloneElement } from 'react';
import QrR from 'react-qr-reader';
import styled from 'styled-components';

const DivQr = styled.div`
  position: fixed;
  background: rgba(0, 0, 0, 0.7);
  top: 70px;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 2;

  &:after {
    content: '';
    display: block;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    border: 50px solid rgba(0, 0, 0, 0.3);
  }

  & .qr__container {
    height: 100%;

    & section {
      height: 100%;
      padding: 0 !important;
    }
  }
`;

class QrReader extends Component {
  state = { data: null, scanning: false, error: null };

  render() {
    const { children, ...rest } = this.props;
    const { scanning, data, error } = this.state;

    return (
      <Fragment>
        {scanning && (
          <DivQr>
            <QrR
              delay={300}
              showViewFinder={false}
              className="qr__container"
              onScan={data => {
                data && this.setState({ data, scanning: false });
              }}
              onError={error => this.setState({ error, scanning: false })}
            />
          </DivQr>
        )}
        {Children.map(children, child =>
          cloneElement(child, {
            ...rest,
            qrClear: this.clear,
            qrData: data,
            qrError: error,
            qrScan: this.scan,
          }),
        )}
      </Fragment>
    );
  }

  scan = () => {
    this.setState({ scanning: true });
  };

  clear = () => {
    this.setState({ data: null });
  };
}

export default QrReader;
