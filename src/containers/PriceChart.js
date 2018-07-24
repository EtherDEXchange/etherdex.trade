import React, { Component } from "react";
import { connect } from "react-redux";

class PriceChart extends Component {
  render() {
    return (
      <div>
        <h2
          style={{
            fontSize: "34px",
            color: "grey",
            textAlign: "center",
            marginTop: "20%"
          }}
        >
          Price chart coming soon
        </h2>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    web3: state.web3Reducer.web3
  };
};

export default connect(mapStateToProps)(PriceChart);
