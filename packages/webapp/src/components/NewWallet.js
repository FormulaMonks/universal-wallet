import React, { Component, Fragment } from 'react';
import { Spinner, CoinsView, Form } from '../components';
import { SectionHeader, SectionTitle, Button, Leaders, Dots } from '../theme';
import {
  generate,
  generateAvailable,
  fromWif,
  fromWifAvailable,
  defaults,
} from '../utils/wallets';
import styled from 'styled-components';

const LeadersFirst = Leaders.extend`
  margin-top: 0;
`;

const LeadersNewWallet = Leaders.extend`
  margin-top: 2em;
`;

const DivOptions = styled.div`
  margin-top: 1em;
  font-size: 12px;
  margin-left: 1em;
`;

const LeadersOptions = LeadersNewWallet.extend`
  margin-top: 1em;
`;

const DivOptionTitle = styled.div`
  margin-top: 2em;
`;

const DivNote = DivOptions.extend`
  margin-top: 2em;
  font-size: 11px;
`;

class NewWallet extends Component {
  state = { alias: null };

  componentDidUpdate(prevProps) {
    const { qrData } = this.props;
    if (!prevProps.qrData && qrData) {
      this.onImportWIF(qrData);
    }
  }

  render() {
    const {
      coin,
      coins,
      coinsLoading,
      token,
      tokens,
      tokensLoading,
    } = this.props;
    const { alias } = this.state;
    const { symbol = '' } = coin || token || {};

    return (
      <Fragment>
        <SectionHeader>
          <SectionTitle>New Wallet</SectionTitle>
        </SectionHeader>
        {(tokensLoading || coinsLoading) && <Spinner />}
        {!coinsLoading &&
          !tokensLoading && (
            <Fragment>
              <LeadersFirst>
                1. Pick a coin:
                <Dots />
                <CoinsTokens
                  coin={coin}
                  coins={coins}
                  tokens={tokens}
                  token={token}
                  onChange={this.pick}
                />
              </LeadersFirst>

              <LeadersNewWallet>
                2. Set an alias:
                <Dots />
                <input
                  disabled={!coin && !token}
                  type="text"
                  placeholder="Alias"
                  onInput={this.aliasInput}
                />
              </LeadersNewWallet>

              <LeadersNewWallet>
                3. Pick one method to create the wallet:
              </LeadersNewWallet>
              <DivOptions>
                <LeadersOptions>
                  a. Import with WIF QR code
                  <Dots />
                  <Button
                    disabled={
                      !alias ||
                      !fromWifAvailable().find(
                        o => o.symbol === symbol,
                      )
                    }
                    onClick={this.onScan}
                  >
                    Scan
                  </Button>
                </LeadersOptions>
                <DivNote>
                  * Only available for:{' '}
                  {fromWifAvailable()
                    .map(o => o.name)
                    .join(', ')}
                </DivNote>

                <LeadersOptions>
                  <DivOptionTitle>b. Generate wallet</DivOptionTitle>
                  <Dots />
                  <Button
                    disabled={
                      !alias ||
                      !generateAvailable().find(
                        o => o.symbol === symbol,
                      )
                    }
                    onClick={this.onGenerate}
                  >
                    Generate
                  </Button>
                </LeadersOptions>
                <DivNote>
                  * Only available for:{' '}
                  {generateAvailable()
                    .map(o => o.name)
                    .join(', ')}
                </DivNote>

                <Form onSubmit={this.onBlank}>
                  <Leaders>
                    <div>c. Enter details manually</div>
                    <Dots />
                    <Button type="submit" disabled={!alias}>
                      Save
                    </Button>
                  </Leaders>
                  <DivOptions>
                    <LeadersNewWallet>
                      <div>Private Key (unencrypted)</div>
                      <Dots />
                      <input
                        required
                        name="inputPrivateKey"
                        type="password"
                        placeholder="Private Key"
                      />
                    </LeadersNewWallet>
                    <LeadersNewWallet>
                      <div>Public Address</div>
                      <Dots />
                      <input
                        required
                        name="inputPublicAddress"
                        type="text"
                        placeholder="Public Address"
                      />
                    </LeadersNewWallet>
                  </DivOptions>
                </Form>
              </DivOptions>
            </Fragment>
          )}
      </Fragment>
    );
  }

  aliasInput = ({ currentTarget: { value: alias } }) => {
    this.setState({ alias });
  };

  onBlank = form => {
    const { alias } = this.state;
    const { coin, token } = this.props;
    const { symbol } = coin || token;
    const { inputPublicAddress, inputPrivateKey } = form.elements;
    const privateKey = inputPrivateKey.value;
    const publicAddress = inputPublicAddress.value;
    const data = defaults(symbol);
    this.post({ ...data, alias, privateKey, publicAddress });
  };

  onGenerate = () => {
    const { alias } = this.state;
    const { coin, token } = this.props;
    const { symbol } = coin || token;
    if (
      generateAvailable().find(
        w => w.symbol === symbol,
      )
    ) {
      const data = generate(symbol)();
      this.post({ ...data, alias });
    }
  };

  onImportWIF = wif => {
    const { alias } = this.state;
    const { coin, token } = this.props;
    const { symbol } = coin || token;
    const data = fromWif(symbol)(wif);
    this.post({ ...data, alias });
  };

  onScan = () => {
    const { coin, token, qrScan } = this.props;
    const { symbol='' } = coin || token || {};
    if (
      fromWifAvailable().find(
        i => i.symbol === symbol,
      )
    ) {
      qrScan();
    }
  };

  pick = symbol => {
    const { coins, coinPick, tokenPick } = this.props;
    if (coins.find(c => c.symbol === symbol)) {
      coinPick(symbol);
      return;
    }
    tokenPick(symbol);
  };

  post = async obj => {
    const { history, walletsPost } = this.props;
    console.log('post: ', obj)
    //const { id } = await walletsPost(obj);
    //history.push(`/${id}`);
  };
}

export default NewWallet;
