import React, { Component } from "react";
import { connect } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import { Scrollbars } from "react-custom-scrollbars";
import io from "socket.io-client";
import ReactModal from "react-modal";

import OrderBook from "./OrderBook";
import PriceChart from "./PriceChart";
import Trades from "./Trades";
import Deposits from "./Deposits";
import Buy from "./Buy";
import MyOrders from "./MyOrders";
import OrderModal from "./OrderModal";
import TokenModal from "./TokenModal";
import WarningWeb3Modal from "./WarningWeb3Modal";

import "./Dashboard.css";
import "react-toastify/dist/ReactToastify.css";

import {
  initSocket,
  updateEtherDEX,
  updateMarketSuccess,
  hideOrderModal,
  updateCurrentBlockSuccess,
  hideTokenModal,
  updateCurrentToken
} from "../actions";
import { toEth } from "../utils";
import ERC20 from "../contracts/ERC20";

ReactModal.setAppElement("#root");

class Dashboard extends Component {
  constructor(props) {
    super(props);

    this.handleWithdraw = this.handleWithdraw.bind(this);
    this.handleDeposit = this.handleDeposit.bind(this);
    this.getToken = this.getToken.bind(this);
    this.handleCloseModal = this.handleCloseModal.bind(this);
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.web3Error === "account_locked") {
      toast.error(
        "❌ Your metamask account is locked, please unlock it to use EtherDEX!",
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

  componentDidMount() {
    const socket = io(process.env.REACT_APP_SERVER_URL);
    this.props.dispatch(initSocket(socket));

    socket.emit("getMarket", {
      token: this.props.currentToken.address,
      user: this.props.account
    });

    let tokenSymbol = this.props.match.params.symbol;
    if (tokenSymbol && this.props.tokens) {
      let token = this.props.tokens.filter(
        token => token.symbol === tokenSymbol
      )[0];
      if (token) {
        socket.emit("getMarket", {
          token: token.address,
          user: this.props.account
        });
        this.props.dispatch(updateCurrentToken(token));
        this.props.history.push("/trade/" + token.symbol);
        if (this.props.web3) {
          let tokenContract = new this.props.web3.eth.Contract(
            ERC20.abi,
            token.address
          );
          this.props.dispatch(
            updateEtherDEX(
              this.props.EtherDEX,
              this.props.account,
              token,
              this.props.web3,
              tokenContract,
              this.props.tokens
            )
          );
        }
      }
    } else {
      this.props.history.push("/trade/" + this.props.currentToken.symbol);
    }

    socket.on("market", market => {
      this.props.dispatch(updateMarketSuccess(market));
    });

    socket.on("requestMarketRefresh", currentBlock => {
      socket.emit("getMarket", {
        token: this.props.currentToken.address,
        user: this.props.account
      });
      this.props.dispatch(updateCurrentBlockSuccess(currentBlock));
      this.props.dispatch(
        updateEtherDEX(
          this.props.EtherDEX,
          this.props.account,
          this.props.currentToken,
          this.props.web3,
          this.props.tokenContract,
          this.props.tokens
        )
      );
    });

    socket.on("newOrder", order => {
      socket.emit("getMarket", {
        token: this.props.currentToken.address,
        user: this.props.account
      });
    });

    socket.on("newFund", fund => {
      if (fund && fund.user === this.props.account) {
        socket.emit("getMarket", {
          token: this.props.currentToken.address,
          user: this.props.account
        });

        setTimeout(() => {
          if (fund.kind === "Deposit") {
            this.handleDeposit(fund);
          } else if (fund.kind === "Withdraw") {
            this.handleWithdraw(fund);
          }
        }, 10000);
      }
    });
  }

  handleWithdraw(withdraw) {
    let token = this.getToken(withdraw.tokenAddr);
    let amount = toEth(withdraw.amount, token.decimals);

    toast.info(`Successfully withdrawed ${amount} ${token.symbol}!`, {
      position: "bottom-left",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false
    });

    this.props.dispatch(
      updateEtherDEX(
        this.props.EtherDEX,
        this.props.account,
        this.props.currentToken,
        this.props.web3,
        this.props.tokenContract,
        this.props.tokens
      )
    );
  }

  handleDeposit(deposit) {
    let token = this.getToken(deposit.tokenAddr);
    let amount = toEth(deposit.amount, token.decimals);

    toast.info(`Successfully deposited ${amount} ${token.symbol}!`, {
      position: "bottom-left",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false
    });

    this.props.dispatch(
      updateEtherDEX(
        this.props.EtherDEX,
        this.props.account,
        this.props.currentToken,
        this.props.web3,
        this.props.tokenContract,
        this.props.tokens
      )
    );
  }

  getToken(tokenAddress) {
    return this.props.tokens.filter(token => {
      return token.address === tokenAddress;
    })[0];
  }

  handleCloseModal() {
    this.props.dispatch(hideOrderModal());
  }

  render() {
    return (
      <main className="container-fluid" style={{ height: "85vh" }}>
        <ReactModal
          isOpen={!this.props.web3}
          onRequestClose={this.handleCloseModal}
          shouldCloseOnOverlayClick={true}
          style={{
            overlay: {
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)"
            },
            content: {
              position: "absolute",
              top: "0",
              height: "100%",
              left: "30%",
              right: "30%",
              bottom: "auto",
              overflowY: "auto",
              backgroundColor: "#F5F5F5",
              overflow: "auto",
              border: "none",
              borderRadius: "0px",
              outline: "none",
              padding: "20px"
            }
          }}
        >
          <WarningWeb3Modal />
        </ReactModal>
        <ReactModal
          isOpen={this.props.showOrderModal}
          onRequestClose={this.handleCloseModal}
          shouldCloseOnOverlayClick={true}
          style={{
            overlay: {
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)"
            },
            content: {
              position: "absolute",
              top: "0",
              height: "100%",
              left: "30%",
              right: "30%",
              bottom: "auto",
              overflowY: "auto",
              backgroundColor: "#F5F5F5",
              overflow: "auto",
              border: "none",
              borderRadius: "0px",
              outline: "none",
              padding: "20px"
            }
          }}
        >
          <OrderModal />
        </ReactModal>
        <ReactModal
          isOpen={this.props.showTokenModal}
          onRequestClose={() => {
            this.props.dispatch(hideTokenModal());
          }}
          shouldCloseOnOverlayClick={true}
          style={{
            overlay: {
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)"
            },
            content: {
              position: "absolute",
              top: "0",
              height: "100%",
              left: "30%",
              right: "30%",
              bottom: "auto",
              overflowY: "auto",
              backgroundColor: "#F5F5F5",
              overflow: "auto",
              border: "none",
              borderRadius: "0px",
              outline: "none",
              padding: "20px"
            }
          }}
        >
          <TokenModal {...this.props} />
        </ReactModal>
        <ToastContainer
          position="top-center"
          autoClose={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnVisibilityChange={false}
          draggablePercent={0}
        />

        <div className="card-deck" style={{ height: "50%", marginTop: "20px" }}>
          <div className="card tile">
            <OrderBook />
          </div>
          <div className="card tile">
            <Scrollbars>
              <PriceChart />
            </Scrollbars>
          </div>
          <div className="card tile">
            <Trades />
          </div>
        </div>
        <div
          className="card-deck"
          style={{ height: "50%", marginTop: "20px", marginBottom: "20px" }}
        >
          <div className="card tile">
            <Scrollbars>
              <Deposits />
            </Scrollbars>
          </div>
          <div className="card tile">
            <Scrollbars>
              <Buy />
            </Scrollbars>
          </div>
          <div className="card tile">
            <MyOrders />
          </div>
        </div>
      </main>
    );
  }
}

const mapStateToProps = state => {
  return {
    web3Error: state.web3Reducer.web3Error,
    account: state.web3Reducer.account,
    EtherDEX: state.web3Reducer.EtherDEX,
    currentToken: state.dexReducer.currentToken,
    tokenContract: state.web3Reducer.tokenContract,
    web3: state.web3Reducer.web3,
    showOrderModal: state.dexReducer.showOrderModal,
    showTokenModal: state.dexReducer.showTokenModal,
    tokens: state.dexReducer.tokens
  };
};

export default connect(mapStateToProps)(Dashboard);
