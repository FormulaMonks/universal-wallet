import React, { Component, Fragment } from 'react';
import { Form } from '../components';
import { SectionHeader, SectionTitle, Button, Leaders, Dots } from '../theme';
import styled from 'styled-components';
import { PrivateKey, crypto } from 'bitcore-lib';

const LeadersNewWallet = Leaders.extend`
  margin-top: 2em;
`;

const DivOptions = styled.div`
  margin-top: 1em;
  font-size: 12px;
  margin-left: 1em;
`;

const LeadersForm = Leaders.extend`
  margin-top: 0;
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
    const { alias } = this.state;

    return (
      <Fragment>
        <SectionHeader>
          <SectionTitle>New Wallet</SectionTitle>
        </SectionHeader>
        <Fragment>
          <LeadersNewWallet>
            1. Set an alias:
            <Dots />
            <input type="text" placeholder="Alias" onInput={this.aliasInput} />
          </LeadersNewWallet>

          <LeadersNewWallet>
            2. Pick one method to create the wallet:
          </LeadersNewWallet>
          <DivOptions>
            <Leaders>
              a. Import with WIF QR code
              <Dots />
              <Button disabled={!alias} onClick={this.onScan}>
                Scan
              </Button>
            </Leaders>

            <Leaders>
              <div>b. Generate wallet</div>
              <Dots />
              <Button disabled={!alias} onClick={this.onGenerate}>
                Generate
              </Button>
            </Leaders>

            <Form onSubmit={this.onBlank}>
              <LeadersForm>
                <div>c. Enter private key manually</div>
                <Dots />
                <Button type="submit" disabled={!alias}>
                  Save
                </Button>
              </LeadersForm>
              <DivOptions>
                <LeadersNewWallet>
                  <div>Private Key (unencrypted)</div>
                  <Dots />
                  <input
                    required
                    autoComplete="off"
                    name="inputPrivateKey"
                    type="password"
                    placeholder="Private Key"
                  />
                </LeadersNewWallet>
              </DivOptions>
            </Form>
          </DivOptions>
        </Fragment>
      </Fragment>
    );
  }

  aliasInput = ({ currentTarget: { value: alias } }) => {
    this.setState({ alias });
  };

  onBlank = form => {
    const { alias } = this.state;
    const { inputPrivateKey } = form.elements;
    const privateKey = inputPrivateKey.value;

    this.post({ privateKey, alias, assets: [] });
  };

  onGenerate = () => {
    const { alias } = this.state;
    const randBuf = crypto.Random.getRandomBuffer(32);
    const privateKeyBuf = crypto.BN.fromBuffer(randBuf);
    const privateKey = privateKeyBuf.toString('hex');

    this.post({ privateKey, alias, assets: [] });
  };

  onImportWIF = wif => {
    const { alias } = this.state;
    const privateKeyObj = PrivateKey.fromWIF(wif);
    const privateKey = privateKeyObj.toString('hex');

    this.post({ privateKey, alias, assets: [] });
  };

  onScan = () => {
    this.props.qrScan();
  };

  post = async obj => {
    const { history, walletsPost } = this.props;
    const { id } = await walletsPost(obj);
    history.push(`/wallets/${id}`);
  };
}

export default NewWallet;
