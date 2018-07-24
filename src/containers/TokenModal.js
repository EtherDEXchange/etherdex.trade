import React, { Component } from "react";
import { connect } from "react-redux";
import Token from "./Token";
import { updateCurrentToken, hideTokenModal, updateEtherDEX } from "../actions";
import ERC20 from "../contracts/ERC20";
import "./Modal.css";

class TokenModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentToken: this.props.currentToken,
      searchPhrase: "",
      filteredTokens: this.props.tokens
    };
  }

  render() {
    return (
      <div style={{ height: "100%" }}>
        <div
          style={{ height: "55%", maxHeight: "55%", overflowY: "auto" }}
          className="row"
        >
          <div className="col">
            <input
              type="text"
              className="form-control modalInput input"
              placeholder="Search token"
              value={this.state.searchPhrase}
              onChange={e => {
                let filteredTokens = this.props.tokens;
                if (e.target.value) {
                  filteredTokens = this.props.tokens.filter(
                    token =>
                      token.name.toLowerCase().includes(e.target.value) ||
                      token.symbol.toLowerCase().includes(e.target.value) ||
                      token.name.includes(e.target.value) ||
                      token.symbol.includes(e.target.value)
                  );
                }
                this.setState({
                  searchPhrase: e.target.value,
                  filteredTokens: filteredTokens
                });
              }}
            />
            <div
              onMouseEnter={() => {
                this.setState({ currentToken: this.props.currentToken });
              }}
            >
              <Token token={this.props.currentToken} />
            </div>
            <div>
              {this.state.filteredTokens.map((token, key) => {
                if (
                  token.address === this.props.currentToken.address ||
                  token.address === "0x0000000000000000000000000000000000000000"
                )
                  return <div key={key} />;
                return (
                  <div
                    key={key}
                    onMouseEnter={() => {
                      this.setState({ currentToken: token });
                    }}
                    onClick={() => {
                      this.props.socket.emit("getMarket", {
                        token: token.address,
                        user: this.props.account
                      });
                      this.props.dispatch(updateCurrentToken(token));
                      this.props.history.push("/trade/" + token.symbol);
                      this.props.dispatch(hideTokenModal());
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
                    }}
                  >
                    <Token token={token} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div style={{ maxHeight: "45%", overflowY: "auto" }} className="row">
          <div className="col">
            <h3 style={{ color: "#212121" }}>{this.state.currentToken.name}</h3>
            <p style={{ color: "#212121" }}>
              {this.state.currentToken.description1}
            </p>
            <p style={{ color: "#212121" }}>
              {this.state.currentToken.description2}
            </p>
            <a href={this.state.currentToken.website}>
              {this.state.currentToken.website}
            </a>
            <br />
            <a
              href={
                "https://etherscan.io/address/" +
                this.state.currentToken.address
              }
            >
              {this.state.currentToken.address}
            </a>
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
    tokenContract: state.web3Reducer.tokenContract,
    currentToken: state.dexReducer.currentToken,
    currentBlock: state.web3Reducer.currentBlock,
    socket: state.dexReducer.socket,
    account: state.web3Reducer.account,
    tokens: state.dexReducer.tokens
  };
};

export default connect(mapStateToProps)(TokenModal);
