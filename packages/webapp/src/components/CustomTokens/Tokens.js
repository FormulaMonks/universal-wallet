import React, { Component, Fragment } from 'react';
import {
  SectionHeader,
  SectionTitle,
  Center,
  Button,
  Leaders,
  Dots,
  UlGrid,
  LiGrid,
  DivGrid,
  DivInner,
  ButtonAdd,
} from '../../theme';
import { Spinner } from '../';

const DivGridI = DivGrid.extend`
  & svg{
    font-size: 25px;
  }
`

class TokensView extends Component {
  render() {
    const {
      tokens,
      tokensError,
      tokensLoading,
      coinsLoading,
    } = this.props;

    return (
      <Fragment>
        {tokensError}
        <SectionHeader>
          <SectionTitle>Custom Tokens</SectionTitle>
          {!!tokens.length && <Button onClick={this.add}>Add token</Button>}
        </SectionHeader>
        {coinsLoading || tokensLoading ? (
          <Spinner />
        ) : (
          <Fragment>
            {!tokens.length ? (
              <Center>
                <div>You have not added any tokens</div>
                <ButtonAdd onClick={this.add}>Add token</ButtonAdd>
              </Center>
            ) : (
              <UlGrid>
                {tokens.map((token, index) => {
                  const { id, createdAt, name: nameToken } = token;
                  const created = new Date(createdAt);

                  return (
                    <LiGrid key={`tokens-${id}`}>
                      <button onClick={this.pick(id)}>
                        <DivGridI>
                          <i className="fab fa-empire"></i>

                          <DivInner>
                            <div>{nameToken}</div>
                            <Leaders>
                              Created
                              <Dots />
                              {created.toDateString()}
                            </Leaders>
                          </DivInner>
                        </DivGridI>
                      </button>
                    </LiGrid>
                  );
                })}
              </UlGrid>
            )}
          </Fragment>
        )}
      </Fragment>
    );
  }

  add = async () => {
    this.props.tokensPost({ name: '', symbol: '', contract: '', decimals: 18 });
  };

  pick = id => () => {
    this.props.tokenPick(id);
  };
}

export default TokensView;
