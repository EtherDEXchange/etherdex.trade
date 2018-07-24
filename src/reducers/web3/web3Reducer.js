import {
  WEB3_INITIALIZED,
  GAS_PRICES_SUCCESS,
  CHANGE_GAS_CHOICE,
  UPDATE_TOKEN_DEX_ERROR,
  UPDATE_CURRENT_BLOCK_SUCCESS,
  UPDATE_CURRENT_TOKEN
} from "../../actions/actionTypes";
import ERC20 from "../../contracts/ERC20";

const initialState = {
  web3: null,
  EtherDEX: null,
  tokenContract: null,
  gasPrices: null,
  gasChoice: "standard",
  networkID: null,
  account: localStorage.getItem("lastAccount")
    ? localStorage.getItem("lastAccount")
    : null,
  balance: null,
  web3Error: null,
  currentBlock: 0
};

const web3Reducer = (state = initialState, action) => {
  switch (action.type) {
    case WEB3_INITIALIZED: {
      localStorage.setItem("lastAccount", action.payload.account);
      return {
        ...state,
        web3: action.payload.web3Instance,
        EtherDEX: action.payload.EtherDEXInstance,
        tokenContract: action.payload.tokenContract,
        networkID: action.payload.networkID,
        account: action.payload.account,
        balance: action.payload.balance,
        web3Error: action.payload.web3Error,
        currentBlock: action.payload.currentBlock
      };
    }

    case GAS_PRICES_SUCCESS: {
      return {
        ...state,
        gasPrices: action.payload
      };
    }

    case CHANGE_GAS_CHOICE: {
      return {
        ...state,
        gasChoice: action.payload
      };
    }

    case UPDATE_TOKEN_DEX_ERROR: {
      return {
        ...state,
        web3Error: action.payload.web3Error
      };
    }

    case UPDATE_CURRENT_BLOCK_SUCCESS: {
      return {
        ...state,
        currentBlock: action.payload
      };
    }

    case UPDATE_CURRENT_TOKEN: {
      return {
        ...state,
        tokenContract: state.web3
          ? new state.web3.eth.Contract(ERC20.abi, action.payload.address)
          : state.tokenContract
      };
    }

    default: {
      return state;
    }
  }
};

export default web3Reducer;
