import React, { Component } from "react";
import { connect } from "react-redux";
import { idToNetwork, shortenAddress, toEth } from "../utils";
import { Link } from "react-router-dom";
import { withRouter } from "react-router-dom";
import { changeGasChoice, showTokenModal } from "../actions";
import BigNumber from "bignumber.js";
import "./Navbar.css";

BigNumber.config({ EXPONENTIAL_AT: 30 });

class Navbar extends Component {
  constructor(props) {
    super(props);

    this.changeGasChoice = this.changeGasChoice.bind(this);
  }

  changeGasChoice(choice) {
    this.props.dispatch(changeGasChoice(choice));
  }

  render() {
    return (
      <nav
        className="navbar navbar-expand-lg navbar-light"
        style={{ backgroundColor: "#F5F5F5", color: "#212121" }}
      >
        <Link className="navbar-brand" to="/" style={{ color: "#212121" }}>
          EtherDEX
        </Link>
        <div className="collapse navbar-collapse">
          <ul className="navbar-nav mr-auto">
            <li className="nav-item">
              <a
                className="dropdown-toggle navbar-text tokenSelect"
                onClick={() => {
                  this.props.dispatch(showTokenModal());
                }}
              >
                {this.props.currentToken.symbol} ({this.props.currentToken.name})
              </a>
            </li>
          </ul>
          <span className="mr-3">{idToNetwork(this.props.networkID)}</span>
          <div className="mr-3 dropdown">
            <a
              className="dropdown-toggle"
              id="gasDropdown"
              data-toggle="dropdown"
              style={{ cursor: "pointer" }}
            >
              Gas price:{" "}
              {this.props.gasChoice && this.props.gasPrices
                ? new BigNumber(
                    this.props.gasPrices[this.props.gasChoice]
                  ).toFixed(0)
                : null}{" "}
              gwei
            </a>
            <div className="dropdown-menu" aria-labelledby="gasDropdown">
              <a
                className="dropdown-item"
                style={{
                  backgroundColor:
                    this.props.gasChoice === "standard" ? "#e3e4e5" : "inherit"
                }}
                onClick={() => {
                  this.changeGasChoice("standard");
                }}
              >
                standard -{" "}
                {this.props.gasPrices ? this.props.gasPrices.standard : null}{" "}
                gwei (recommended)
              </a>
              <a
                className="dropdown-item"
                style={{
                  backgroundColor:
                    this.props.gasChoice === "fast" ? "#e3e4e5" : "white"
                }}
                onClick={() => {
                  this.changeGasChoice("fast");
                }}
              >
                fast - {this.props.gasPrices ? this.props.gasPrices.fast : null}{" "}
                gwei
              </a>
              <a
                className="dropdown-item"
                style={{
                  backgroundColor:
                    this.props.gasChoice === "fastest" ? "#e3e4e5" : "white"
                }}
                onClick={() => {
                  this.changeGasChoice("fastest");
                }}
              >
                fastest -{" "}
                {this.props.gasPrices ? this.props.gasPrices.fastest : null}{" "}
                gwei
              </a>
            </div>
          </div>
          <div className="mr-3 dropdown">
            <a
              className="dropdown-toggle"
              id="infoDropdown"
              data-toggle="dropdown"
              style={{ cursor: "pointer" }}
            >
              {this.props.account && this.props.balance
                ? `🦊 ${shortenAddress(this.props.account)} - ${toEth(
                    this.props.balance,
                    18
                  ).toFixed(4)} ETH`
                : "NO ACCOUNT"}
            </a>
            <div className="dropdown-menu" aria-labelledby="infoDropdown">
              <Link className="dropdown-item" to="/fees">
                Fees
              </Link>
              <Link className="dropdown-item" to="/faq">
                FAQ
              </Link>
              <Link className="dropdown-item" to="/socials">
                Socials
              </Link>
              <a
                className="dropdown-item"
                href="https://etherscan.io/address/0x8AF4dfc5c55eF2D3BCE511E4C14d631253533540"
              >
                Smart Contract
              </a>
              <a className="dropdown-item" href="mailto:contact@etherdex.trade">
                Contact us
              </a>
            </div>
          </div>
        </div>
      </nav>
    );
  }
}

const mapStateToProps = state => {
  return {
    web3: state.web3Reducer.web3,
    EtherDEX: state.web3Reducer.EtherDEX,
    gasPrices: state.web3Reducer.gasPrices,
    gasChoice: state.web3Reducer.gasChoice,
    networkID: state.web3Reducer.networkID,
    account: state.web3Reducer.account,
    balance: state.web3Reducer.balance,
    currentToken: state.dexReducer.currentToken
  };
};

export default withRouter(connect(mapStateToProps)(Navbar));
