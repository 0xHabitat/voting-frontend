import React from "react";
import { PrimaryButton } from "../components/Buttons";
import { finalizeHandshake } from "./utils";

export default class FinalizeHandshake extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  async componentDidMount() {
    const passport = (await this.props.leap3.getUnspent(
      "0x197970E48082CD46f277ABDb8afe492bCCd78300",
      "49155"
    ))[1];
    this.setState({ passport });
  }

  send = async () => {
    const result = await finalizeHandshake(
      this.props.leap3,
      this.state.passport,
      this.props.scannerState.receipt,
      this.props.metaAccount.privateKey
    );
    console.log("Finalize handshake", result);
  };

  render() {
    const {
      changeView,
      goBack,
      metaAccount,
      web3,
      leap3
    } = this.props;
    const { receipt } = this.props.scannerState;
    const { passport } = this.state;

    return (
      <div>
        {receipt}

        <PrimaryButton
          size={"large"}
          width={1}
          disabled={!passport}
          onClick={this.send}
        >
          Handshake!
        </PrimaryButton>
      </div>
    );
  }
}
