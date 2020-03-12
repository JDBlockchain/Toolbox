const Web3 = require('web3');
const solc = require('solc');
const fs = require('fs');

const nodeUri = 'http://39.100.246.152:22001';
var address = '';

let web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider(nodeUri));

if(!web3.isConnected()){
    throw new Error('unable to connect to moac vnode at ' + nodeUri);
}else{

    console.log('connected to moac vnode at ' + nodeUri);
    let coinbase = web3.eth.coinbase;
    console.log('coinbase:' + coinbase);
    let balance = web3.eth.getBalance(coinbase);
    console.log('balance:' + balance/1000000000000000000 + " ETH");
    let accounts = web3.eth.accounts;
    console.log(accounts);
    address = coinbase;
}

var testObjAddr = "0x54784c2f817884785226e298207ae07782315117";
test = testContract.at(testObjAddr);
console.log("test contract address:", test.address);

console.log("Adding one ...");
test.add(1,{from:web3.eth.accounts[0]});

console.log("Reading total ...");
var num = test.get({from:web3.eth.accounts[0]});
console.log("num=" + num);
