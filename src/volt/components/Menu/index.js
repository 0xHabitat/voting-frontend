import React from "react";
import dayjs from 'dayjs';
import { FullScreenContainer, ActionClose } from "../Common";
import { Container } from "../Progress/styles";
import { DeoraLogo, MenuItems, Item, AccountDetails, Label, Address } from "./styles";

const Menu = ({ onClose, account, voteEndTime }) => (
  <FullScreenContainer>
    <Container>
      <DeoraLogo />
      <MenuItems>
        <Item href="https://ethturin.com/">ETH TURIN</Item>
        <Item href="https://ethturin.com/agenda">Agenda</Item>
        <Item href="https://ethturin.com/tracks">The tracks</Item>
        <Item href="https://vote.ethturin.com/faucet ">Faucet for Voice Credits</Item>
        {dayjs().isAfter(voteEndTime) && <Item target="_blank" href="https://vote.ethturin.com/results">Results</Item>}
      </MenuItems>
      <AccountDetails>
        <Label>Your Account Address:</Label>
        <Address>{account}</Address>
      </AccountDetails>
      <ActionClose onClick={onClose}>Schließen</ActionClose>
    </Container>
  </FullScreenContainer>
);

export default Menu;
