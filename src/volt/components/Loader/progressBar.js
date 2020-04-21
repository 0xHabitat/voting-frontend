import React, { Component } from 'react'
import Lottie from 'react-lottie'
import animationData from '../../assets/progressBar.json'

class ProgressBar extends Component {


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
              height={110}
              width={250}
        />
      </div>
    )
  }
}

export default ProgressBar