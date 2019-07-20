import React from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import getConfig from "../config";
import i18n from "../i18n";
import { Flex, Box, PublicAddress, QR as QRCode } from "rimble-ui";
import { startHandshake, finalizeHandshake } from "./utils";

const CONFIG = getConfig();

export default class Handshake extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  async componentDidMount() {
    const passport = (await this.props.leap3.getUnspent(
      "0x197970E48082CD46f277ABDb8afe492bCCd78300",
      "49155"
    ))[0];
    this.setState({passport});
  }

  render() {
    const {
      changeView,
      changeAlert,
      goBack,
      metaAccount,
      web3,
      leap3
    } = this.props;
    const { passport } = this.state;
    let receipt = "";
    console.log(passport);
    if (passport) {
      receipt = startHandshake(passport, metaAccount.privateKey);
    }
    window.leap3 = leap3;

    return (
      <div>
        <div>
          <CopyToClipboard
            text={receipt}
            onCopy={() => {
              changeAlert({
                type: "success",
                message: i18n.t("receive.address_copied")
              });
            }}
          >
            <Box>
              <Flex
                flexDirection={"column"}
                alignItems={"center"}
                p={3}
                border={1}
                borderColor={"grey"}
                borderRadius={1}
              >
                <QRCode className="qr-code" value={"/planeta/handshake/"+receipt} renderAs={"svg"} />
              </Flex>
            </Box>
          </CopyToClipboard>
        </div>
        <div name="theVeryBottom" className="text-center bottom-text">
          <span style={{ padding: 10 }}>
            <a
              href="#"
              style={{ color: "#FFFFFF" }}
              onClick={() => {
                goBack();
              }}
            >
              <i className="fas fa-times" /> {i18n.t("cancel")}
            </a>
          </span>
        </div>
      </div>
    );
  }
}
