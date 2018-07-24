import React, { Component } from "react";
import { connect } from "react-redux";
import {
  deposit,
  depositToken,
  changeDepositType,
  withdraw,
  withdrawToken
} from "../actions";
import "../index.css";
import { toEth, toWei } from "../utils";
import BigNumber from "bignumber.js";
import { toast } from "react-toastify";

BigNumber.config({ EXPONENTIAL_AT: 30 });

const WalletInfo = props => (
  <div className="row justify-content-around">
    <div className="text-left col-auto">
      <h6>{props.name}</h6>
    </div>
    <div className="text-center col-auto">
      <h6>{props.eth}</h6>
    </div>
    <div className="text-center col-auto">
      <h6>{props.token}</h6>
    </div>
  </div>
);

const WalletInput = props => (
  <form
    className={`form-inline justify-content-between ${props.className}`}
    onSubmit={props.onSubmit}
  >
    <div className="form-group col-4">
      <label htmlFor="name" className="control-label label">
        {props.label}
      </label>
      <input
        type="number"
        className="form-control input col"
        value={props.value}
        onChange={props.onChange}
      />
    </div>
    <div className="form-group mt-3">
      <button type="submit" className="button col">
        {props.button}
      </button>
    </div>
  </form>
);

class Deposits extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ethAmount: "",
      tokenAmount: ""
    };
    this.deposit = this.deposit.bind(this);
    this.depositToken = this.depositToken.bind(this);
    this.withdraw = this.withdraw.bind(this);
    this.withdrawToken = this.withdrawToken.bind(this);
    this.changeDepositType = this.changeDepositType.bind(this);
  }

  deposit(e) {
    e.preventDefault();
    if (!this.state.ethAmount) return;
    if (
      toWei(this.state.ethAmount, 18).isGreaterThan(
        new BigNumber(this.props.walletBalance)
      )
    ) {
      toast.error("Cannot deposit more ETH than you have in personal wallet", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false
      });
      return;
    }

    this.setState({
      ethAmount: "",
      tokenAmount: ""
    });

    this.props.dispatch(
      deposit(
        this.props.web3,
        this.props.EtherDEX,
        toWei(this.state.ethAmount, 18),
        this.props.account,
        this.props.gasPrices[this.props.gasChoice]
      )
    );
  }

  depositToken(e) {
    e.preventDefault();
    if (!this.state.tokenAmount) return;
    if (
      toWei(
        this.state.tokenAmount,
        this.props.currentToken.decimals
      ).isGreaterThan(new BigNumber(this.props.walletTokenBalance))
    ) {
      toast.error(
        "Cannot deposit more " +
          this.props.currentToken.symbol +
          " than you have in personal wallet",
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

    this.props.dispatch(
      depositToken(
        this.props.web3,
        this.props.EtherDEX,
        this.props.tokenContract,
        toWei(this.state.tokenAmount, this.props.currentToken.decimals),
        this.props.account,
        this.props.gasPrices[this.props.gasChoice]
      )
    );

    this.setState({
      ethAmount: "",
      tokenAmount: ""
    });
  }

  changeDepositType(type) {
    this.props.dispatch(changeDepositType(type));
  }

  withdraw(e) {
    e.preventDefault();
    if (!this.state.ethAmount) return;
    this.props.dispatch(
      withdraw(
        this.props.web3,
        this.props.EtherDEX,
        toWei(this.state.ethAmount, 18),
        this.props.account,
        this.props.gasPrices[this.props.gasChoice]
      )
    );
  }

  withdrawToken(e) {
    e.preventDefault();
    if (!this.state.tokenAmount) return;
    this.props.dispatch(
      withdrawToken(
        this.props.web3,
        this.props.EtherDEX,
        this.props.tokenContract,
        toWei(this.state.tokenAmount, this.props.currentToken.decimals),
        this.props.account,
        this.props.gasPrices[this.props.gasChoice]
      )
    );
  }

  render() {
    return (
      <div className="container">
        <div className="d-flex flex-row justify-content-center">
          <div>
            <h2
              className="p-2 font-weight-light"
              style={{
                color:
                  this.props.depositType === "DEPOSIT" ? "#00BFA5" : undefined,
                cursor: "pointer"
              }}
              onClick={() => this.changeDepositType("DEPOSIT")}
            >
              DEPOSIT
            </h2>
          </div>
          <div>
            <h2
              className="p-2 font-weight-light"
              style={{
                color:
                  this.props.depositType === "WITHDRAW" ? "#00BFA5" : undefined,
                cursor: "pointer"
              }}
              onClick={() => this.changeDepositType("WITHDRAW")}
            >
              WITHDRAW
            </h2>
          </div>
        </div>
        <WalletInfo
          name="Exchange wallet"
          eth={toEth(this.props.balance, 18).toFixed(4) + " ETH"}
          token={
            toEth(
              this.props.tokenBalance,
              this.props.currentToken.decimals
            ).toFixed(4) +
            " " +
            this.props.currentToken.symbol
          }
        />

        <WalletInfo
          name="Personal wallet"
          eth={toEth(this.props.walletBalance, 18).toFixed(4) + " ETH"}
          token={
            toEth(
              this.props.walletTokenBalance,
              this.props.currentToken.decimals
            ).toFixed(4) +
            " " +
            this.props.currentToken.symbol
          }
        />
        <hr />
        <WalletInput
          label="ETH Amount"
          value={this.state.ethAmount}
          button={this.props.depositType + " ETH"}
          onChange={e => {
            this.setState({ ethAmount: e.target.value });
          }}
          onSubmit={
            this.props.depositType === "WITHDRAW" ? this.withdraw : this.deposit
          }
        />
        <WalletInput
          label="Token Amount"
          value={this.state.tokenAmount}
          className="mt-xl-2"
          button={this.props.depositType + " " + this.props.currentToken.symbol}
          onChange={e => {
            this.setState({ tokenAmount: e.target.value });
          }}
          onSubmit={
            this.props.depositType === "WITHDRAW"
              ? this.withdrawToken
              : this.depositToken
          }
        />
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    web3: state.web3Reducer.web3,
    EtherDEX: state.web3Reducer.EtherDEX,
    tokenContract: state.web3Reducer.tokenContract,
    account: state.web3Reducer.account,
    gasPrices: state.web3Reducer.gasPrices,
    gasChoice: state.web3Reducer.gasChoice,
    balance: state.dexReducer.balance,
    tokenBalance: state.dexReducer.tokenBalance,
    walletBalance: state.dexReducer.walletBalance,
    walletTokenBalance: state.dexReducer.walletTokenBalance,
    currentToken: state.dexReducer.currentToken,
    depositType: state.dexReducer.depositType
  };
};

export default connect(mapStateToProps)(Deposits);
