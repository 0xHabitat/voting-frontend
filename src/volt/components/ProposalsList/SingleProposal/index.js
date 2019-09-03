import React from "react";
import { Link } from 'react-router-dom';
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
  //const { votes } = props;
  const { title, proposalId, toggle, favorite } = props;
  // const { favorite } = props;
  const topic = "Smart State";
    // Math.random() > 0.3 ? "yes" : Math.random() > 0.5 ? "no" : "empty";
  const votes = 0;
  return (
    <ProposalContainer>
      <VoteRecord votes={votes} />
      <Link to={`/proposal/${proposalId}`}>
      <VoteInfo>
        <TopPart>

            <ProposalId>{proposalId}</ProposalId>
            <Topic>{topic}</Topic>

        </TopPart>
        <Title>{title}</Title>
      </VoteInfo>
      </Link>
      <Star active={favorite} onClick={()=> toggle(proposalId)}/>
    </ProposalContainer>
  );
};

export default SingleProposal;
