import React, { Component } from "react";
import { connect } from "react-redux";
import BigNumber from "bignumber.js";
import { toEth } from "../utils";

BigNumber.config({ EXPONENTIAL_AT: 30 });

class Trade extends Component {
  render() {
    let orderColor;
    if (this.props.type === "buy") {
      orderColor = "#B2FF59";
    } else if (this.props.type === "sell") {
      orderColor = "#EC407A";
    }
    return (
      <div className="d-flex flex-row">
        <a
          className="col-3 text-left p-0"
          style={{
            textDecoration: "underline",
            textDecorationStyle: "dotted",
            color: "white"
          }}
          href={
            "https://" +
            (this.props.networkID === 3 ? "ropsten." : "") +
            "etherscan.io/tx/" +
            this.props.hash
          }
        >
          {this.props.hash.substr(0, 6)}
        </a>
        <span className="col-3 text-left p-0" style={{ color: orderColor }}>
          {BigNumber(this.props.price).toFixed(10)}
        </span>
        <span className="col-3 text-center p-0">
          {toEth(this.props.token, this.props.currentToken.decimals).toFixed(3)}
        </span>
        <span className="col-3 text-right p-0">
          {toEth(this.props.eth, 18).toFixed(4)}
        </span>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    web3: state.web3Reducer.web3,
    currentToken: state.dexReducer.currentToken,
    networkID: state.web3Reducer.networkID
  };
};

export default connect(mapStateToProps)(Trade);
