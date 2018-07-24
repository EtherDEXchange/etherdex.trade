import React, { Component } from "react";

class WarningWeb3Modal extends Component {
  render() {
    return (
      <div>
        <div className="row">
          <img
            className="mx-auto pt-5 mt-4"
            src="https://image.ibb.co/fuFNod/metamask.png"
          />
        </div>
        <div style={{ color: "#212121" }} className="text-center mt-3">
          <h1>Your MetaMask is not enabled</h1>
          <p className="mt-3">
            To be able to connect with Ethereum network you have to install
            MetaMask browser extension.
          </p>
          <a href="https://metamask.io/">Download MetaMask here!</a>
        </div>
      </div>
    );
  }
}

export default WarningWeb3Modal;
