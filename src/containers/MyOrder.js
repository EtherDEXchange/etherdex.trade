import React, { Component } from "react";
import { connect } from "react-redux";
import BigNumber from "bignumber.js";
import { toEth } from "../utils";
import { toast } from "react-toastify";

BigNumber.config({ EXPONENTIAL_AT: 30 });

class MyOrder extends Component {
  constructor(props) {
    super(props);

    this.cancelOrder = this.cancelOrder.bind(this);
  }

  cancelOrder() {
    let order = this.props.order;
    this.props.EtherDEX.methods
      .cancelOrder(
        order.tokenGet,
        order.amountGet,
        order.tokenGive,
        order.amountGive,
        order.expires,
        order.nonce,
        order.v,
        order.r,
        order.s
      )
      .send({
        from: this.props.account,
        gasPrice: this.props.web3.utils.toHex(
          this.props.web3.utils.toWei(
            this.props.gasPrices[this.props.gasChoice],
            "gwei"
          )
        )
      })
      .on("transactionHash", hash => {
        this.props.socket.emit("cancelOrder", {
          orderID: order._id,
          token: this.props.currentToken.address,
          user: this.props.account,
          hash: hash
        });
      })
      .on("receipt", receipt => {
        toast.info(`Successfully canceled order!`, {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false
        });

        this.props.socket.emit("getMarket", {
          token: this.props.currentToken.address,
          user: this.props.account
        });
      });
  }

  render() {
    let orderColor;
    if (this.props.type === "buy") {
      orderColor = "#B2FF59";
    } else if (this.props.type === "sell") {
      orderColor = "#EC407A";
    }
    return (
      <div className="d-flex flex-row" style={{ overflow: "hidden" }}>
        <span className="col-3 text-left p-0" style={{ color: orderColor }}>
          {BigNumber(this.props.price).toFixed(10)}
        </span>
        <span className="col-2 text-center p-0">
          {toEth(this.props.token, this.props.currentToken.decimals).toFixed(3)}
        </span>
        <span className="col-2 text-center p-0">
          {toEth(this.props.eth, 18).toFixed(4)}
        </span>
        <span className="col-2 text-center p-0">{this.props.volume}</span>
        <span className="col-1 text-right p-0">{this.props.expires}</span>
        <span
          className="col-2 text-right p-0"
          onClick={this.cancelOrder}
          style={{ cursor: "pointer" }}
          role="img"
          aria-label="cancel order"
        >
          ❌
        </span>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    web3: state.web3Reducer.web3,
    account: state.web3Reducer.account,
    currentToken: state.dexReducer.currentToken,
    socket: state.dexReducer.socket,
    EtherDEX: state.web3Reducer.EtherDEX,
    gasPrices: state.web3Reducer.gasPrices,
    gasChoice: state.web3Reducer.gasChoice
  };
};

export default connect(mapStateToProps)(MyOrder);
