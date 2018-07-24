import React, { Component } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";

class FAQ extends Component {
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
        <h1 className="display-3">Frequently Asked Questions</h1>
        <h4>Question: What is a Decentralized Exchange?</h4>
        <h5>
          Answer: A decentralized exchange is an exchange that does not rely on
          a third party to hold customers’ funds. Instead, decentralized
          exchanges such as EtherDEX facilitate trades that occur directly
          between customers, on a peer to peer basis.
        </h5>
        <br />
        <br />
        <h4>Q: What are the advantages of a Decentralized Exhcange?</h4>
        <h5>
          A: Your funds are secured by the smart contract, only you can access
          them.
        </h5>
        <br />
        <br />
        <h4>Q: Can you list my token?</h4>
        <h5>
          A: Please contact{" "}
          <a href="mailto:contact@etherdex.trade">contact@etherdex.trade</a>
        </h5>
        <br />
        <br />
        <h4>Q: What are your fees?</h4>
        <h5>
          A: You can find them <Link to="/fees">here</Link>
        </h5>
      </div>
    );
  }
}

export default connect()(FAQ);
