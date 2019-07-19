import React from "react";
import { Tx, Input, Output, Util } from "leap-core";
import Web3 from "web3";
import { toHex, bytesToHex, padLeft } from "web3-utils";
import { ecsign, hashPersonalMessage, ripemd160 } from "ethereumjs-util";
const EARTH_ABI = require("./abis/earth.json");

const BN = Web3.utils.BN;
const SCRIPT = Buffer.from(
  "608060405234801561001057600080fd5b506004361061002e5760e060020a60003504637f565aab8114610033575b600080fd5b610106600480360360e081101561004957600080fd5b813591602081013591810190606081016040820135602060020a81111561006f57600080fd5b82018360208201111561008157600080fd5b803590602001918460018302840111602060020a831117156100a257600080fd5b91908080601f01602080910402602001604051908101604052809392919081815260200183838082843760009201919091525092955050823593505050602081013563ffffffff16906040810135600160a060020a03908116916060013516610108565b005b6000829050600081600160a060020a03166337ebbc038a6040518263ffffffff1660e060020a0281526004018082815260200191505060206040518083038186803b15801561015657600080fd5b505afa15801561016a573d6000803e3d6000fd5b505050506040513d602081101561018057600080fd5b50516040805160e160020a6331a9108f028152600481018c90529051919250828a0391731f89fb2199220a350287b162b9d0a330a2d2efad91829163a9059cbb91600160a060020a03881691636352211e91602480820192602092909190829003018186803b1580156101f257600080fd5b505afa158015610206573d6000803e3d6000fd5b505050506040513d602081101561021c57600080fd5b50516040805163ffffffff84811660e060020a028252600160a060020a039093166004820152918b1660248301525160448083019260209291908290030181600087803b15801561026c57600080fd5b505af1158015610280573d6000803e3d6000fd5b505050506040513d602081101561029657600080fd5b50506040805160e160020a6331a9108f028152600481018a905290518691600160a060020a038085169263a9059cbb9291851691636352211e916024808301926020929190829003018186803b1580156102ef57600080fd5b505afa158015610303573d6000803e3d6000fd5b505050506040513d602081101561031957600080fd5b50516040805163ffffffff84811660e060020a028252600160a060020a039093166004820152918c1660248301525160448083019260209291908290030181600087803b15801561036957600080fd5b505af115801561037d573d6000803e3d6000fd5b505050506040513d602081101561039357600080fd5b81019080805190602001909291905050505084600160a060020a03166336c9c4578d8d8d6040518463ffffffff1660e060020a0281526004018084815260200183815260200180602001828103825283818151815260200191508051906020019080838360005b838110156104125781810151838201526020016103fa565b50505050905090810190601f16801561043f5780820380516001836020036101000a031916815260200191505b50945050505050600060405180830381600087803b15801561046057600080fd5b505af1158015610474573d6000803e3d6000fd5b50505050600081600160a060020a03166337ebbc038b6040518263ffffffff1660e060020a0281526004018082815260200191505060206040518083038186803b1580156104c157600080fd5b505afa1580156104d5573d6000803e3d6000fd5b505050506040513d60208110156104eb57600080fd5b50516040805160e060020a63a983d43f028152600481018d905263ffffffff8c16830160248201529051919250600160a060020a0384169163a983d43f9160448082019260009290919082900301818387803b15801561054a57600080fd5b505af115801561055e573d6000803e3d6000fd5b50506040805160e060020a63a9059cbb028152738db6B632D743aef641146DC943acb64957155388600482015263ffffffff8d166024820152905173f64ffbc4a69631d327590f4151b79816a193a8c6935083925063a9059cbb916044808201926020929091908290030181600087803b1580156105db57600080fd5b505af11580156105ef573d6000803e3d6000fd5b505050506040513d602081101561060557600080fd5b5050505050505050505050505050505056fea165627a7a7230582040b4d4c325ac3d46db172e483ff415735a15bc2356a30fbc65bf9b92d06fdc5a0029",
  "hex"
);
window.ethjsutils = { ecsign, hashPersonalMessage };

/**
 * Passport data structure

+------------+------------+------------+-------------+
|20 bytes    | 4 bytes    | 4 bytes    | 4 bytes     |
|name str    | picId      | CO2 locked | CO2 emitted |
+------------+------------+------------+-------------+

*/

export default ({ metaAccount, web3, leap3 }) => {
  // generate from code
  const EARTH_ADDR = "0x" + ripemd160(SCRIPT).toString("hex");
  const USA_ADDR = "0x3378420181474D3aad9579907995011D6a545E3D";
  const USB_ADDR = "0x181fc600915c35F4e44d41f9203A7c389b4A7189";
  console.log("earth address", EARTH_ADDR);

  const USA_COLOR = 49156;
  const USB_COLOR = 49155;
  const LEAP_COLOR = 0;
  const CO2_COLOR = 2;
  const GOELLARS_COLOR = 3;

  window.getColors = async () => {
    return new Promise((resolve, reject) => {
      leap3.currentProvider.send(
        {
          jsonrpc: "2.0",
          id: 42,
          method: "plasma_getColors",
          params: [false, true]
        },
        (err, response) => {
          if (err) {
            return reject(err);
          }
          return resolve(response.result);
        }
      );
    });
  };

  window.startTrade = async () => {
    function updateCO2(passportData, amount = 10) {
      const n = new BN(passportData.replace("0x", ""), 16);
      n.iadd(new BN(amount));
      return padLeft(n.toString(16), 64);
    }

    function hashAndSign(buffer, address, privateKey) {
      console.log("SIGN", buffer.toString("hex"));
      console.log("xxxx", hashPersonalMessage(buffer).toString("hex"));
      const { r, s, v } = ecsign(
        hashPersonalMessage(buffer),
        Buffer.from(privateKey.replace("0x", ""), "hex")
      );
      const full = Array.from(r)
        .concat(Array.from(s))
        .concat([v]);
      return bytesToHex(full);

      // Web3:
      //return await web3.eth.personal.sign(buffer.toString(), address, null);
    }

    const address = metaAccount
      ? metaAccount.address
      : (await web3.eth.getAccounts())[0];
    const privateKey = metaAccount && metaAccount.privateKey;
    const myPassportOutput = (await leap3.getUnspent(address, USB_COLOR))[0];

    const myPassport = myPassportOutput.output.data;
    const myPassportAfter = updateCO2(myPassport);
    console.log(myPassport, myPassportAfter);

    const signedPassport = hashAndSign(
      Buffer.from(myPassport.replace("0x", "") + myPassportAfter, "hex"),
      address,
      privateKey
    );

    const receipt = [
      padLeft(toHex(USB_COLOR), 4),
      padLeft(address, 40),
      padLeft(myPassportAfter, 64),
      padLeft(signedPassport, 130)
    ].map(x => x.replace("0x", ""));
    console.log(receipt.join(""));
  };

  window.finalizeTrade = async receipt => {
    const address = metaAccount
      ? metaAccount.address
      : (await web3.eth.getAccounts())[0];

    const privateKey = metaAccount && metaAccount.privateKey;

    function unpackReceipt(receipt) {
      const passportColor = parseInt(receipt.substr(0, 4), 16);
      const address = "0x" + receipt.substr(4, 40).toLowerCase();
      const passportData = receipt.substr(44, 64);
      const signature = "0x" + receipt.substr(108);
      const r = signature;

      return { passportColor, address, passportData, signature };
    }
    console.log(unpackReceipt(receipt));
    const their = unpackReceipt(receipt);

    console.log("0x" + their.address, parseInt(their.passportColor, 16));

    const theirPassportOutput = (await leap3.getUnspent(
      their.address,
      their.passportColor
    ))[0];

    const theirPassportDataBefore = theirPassportOutput.output.data.replace(
      "0x",
      ""
    );
    console.log(theirPassportDataBefore, their.passportData);
    const buffer = Buffer.from(
      theirPassportDataBefore + their.passportData,
      "hex"
    );

    //console.log("VERIFY", buffer.toString("hex"));
    //console.log("xxxx", hashPersonalMessage(buffer).toString("hex"));

    //const theirAccount = await web3.eth.personal.ecRecover(
    //  buffer.toString(),
    //  their.signature
    //);

    //console.log(theirAccount);

    //if (theirAccount != their.address) {
    //  throw "ecsignature doesn't match sender";
    //}

    const leapOutput = (await leap3.getUnspent(EARTH_ADDR, LEAP_COLOR))[0];
    const co2Output = (await leap3.getUnspent(EARTH_ADDR, CO2_COLOR))[0];
		console.log("CO₂", co2Output);
    const goellarsOutput = (await leap3.getUnspent(
      EARTH_ADDR,
      GOELLARS_COLOR
    ))[0];

    const myPassportOutput = (await leap3.getUnspent(address, USB_COLOR))[1];

    let condition = Tx.spendCond(
      [
        new Input({ prevout: leapOutput.outpoint, script: SCRIPT }),
        new Input({ prevout: co2Output.outpoint }),
        new Input({ prevout: goellarsOutput.outpoint }),
        new Input({ prevout: theirPassportOutput.outpoint }),
        new Input({ prevout: myPassportOutput.outpoint })
      ],
      []
    );

    console.log(
      theirPassportOutput.output.value,
      "0x" + their.passportData,
      their.signature,
      myPassportOutput.output.value,
      10,
      USB_ADDR,
      USB_ADDR
    );

    const earthContract = new web3.eth.Contract(EARTH_ABI);
    const data = await earthContract.methods
      .trade(
        theirPassportOutput.output.value,
        "0x" + their.passportData,
        their.signature,
        myPassportOutput.output.value,
        10,
        USB_ADDR,
        USB_ADDR
      )
      .encodeABI();
    console.log("msg data", data);
    condition.inputs[0].setMsgData(data);


    console.log(condition.hex(), data);

    const { outputs } = await new Promise((resolve, reject) => {
      leap3.currentProvider.send(
        {
          jsonrpc: "2.0",
          id: 42,
          method: "checkSpendingCondition",
          params: [condition.hex()]
        },
        (err, response) => {
          if (err) {
            return reject(err);
          }
          return resolve(response.result);
        }
      );
    });

    console.log(outputs);

    condition = Tx.spendCond(
      [
        new Input({ prevout: leapOutput.outpoint, script: SCRIPT }),
        new Input({ prevout: co2Output.outpoint }),
        new Input({ prevout: goellarsOutput.outpoint }),
        new Input({ prevout: theirPassportOutput.outpoint }),
        new Input({ prevout: myPassportOutput.outpoint })
      ],
      [
        new Output(outputs[0]),
        new Output(outputs[1]),
        new Output(outputs[2]),
        new Output(outputs[3]),
        new Output(outputs[4]),
        new Output(outputs[5]),
        new Output(outputs[6])
      ]
    );
    condition.inputs[0].setMsgData(data);
    //condition.signAll(privateKey);
    //condition.sign([null, null, null, null, privateKey]);

    const result = await new Promise((resolve, reject) => {
      leap3.currentProvider.send(
        {
          jsonrpc: "2.0",
          id: 42,
          method: "eth_sendRawTransaction",
          params: [condition.hex()]
        },
        (err, { result }) => {
          if (err) {
            return reject(err);
          }
          return resolve(result);
        }
      );
    });
    console.log(result);
  };

  window.bufferfrom = Buffer.from;
  return <div>hell0</div>;
};
