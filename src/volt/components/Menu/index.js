import React from "react";
import { FullScreenContainer, ActionClose } from "../Common";
import { Container } from "../Progress/styles";
import { DeoraLogo, MenuItems, Item, AccountDetails, Label, Address } from "./styles";

const Menu = ({ onClose, account }) => (
  <FullScreenContainer>
    <Container>
      <DeoraLogo />
      <MenuItems>
        <Item href="/page-1">Über uns</Item>
        <Item href="/page-2">Quadratical Voting</Item>
        <Item href="/page-3">Die Blockchain</Item>
        <Item href="/page-4">Sicherheit & Privacy</Item>
        <Item href="/page-5">Wahlergebnisse</Item>
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
