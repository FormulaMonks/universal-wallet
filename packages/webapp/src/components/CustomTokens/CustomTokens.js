import React, { Component, Fragment, Children, cloneElement } from 'react';
import uuid from 'uuid';
import { getFile, putFile } from 'blockstack';
import Compose from '../Compose';
import TokensView from './Tokens';
import TokenView from './Token';

const CUSTOM_TOKENS_JSON = 'custom-tokens.json';

const sort = (a, b) => a.name.localeCompare(b.name);

const View = ({ token, ...rest }) => {
  if (token) {
    return <TokenView {...{ token, ...rest }} />;
  }

  return <TokensView {...rest} />;
};

class Store extends Component {
  state = {
    error: null,
    loading: true,
    tokens: [],
    token: null,
  };

  render() {
    const { token, tokens, loading, error } = this.state;
    const { children, ...rest } = this.props;
    return (
      <Fragment>
        {Children.map(this.props.children, child =>
          cloneElement(child, {
            ...rest,
            token,
            tokens,
            tokensError: error && (
              <div>There was an error fetching the custom tokens: {error}</div>
            ),
            tokensLoading: loading,
            tokensGet: this.get,
            tokensDelete: this.delete,
            tokensPut: this.put,
            tokensPost: this.post,
            tokenPick: this.pick,
            tokenRelease: this.release,
          }),
        )}
      </Fragment>
    );
  }

  delete = async tokenId => {
    this.setState({ loading: true });

    const newList = this.state.tokens.filter(({ id }) => id !== tokenId);
    await putFile(CUSTOM_TOKENS_JSON, JSON.stringify(newList));
  };

  get = async () => {
    this.setState({ loading: true });

    try {
      const file = await getFile(CUSTOM_TOKENS_JSON);
      const rawTokens = JSON.parse(file || '[]');
      const tokens = rawTokens.sort(sort);
      this.setState({ tokens, loading: false });
    } catch (e) {
      this.setState({ error: e.toString() });
    }
  };

  pick = tokenId => {
    const token = this.state.tokens.find(({ id, symbol }) => tokenId === id);
    if (!token) {
      return;
    }
    this.setState({ token });
  };

  post = async ({ symbol, ...rest }) => {
    const obj = { ...rest, symbol: symbol.toLowerCase() };
    this.setState({ loading: true });

    const newObj = {
      ...obj,
      id: uuid(),
      createdAt: Date.now(),
      lastModified: Date.now(),
    };
    const newList = [...this.state.tokens, newObj];
    await putFile(CUSTOM_TOKENS_JSON, JSON.stringify(newList));
    return newObj;
  };

  put = async (tokenId, { symbol, ...rest }) => {
    const obj = { ...rest, symbol: symbol.toLowerCase() };
    this.setState({ loading: true });

    const { tokens } = this.state;
    const { id, createdAt, lastModified, ...current } = tokens.find(
      ({ id }) => id === tokenId,
    );
    const newList = [
      ...tokens.filter(w => w.id !== id),
      { ...current, ...obj, id, createdAt, lastModified: Date.now() },
    ];
    await putFile(CUSTOM_TOKENS_JSON, JSON.stringify(newList));
  };

  release = () => {
    this.setState({ token: null });
  };
}

class Saga extends Component {
  componentDidMount() {
    this.props.tokensGet();
  }

  render() {
    const {
      children,
      tokensDelete,
      tokensPut,
      tokensPost,
      ...rest
    } = this.props;

    return (
      <Fragment>
        {Children.map(children, child =>
          cloneElement(child, {
            ...rest,
            tokensDelete: this.delete,
            tokensPut: this.put,
            tokensPost: this.post,
          }),
        )}
      </Fragment>
    );
  }

  delete = async tokenId => {
    const { token, tokenRelease, tokensDelete, tokensGet } = this.props;
    if (token && token.id === tokenId) {
      tokenRelease();
    }
    await tokensDelete(tokenId);
    await tokensGet();
  };

  put = async (tokenId, data) => {
    const { tokenRelease, tokensPut, tokensGet } = this.props;
    tokenRelease();
    await tokensPut(tokenId, data);
    await tokensGet();
  };

  post = async data => {
    const { tokens, tokensPost, tokensGet, tokenPick } = this.props;
    const exists = tokens.find(({ symbol }) => symbol === data.symbol);
    if (exists) {
      throw new Error('Please use a different symbol');
    }
    const newToken = await tokensPost(data);
    await tokensGet();
    tokenPick(newToken.id);
  };
}

const SagaStore = Compose(Store, Saga);

export { SagaStore as Store, View };
export default Compose(SagaStore, View);
