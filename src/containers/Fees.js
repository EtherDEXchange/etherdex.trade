import React, { Component } from "react";
import { connect } from "react-redux";

class Fees extends Component {
  render() {
    return (
      <div
        style={{
          backgroundColor: "rgba(176, 190, 197, 0.13)",
          margin: "20px",
          height: "100%",
          borderRadius: "10px",
          padding: "10px"
        }}
      >
        <h1 className="display-3">Fees</h1>
        <h4>
          Trading on decentralized exchanges like EtherDEX consist of two types
          of fees:
        </h4>
        <ul>
          <li>Exchange fee: charged by EtherDEX on market takers</li>
          <li>
            Ethereum fee (gas): charged by Ethereum network on all contract
            transactions
          </li>
        </ul>
        <h5>
          Remember that placing orders doesn't cost you gas, as it happens
          off-chain on EtherDEX server. <br /> However, order cancellation
          happens on Ethereum blockchain, so requires a gas fee
        </h5>
        <h2 className="display-4">Exchange fees</h2>
        <ul>
          <li>
            <b>0.2%</b> for market takers
          </li>
          <li>
            <b>0%</b> for market makers
          </li>
        </ul>
        <p class="text-muted">
          For simplicity: market maker is an investor who creates order and
          market taker is an investor who executes it
        </p>
        <small class="text-muted">Last updated: July 18 2018</small>
      </div>
    );
  }
}

export default connect()(Fees);
