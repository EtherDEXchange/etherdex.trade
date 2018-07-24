import React, { Component } from "react";
import { connect } from "react-redux";
import { toEth, toWei } from "../utils";
import BigNumber from "bignumber.js";
import { hideOrderModal } from "../actions";
import { toast } from "react-toastify";
import "./Modal.css";

BigNumber.config({ EXPONENTIAL_AT: 30 });

class OrderModal extends Component {
  constructor(props) {
    super(props);

    let tokenAmount, maxTokenAmount;
    maxTokenAmount = this.props.modalOrder.availableVolume;
    tokenAmount = this.props.modalOrder.availableVolume;
    this.state = {
      tokenAmount: toEth(
        tokenAmount,
        this.props.currentToken.decimals
      ).toString(),
      maxTokenAmount: maxTokenAmount
    };

    this.executeOrder = this.executeOrder.bind(this);
  }

  async executeOrder() {
    let amountToExecute;
    if (this.props.modalOrder.type === "buy") {
      amountToExecute = toWei(
        this.state.tokenAmount,
        this.props.currentToken.decimals
      ).toString();
    } else if (this.props.modalOrder.type === "sell") {
      amountToExecute = toWei(
        this.state.tokenAmount,
        this.props.currentToken.decimals
      )
        .multipliedBy(new BigNumber(this.props.modalOrder.price))
        .toString();
    }

    if (this.props.modalOrder.type === "buy") {
      let activeOrdersETH = new BigNumber(0);
      let activeBuyOrders = this.props.market.myOrders.buys;
      activeBuyOrders.forEach(order => {
        activeOrdersETH = activeOrdersETH.plus(new BigNumber(order.amountGive));
      });
      activeOrdersETH = activeOrdersETH.plus(
        toWei(
          new BigNumber(this.props.modalOrder.price)
            .times(new BigNumber(this.state.tokenAmount))
            .toString(),
          18
        )
      );
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
    } else if (this.props.modalOrder.type === "sell") {
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

    let order = this.props.modalOrder;
    order.amount = amountToExecute;
    let result = await this.props.EtherDEX.methods
      .testTrade(
        order.tokenGet,
        order.amountGet,
        order.tokenGive,
        order.amountGive,
        order.expires,
        order.nonce,
        order.user,
        order.v,
        order.r,
        order.s,
        amountToExecute,
        this.props.web3.eth.defaultAccount
      )
      .call();

    this.props.dispatch(hideOrderModal());

    if (result) {
      this.props.EtherDEX.methods
        .trade(
          order.tokenGet,
          order.amountGet,
          order.tokenGive,
          order.amountGive,
          order.expires,
          order.nonce,
          order.user,
          order.v,
          order.r,
          order.s,
          amountToExecute
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
          this.props.socket.emit("orderPending", {
            order: order,
            tradeHash: hash
          });
        })
        .on("receipt", receipt => {
          if (receipt.status) {
            toast.info(
              `Successfully traded ${this.props.currentToken.symbol}!`,
              {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: false
              }
            );

            this.props.socket.emit("getMarket", {
              token: this.props.currentToken.address,
              user: this.props.account
            });
          }
        })
        .on("error", error => {
          toast.error(
            `Error while trading ${
              this.props.currentToken.symbol
            }! Check if you have enough balance left to pay fees.`,
            {
              position: "top-center",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: false
            }
          );
        });
    } else {
      toast.error(
        "❌ Error during trade! Maybe order has expired or you don't have enough ETH/tokens to trade/pay fees.",
        {
          position: "top-center",
          autoClose: false,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false
        }
      );
    }
  }

  render() {
    let orderAction, feeType, fee;
    if (this.props.modalOrder.type === "sell") {
      orderAction = "BUY";
      feeType = "ETH";
      fee = new BigNumber(this.props.modalOrder.price)
        .times(new BigNumber(this.state.tokenAmount))
        .times(new BigNumber("0.002"))
        .toString();
    } else if (this.props.modalOrder.type === "buy") {
      orderAction = "SELL";
      feeType = this.props.currentToken.symbol;
      fee = new BigNumber(this.state.tokenAmount)
        .times(new BigNumber("0.002"))
        .toString();
    }

    return (
      <div className="text-center">
        <h2 style={{ textTransform: "uppercase", color: "#000" }}>
          {orderAction}
        </h2>

        <div className="">
          <form>
            <div className="row">
              <div className="col-8 offset-2">
                <div className="form-group">
                  <label style={{ color: "#212121" }}>
                    Amount of {this.props.currentToken.symbol} to {orderAction}{" "}
                    (available volume)
                  </label>
                  <input
                    className=" form-control input modalInput"
                    type="number"
                    value={new BigNumber(this.state.tokenAmount).toString()}
                    onChange={e => {
                      if (
                        new BigNumber(e.target.value).isGreaterThan(
                          toEth(
                            this.state.maxTokenAmount,
                            this.props.currentToken.decimals
                          )
                        )
                      ) {
                        return;
                      }

                      this.setState({ tokenAmount: e.target.value });
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-8 offset-2">
                <div className="form-group">
                  <label style={{ color: "#212121" }}>
                    Price ETH/{this.props.currentToken.symbol}
                  </label>
                  <input
                    className="form-control input modalInput"
                    type="number"
                    value={new BigNumber(
                      this.props.modalOrder.price
                    ).toString()}
                    disabled
                  />
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-8 offset-2">
                <div className="form-group">
                  <label style={{ color: "#212121" }}>Total ETH amount</label>
                  <input
                    className="form-control input modalInput"
                    type="number"
                    value={new BigNumber(this.props.modalOrder.price)
                      .times(new BigNumber(this.state.tokenAmount))
                      .toString()}
                    disabled
                  />
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-8 offset-2">
                <div className="form-group">
                  <label style={{ color: "#212121" }}>
                    Expires in (blocks)
                  </label>
                  <input
                    className="form-control input modalInput"
                    type="number"
                    value={
                      this.props.modalOrder.expires - this.props.currentBlock
                    }
                    disabled
                  />
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-8 offset-2">
                <div className="form-group">
                  <label style={{ color: "#212121" }}>Fee ({feeType})</label>
                  <input
                    className="form-control input modalInput"
                    type="number"
                    value={fee}
                    disabled
                  />
                </div>
              </div>
            </div>
          </form>
          <div className="row pt-3">
            <button
              className="button col-4 offset-4"
              style={{ fontSize: "20px" }}
              onClick={this.executeOrder}
            >
              {orderAction}
            </button>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    EtherDEX: state.web3Reducer.EtherDEX,
    web3: state.web3Reducer.web3,
    modalOrder: state.dexReducer.modalOrder,
    currentToken: state.dexReducer.currentToken,
    currentBlock: state.web3Reducer.currentBlock,
    socket: state.dexReducer.socket,
    account: state.web3Reducer.account,
    gasPrices: state.web3Reducer.gasPrices,
    gasChoice: state.web3Reducer.gasChoice,
    market: state.dexReducer.market
  };
};

export default connect(mapStateToProps)(OrderModal);
