import {
  WEB3_INITIALIZED,
  GAS_PRICES_SUCCESS,
  GAS_PRICES_ERROR,
  CHANGE_GAS_CHOICE,
  UPDATE_TOKEN_DEX_SUCCESS,
  UPDATE_TOKEN_DEX_ERROR,
  CHANGE_DEPOSIT_TYPE,
  INIT_SOCKET,
  CHANGE_BUY_TYPE,
  UPDATE_MARKET_SUCCESS,
  SHOW_ORDER_MODAL,
  CLOSE_ORDER_MODAL,
  UPDATE_CURRENT_BLOCK_SUCCESS,
  SHOW_TOKEN_MODAL,
  CLOSE_TOKEN_MODAL,
  UPDATE_CURRENT_TOKEN
} from "./actionTypes";
import axios from "axios";

// {"safeLow":"10","standard":"11.44375","fast":"18","fastest":"31"}
const GAS_URL = "https://www.etherchain.org/api/gasPriceOracle";

export const web3Initialized = results => {
  return {
    type: WEB3_INITIALIZED,
    payload: results
  };
};

export const gasPricesSuccess = prices => ({
  type: GAS_PRICES_SUCCESS,
  payload: prices
});

export const gasPricesError = error => ({
  type: GAS_PRICES_ERROR,
  payload: error
});

export function getGasPrices() {
  return dispatch => {
    return axios
      .get(GAS_URL)
      .then(response => {
        dispatch(gasPricesSuccess(response.data));
      })
      .catch(err => dispatch(gasPricesError(err)));
  };
}

export const changeGasChoice = choice => ({
  type: CHANGE_GAS_CHOICE,
  payload: choice
});

export function updateEtherDEX(
  EtherDEX,
  accountAddress,
  token,
  web3,
  tokenContract,
  tokens
) {
  return async dispatch => {
    let balance = accountAddress
      ? await EtherDEX.methods.balanceOf(0, accountAddress).call()
      : null;
    let tokenBalance =
      token && accountAddress
        ? await EtherDEX.methods.balanceOf(token.address, accountAddress).call()
        : null;
    let walletBalance = accountAddress
      ? await web3.eth.getBalance(accountAddress)
      : null;
    let walletTokenBalance =
      tokenContract && accountAddress
        ? await tokenContract.methods.balanceOf(accountAddress).call()
        : null;

    dispatch(
      updateEtherDEXSuccess({
        balance,
        tokenBalance,
        walletBalance,
        walletTokenBalance,
        tokens
      })
    );
  };
}

export const updateEtherDEXSuccess = results => {
  return {
    type: UPDATE_TOKEN_DEX_SUCCESS,
    payload: results
  };
};

export const updateEtherDEXError = error => {
  return {
    type: UPDATE_TOKEN_DEX_ERROR,
    payload: error
  };
};

export function deposit(web3, EtherDEX, amount, userAddress, gasPrice) {
  return async dispatch => {
    EtherDEX.methods.deposit().send({
      from: userAddress,
      value: web3.utils.toHex(amount),
      gasPrice: web3.utils.toHex(web3.utils.toWei(gasPrice, "gwei"))
    });
  };
}

export function depositToken(
  web3,
  EtherDEX,
  tokenContract,
  amount,
  userAddress,
  gasPrice
) {
  return async dispatch => {
    tokenContract.methods
      .approve(EtherDEX.options.address, amount)
      .send({
        from: userAddress,
        gasPrice: web3.utils.toHex(web3.utils.toWei(gasPrice, "gwei"))
      })
      .on("transactionHash", function(hash) {
        EtherDEX.methods
          .depositToken(tokenContract.options.address, amount)
          .send({
            from: userAddress,
            gasPrice: web3.utils.toHex(web3.utils.toWei(gasPrice, "gwei"))
          });
      });
  };
}

export function withdraw(web3, EtherDEX, amount, userAddress, gasPrice) {
  return async dispatch => {
    EtherDEX.methods.withdraw(amount).send({
      from: userAddress,
      gasPrice: web3.utils.toHex(web3.utils.toWei(gasPrice, "gwei"))
    });
  };
}

export function withdrawToken(
  web3,
  EtherDEX,
  tokenContract,
  amount,
  userAddress,
  gasPrice
) {
  return async dispatch => {
    EtherDEX.methods.withdrawToken(tokenContract.options.address, amount).send({
      from: userAddress,
      gasPrice: web3.utils.toHex(web3.utils.toWei(gasPrice, "gwei"))
    });
  };
}

export const changeDepositType = depositType => {
  return {
    type: CHANGE_DEPOSIT_TYPE,
    payload: depositType
  };
};

export const initSocket = socket => {
  return {
    type: INIT_SOCKET,
    payload: socket
  };
};

export const changeBuyType = buyType => {
  return {
    type: CHANGE_BUY_TYPE,
    payload: buyType
  };
};

export const updateMarketSuccess = market => {
  return {
    type: UPDATE_MARKET_SUCCESS,
    payload: market
  };
};

export const showOrderModal = order => {
  return {
    type: SHOW_ORDER_MODAL,
    payload: order
  };
};

export const hideOrderModal = () => {
  return {
    type: CLOSE_ORDER_MODAL
  };
};

export const updateCurrentBlockSuccess = currentBlock => {
  return {
    type: UPDATE_CURRENT_BLOCK_SUCCESS,
    payload: currentBlock
  };
};

export const showTokenModal = () => {
  return {
    type: SHOW_TOKEN_MODAL
  };
};

export const hideTokenModal = () => {
  return {
    type: CLOSE_TOKEN_MODAL
  };
};

export const updateCurrentToken = token => {
  return {
    type: UPDATE_CURRENT_TOKEN,
    payload: token
  };
};
