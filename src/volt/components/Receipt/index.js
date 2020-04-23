import React from "react";
import styled from "styled-components";
import { Flex, Text, Image } from "rimble-ui";

import { FullScreenContainer } from "../Common";
import { DeoraLogo } from "../Menu/styles";

import VoteYes from "./voteYes";
import voteNo from "../../assets/vote-no.png";
import voteAccepted from '../../assets/vote-accepted.svg';
import witdrawImage from "../../assets/icn-withdraw.svg";
import { ActionClose } from "../Common";

const Container = styled(Flex).attrs(() => ({
  bg: "voltBrandMain",
  px: "4rem",
  pt: "4rem",
  pb: "3rem",
  flexDirection: "column",
  justifyContent: "space-between",
  alignItems: "center"
}))`
  position: absolute;
  width: 100%;
  height: 100%;
`;

const Logo = styled(DeoraLogo)`
  margin-bottom: ${({theme}) => `${theme.space[5]}px`};
  
  @media screen and (max-height: 600px){  
  }
`;

const MiddlePart = styled(Flex).attrs(() => ({
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center"
}))``;

const Title = styled(Text).attrs(() => ({
  fontSize: 4
}))`
  color: white;
  text-align: center;
`;

const Graphic = styled(Image).attrs(() => ({}))`
  height: auto;
  background-color: transparent;
`;

const ReceiptInfo = styled(Flex).attrs(() => ({
  mb: "3rem",
  flexDirection: "column"
}))``;

const ReceiptFieldContainer = styled(Flex).attrs(() => ({
  mb: 3
}))`
  justify-content: center;
`;

const ReceiptText = styled(Text).attrs(() => ({
  mb: "3rem",
  flexDirection: "column",
  fontSize: 3
}))`
  color: white;
  font-weight: normal;
  text-transform: uppercase;
  text-align: center;
  letter-spacing: 2px;
  max-width: 60em;
`;

const Label = styled(Text).attrs(() => ({
  fontSize: 2
}))`
  color: white;
  font-weight: normal;
  text-transform: uppercase;
  text-align: center;
  letter-spacing: 3px;

  &:after {
    content: ":";
    display: inline-block;
    margin-right: 8px;
  }
`;

const Value = styled(Label)`
  font-weight: bold;
  &:after {
    content: "";
    display: none;
  }
`;

const ReceiptField = ({ label, value }) => {
  return (
    <ReceiptFieldContainer>
      <Label>{label}</Label>
      <Value>{value}</Value>
    </ReceiptFieldContainer>
  );
};

export const Receipt = props => {
  const { votes = 0, onClose } = props;
  return (
    <FullScreenContainer>
      <Container>
        <Title>Your Receipt</Title>
        <MiddlePart>
          <VoteYes />
          <ReceiptInfo>
            <ReceiptField label="Number of Upvotes" value={votes.toString()} />
            <ReceiptField label="Voicecredits" value={votes.mul(votes).toString()} />
          </ReceiptInfo>
        </MiddlePart>
        <ActionClose onClick={onClose}>Close</ActionClose>
      </Container>
    </FullScreenContainer>
  );
};

export const WithdrawReceipt = props => {
  const { onClose } = props;
  return (
    <FullScreenContainer>
      <Container>
        <Logo/>
        <MiddlePart>
          <Graphic src={witdrawImage} width={"30vw"} mb="4rem" />
          <ReceiptText>
            YOUR VOTE HAS BEEN SUCCESSFULLY WITHDRAWN
          </ReceiptText>
        </MiddlePart>
        <ActionClose onClick={onClose}>Schließen</ActionClose>
      </Container>
    </FullScreenContainer>
  );
};
