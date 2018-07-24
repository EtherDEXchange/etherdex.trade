import { BigNumber } from "bignumber.js";
import ethUtil from "ethereumjs-util";
import { sha256 } from "js-sha256";

export const toEth = (wei, decimals) => {
  return new BigNumber(String(wei)).div(new BigNumber(10 ** decimals));
};

export const toWei = (eth, decimals) => {
  return new BigNumber(String(eth)).times(new BigNumber(10 ** decimals));
};

export const idToNetwork = id => {
  switch (id) {
    case 1:
      return "";
    case 3:
      return "test net";
    default:
      return "unknown";
  }
};

export const shortenAddress = address => {
  return address.substr(0, 6);
};

const defaultExpirationInBlocks = 100;

export function getBlockNumber(web3) {
  return new Promise((resolve, reject) => {
    web3.eth.getBlockNumber((error, result) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(result);
    });
  });
}

export function orderHash(
  contractAddress,
  creatorAddress,
  tokenGet,
  amountGet,
  tokenGive,
  amountGive,
  expires,
  nonce
) {
  const condensed = pack(
    [
      contractAddress,
      tokenGet,
      amountGet,
      tokenGive,
      amountGive,
      expires,
      nonce
    ],
    [160, 160, 256, 160, 256, 256, 256]
  );
  return sha256(new Buffer(condensed, "hex"));
}

export function signOrder(
  web3,
  contractAddress,
  creatorAddress,
  tokenGet,
  amountGet,
  tokenGive,
  amountGive,
  expires,
  nonce
) {
  const hash = orderHash(
    contractAddress,
    creatorAddress,
    tokenGet,
    amountGet,
    tokenGive,
    amountGive,
    expires,
    nonce
  );
  return promisify(sign, [web3, creatorAddress, hash, ""]);
}

export function executeOrder(
  contractAddress,
  creatorAddress,
  tokenGet,
  amountGet,
  tokenGive,
  amountGive,
  amountGiven,
  from,
  expire,
  nonce
) {
  let realExpire;
  let realNonce = nonce || Math.floor(Math.random());
  return getBlockNumber()
    .then(function(result) {
      realExpire = expire || result + defaultExpirationInBlocks;
      return signOrder(
        contractAddress,
        creatorAddress,
        tokenGet,
        amountGet,
        tokenGive,
        amountGive,
        realExpire,
        realNonce
      );
    })
    .then(function(result) {
      return contractAddress.trade(
        tokenGet,
        amountGet,
        tokenGive,
        amountGive,
        realExpire,
        realNonce,
        creatorAddress,
        result.v,
        result.r,
        result.s,
        amountGiven,
        { from: from }
      );
    });
}

export function isObject(object) {
  return (
    object !== null && !Array.isArray(object) && typeof object === "object"
  );
}

export function promisify(func, args, self) {
  return new Promise(function(resolve, reject) {
    args.push((err, res) => {
      if (err) return reject(err);
      resolve(res);
    });

    func.apply(self, args);
  });
}

export function getDivisor(token) {
  let result = 1000000000000000000;
  if (token && token.decimals !== undefined) {
    result = Math.pow(10, token.decimals);
  }

  return new BigNumber(result);
}

export function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

export function getNextNonce(web3, address, callback) {
  web3.eth.getTransactionCount(address, (err, result) => {
    const nextNonce = Number(result);
    callback(undefined, nextNonce);
  });
}

export function send(
  web3,
  contract,
  address,
  functionName,
  argsIn,
  fromAddress,
  privateKeyIn,
  nonceIn,
  callback
) {
  function encodeConstructorParams(abi, params) {
    return (
      abi
        .filter(
          json =>
            json.type === "constructor" && json.inputs.length === params.length
        )
        .map(json => json.inputs.map(input => input.type))
        .map(types => web3.eth.abi.encodeParameters(types, params))[0] || ""
    );
  }

  const args = Array.prototype.slice.call(argsIn).filter(a => a !== undefined);
  let options = {};

  if (typeof args[args.length - 1] === "object" && args[args.length - 1].gas) {
    args[args.length - 1].gasPrice = 15000000000;
    args[args.length - 1].gasLimit = args[args.length - 1].gas;

    delete args[args.length - 1].gas;
  }

  if (isObject(args[args.length - 1])) {
    options = args.pop();
  }

  getNextNonce(web3, fromAddress, (err, nextNonce) => {
    let nonce = nonceIn;
    if (nonceIn === undefined || nonceIn < nextNonce) {
      nonce = nextNonce;
    }

    options.nonce = nonce;
    if (functionName === "constructor") {
      if (options.data.slice(0, 2) !== "0x") {
        options.data = `0x${options.data}`;
      }
      const encodedParams = encodeConstructorParams(contract, args);
      options.data += encodedParams;
    } else if (!contract || !functionName) {
      options.to = address;
    } else {
      options.to = address;
      const functionAbi = contract.find(
        element => element.name === functionName
      );
      const inputTypes = functionAbi.inputs.map(x => x.type);
      const typeName = inputTypes.join();
      options.data = `0x${web3
        .sha3(`${functionName}(${typeName})`)
        .slice(0, 8)}${web3.eth.abi.encodeParameters(inputTypes, args)}`;
    }

    try {
      options.from = fromAddress;
      options.gas = options.gasLimit;
      delete options.gasLimit;

      web3.eth.sendTransaction(options, (err, hash) => {
        callback(undefined, { txHash: hash, nonce: nonce + 1 });
      });
    } catch (errCatch) {
      callback(errCatch, { txHash: undefined, nonce });
    }
  });
}

export function multiplyByNumber(numIn, x, base) {
  let num = numIn;
  if (num < 0) return null;
  if (num === 0) return [];
  let result = [];
  let power = x;
  while (true) {
    if (num & 1) {
      result = add(result, power, base);
    }
    num = num >> 1;
    if (num === 0) break;
    power = add(power, power, base);
  }
  return result;
}

export function add(x, y, base) {
  const z = [];
  const n = Math.max(x.length, y.length);
  let carry = 0;
  let i = 0;
  while (i < n || carry) {
    const xi = i < x.length ? x[i] : 0;
    const yi = i < y.length ? y[i] : 0;
    const zi = carry + xi + yi;
    z.push(zi % base);
    carry = Math.floor(zi / base);
    i += 1;
  }

  return z;
}

export function parseToDigitsArray(str, base) {
  const digits = str.split("");
  const ary = [];
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    const n = parseInt(digits[i], base);
    if (isNaN(n)) return null;
    ary.push(n);
  }

  return ary;
}

export function convertBase(str, fromBase, toBase) {
  const digits = parseToDigitsArray(str, fromBase);
  if (digits === null) return null;
  let outArray = [];
  let power = [1];
  for (let i = 0; i < digits.length; i += 1) {
    if (digits[i]) {
      outArray = add(
        outArray,
        multiplyByNumber(digits[i], power, toBase),
        toBase
      );
    }
    power = multiplyByNumber(fromBase, power, toBase);
  }
  let out = "";
  for (let i = outArray.length - 1; i >= 0; i -= 1) {
    out += outArray[i].toString(toBase);
  }
  if (out === "") out = 0;

  return out;
}

export function decToHex(dec, lengthIn) {
  let length = lengthIn;
  if (!length) length = 32;
  if (dec < 0) {
    return new BigNumber(2)
      .pow(length)
      .add(new BigNumber(dec))
      .toString(16);
  }
  let result = null;
  try {
    result = convertBase(dec.toString(), 10, 16);
  } catch (err) {
    result = null;
  }
  if (result) {
    return result;
  }
  return new BigNumber(dec).toString(16);
}

export function zeroPad(num, places) {
  const zero = places - num.toString().length + 1;

  return Array(+(zero > 0 && zero)).join("0") + num;
}

export function pack(dataIn, lengths) {
  let packed = "";
  const data = dataIn.map(x => x);

  for (let i = 0; i < lengths.length; i += 1) {
    if (typeof data[i] === "string" && data[i].substring(0, 2) === "0x") {
      if (data[i].substring(0, 2) === "0x") data[i] = data[i].substring(2);
      packed += zeroPad(data[i], lengths[i] / 4);
    } else if (typeof data[i] !== "number" && /[a-f]/.test(data[i])) {
      if (data[i].substring(0, 2) === "0x") data[i] = data[i].substring(2);
      packed += zeroPad(data[i], lengths[i] / 4);
    } else {
      packed += zeroPad(decToHex(data[i], lengths[i]), lengths[i] / 4);
    }
  }

  return packed;
}

export function sign(web3, address, msgToSignIn, privateKeyIn, callback) {
  let msgToSign = msgToSignIn;
  if (msgToSign.substring(0, 2) !== "0x") msgToSign = `0x${msgToSign}`;

  function prefixMessage(msgIn) {
    let msg = msgIn;
    msg = new Buffer(msg.slice(2), "hex");
    msg = Buffer.concat([
      new Buffer(`\x19Ethereum Signed Message:\n${msg.length.toString()}`),
      msg
    ]);
    msg = web3.utils.sha3(`0x${msg.toString("hex")}`, { encoding: "hex" });
    msg = new Buffer(msg.slice(2), "hex");
    return `0x${msg.toString("hex")}`;
  }

  function testSig(msg, sig) {
    const recoveredAddress = `0x${ethUtil
      .pubToAddress(ethUtil.ecrecover(msg, sig.v, sig.r, sig.s))
      .toString("hex")}`;
    return recoveredAddress === address.toLowerCase();
  }

  if (privateKeyIn) {
    let privateKey = privateKeyIn;
    if (privateKey.substring(0, 2) === "0x")
      privateKey = privateKey.substring(2, privateKey.length);
    msgToSign = prefixMessage(msgToSign);
    try {
      const sig = ethUtil.ecsign(
        new Buffer(msgToSign.slice(2), "hex"),
        new Buffer(privateKey, "hex")
      );
      const r = `0x${sig.r.toString("hex")}`;
      const s = `0x${sig.s.toString("hex")}`;
      const v = sig.v;
      const result = { r, s, v };
      callback(undefined, result);
    } catch (err) {
      callback(err);
    }
  } else {
    if (web3.currentProvider.isMetaMask) {
      msgToSign = prefixMessage(msgToSign);
    }

    web3.eth.sign(msgToSign, address, (err, sigResult) => {
      if (err) {
        callback("Failed to sign message 1");
      } else {
        const sig = ethUtil.fromRpcSig(sigResult);
        let msg;
        if (web3.currentProvider.isMetaMask) {
          msg = new Buffer(msgToSign.slice(2), "hex");
        } else {
          msg = new Buffer(prefixMessage(msgToSign).slice(2), "hex");
        }
        if (testSig(msg, sig, address)) {
          const r = `0x${sig.r.toString("hex")}`;
          const s = `0x${sig.s.toString("hex")}`;
          const v = sig.v;
          const result = { r, s, v };
          callback(undefined, result);
        } else {
          callback("Failed to sign message 2");
        }
      }
    });
  }
}
