import React, { Component } from "react";
import { connect } from "react-redux";
import Trade from "./Trade";
import { Scrollbars } from "react-custom-scrollbars";

class Trades extends Component {
  render() {
    return (
      <div style={{ overflow: "hidden" }}>
        <div className="d-flex flex-row justify-content-center">
          <h2 className="p-2 font-weight-light">Trades</h2>
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
              TX HASH
            </span>
            <span className="col-3 text-left font-weight-bold title-label">
              ETH/{this.props.currentToken.symbol}
            </span>

            <span className="col-3 text-center font-weight-bold title-label">
              {this.props.currentToken.symbol}
            </span>
            <span className="col-3 text-right font-weight-bold title-label">
              ETH
            </span>
          </div>
          <hr className="pb-2" />
          <Scrollbars>
            {this.props.market && this.props.market.trades.length > 0 ? (
              this.props.market.trades.map((trade, key) => {
                return (
                  <Trade
                    key={key}
                    token={trade.amount}
                    eth={trade.amountBase}
                    price={trade.price}
                    trade={trade}
                    type={trade.side}
                    hash={trade.txHash}
                  />
                );
              })
            ) : (
              <div className="d-flex flex-row justify-content-center">
                No trades for the selected pair
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

export default connect(mapStateToProps)(Trades);
