import React from 'react';

export default (Store, Saga) => ({ children, ...props }) => (
  <Store {...props}>
    <Saga children={children} />
  </Store>
);
