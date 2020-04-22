import styled from "styled-components";
import { Container } from "../Progress/styles";
import { Image } from "rimble-ui";
import loadingLogo from "../../assets/loading-logo.png";

export const LoaderContainer = styled(Container)`
  justify-content: center;
`;

export const LoadingLogo = styled(Image).attrs(() => ({
  src: loadingLogo
}))`
  width: 12em;
  background-color: transparent;
  position: relative;
`;
