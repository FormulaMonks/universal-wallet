import React from 'react';
import styled from 'styled-components';

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  position: relative;
  margin: 8em auto;

  .bounce1,
  .bounce2 {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: #ddd;
    opacity: 0.6;
    position: absolute;
    top: 0;
    left: 0;

    animation: sk-bounce 2s infinite ease-in-out;
  }

  .bounce2 {
    animation-delay: -1s;
  }

  @keyframes sk-bounce {
    0%,
    100% {
      transform: scale(0);
    }
    50% {
      transform: scale(1);
    }
  }
`;

export default () => (
  <Spinner>
    <div className="bounce1" />
    <div className="bounce2" />
  </Spinner>
);
