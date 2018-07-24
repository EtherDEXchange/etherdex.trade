import React, { Component } from "react";
import { connect } from "react-redux";
import BigNumber from "bignumber.js";
import { toast } from "react-toastify";
import { changeBuyType } from "../actions";
import { toWei, signOrder, toEth } from "../utils";

BigNumber.config({ EXPONENTIAL_AT: 30 });

class Buy extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tokenAmount: "",
      price: "",
      totalEth: "",
      expires: "10000"
    };

    this.changeBuyType = this.changeBuyType.bind(this);
    this.placeOrder = this.placeOrder.bind(this);
  }

  changeBuyType(type) {
    this.props.dispatch(changeBuyType(type));
  }

  async placeOrder() {
    let order;

    if (
      !this.state.expires ||
      this.state.expires < 1 ||
      this.state.expires % 1 !== 0
    ) {
      toast.error("Expires has to be higher than 0 and integer", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false
      });
      return;
    }

    if (!this.state.tokenAmount || this.state.tokenAmount <= 0) {
      toast.error("Token amount has to be higher than 0", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false
      });
      return;
    }

    if (
      this.props.buyType === "BUY" &&
      toWei(this.state.totalEth.toString(), 18).isGreaterThan(
        new BigNumber(this.props.balance)
      )
    ) {
      toast.error("You have only " + toEth(this.props.balance, 18) + " ETH", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false
      });
      return;
    }

    if (
      this.props.buyType === "SELL" &&
      toWei(
        this.state.tokenAmount.toString(),
        this.props.currentToken.decimals
      ).isGreaterThan(this.props.tokenBalance)
    ) {
      toast.error(
        "You have only " +
          toEth(this.props.tokenBalance, this.props.currentToken.decimals) +
          " " +
          this.props.currentToken.symbol,
        {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false
        }
      );
      return;
    }

    if (this.props.buyType === "BUY") {
      let activeOrdersETH = new BigNumber(0);
      let activeBuyOrders = this.props.market.myOrders.buys;
      activeBuyOrders.forEach(order => {
        activeOrdersETH = activeOrdersETH.plus(new BigNumber(order.amountGive));
      });
      activeOrdersETH = activeOrdersETH.plus(toWei(this.state.totalEth, 18));
      if (activeOrdersETH.isGreaterThan(this.props.balance)) {
        toast.error(
          "You have only " +
            toEth(this.props.balance, 18) +
            " ETH available. Check your active orders",
          {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: false
          }
        );
        return;
      }
    } else if (this.props.buyType === "SELL") {
      let activeOrdersToken = new BigNumber(0);
      let activeSellOrders = this.props.market.myOrders.sells;
      activeSellOrders.forEach(order => {
        activeOrdersToken = activeOrdersToken.plus(
          new BigNumber(order.amountGive)
        );
      });
      activeOrdersToken = activeOrdersToken.plus(
        toWei(this.state.tokenAmount, this.props.currentToken.decimals)
      );
      if (activeOrdersToken.isGreaterThan(this.props.tokenBalance)) {
        toast.error(
          "You have only " +
            toEth(this.props.tokenBalance, this.props.currentToken.decimals) +
            this.props.currentToken.symbol +
            " available. Check your active orders",
          {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: false
          }
        );
        return;
      }
    }

    if (!this.state.price || this.state.price <= 0) {
      toast.error("Price has to be higher than 0", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false
      });
      return;
    }

    if (this.props.buyType === "BUY") {
      let expire =
        (await this.props.web3.eth.getBlockNumber()) +
        Number(this.state.expires);

      order = {
        amountGive: toWei(this.state.totalEth, 18).toString(),
        tokenGive: "0x0000000000000000000000000000000000000000",
        amountGet: toWei(
          this.state.tokenAmount,
          this.props.currentToken.decimals
        ).toString(),
        tokenGet: this.props.currentToken.address,
        contractAddr: this.props.EtherDEX.options.address,
        expires: expire,
        nonce: Math.floor(Math.random() * Math.floor(1000000000)),
        user: this.props.account,
        type: "buy"
      };
    } else if (this.props.buyType === "SELL") {
      let expire =
        (await this.props.web3.eth.getBlockNumber()) +
        Number(this.state.expires);

      order = {
        amountGive: toWei(
          this.state.tokenAmount,
          this.props.currentToken.decimals
        ).toString(),
        tokenGive: this.props.currentToken.address,
        amountGet: toWei(this.state.totalEth, 18).toString(),
        tokenGet: "0x0000000000000000000000000000000000000000",
        contractAddr: this.props.EtherDEX.options.address,
        expires: expire,
        nonce: Math.floor(Math.random() * Math.floor(1000000000)),
        user: this.props.account,
        type: "sell"
      };
    }

    let signature = await signOrder(
      this.props.web3,
      order.contractAddr,
      order.user,
      order.tokenGet,
      order.amountGet,
      order.tokenGive,
      order.amountGive,
      order.expires,
      order.nonce
    );

    order.v = signature.v;
    order.r = signature.r;
    order.s = signature.s;

    this.props.socket.emit("order", order);

    this.setState({
      tokenAmount: "",
      price: "",
      totalEth: "",
      expires: "10000"
    });
  }

  render() {
    return (
      <div>
        <div className="d-flex flex-row justify-content-center">
          <div>
            <h2
              className="p-2 font-weight-light"
              style={{
                color: this.props.buyType === "BUY" ? "#00BFA5" : undefined,
                cursor: "pointer"
              }}
              onClick={() => this.changeBuyType("BUY")}
            >
              BUY
            </h2>
          </div>
          <div>
            <h2
              className="p-2 font-weight-light"
              style={{
                color: this.props.buyType === "SELL" ? "#00BFA5" : undefined,
                cursor: "pointer"
              }}
              onClick={() => this.changeBuyType("SELL")}
            >
              SELL
            </h2>
          </div>
        </div>
        <div>
          <div className="row">
            <div className="col-4 offset-2">
              <div className="form-group">
                <label className="label">
                  {this.props.currentToken.symbol} amount
                </label>
                <input
                  className="form-control input"
                  style={{ marginTop: "-5px" }}
                  type="number"
                  value={this.state.tokenAmount}
                  onChange={e => {
                    this.setState({
                      tokenAmount: e.target.value,
                      totalEth:
                        this.state.price && e.target.value
                          ? BigNumber(e.target.value).times(
                              BigNumber(this.state.price)
                            )
                          : 0
                    });
                  }}
                />
              </div>
            </div>
            <div className="col-4">
              <div className="form-group">
                <label className="label">
                  Price (ETH/{this.props.currentToken.symbol})
                </label>
                <input
                  className="form-control input"
                  style={{ marginTop: "-5px" }}
                  type="number"
                  value={this.state.price}
                  onChange={e => {
                    this.setState({
                      price: e.target.value,
                      totalEth:
                        this.state.tokenAmount && e.target.value
                          ? BigNumber(e.target.value).times(
                              BigNumber(this.state.tokenAmount)
                            )
                          : 0
                    });
                  }}
                />
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-4 offset-2">
              <div className="form-group">
                <label className="label">Total ETH</label>
                <input
                  className="form-control input"
                  style={{ marginTop: "-5px" }}
                  type="number"
                  value={this.state.totalEth}
                  disabled
                />
              </div>
            </div>
            <div className="col-4">
              <div className="form-group">
                <label className="label">Expires in (blocks)</label>
                <input
                  className="form-control input"
                  style={{ marginTop: "-5px" }}
                  type="number"
                  value={this.state.expires}
                  onChange={e => {
                    this.setState({
                      expires: e.target.value
                    });
                  }}
                />
              </div>
            </div>
          </div>
          <div className="text-center pb-2">
            <button className="button" onClick={this.placeOrder}>
              PLACE {this.props.buyType} ORDER
            </button>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    web3: state.web3Reducer.web3,
    account: state.web3Reducer.account,
    buyType: state.dexReducer.buyType,
    currentToken: state.dexReducer.currentToken,
    socket: state.dexReducer.socket,
    EtherDEX: state.web3Reducer.EtherDEX,
    balance: state.dexReducer.balance,
    tokenBalance: state.dexReducer.tokenBalance,
    market: state.dexReducer.market
  };
};

export default connect(mapStateToProps)(Buy);
