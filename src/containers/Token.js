import React, { Component } from "react";
import { connect } from "react-redux";

class Token extends Component {
  render() {
    return (
      <p
        className="d-flex flex-row token"
        style={{ color: "#212121", fontSize: "20px" }}
      >
        {this.props.token.symbol} {this.props.token.name}
      </p>
    );
  }
}

const mapStateToProps = state => {
  return {
    currentToken: state.dexReducer.currentToken
  };
};

export default connect(mapStateToProps)(Token);
