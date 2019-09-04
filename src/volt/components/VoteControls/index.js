import React, { Component } from "react";
import Web3 from "web3";
import { Tx, Input, Output, helpers } from "leap-core";
import { providers, utils } from "ethers";
import { bufferToHex } from "ethereumjs-util";
import SMT from "../../lib/SparseMerkleTree";
import { getStoredValue, storeValues } from "../../../services/localStorage";

import votingBoothArtifact from "../../contracts/VotingBooth";
import ballotBoxInterface from "../../contracts/ballotBox";

import { Equation } from "./GridDisplay";
import { Choice } from "./Choice";
import {
  SliderLabels,
  Container,
  Label,
  StyledSlider,
  ActionButton
} from "./styles";
import proposals from "../../proposals";
import {
  votesToValue,
  getUTXOs,
  toHex,
  padHex,
  replaceAll,
  signMatching,
  pad
} from "../../utils";
import { voltConfig } from "../../config";
import { getData, getId } from "../../../services/plasma";
import Progress from "../Progress";
import { bytecode, template } from "../../contracts/voteBooth";
import Receipt from "../Receipt";

const RPC = "https://testnet-node1.leapdao.org";
const plasma = new providers.JsonRpcProvider(RPC);

class VoteControls extends Component {
  constructor(props) {
    super(props);

    this.collapse = this.collapse.bind(this);
    this.expand = this.expand.bind(this);
    this.setProgressState = this.setProgressState.bind(this);
    this.setReceiptState = this.setReceiptState.bind(this);
    this.resetState = this.resetState.bind(this);

    this.setTokenNumber = this.setTokenNumber.bind(this);
    this.setChoice = this.setChoice.bind(this);

    this.prepareScript = this.prepareScript.bind(this);
    this.getOutputs = this.getOutputs.bind(this);
    this.cookVoteParams = this.cookVoteParams.bind(this);
    this.constructVote = this.constructVote.bind(this);
    this.signVote = this.signVote.bind(this);
    this.processVote = this.processVote.bind(this);

    // Withdraw methods
    this.prepareWithdrawScript = this.prepareWithdrawScript.bind(this);
    this.getWithdrawOutputs = this.getWithdrawOutputs.bind(this);
    this.cookWithdrawParams = this.cookWithdrawParams.bind(this);
    this.signWithdraw = this.signWithdraw.bind(this);

    this.getDataFromTree = this.getDataFromTree.bind(this);
    this.writeDataToTree = this.writeDataToTree.bind(this);

    this.submitVote = this.submitVote.bind(this);
    this.withdrawVote = this.withdrawVote.bind(this);

    const treeData = this.getDataFromTree();
    this.state = {
      expanded: false,
      votes: 0,
      choice: "",
      showProgress: false,
      showReceipt: false,
      ...treeData
    };
  }

  setTokenNumber(event) {
    const { target } = event;
    this.setState(state => ({
      ...state,
      votes: target.value
    }));
  }

  setChoice({ value }) {
    this.setState(state => ({
      ...state,
      choice: value
    }));
  }

  prepareScript() {
    const { proposalId } = this.props;
    const { yesBoxAddress, noBoxAddress } = proposals[proposalId];
    const hexId = toHex(proposalId, 12);

    // Bytecode templates
    const {
      VOICE_CREDITS,
      VOICE_TOKENS,
      BALANCE_CARD,
      YES_BOX,
      NO_BOX,
      PROPOSAL_ID
    } = template;

    // VOLT related addresses
    const {
      CONTRACT_VOICE_CREDITS,
      CONTRACT_VOICE_TOKENS,
      CONTRACT_VOICE_BALANCE_CARD
    } = voltConfig;

    // Replace all the placeholders with real data
    let finalBytecode = replaceAll(
      bytecode,
      VOICE_CREDITS,
      CONTRACT_VOICE_CREDITS
    );
    finalBytecode = replaceAll(
      finalBytecode,
      VOICE_TOKENS,
      CONTRACT_VOICE_TOKENS
    );
    finalBytecode = replaceAll(
      finalBytecode,
      BALANCE_CARD,
      CONTRACT_VOICE_BALANCE_CARD
    );
    finalBytecode = replaceAll(finalBytecode, YES_BOX, yesBoxAddress);
    finalBytecode = replaceAll(finalBytecode, NO_BOX, noBoxAddress);

    finalBytecode = replaceAll(finalBytecode, PROPOSAL_ID, hexId);
    return Buffer.from(finalBytecode, "hex");
  }

  async getBalanceCard(address) {
    // Balance Card
    const { BALANCE_CARD_COLOR } = voltConfig;
    const balanceCards = await getUTXOs(plasma, address, BALANCE_CARD_COLOR);
    const balanceCard = balanceCards[0];

    return {
      id: getId(balanceCard),
      unspent: balanceCard
    };
  }

  async getVoteCredits(address) {
    const { VOICE_CREDITS_COLOR } = voltConfig;
    const voiceCreditsUTXOs = await getUTXOs(
      plasma,
      address,
      VOICE_CREDITS_COLOR
    );

    // TODO: We can put all UTXO here for consolidation
    return {
      unspent: voiceCreditsUTXOs[0]
    };
  }

  async getGas(address) {
    // Gas is always paid in Leap tokens (color = 0)
    const LEAP_COLOR = 0;
    const gasUTXOs = await getUTXOs(plasma, address, LEAP_COLOR);

    // TODO: Do we need to get several here?
    const gas = gasUTXOs[0];
    return {
      unspent: gas
    };
  }

  async getVoteTokens(address) {
    const { VOICE_TOKENS_COLOR } = voltConfig;
    const voiceTokensUTXOs = await getUTXOs(
      plasma,
      address,
      VOICE_TOKENS_COLOR
    );

    // TODO: Pick enough outputs
    const voiceTokensOutput = voiceTokensUTXOs[0];

    console.log({ voiceTokensUTXOs });

    return {
      unspent: voiceTokensOutput,
      all: voiceTokensUTXOs
    };
  }

  async getOutputs() {
    const { account, proposalId } = this.props;
    const proposal = proposals[proposalId];
    const { boothAddress } = proposal;
    // TODO: Parallelize with Promise.all([...promises])
    const gas = await this.getGas(boothAddress);
    const voteTokens = await this.getVoteTokens(boothAddress);
    const balanceCard = await this.getBalanceCard(account);
    const voteCredits = await this.getVoteCredits(account);

    return {
      gas,
      voteTokens,
      balanceCard,
      voteCredits
    };
  }

  getDataFromTree() {
    const t = utils.parseEther('1');
    console.log('Test', padHex(t.toHexString(), 64));
    const { account, proposalId } = this.props;

    let tree;
    let castedVotes;
    let localTree = getStoredValue("votes", account);

    if (!localTree) {
      console.log("local tree is empty");
      tree = new SMT(9);
      castedVotes = 0;
    } else {
      const parsedTree = JSON.parse(localTree);
      console.log({parsedTree});
      tree = new SMT(9, parsedTree);
      castedVotes = utils.formatEther(parsedTree[proposalId]);
    }
    const proof = tree.createMerkleProof(proposalId);

    console.log({ castedVotes, proof });

    return {
      proof,
      castedVotes
    };
  }

  writeDataToTree(castedVotes, newLeaf) {
    const { account, proposalId } = this.props;
    const localTree = getStoredValue("votes", account);
    const parsedTree = JSON.parse(localTree);
    parsedTree[proposalId] = padHex(newLeaf.toHexString(), 64);

    console.log({castedVotes, newLeaf});
    console.log({parsedTree});

    storeValues({ votes: JSON.stringify(parsedTree) }, account);

    const tree = new SMT(9, parsedTree);
    const proof = tree.createMerkleProof(proposalId);

    this.setState(state => ({
      ...state,
      proof,
      castedVotes
    }));
  }

  cookVoteParams(balanceCardId, prevVotes, newVotes) {
    const { proof } = this.state;

    const { abi } = votingBoothArtifact;
    const contractInterface = new utils.Interface(abi);

    return contractInterface.functions.castBallot.encode([
      parseInt(balanceCardId),
      proof,
      prevVotes, // previous value
      newVotes // how much added
    ]);
  }

  async constructVote(outputs, script, data) {
    const { gas, voteTokens, voteCredits, balanceCard } = outputs;

    const { all } = voteTokens;

    const vote = Tx.spendCond(
      [
        new Input({
          prevout: gas.unspent.outpoint,
          script
        }),
        new Input({
          prevout: voteTokens.unspent.outpoint
        }),
        new Input({
          prevout: voteCredits.unspent.outpoint
        }),
        new Input({
          prevout: balanceCard.unspent.outpoint
        })
      ],
      // Outputs is empty, cause it's hard to guess what it should be
      []
    );

    vote.inputs[0].setMsgData(data);
    return vote;
  }

  async signVote(vote) {
    const { metaAccount, web3 } = this.props;

    if (metaAccount && metaAccount.privateKey) {
      // TODO: Check that this is working on mobile, where you don't have Metamask
      //vote.signAll(metaAccount.privateKey);
      vote.sign([null, null, null, metaAccount.privateKey]);
    } else {
      await window.ethereum.enable();
      await vote.signWeb3(web3);
    }
  }

  async signWithdraw(withdraw) {
    const { metaAccount, web3 } = this.props;

    if (metaAccount && metaAccount.privateKey) {
      // TODO: Check that this is working on mobile, where you don't have Metamask
      //vote.signAll(metaAccount.privateKey);
      withdraw.sign([null, null, null, null, metaAccount.privateKey]);
    } else {
      await window.ethereum.enable();
      await withdraw.signWeb3(web3);
    }
  }

  async checkCondition(vote) {
    return await plasma.send("checkSpendingCondition", [vote.hex()]);
  }

  async updateVoteOutputs(vote, correctOutputs) {
    for (let i = 0; i < correctOutputs.length; i++) {
      vote.outputs[i] = new Output.fromJSON(correctOutputs[i]);
    }
  }

  async processVote(vote) {
    const plasmaWeb3 = helpers.extendWeb3(new Web3(RPC));
    const receipt = await plasmaWeb3.eth.sendSignedTransaction(vote.hex());
    return receipt;
  }

  async submitVote() {
    const { votes, choice, castedVotes } = this.state;

    console.log("Display Progress Screen");
    console.log({ choice });
    this.setProgressState(true);

    /// START NEW CODE

    const script = this.prepareScript();
    const outputs = await this.getOutputs();
    const { balanceCard } = outputs;

    const treeData = this.getDataFromTree();
    console.log({ treeData });

    const sign = choice === "yes" ? 1 : -1;

    const prevNumOfVotes = utils.parseEther((castedVotes).toString());
    const newVotesTotal = Math.abs(parseInt(castedVotes)) + parseInt(votes);
    const newNumOfVotes = utils.parseEther((sign * newVotesTotal).toString());

    console.log({ castedVotes, newVotesTotal, newNumOfVotes });

    const data = this.cookVoteParams(
      balanceCard.id,
      prevNumOfVotes,
      newNumOfVotes
    );
    const vote = await this.constructVote(outputs, script, data);

    console.log({ vote });

    // Sign and check vote
    await this.signVote(vote);
    const check = await this.checkCondition(vote);

    console.log({ check });
    vote.outputs = check.outputs.map(o => new Output(o));
    await this.signVote(vote);

    const secondCheck = await this.checkCondition(vote);
    console.log({ secondCheck });

    // Submit vote to blockchain
    const receipt = await this.processVote(vote);
    console.log({ receipt });
    this.writeDataToTree(newVotesTotal, newNumOfVotes);

    this.setProgressState(false);
    this.setReceiptState(true);
  }

  // WITHDRAW RELATED METHODS

  prepareWithdrawScript() {
    const { proposalId, trashBox } = this.props;
    const { yesBoxAddress, noBoxAddress } = proposals[proposalId];
    console.log({ yesBoxAddress, noBoxAddress });
    const hexId = toHex(proposalId, 12);
    const {
      VOICE_CREDITS,
      VOICE_TOKENS,
      BALANCE_CARD,
      TRASH_BOX,
      PROPOSAL_ID,
      IS_YES
    } = ballotBoxInterface.template;

    const {
      CONTRACT_VOICE_CREDITS,
      CONTRACT_VOICE_TOKENS,
      CONTRACT_VOICE_BALANCE_CARD
    } = voltConfig;

    // TODO: Add selection here
    const YES = "0x000000000001";
    const NO = "0x000000000000";

    // Construct new bytecode
    let finalBytecode = replaceAll(
      bytecode,
      VOICE_CREDITS,
      CONTRACT_VOICE_CREDITS
    );
    finalBytecode = replaceAll(
      finalBytecode,
      VOICE_TOKENS,
      CONTRACT_VOICE_TOKENS
    );
    finalBytecode = replaceAll(
      finalBytecode,
      BALANCE_CARD,
      CONTRACT_VOICE_BALANCE_CARD
    );
    finalBytecode = replaceAll(finalBytecode, TRASH_BOX, trashBox);
    finalBytecode = replaceAll(finalBytecode, IS_YES, YES);
    finalBytecode = replaceAll(finalBytecode, PROPOSAL_ID, hexId);
    return Buffer.from(finalBytecode, "hex");
  }

  async getWithdrawOutputs() {
    const { account, proposals, proposalId } = this.props;
    const proposal = proposals[proposalId];
    console.log({ proposal });

    const { yesBoxAddress, noBoxAddress } = proposal;
    // TODO: Check from what box we shall withdraw
    const destBox = yesBoxAddress;

    console.log({ destBox });

    const gas = await this.getGas(destBox);
    const voteTokens = await this.getVoteTokens(destBox);
    const voteCredits = await this.getVoteCredits(destBox);
    const balanceCard = await this.getBalanceCard(account);

    return {
      gas,
      voteTokens,
      balanceCard,
      voteCredits
    };
  }

  cookWithdrawParams(balanceCardId, amount) {
    const { proof } = this.state;

    const { abi } = ballotBoxInterface;
    const contractInterface = new utils.Interface(abi);

    console.log({amount});

    return contractInterface.functions.withdraw.encode([
      parseInt(balanceCardId),
      proof,
      amount,
      amount
    ]);
  }

  async constructWithdraw(outputs, script, data) {
    const { gas, voteTokens, voteCredits, balanceCard } = outputs;

    console.log({voteTokens});

    const inputs = [
      new Input({
        prevout: gas.unspent.outpoint,
        script
      }),
      new Input({
        prevout: voteTokens.all[0].outpoint
      }),
      new Input({
        prevout: voteTokens.all[1].outpoint
      }),
      new Input({
        prevout: voteCredits.unspent.outpoint
      }),
      new Input({
        prevout: balanceCard.unspent.outpoint
      })
    ];

    const withdraw = Tx.spendCond(
      inputs,
      // Outputs is empty, cause it's hard to guess what it should be
      []
    );

    withdraw.inputs[0].setMsgData(data);
    return withdraw;
  }

  async withdrawVote() {
    const { castedVotes } = this.state;
    console.log("Display Progress Screen");
    this.setProgressState(true);

    // WITHDRAW CODE HERE
    const script = this.prepareWithdrawScript();
    const outputs = await this.getWithdrawOutputs();
    const { balanceCard } = outputs;

    const treeData = this.getDataFromTree();
    console.log({ treeData });

    const currentVotes = utils.parseEther((castedVotes).toString());

    const data = this.cookWithdrawParams(balanceCard.id, currentVotes);

    const withdraw = await this.constructWithdraw(outputs, script, data);

    console.log({ withdraw });

    //await this.signVote(withdraw);
    await this.signWithdraw(withdraw);
    const check = await this.checkCondition(withdraw);

    console.log({ check });
    withdraw.outputs = check.outputs.map(o => new Output(o));
    await this.signWithdraw(withdraw);

    const secondCheck = await this.checkCondition(withdraw);
    console.log({ secondCheck });

    /*    // Update vote and sign again
    this.updateVoteOutputs(withdraw, check.outputs);
    await this.signVote(withdraw);
    const secondCheck = await this.checkCondition(withdraw);
    console.log({ secondCheck });*/

    this.setProgressState(false);

    // TODO: Do we need to show receipt screen here?
    // this.setReceiptState(true);
  }

  setProgressState(bool) {
    this.setState(state => ({
      ...state,
      showProgress: bool
    }));
  }

  setReceiptState(bool) {
    this.setState(state => ({
      ...state,
      showReceipt: bool
    }));
  }

  resetState() {
    this.setState(() => ({
      expanded: false,
      votes: 0,
      choice: "",
      showProgress: false,
      showReceipt: false
    }));
  }

  collapse() {
    this.setState(state => {
      return {
        ...state,
        expanded: false
      };
    });
  }

  expand() {
    this.setState(state => {
      return {
        ...state,
        expand: true
      };
    });
  }

  render() {
    const { expanded, votes, choice } = this.state;
    const { showReceipt, showProgress } = this.state;
    const { credits } = this.props;
    const max = Math.floor(Math.sqrt(credits)) || 0;
    const options = [
      { value: "yes", color: "voltBrandGreen" },
      { value: "no", color: "voltBrandRed" }
    ];
    const disabled = votes < 1 || choice === "";

    return (
      <Container>
        {showProgress && <Progress message={"Processing, please wait..."} />}
        {showReceipt && (
          <Receipt voteType={choice} votes={votes} onClose={this.resetState} />
        )}
        <Equation votes={votes} />
        <StyledSlider
          min={0}
          max={Math.max(max, 1)}
          steps={max + 1}
          value={votes}
          onChange={this.setTokenNumber}
        />
        <SliderLabels>
          <Label>0</Label>
          <Label>{max}</Label>
        </SliderLabels>
        <Choice
          options={options}
          selection={choice}
          onChange={this.setChoice}
        />
        <ActionButton disabled={disabled} onClick={this.submitVote}>
          Send Vote
        </ActionButton>
        <ActionButton onClick={this.withdrawVote}>Withdraw</ActionButton>
      </Container>
    );
  }
}

export default VoteControls;
