import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Flex } from "rimble-ui";
import { bi, divide } from "jsbi-utils";
import { voltConfig } from "./volt/config";

const Container = styled(Flex).attrs({
  flexDirection: 'column',
})`
  flex: 1;
  height: 100%;

  ul {
    height: 100%;
    overflow-y: auto;
    padding: 0;
  }
`;

const ERC721 = [{"constant":true,"inputs":[{"name":"owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"}];

const ERC20 = [
  {
      "constant": true,
      "inputs": [
          {
              "name": "_owner",
              "type": "address"
          }
      ],
      "name": "balanceOf",
      "outputs": [
          {
              "name": "balance",
              "type": "uint256"
          }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
  }
];

export default function FaucetPage({ web3Props }) {
  const [balance, setBalances] = React.useState();
  React.useEffect(() => {
    const contract = new web3Props.plasma.eth.Contract(ERC20, voltConfig.CONTRACT_VOICE_CREDITS);
    console.log(web3Props.hasOwnProperty("metaAccount") ? true : false);
    console.log("Account: "+ web3Props.account)
    /*contract.methods.balanceOf(web3Props.account).call()
    .then(function(x){
      setBalances(x);
    });*/
    setBalances("4");

  });

  React.useEffect(() => {
    if(balance){
      console.log("changed");
    } else {
      const contract = new web3Props.web3.eth.Contract(ERC721, "0xd8dcb0c856b5d0d234e70f9e5f13b6bc165f7de4");
      contract.methods.balanceOf(web3Props.account).call().then(function(x){
        console.log(x);
      });
    }
  }, [balance]);


  return <Container>
    {!balance && 'Loading...'}
    {balance && (
      <ul>
        {balance}
      </ul>
    )}
  </Container>;
}
