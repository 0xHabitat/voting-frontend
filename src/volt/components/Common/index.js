import styled from "styled-components";
import { Flex } from "rimble-ui";

export const MainContainer = styled(Flex).attrs(() => ({
  flexDirection: "column",
  bg: "#4d606d"
}))`
  position: relative;
  height: 100vh;
`;

export const FullScreenContainer = styled(Flex).attrs(() => ({}))`
  position: fixed;
  top: 0;
  bottom: 0;
  width: 100%;
  z-index: 5;
`;

export const ActionClose = styled.button.attrs(() => ({}))`
  color: ${({ theme }) => theme.colors.voltBrandMain};
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  padding: 5px 10px;
  border: 3px solid white;
  border-radius: 8px;
  background-color: white;
  &:disabled {
    opacity: 0.3;
  }
`;