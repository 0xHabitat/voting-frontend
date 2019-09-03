import React from 'react';
import styled from 'styled-components';
import { Flex, Box } from "rimble-ui";
import yabbcode from 'ya-bbcode';

import { Star, Back } from "./volt/components/Common";
import VoteControls from "./volt/components/VoteControls";
import { ActionButton } from "./volt/components/VoteControls/styles";


const parser = new yabbcode();

parser.registerTag('color', {
  type: 'replace',
  open: (attr) => {
      return `<span style="color: ${attr}">`;
  },
  close: '</span>'
});

parser.registerTag('ol', {
  type: 'replace',
  open: '<ol>',
  close: '</ol>'
});

parser.registerTag('ul', {
  type: 'replace',
  open: '<ul>',
  close: '</ul>'
});

parser.registerTag('li', {
  type: 'replace',
  open: '<li>',
  close: null
});

parser.registerTag('size', {
  type: 'replace',
  open: (attr) => {
      return `<span>`;
  },
  close: '</span>'
});

const VoteButton = styled(ActionButton)`
  width: auto;
  padding-left: 50px;
  padding-right: 50px;
`;

const Container = styled(Flex).attrs({
  flexDirection: 'column',
})`
  flex: 1;
  height: 100%;
`;

export const Footer = styled(Flex).attrs(() => ({
  p: 3,
  width: "100%",
  bg: "voltBrandMain",
  color: "voltBrandWhite",
  alignItems: "center",
  justifyContent: "center"
}))`
  /* position: fixed;
  bottom: 0;
  z-index: 2; */
  flex-direction: column;
`;

export const VoteFooter = styled(Flex).attrs(() => ({
  pt: 5,
  pb: 5,
}))`
`;

const HeaderBar = styled(Flex).attrs({
  justifyContent: 'space-between',
  pt: 3,
  pb: 3,
})``;

const Content = styled(Box).attrs({
  p: 3,
  pt: 0,
})`
  height: 100%;
  overflow-y: auto;
  /* br {
    display: none;
  } */
`;

export default class ProposalPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showVoteControls: false,
    };
  }
  render() {
    const { showVoteControls } = this.state;
    const {
      proposal,
      toggleFavorites,
      favorite,
      creditsBalance,
      goBack,
      web3Props,
    } = this.props;

    return (
      <Container>
        <Content as="article">
          <HeaderBar as="nav">
            <Back onClick={goBack}/>
            <Star active={favorite} onClick={()=> toggleFavorites(proposal.proposalId)}/>
          </HeaderBar>

          <header>
            <h1>{proposal.title}</h1>
          </header>
          <main dangerouslySetInnerHTML={{__html: parser.parse(proposal.description)}} />
        </Content>

        <Footer as="footer">
          {showVoteControls &&
            <VoteControls
              proposalId={proposal.proposalId}
              credits={creditsBalance}
              {...web3Props}
            />
          }

          {!showVoteControls &&
            <VoteFooter>
              <VoteButton onClick={() => {
                this.setState({ showVoteControls: true })
              }}>JETZT VOTEN</VoteButton>
            </VoteFooter>
          }
        </Footer>

      </Container>
    );
  }
}