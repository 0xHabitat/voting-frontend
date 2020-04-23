import React from "react";
import { Link } from 'react-router-dom';
import Web3 from 'web3';
import {
  HeaderContainer,
  TopContainer,
  LogoContainer,
  LogoDeora,
  LogoEthTurin,
  LogoPadding,
  Actions,
  Settings,
  Hamburger,
  BalanceContainer,
  Balance,
  Label,
  Value
} from "./styles";

import { factor18 } from '../../utils';

const BN = Web3.utils.BN;

export const Header = props => {
  let { credits, maxCredits = 25, openMenu } = props;
  if (maxCredits < 100) {
    maxCredits = 100;
  }
  let availableCredits = '--';
  if (credits) {
    availableCredits = new BN(credits).div(factor18).toString();
  }
  return (
    <HeaderContainer>
      <TopContainer>
        <Link to="/">
          <LogoContainer>
            <LogoDeora/>
            <LogoPadding>x</LogoPadding>
            <LogoEthTurin/>
          </LogoContainer>
        </Link>
        <Actions>
          <Hamburger onClick={openMenu} />
        </Actions>
      </TopContainer>
      <BalanceContainer>
        <Label className="long">MEINE VOICE CREDITS</Label>
        <Label className="short">VOICE CREDITS</Label>
        <Balance>
          <Value>
            {availableCredits} <span>/{maxCredits > 0 ? maxCredits : '--'}</span>{" "}
          </Value>
        </Balance>
      </BalanceContainer>
    </HeaderContainer>
  );
};
