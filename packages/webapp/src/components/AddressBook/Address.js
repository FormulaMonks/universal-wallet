import React, { Component, Fragment } from 'react';
import qr from 'qr-encode';
import {
  Button,
  Leaders,
  LeadersCoins,
  LeadersQrScan,
  Dots,
  H3Address,
  DivQrPublicAddress,
  DivBtns,
} from '../../theme';
import { Spinner, ImgFromSymbol, CoinsView, Form } from '../';

const LeadersAddress = Leaders.extend`
  margin-top: 2em;
`;

const getFormValues = ({ inputAlias, inputPublicAddress, selectSymbol }) => {
  return {
    alias: inputAlias.value,
    publicAddress: inputPublicAddress.value,
    symbol: selectSymbol.value,
  };
};

class AddressView extends Component {
  state = { publicAddress: '', symbol: '' };

  componentDidMount() {
    const { address: { publicAddress, symbol } } = this.props;

    if (publicAddress) {
      this.setState({ publicAddress });
    }

    if (symbol) {
      this.setState({ symbol });
    }
  }

  componentDidUpdate(prevProps) {
    const { qrData, qrClear } = this.props;
    if (qrData && !prevProps.qrData) {
      this.setState({ publicAddress: qrData }, qrClear);
    }
    if (prevProps.address.publicAddress !== this.props.address.publicAddress) {
      this.setState({ publicAddress: this.props.address.publicAddress });
    }
  }

  render() {
    const { coins, coinsLoading, address, qrScan } = this.props;
    if (coinsLoading) {
      return <Spinner />;
    }
    const { alias } = address;
    const { publicAddress, symbol } = this.state;
    const coin = coins.find(c => c.symbol === symbol);

    return (
      <Fragment>
        <H3Address>
          <ImgFromSymbol symbol={symbol} coins={coins} />
          {alias}
        </H3Address>

        <DivQrPublicAddress>
          <img src={qr(publicAddress)} alt={publicAddress} />
          <div>{publicAddress}</div>
        </DivQrPublicAddress>

        <Form onSubmit={this.put}>
          <LeadersAddress>
            Alias
            <Dots />
            <input
              type="text"
              name="inputAlias"
              defaultValue={alias}
              placeholder="Alias"
              required
            />
          </LeadersAddress>

          <LeadersAddress>
            Public Address
            <Dots />
            <input
              placeholder="Public Address"
              type="text"
              name="inputPublicAddress"
              value={publicAddress}
              onChange={this.inputPublicAddressChange}
              required
            />
          </LeadersAddress>

          <LeadersQrScan>
            <div>Scan from QR Code</div>
            <Dots />
            <button type="button" title="Scan from QR Code" onClick={qrScan}>
              <i className="fas fa-qrcode" />
            </button>
          </LeadersQrScan>

          <LeadersCoins>
            <div>Crypto currency</div>
            <Dots />
            <CoinsView
              required={true}
              coin={coin}
              coins={coins}
              onChange={this.coinChange}
            />
          </LeadersCoins>

          <DivBtns>
            <Button type="submit">Save</Button>
            <Button type="button" onClick={this.delete}>
              Delete
            </Button>
          </DivBtns>
        </Form>
      </Fragment>
    );
  }

  coinChange = symbol => {
    this.setState({ symbol });
  };

  delete = () => {
    const { address: { id }, addressBookDelete } = this.props;
    addressBookDelete(id);
  };

  inputPublicAddressChange = e => {
    this.setState({ publicAddress: e.currentTarget.value });
  };

  put = form => {
    const { address: { id }, addressBookPut } = this.props;
    addressBookPut(id, getFormValues(form.elements));
  };
}

export default AddressView;
