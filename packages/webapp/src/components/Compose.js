import React from 'react';

export default (Parent, Child) => ({ children, ...props }) => (
  <Parent {...props}>
    <Child children={children} />
  </Parent>
);
