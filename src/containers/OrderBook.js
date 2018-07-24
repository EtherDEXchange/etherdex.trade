import React, { Component } from "react";
import { connect } from "react-redux";
import "./OrderBook.css";
import Order from "./Order";
import { Scrollbars } from "react-custom-scrollbars";

class OrderBook extends Component {
  ordersLegend;

  scrollToBottom = () => {
    this.ordersLegend.scrollIntoView({ behavior: "instant", block: "center" });
  };

  componentDidMount() {
    this.scrollToBottom();
  }

  render() {
    return (
      <div style={{ overflow: "hidden" }}>
        <div className="d-flex flex-row justify-content-center">
          <h2 className="p-2 font-weight-light">Order book</h2>
        </div>
        <div
          className="container-fluid"
          style={{ height: "30vh", overflow: "hidden" }}
        >
          <Scrollbars>
            {this.props.market && this.props.market.orders.sells.length > 0 ? (
              this.props.market.orders.sells.map((sell, key) => {
                return (
                  <Order
                    key={key}
                    token={sell.amountGive}
                    eth={sell.amountGet}
                    price={sell.price}
                    order={sell}
                    type="sell"
                  />
                );
              })
            ) : (
              <div className="d-flex flex-row justify-content-center">
                No bids for the selected pair
              </div>
            )}
            <hr />
            <div
              className="d-flex flex-row"
              ref={element => {
                this.ordersLegend = element;
              }}
            >
              <span className="col-4 text-left font-weight-bold">
                ETH/{this.props.currentToken.symbol}
              </span>

              <span className="col-4 text-center font-weight-bold">
                {this.props.currentToken.symbol}
              </span>
              <span className="col-4 text-right font-weight-bold">ETH</span>
            </div>
            <hr />

            {this.props.market && this.props.market.orders.buys.length > 0 ? (
              this.props.market.orders.buys.map((buy, key) => {
                return (
                  <Order
                    key={key}
                    token={buy.amountGet}
                    eth={buy.amountGive}
                    price={buy.price}
                    order={buy}
                    type="buy"
                  />
                );
              })
            ) : (
              <div className="d-flex flex-row justify-content-center">
                No asks for the selected pair
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
    market: state.dexReducer.market
  };
};

export default connect(mapStateToProps)(OrderBook);
