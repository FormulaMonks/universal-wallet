import React, { Component, Fragment, Children, cloneElement } from 'react';
import Compose from './Compose';
import uuid from 'uuid';
import { getFile, putFile } from 'blockstack';
import { Ul, Leaders, Dots } from '../theme';
import { Spinner } from './';
import styled from 'styled-components';

const H4 = styled.h4`
  display: inline-block;
`;

const Li = styled.li`
  font-size: 12px;
  padding: 1em;

  &:nth-child(odd) {
    background: rgba(200, 200, 200, 0.1);
  }
`;

const ORDERS_JSON = 'orders.json';

const SS_ORDERS_URL = 'https://shapeshift.io/#/status/';

const sort = (a, b) => b.createdAt - a.createdAt;

const View = ({ orders, ordersLoading, wallet: { id } }) => {
  const filteredOrders = orders.filter(o => o.walletId === id);

  return (
    <Fragment>
      {!!filteredOrders.length && (
        <details>
          <summary>
            <H4>ShapeShift Orders History</H4>
          </summary>

          {ordersLoading ? (
            <Spinner />
          ) : (
            <Ul>
              {filteredOrders.map(
                ({ id, walletId, createdAt, tx, order, broadcast }) => {
                  const date = new Date(createdAt);

                  if (!tx && !order && !broadcast) {
                    return null;
                  }

                  return (
                    <Li key={`orders-${walletId}-${id}`}>
                      <Leaders>
                        Date
                        <Dots />
                        {date.toDateString()}, {date.toLocaleTimeString()}
                      </Leaders>

                      {tx && (
                        <Fragment>
                          <h4>Tx details</h4>
                          <Leaders>
                            Balance at the time <Dots />
                            {tx.fromSymbol.toUpperCase()} {tx.balance}
                          </Leaders>
                          <Leaders>
                            Amount<Dots />
                            {tx.fromSymbol.toUpperCase()} {tx.amount}
                          </Leaders>
                        </Fragment>
                      )}

                      {order && (
                        <Fragment>
                          <h4>Order details</h4>
                          {Object.keys(order).map((key, index) => {
                            return (
                              <Leaders
                                key={`orders-${walletId}-${id}-ss-order-${index}`}
                              >
                                {key}
                                <Dots />
                                {key === 'Order Id' ? (
                                  <a
                                    href={SS_ORDERS_URL + order[key]}
                                    target="_blank"
                                    rel="nofollow"
                                  >
                                    {order[key]}
                                  </a>
                                ) : (
                                  order[key]
                                )}
                              </Leaders>
                            );
                          })}
                        </Fragment>
                      )}

                      {broadcast && (
                        <Fragment>
                          <h4>Broadcast</h4>
                          <Leaders>
                            Status
                            <Dots />
                            {broadcast.status}
                          </Leaders>
                          <Leaders>
                            Info
                            <Dots />
                            {broadcast.info}
                          </Leaders>
                        </Fragment>
                      )}
                    </Li>
                  );
                },
              )}
            </Ul>
          )}
        </details>
      )}
    </Fragment>
  );
};

class Store extends Component {
  state = { orders: [], loaded: false, loading: true };

  componentDidMount() {
    this.get();
  }

  render() {
    const { children, ...rest } = this.props;
    const { orders, error, loaded, loading } = this.state;

    return (
      <Fragment>
        {Children.map(children, child =>
          cloneElement(child, {
            ...rest,
            orders,
            ordersLoaded: loaded,
            ordersLoading: loading,
            ordersError: error,
            ordersPost: this.post,
            ordersPut: this.put,
          }),
        )}
      </Fragment>
    );
  }

  get = () => {
    this.setState({ loading: true }, async () => {
      try {
        const file = await getFile(ORDERS_JSON);
        const raw = JSON.parse(file || '[]');
        const orders = raw.sort(sort);
        this.setState({ orders });
      } catch ({ message }) {
        this.setState({ error: message });
      }
      this.setState({ loaded: true, loading: false });
    });
  };

  post = async obj => {
    const id = uuid();
    const newOrder = { ...obj, createdAt: Date.now(), id };
    const newOrders = [...this.state.orders, newOrder];
    await putFile(ORDERS_JSON, JSON.stringify(newOrders));
    this.setState({ orders: newOrders.sort(sort) });
    return newOrder;
  };

  put = async (orderId, obj) => {
    const { orders } = this.state;
    const order = orders.find(({ id }) => id === orderId);
    if (order) {
      const { id, createdAt, ...rest } = order;
      const newOrder = { ...rest, ...obj, id, createdAt };
      const newOrders = [
        ...orders.filter(({ id }) => id !== orderId),
        newOrder,
      ];
      await putFile(ORDERS_JSON, JSON.stringify(newOrders));
      this.setState({ orders: newOrders.sort(sort) });
    }
  };
}

export { Store, View };
export default Compose(Store, View);
