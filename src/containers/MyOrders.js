import BigNumber from "bignumber.js";
import React, { Component } from "react";
import { Scrollbars } from "react-custom-scrollbars";
import { connect } from "react-redux";
import MyOrder from "./MyOrder";
import { toEth } from "../utils";
import "../index.css";

BigNumber.config({ EXPONENTIAL_AT: 30 });

class MyOrders extends Component {
  render() {
    return (
      <div style={{ overflow: "hidden" }}>
        <div className="d-flex flex-row justify-content-center">
          <h2 className="p-2 font-weight-light">My Orders</h2>
        </div>
        <div
          className="container-fluid"
          style={{ height: "30vh", overflow: "hidden" }}
        >
          <div
            className="d-flex flex-row"
            ref={element => {
              this.ordersLegend = element;
            }}
          >
            <span className="col-3 text-left font-weight-bold title-label">
              ETH/{this.props.currentToken.symbol}
            </span>

            <span className="col-2 text-center font-weight-bold title-label">
              {this.props.currentToken.symbol}
            </span>
            <span className="col-2 text-center font-weight-bold title-label">
              ETH
            </span>
            <span className="col-2 text-right font-weight-bold title-label">
              Volume
            </span>
            <span className="col-2 text-center font-weight-bold title-label">
              Expires
            </span>
            <span className="col-1 text-right font-weight-bold title-label" />
          </div>
          <hr className="pb-2" />
          <Scrollbars>
            {this.props.market &&
            this.props.market.myOrders &&
            this.props.market.myOrders.sells.length > 0 ? (
              this.props.market.myOrders.sells.map((sell, key) => {
                return (
                  <MyOrder
                    key={key}
                    token={sell.amountGive}
                    eth={sell.amountGet}
                    price={sell.price}
                    order={sell}
                    volume={toEth(
                      sell.availableVolume,
                      this.props.currentToken.decimals
                    ).toFixed(3)}
                    expires={sell.expires - this.props.currentBlock}
                    type="sell"
                  />
                );
              })
            ) : (
              <div className="d-flex flex-row justify-content-center">
                You have no sell orders for the selected pair
              </div>
            )}
            <hr />
            {this.props.market &&
            this.props.market.myOrders &&
            this.props.market.myOrders.buys.length > 0 ? (
              this.props.market.myOrders.buys.map((buy, key) => {
                return (
                  <MyOrder
                    key={key}
                    token={buy.amountGet}
                    eth={buy.amountGive}
                    price={buy.price}
                    order={buy}
                    volume={toEth(
                      buy.availableVolume,
                      this.props.currentToken.decimals
                    ).toFixed(3)}
                    expires={buy.expires - this.props.currentBlock}
                    type="buy"
                  />
                );
              })
            ) : (
              <div className="d-flex flex-row justify-content-center">
                You have no buy orders for the selected pair
              </div>
            )}
          </Scrollbars>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    web3: state.web3Reducer.web3,
    currentToken: state.dexReducer.currentToken,
    market: state.dexReducer.market,
    currentBlock: state.web3Reducer.currentBlock
  };
};

export default connect(mapStateToProps)(MyOrders);
