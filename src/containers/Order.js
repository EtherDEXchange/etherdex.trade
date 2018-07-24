import React, { Component } from "react";
import { connect } from "react-redux";
import BigNumber from "bignumber.js";
import { toEth } from "../utils";
import { showOrderModal } from "../actions";

BigNumber.config({ EXPONENTIAL_AT: 30 });

class Order extends Component {
  constructor(props) {
    super(props);

    this.openOrderModal = this.openOrderModal.bind(this);
  }

  render() {
    let orderColor;
    if (this.props.type === "buy") {
      orderColor = "#B2FF59";
    } else if (this.props.type === "sell") {
      orderColor = "#EC407A";
    }
    return (
      <div
        className="d-flex flex-row order"
        style={{ cursor: "pointer" }}
        onClick={() => this.openOrderModal()}
      >
        <span className="col-4 text-left p-0" style={{ color: orderColor }}>
          {BigNumber(this.props.price).toFixed(10)}
        </span>
        <span className="col-4 text-center p-0">
          {toEth(this.props.token, this.props.currentToken.decimals).toFixed(3)}
        </span>
        <span className="col-4 text-right p-0">
          {toEth(this.props.eth, 18).toFixed(4)}
        </span>
      </div>
    );
  }

  openOrderModal() {
    this.props.dispatch(showOrderModal(this.props.order));
  }
}

const mapStateToProps = state => {
  return {
    web3: state.web3Reducer.web3,
    currentToken: state.dexReducer.currentToken,
    market: state.dexReducer.market
  };
};

export default connect(mapStateToProps)(Order);
