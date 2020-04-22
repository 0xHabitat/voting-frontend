import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Flex } from "rimble-ui";
import { bi, divide } from "jsbi-utils";
import { voltConfig } from "./volt/config";
import { fromWei } from "web3-utils";


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
    contract.methods.balanceOf(web3Props.account).call()
    .then(function(balance){
      setBalances(fromWei(balance));
      if(balance){
        console.log("changed");
        console.log(web3Props.web3);
      //} else {
      console.log(web3Props.web3.eth.defaultAccount);
        const contract1 = new web3Props.web3.eth.Contract(ERC721, "0xD8Dcb0C856B5d0D234E70f9e5F13b6bc165F7dE4");
        contract1.methods.balanceOf(web3Props.account).call().then(function(z){
          console.log(z);
        });
    }
    });

  },[]);


  return <Container>
    {!balance && 'Loading...'}
    {balance && (
      <ul>
        {balance}
      </ul>
    )}
  </Container>;
}
