import store from "../../store";
import Web3 from "web3";
import EtherDEX from "../../contracts/EtherDEX";
import ERC20 from "../../contracts/ERC20";
import axios from "axios";

import {
  web3Initialized,
  getGasPrices,
  updateEtherDEX,
  updateEtherDEXError
} from "../../actions";

let getWeb3 = function() {
  // Wait for loading completion to avoid race conditions with web3 injection timing.
  window.addEventListener("load", async function(dispatch) {
    let results;
    let web3 = window.web3;

    // Get gas prices
    store.dispatch(getGasPrices());

    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof web3 !== "undefined") {
      // Use Mist/MetaMask's provider.
      web3 = new Web3(web3.currentProvider);
      results = await initWeb3(web3);

      console.log("Injected web3 detected.");

      store.dispatch(web3Initialized(results));
    } else {
      store.dispatch(updateEtherDEXError("no_metamask"));

      results = {
        web3Error: "no_metamask",
        web3Instance: null,
        EtherDEXInstance: null,
        tokenContract: null,
        networkID: null,
        account: null,
        balance: null
      };

      store.dispatch(web3Initialized(results));
    }
  });
  async function initWeb3(web3) {
    let accounts = await web3.eth.getAccounts();
    let account = !accounts || accounts.length === 0 ? null : accounts[0];

    if (!account) {
      store.dispatch(updateEtherDEXError("account_locked"));

      setInterval(async () => {
        if ((await web3.eth.getAccounts()).length !== accounts.length) {
          window.location.reload();
        }
      }, 1000);

      return {
        web3Error: "account_locked",
        web3Instance: null,
        EtherDEXInstance: null,
        tokenContract: null,
        networkID: null,
        account: null,
        balance: null
      };
    }

    web3.eth.defaultAccount = account;
    let EtherDEXContract = new web3.eth.Contract(
      EtherDEX.abi,
      process.env.REACT_APP_CONTRACT_ADDRESS
    );

    let tokenContract = new web3.eth.Contract(
      ERC20.abi,
      store.getState().dexReducer.currentToken.address
    );

    let currentBlock = await web3.eth.getBlockNumber();
    axios.get(process.env.REACT_APP_SERVER_URL + "/tokens").then(response => {
      let tokens = response.data;

      store.dispatch(
        updateEtherDEX(
          EtherDEXContract,
          account,
          store.getState().dexReducer.currentToken,
          web3,
          tokenContract,
          tokens
        )
      );
    });

    let networkID = await web3.eth.net.getId();
    let balance = await web3.eth.getBalance(account);

    return {
      web3Instance: web3,
      EtherDEXInstance: EtherDEXContract,
      tokenContract: tokenContract,
      networkID: networkID,
      account: account,
      balance: balance,
      currentBlock: currentBlock
    };
  }
};

export default getWeb3;
