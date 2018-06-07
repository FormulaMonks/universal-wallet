import styled from 'styled-components';

export const Section = styled.section`
  padding: 0 1em;
`;

export const Button = styled.button`
  font-family: 'Open Sans', sans-serif;
  padding: 0.5em 2em;
  border: 1px solid #ccc;
  background: #fff;
  font-size: 14px;
  cursor: pointer;

  &:enabled:hover {
    border-color: rgba(0, 0, 0, 0);
    color: #fff;
    background: rgba(37, 58, 84, 0.7);
  }

  &:enabled:active {
    border-color: rgba(0, 0, 0, 0);
    color: #fff;
    background: rgba(37, 58, 84, 0.9);
  }
`;

export const Ul = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

export const Center = styled.div`
  text-align: center;
`;

export const Leaders = styled.div`
  display: flex;
  align-items: flex-end;
  margin: 1em 0;
  font-size: 12px;
`;

export const Dots = styled.div`
  flex-grow: 1;
  margin: 0 0.5em;
  border-bottom: 1px dashed #ddd;
  position: relative;
  top: -4px;
  min-width: 10px;
`;

export const SectionTitle = styled.h2`
  padding: 1.33em 0;
  margin: 0;
`
