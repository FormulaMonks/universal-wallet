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
import { Spinner, ImgFromSymbol } from '../';

class AddressBookView extends Component {
  render() {
    const {
      addressBook,
      addressBookError,
      addressBookLoading,
      coins,
      coinsLoading,
    } = this.props;

    return (
      <Fragment>
        {addressBookError}
        <SectionHeader>
          <SectionTitle>Address Book</SectionTitle>
          {!!addressBook.length && <Button onClick={this.add}>Add address</Button>}
        </SectionHeader>
        {coinsLoading || addressBookLoading ? (
          <Spinner />
        ) : (
          <Fragment>
            {!addressBook.length ? (
              <Center>
                <div>You have not added any addresses</div>
                <ButtonAdd onClick={this.add}>Add address</ButtonAdd>
              </Center>
            ) : (
              <UlGrid>
                {addressBook.map((address, index) => {
                  const { id, createdAt, alias, symbol } = address;
                  const created = new Date(createdAt);

                  return (
                    <LiGrid key={`addressBook-${id}`}>
                      <button onClick={this.pick(id)}>
                        <DivGrid>
                          <ImgFromSymbol
                            symbol={symbol}
                            coins={coins}
                            coinsLoading={coinsLoading}
                          />

                          <DivInner>
                            <div>{alias}</div>
                            <Leaders>
                              Created
                              <Dots />
                              {created.toDateString()}
                            </Leaders>
                          </DivInner>
                        </DivGrid>
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
    this.props.addressBookPost({ alias: 'New address', publicAddress: '' });
  };

  pick = id => () => {
    this.props.addressPick(id);
  };
}

export default AddressBookView;
