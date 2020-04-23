import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Flex } from "rimble-ui";
import { bi, divide } from "jsbi-utils";
import { voltConfig } from "./volt/config";
import { FullScreenContainer } from "./volt/components/Common";
import { LoadingLogo } from "./volt/components/Loader/styles";
import { fromWei } from "web3-utils";
import QRCodeFaucet from "./volt/components/QRCodeFaucet";
let base64url = require("base64url");


const MainContainer = styled.div`
  position: fixed;
  top: 0;
  bottom: 0;
  width: 100%;
  z-index: 5;
  background-color: #000000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const RequestButton = styled.button.attrs(() => ({}))`
  color: ${({ theme }) => theme.colors.voltBrandMain};
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  margin-top: 65px;
  padding: 5px 10px;
  border: 3px solid white;
  border-radius: 8px;
  background-color: white;
  &:disabled {
    opacity: 0.3;
  }
`;

const ERC721 = [
  {
    constant: true,
    inputs: [
      {
        name: "owner",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        name: "balance",
        type: "uint256",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
];

const ERC20 = [
  {
    constant: true,
    inputs: [
      {
        name: "_owner",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        name: "balance",
        type: "uint256",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
];

export default function FaucetPage({ web3Props }) {
  const [balance, setBalances] = React.useState();
  const [isParticipant, setParticipant] = React.useState();
  const [hasRequested, setRequested] = React.useState();
  const [privateKey, setPrivateKey] = React.useState();

  function pkToUrl(pk) {
    return base64url(web3Props.web3.utils.hexToBytes(pk));
  }
  const redirect = () => {
    window.location.replace("/");
  };

  const requestTokens = async () => {
    try {
      const votingAddress = web3Props.web3.eth.accounts.privateKeyToAccount(
        privateKey
      ).address;
      web3Props.web3.eth.personal
        .sign(votingAddress.replace('0x',''), web3Props.account)
        .then(function (receipt) {
          const requestOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              address: web3Props.account,
              color: 4,
              toAddress: votingAddress,
              sig: receipt,
            }),
          };
          fetch(
            "https://jw98dxp219.execute-api.eu-west-1.amazonaws.com/testnet",
            requestOptions
          ).then((response) => {
            console.log(response.json());
            //localStorage.setItem("requested-faucet", true);
          });
        });
    } catch (err) {
      console.error(err);
    }
  };

  React.useEffect(() => {
    const contract = new web3Props.plasma.eth.Contract(
      ERC20,
      voltConfig.CONTRACT_VOICE_CREDITS
    );

    contract.methods
      .balanceOf(web3Props.account)
      .call()
      .then(function (balance) {
        setBalances(fromWei(balance));
        if (balance = 0) {
          redirect();
        } else {
          if (localStorage.getItem("requested-faucet")) {
            setRequested(true);
            return;
          }

          const contract1 = new web3Props.web3.eth.Contract(
            ERC721,
            "0xD8Dcb0C856B5d0D234E70f9e5F13b6bc165F7dE4"
          );
          contract1.methods
            .balanceOf(web3Props.account)
            .call()
            .then(function (amount) {
              console.log(amount);
              if (amount > 0) {
                setParticipant(true);
                var localStor = false;
                if (typeof Storage !== "undefined") {
                  localStor = true;
                  const privateKey = localStorage.getItem("privKey-faucet");
                  if (privateKey) {
                    setPrivateKey(privateKey);
                    return;
                  }
                  // Code for localStorage
                }
                const account = web3Props.web3.eth.accounts.create();
                setPrivateKey(account.privateKey);
                if (localStor) {
                  localStorage.setItem("privKey-faucet", account.privateKey);
                }
              } else {
                setParticipant(false);
              }
            });
        }
      });
  }, []);

  return (

    <MainContainer>
      <LoadingLogo/>
      {" "}
      {isParticipant && !hasRequested && (
        <RequestButton onClick={() => requestTokens()}>Request Voice Tokens</RequestButton>
      )}{" "}
      {hasRequested && privateKey && (
        <QRCodeFaucet privateKey={pkToUrl(privateKey)}></QRCodeFaucet>
      )}
    </MainContainer>
  );
}
