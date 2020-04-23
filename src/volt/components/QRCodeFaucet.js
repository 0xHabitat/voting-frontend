import React from "react";
import QRCode from "qrcode.react";
import styled from "styled-components";
import FundingSucess from "./sucessAnimation/fundingSucess";

const Container = styled.div`
  margin-top: auto;
  margin-bottom: auto;
  word-break: break-all;
  text-align: center;
  display: flex;
  width: 400px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
`;

const OpenAppBtn = styled.button`
  background-color: #ff2be1;
  border: none;
  padding: 10px;
  margin-top: 15px;
  margin-bottom: 15px;
  font-weight: bold;
`;

const QRCodeWrapper = styled.div`
  background-color: white;
  background: white;
  height: 143px;
  width: 143px;
  margin-right: auto;
  margin-left: auto;
`;

const Link = styled.a`
  color: #000 !important;
`;

const Attention = styled.span`
  color: #03fef8;
`;

const QRCodeFaucet = ({ privateKey }) => (
  <Container>
    <FundingSucess />
    <div>
      <p>
        <b>We have generated and funded your voting account.</b> <br />
        <Attention>
          Please scan the QR code or click the link with a <br /> non-web3
          browser (no metamask).
        </Attention>
      </p>
      <QRCodeWrapper>
        <QRCode
          style={{ marginTop: "7.5px" }}
          value={"http://vote.ethturin.com/pk#" + privateKey}
        />
      </QRCodeWrapper>
      <OpenAppBtn href={"http://vote.ethturin.com/pk#" + privateKey}>
        <Link href={"http://vote.ethturin.com/pk#" + privateKey}>
          Open the App{" "}
        </Link>
      </OpenAppBtn>
      <div>
        <a href={"http://vote.ethturin.com/pk#" + privateKey}>
          {"vote.ethturin.com/pk#" + privateKey}
        </a>
      </div>
    </div>
  </Container>
);

export default QRCodeFaucet;
