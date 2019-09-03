import React, { memo } from "react";
import { ListContainer } from "./styles";
import SingleProposal from "./SingleProposal";

const ProposalsList = props => {
  const { list, toggle, favorites } = props;
  return (
    <ListContainer>
      {list &&
        list.map((proposal, index) => {
          const { proposalId } = proposal;
          const favorite = favorites[proposalId];
          return (
            <SingleProposal
              key={`${proposalId}${index}`}
              toggle={toggle}
              favorite={favorite}
              {...proposal}
            />
          );
        })}
    </ListContainer>
  );
};

export default ProposalsList
