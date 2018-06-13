import React, { Component, Fragment } from 'react';
import styled from 'styled-components';
import { Button, Leaders, Dots, H3Wallet, DivBtns } from '../../theme';
import { Spinner, Form } from '../';

const DivError = styled.div`
  font-weight: bold;
  color: #b31313;
`;

const H3Name = H3Wallet.extend`
  min-height: 25px;

  & svg {
    font-size: 25px;
  }
`;

const getFormValues = ({
  inputName,
  inputContract,
  inputSymbol,
  inputDecimals,
}) => {
  return {
    name: inputName.value,
    contract: inputContract.value,
    symbol: inputSymbol.value.toLowerCase(),
    decimals: inputDecimals.value,
  };
};

class TokenView extends Component {
  state = { contract: '', symbol: '', decimals: '', name: '', error: null };

  componentDidMount() {
    const {
      token: { name: nameToken, contract, symbol, decimals },
    } = this.props;

    if (contract) {
      this.setState({ contract });
    }

    if (symbol) {
      this.setState({ symbol });
    }

    if (decimals) {
      this.setState({ decimals });
    }

    if (nameToken) {
      this.setState({ name: nameToken });
    }
  }

  render() {
    const { coinsLoading, tokensLoading } = this.props;
    if (coinsLoading || tokensLoading) {
      return <Spinner />;
    }
    const { contract, symbol, decimals, name: nameToken, error } = this.state;

    return (
      <Fragment>
        <H3Name>
          <i className="fab fa-empire" />
          {nameToken}
        </H3Name>

        <DivError>{error}</DivError>

        <Form onSubmit={this.put}>
          <Leaders>
            Name
            <Dots />
            <input
              type="text"
              name="inputName"
              value={nameToken}
              placeholder="Name"
              required
              onChange={this.inputNameChange}
            />
          </Leaders>

          <Leaders>
            Contract address
            <Dots />
            <input
              placeholder="Contract"
              type="text"
              name="inputContract"
              value={contract}
              onChange={this.inputContractChange}
              required
            />
          </Leaders>

          <Leaders>
            <div>Symbol</div>
            <Dots />
            <input
              placeholder="Symbol"
              type="text"
              name="inputSymbol"
              value={symbol}
              onChange={this.inputSymbolChange}
              required
            />
          </Leaders>

          <Leaders>
            <div>Decimals</div>
            <Dots />
            <input
              placeholder="Decimals"
              type="text"
              name="inputDecimals"
              value={decimals}
              onChange={this.inputDecimalsChange}
              required
            />
          </Leaders>

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

  delete = () => {
    const { token: { id }, tokensDelete } = this.props;
    tokensDelete(id);
  };

  inputContractChange = e => {
    this.setState({ contract: e.currentTarget.value });
  };

  inputDecimalsChange = e => {
    this.setState({ decimals: e.currentTarget.value });
  };

  inputNameChange = e => {
    this.setState({ name: e.currentTarget.value });
  };

  inputSymbolChange = e => {
    this.setState({ symbol: e.currentTarget.value });
  };

  put = form => {
    const { coins, token: { id }, tokensPut, tokens } = this.props;
    const data = getFormValues(form.elements);
    if (
      coins.find(({ symbol }) => symbol === data.symbol) ||
      tokens.find(({ symbol }) => symbol === data.symbol)
    ) {
      this.setState({
        error: 'Could not save Token. Please use a different symbol.',
      });
      return;
    }
    tokensPut(id, data);
  };
}

export default TokenView;
