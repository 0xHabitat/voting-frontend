import React from "react";
import { Star } from "../../Common";
import VoteRecord from "../VoteRecord";
import {
  ProposalContainer,
  VoteInfo,
  TopPart,
  ProposalId,
  Topic,
  Title
} from "./styles";

const SingleProposal = props => {
  const { title, proposalId, toggle, favorite } = props;
  const topic = "Smart State";
  const sign = 1
  const votes = sign * 0;
  return (
    <ProposalContainer>
      <VoteRecord votes={votes} />
      <VoteInfo>
        <TopPart>
          <ProposalId>{proposalId}</ProposalId>
          <Topic>{topic}</Topic>
        </TopPart>
        <Title>{title}</Title>
      </VoteInfo>
      <Star active={favorite} onClick={()=> toggle(proposalId)}/>
    </ProposalContainer>
  );
};

export default SingleProposal;
