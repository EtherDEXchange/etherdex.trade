import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import loading from "./loading.svg";

class Startup extends Component {
  render() {
    return this.props.isReady ? (
      this.props.children
    ) : (
      <div>
        <h1 style={{ marginTop: "45vh", marginLeft: "45vw", fontSize: "42px" }}>
          EtherDEX
        </h1>
        <img src={loading} style={{ marginLeft: "45vw" }} alt="EtherDEX logo" />
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    isReady: state.dexReducer.isReady
  };
}

export default withRouter(connect(mapStateToProps)(Startup));
