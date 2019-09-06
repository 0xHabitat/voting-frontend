import React from "react";
import { FooterContainer, History, Timer } from "./styles";
import {getStoredValue} from "../../../services/localStorage";

const Footer = (props) => {
  const { account } = props;

  // TODO: Need optimization with use of state or context
  const prevValues = getStoredValue("votesHistory", account);
  const parsedHistory = prevValues ? JSON.parse(prevValues) : [];
  const history = parsedHistory.reverse().slice(0, 3);

  return (
    <FooterContainer>
      <History history={history} />
    </FooterContainer>
  );
};

export default Footer;
