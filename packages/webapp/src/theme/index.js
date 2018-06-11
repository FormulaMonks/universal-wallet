import styled from 'styled-components';

/* section */
export const Section = styled.section`
  padding: 0 1em 1em;
`;

export const SectionHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
`;

export const SectionTitle = styled.h2`
  padding: 1.33em 0;
  margin: 0;
`;

export const StickySummary = styled.summary`
  position: sticky;
  top: 70px;
  display: block;
  background: #fff;
  z-index: 1;
`;

/* buttons */
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

/* lists and grids */
export const Ul = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

export const UlGrid = Ul.extend`
  display: grid;
  grid-gap: 1em;

  @media (min-width: 600px) {
    grid-template-columns: repeat(auto-fill, minmax(30em, 1fr));
  }
`;

export const LiGrid = styled.li`
  padding: 0.5em;

  &:nth-child(odd) {
    background: rgba(200, 200, 200, 0.1);
  }

  & a,
  & button {
    color: initial;
    font-size: initial;
    border: none;
  }

  & a {
    display: grid;
    grid-template-columns: auto 1fr;
    grid-gap: 0.5em;
    text-decoration: none;
  }

  & button {
    width: 100%;
    background: none;
    cursor: pointer;
  }

  @media (min-width: 600px) {
    background: rgba(200, 200, 200, 0.1);
  }
`;

/* leaders and dots */
export const Leaders = styled.div`
  display: flex;
  align-items: flex-end;
  margin: 1em 0;
  font-size: 12px;

  & input{ 
    text-align: right;
    border: none;
    border-bottom: 1px solid #eee;
    position: relative;
    top: -4px;
  }
`;

export const LeadersCoins = Leaders.extend`
  margin-left: 1em;

  & select {
    max-width: 150px;
    text-align: right;
    text-align-last: right;
  }
`;

export const LeadersQrScan = Leaders.extend`
  margin-left: 1em;
  position: relative;

  & button {
    border: none;
    cursor: pointer;
    background: none;
    padding: 0;
  }

  & svg {
    font-size: 28px;
    color: #444;
  }
`

export const Dots = styled.div`
  flex-grow: 1;
  margin: 0 0.5em;
  border-bottom: 1px dashed #ddd;
  position: relative;
  top: -4px;
  min-width: 10px;
`;


/* common */
export const Center = styled.div`
  text-align: center;
`;

/* wallet/address */
export const H3Wallet = styled.h3`
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;

  & img,
  & svg {
    margin-right: 0.5em;
  }
`;

export const H3Address = H3Wallet;

export const DivQrPublicAddress = Center.extend`
  background: rgba(200, 200, 200, 0.1);
  padding: 1em;
  padding-top: 1.5em;

  & div {
    margin-top: 1em;
    font-size: 12px;
    word-break: break-all;
    min-height: 17px;
  }
`;
