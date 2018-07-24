import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { Provider } from "react-redux";
import getWeb3 from "./reducers/web3/getWeb3";
import store from "./store";

import Dashboard from "./containers/Dashboard";
import Navbar from "./containers/Navbar";
import Startup from "./containers/Startup";
import Fees from "./containers/Fees";
import FAQ from "./containers/FAQ";
import Socials from "./containers/Socials";

import "./index.css";

getWeb3();

ReactDOM.render(
  <Provider store={store}>
    <Router>
      <Startup>
        <div>
          <Navbar />
          <Switch>
            <Route exact path="/" component={Dashboard} />
            <Route path="/fees" component={Fees} />
            <Route path="/faq" component={FAQ} />
            <Route path="/socials" component={Socials} />
            <Route path="/trade/:symbol" component={Dashboard} />
            <Route component={Dashboard} />
          </Switch>
        </div>
      </Startup>
    </Router>
  </Provider>,
  document.getElementById("root")
);
