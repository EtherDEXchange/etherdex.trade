import { combineReducers } from "redux";
import web3Reducer from "./web3/web3Reducer";
import dexReducer from "./dex/dexReducer";

const reducer = combineReducers({
  web3Reducer: web3Reducer,
  dexReducer: dexReducer
});

export default reducer;
