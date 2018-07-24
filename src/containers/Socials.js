import React, { Component } from "react";
import { connect } from "react-redux";

class Socials extends Component {
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
        <h1 className="display-3">EtherDEX Socials</h1>
        <ul>
          <li>
            Twitter:{" "}
            <a href="https://twitter.com/etherDEXchange">@etherDEXchange</a>
          </li>
          <li>
            Reddit: <a href="https://www.reddit.com/user/EtherDEX">EtherDEX</a>
          </li>
          <li>Bitcointalk thread: </li>
          <li>Telegram group: </li>
          <li>
            Github:{" "}
            <a href="https://github.com/EtherDEXchange">EtherDEXchange</a>
          </li>
          <li>
            Email:{" "}
            <a href="mailto:contact@etherdex.trade">contact@etherdex.trade</a>
          </li>
        </ul>
      </div>
    );
  }
}

export default connect()(Socials);
