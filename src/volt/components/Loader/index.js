import React from 'react'
import { FullScreenContainer } from "../Common";
import { LoaderContainer, LoadingLogo } from "./styles";
import ProgressBar from "./progressBar";

const Loader = () => {
  return(
    <FullScreenContainer>
      <LoaderContainer>
        <LoadingLogo/>
        <ProgressBar/>
      </LoaderContainer>
    </FullScreenContainer>
  )
};

export default Loader
