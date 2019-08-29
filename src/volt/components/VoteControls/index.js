import React, { Component } from "react";
import { Tx, Input, Output } from "leap-core";
import { providers, utils } from "ethers";
import SMT from "../../lib/SparseMerkleTree";
import { getStoredValue, storeValues } from "../../../services/localStorage";

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
import { votesToValue, getUTXOs } from "../../utils";
import { abi, bytecode } from "../../contracts/voteBooth";
import { voltConfig } from "../../config";
import { getId } from "../../../services/plasma";

const RPC = "https://testnet-node1.leapdao.org";
const plasma = new providers.JsonRpcProvider(RPC);

class VoteControls extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expanded: false,
      votes: 0,
      choice: ""
    };
    this.collapse = this.collapse.bind(this);
    this.expand = this.expand.bind(this);
    this.setTokenNumber = this.setTokenNumber.bind(this);
    this.setChoice = this.setChoice.bind(this);
    this.submit = this.submit.bind(this);
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

  async submit() {
    const { account, metaAccount, web3 } = this.props;
    console.log(account);
    console.log({ metaAccount });
    console.log({ web3 });
    const { proposalId } = this.props;
    const { choice, votes } = this.state;
    console.log(`Submit Choice: ${votes} for ${choice} from ${account}`);
    const { hex, string } = votesToValue(votes);
    const sign = choice === "Yes" ? 1 : -1;
    const voiceCredits = sign * votes * 10 ** 18;

    const { boothAddress } = proposals[0];
    const balanceCardColor = voltConfig.BALANCE_CARD_COLOR;
    const balanceCardAddress = voltConfig.CONTRACT_VOICE_BALANCE_CARD;
    const balanceCards = await getUTXOs(plasma, account, balanceCardColor);
    console.log({ balanceCards });
    const balanceCard = balanceCards[0];
    const balanceCardId = getId(balanceCard);

    const voiceCreditsColor = voltConfig.VOICE_CREDITS_COLOR;
    const voiceCreditsUTXOs = await getUTXOs(
      plasma,
      account,
      voiceCreditsColor
    );
    console.log({ voiceCreditsUTXOs });

    // TODO: Do we need to get several here?
    const gasUTXOs = await getUTXOs(plasma, boothAddress, 0);
    console.log(gasUTXOs);
    const gas = gasUTXOs[0];
    const script = Buffer.from(bytecode, "hex");

    const condition = Tx.spendCond(
      [
        new Input({
          prevout: gas.outpoint,
          script
        }),
        new Input({
          prevout: balanceCard.outpoint
        }),
        new Input({
          prevout: voiceCreditsUTXOs[1].outpoint // HARDCODED, FIX TO PROPER SOLUTION!
        })
      ],
      [
        // Empty for now, we can always get them back from check
      ]
    );

    let tree;
    let castedVotes;
    let localTree = getStoredValue("votes", account);
    if (!localTree) {
      console.log("local tree is empty");
      tree = new SMT(9);
      castedVotes = 0;
    } else {
      const parsedTree = JSON.parse(localTree);
      console.log({ parsedTree });
      tree = new SMT(9, parsedTree);
      castedVotes = parsedTree[proposalId];
    }
    const proof = tree.createMerkleProof(proposalId);
    window.tree = tree;

    console.log({balanceCardId, proof, votes, castedVotes});

    const voteBoothABI = new utils.Interface(abi);
    const castBallotParams = voteBoothABI.functions.castBallot.encode([
      parseInt(balanceCardId),
      proof,
      parseInt(votes),
      castedVotes
    ]);
    console.log(castBallotParams);

    condition.inputs[0].setMsgData(castBallotParams);

    // Sign Spending Condition
    if (metaAccount && metaAccount.privateKey) {
      // TODO: Check that this is working on mobile, where you don't have Metamask
      condition.signAll(metaAccount.privateKey);
    } else {
      console.log("Waiting for sign with metamask");
      await condition.signWeb3(web3);
      console.log("Signed!");
    }

    // Check Spending Condition
    const response = await plasma.send("checkSpendingCondition",
      [condition.hex()]
    );

    console.log("Spending condition checked");
    console.log({ response });

    // TODO: Update outputs accordingly
    // TODO: Submit transition to blockchain
    // TODO: Update local SMT
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
    const { credits } = this.props;
    const max = Math.floor(Math.sqrt(credits)) || 0;
    const options = [
      { value: "Yes", color: "voltBrandGreen" },
      { value: "No", color: "voltBrandRed" }
    ];
    const disabled = votes < 1 || choice === "";
    return (
      <Container>
        <Equation votes={votes} />
        <StyledSlider
          min={0}
          max={max}
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
        <ActionButton disabled={disabled} onClick={this.submit}>
          Send Vote
        </ActionButton>
      </Container>
    );
  }
}

export default VoteControls;
