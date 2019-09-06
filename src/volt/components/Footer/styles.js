import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Flex, Text } from "rimble-ui";

export const FooterContainer = styled(Flex).attrs(() => ({
  p: 4,
  bg: "voltBrandMain",
  color: "voltBrandWhite"
}))``;

export const HistoryContainer = styled(Flex).attrs(() => ({
  flexDirection: "column"
}))``;

export const HistoryTitle = styled(Text).attrs(() => ({
  fontSize: 2,
  mb: 2,
  color: "voltBrandWhite"
}))`
  font-weight: bold;
  letter-spacing: 2px;
  text-transform: uppercase;
`;

export const HistoryItem = styled(Text).attrs(() => ({
  fontSize: 1,
  color: "voltBrandWhite",
  mb: 0
}))`
  & span {
    font-weight: bold;
    i {
      margin-right: 4px;
    }
    &:after {
      content: "•";
      margin-right: 4px;
      margin-left: 4px;
    }
  }
`;

export const History = ({ history }) => {
  return (
    <HistoryContainer>
      <HistoryTitle>Voice History</HistoryTitle>
      {history.length > 0 ?
        history.map(item => {
          const {type, votes, proposalId, timestamp} = item;
          let suffix = "Voice Credit";
          if (Math.abs(votes) !== 1 ) {
            suffix += "s";
          }
          const t = `${item.votes} ${suffix}`;
          const prefix = type === "cast" ? ">" : "<";
          return (
            <HistoryItem key={timestamp}>
              <span><i>{prefix}</i>{proposalId}</span> {t}
            </HistoryItem>
          );
        })
        : <Text color={"voltBrandWhite"} opacity={0.6}>No votes casted</Text>
      }
    </HistoryContainer>
  );
};
export const Timer = props => {
  const { voteStartTime, voteEndTime } = props;

  const now = new Date();
  const start = new Date(voteStartTime);
  const end = new Date(voteEndTime);

  const [timer, setTimer] = useState(0);

  useEffect(() => {
    let interval = null;
    interval = setInterval(() => {
      setTimer(timer => timer + 1);
    }, 1000);
    return () => clearInterval(interval);
  });

  return <div>{timer}</div>;
};
