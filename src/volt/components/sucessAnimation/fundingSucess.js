import React, { Component } from 'react'
import Lottie from 'react-lottie'
import animationData from '../../assets/fundingSucess.json'

class FundingSucess extends Component {


  render(){

    const defaultOptions = {
      loop: true,
      autoplay: true,
      animationData: animationData,
      rendererSettings: {
        preserveAspectRatio: 'xMidYMid slice'
      }
    };

    return(
      <div>
        <Lottie options={defaultOptions}
              height={150}
              width={250}
        />
      </div>
    )
  }
}

export default FundingSucess