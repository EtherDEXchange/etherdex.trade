import {
  UPDATE_TOKEN_DEX_SUCCESS,
  UPDATE_TOKEN_DEX_ERROR,
  CHANGE_DEPOSIT_TYPE,
  INIT_SOCKET,
  CHANGE_BUY_TYPE,
  UPDATE_MARKET_SUCCESS,
  SHOW_ORDER_MODAL,
  CLOSE_ORDER_MODAL,
  SHOW_TOKEN_MODAL,
  CLOSE_TOKEN_MODAL,
  UPDATE_CURRENT_TOKEN
} from "../../actions/actionTypes";

let defaultToken;

if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {
  defaultToken = {
    address: "0x3Cd92940fa938ccAf446EE2cB6FcE2EA3783117D",
    symbol: "TEST",
    decimals: 18.0,
    name: "Test Token",
    description1: "blablabla",
    description2: "blableble",
    website: "https://etherdex.trade"
  };
} else {
  defaultToken = {
    address: "0x993890f752fd0f3d37c8bc5f3262c86b80d7c415",
    symbol: "MBYZ",
    decimals: 18.0,
    name: "MBYZ Coin",
    description1:
      "We are, as the cryptocurrency, a product of the collaboration of the community influenced by the use, for that we have a training plan with educational videos and preparation on line or in situ depending of the requirements to create a great network of users prepared to commercialize on their account the benefits of the network.",
    description2:
      "We will give technological security support to help in the BlockChain technology and the issue of the Tokens, that does not permit us to make equivalences in our platform to unify criteria between users, We want to allow the common user to acquire goods and services directly with their currency, and in the same way the merchant will receive the currency that he likes, whether it is FIAT or not. We would only be a means agreed between the parties to establish a price equivalence.",
    website: "https://mbyz.io"
  };
}

if (!localStorage.getItem("lastToken")) {
  localStorage.setItem("lastToken", JSON.stringify(defaultToken));
}

const initialState = {
  isReady: false,
  balance: null,
  tokenBalance: null,
  walletBalance: null,
  walletTokenBalance: null,
  tokens: null,
  currentToken: JSON.parse(localStorage.getItem("lastToken")),
  depositType: "DEPOSIT",
  socket: null,
  buyType: "BUY",
  market: null,
  showOrderModal: false,
  modalOrder: null,
  showTokenModal: false
};

const dexReducer = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_TOKEN_DEX_SUCCESS: {
      return {
        ...state,
        balance: action.payload.balance,
        tokenBalance: action.payload.tokenBalance,
        walletBalance: action.payload.walletBalance,
        walletTokenBalance: action.payload.walletTokenBalance,
        tokens: action.payload.tokens,
        isReady: true
      };
    }

    case UPDATE_TOKEN_DEX_ERROR: {
      return {
        ...state,
        isReady: true
      };
    }

    case CHANGE_DEPOSIT_TYPE: {
      return {
        ...state,
        depositType: action.payload
      };
    }

    case INIT_SOCKET: {
      return {
        ...state,
        socket: action.payload
      };
    }

    case CHANGE_BUY_TYPE: {
      return {
        ...state,
        buyType: action.payload
      };
    }

    case UPDATE_MARKET_SUCCESS: {
      return {
        ...state,
        market: action.payload
      };
    }

    case SHOW_ORDER_MODAL: {
      return {
        ...state,
        showOrderModal: true,
        modalOrder: action.payload
      };
    }

    case CLOSE_ORDER_MODAL: {
      return {
        ...state,
        showOrderModal: false
      };
    }

    case SHOW_TOKEN_MODAL: {
      return {
        ...state,
        showTokenModal: true
      };
    }

    case CLOSE_TOKEN_MODAL: {
      return {
        ...state,
        showTokenModal: false
      };
    }

    case UPDATE_CURRENT_TOKEN: {
      localStorage.setItem("lastToken", JSON.stringify(action.payload));
      return {
        ...state,
        currentToken: action.payload
      };
    }

    default: {
      return state;
    }
  }
};

export default dexReducer;
