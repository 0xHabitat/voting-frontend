import React from "react";
import QRCode from "qrcode.react";
import styled from "styled-components";

const Container = styled.div`
  margin-top: auto;
  margin-bottom: auto;
  word-break: break-all;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const QRCodeFaucet = ({ privateKey }) => (
  <Container>
    <div>
      <p>
        We have generated and funded your voting account. Please scan the QR
        code or click the link with a non-web3 browser (no metamask).
      </p>
      <div>
        <QRCode value={"http://vote.ethturin.com/pk#" + privateKey} />
      </div>
      <a href={"http://vote.ethturin.com/pk#" + privateKey}>
        {"vote.ethturin.com/pk#" + privateKey}
      </a>
    </div>
  </Container>
);

export default QRCodeFaucet;
