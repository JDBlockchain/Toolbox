const Web3 = require('web3');
const solc = require('solc');
const fs = require('fs');

/*
连接区块链
解锁主账户
发布Solidity智能合约
本地签名调用合约
异地签名调用合约
简单转账
查看余额
*/


const nodeUri = 'http://39.100.246.152:22001';
var address = '';

let web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider(nodeUri));

// 解锁账户
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
    
    if (web3.personal.unlockAccount(address, 'test123')) {
        console.log(`${address} is unlocked`);
    }else{
        console.log(`unlock failed, ${address}`);
        throw new Error('unlock failed ' + address);
    }
}

// deploy智能合约
var contractName = 'simplestorage';
var solpath = 'test.sol';

console.log("Read path:", solpath)
contract = fs.readFileSync(solpath, 'utf8');

output = solc.compile(contract, 1);

//console.log("output=" + JSON.stringify(output));
abi = output.contracts[':' + contractName].interface;
bin = output.contracts[':' + contractName].bytecode;

var testContract = web3.eth.contract(JSON.parse(abi));

var testObj = testContract.new(
   42,
   {
     from: address, 
     data: '0x' + bin, 
     gas: '8000000'
   }
 );

console.log("Test Contract is being deployed at transaction HASH: " + testObj.transactionHash);

var testObjAddr = waitBlock(testObj.transactionHash);

test = testContract.at(testObjAddr);

// 本地签名调用智能合约Add函数
var _ = require('lodash');
var SolidityFunction = require('web3/lib/web3/function');
var solidityFunction = new SolidityFunction('', _.find(JSON.parse(abi), { name: 'add' }), '');
console.log('This shows what toPayload expects as an object');
console.log(solidityFunction)

var sendValue = 10;
var payloadData = solidityFunction.toPayload([ sendValue ]).data;

//======================================================================================
console.log("test contract address:", test.address);

var num = test.get({from:web3.eth.accounts[0]});
console.log("total=" + num);

// Test call function using SendRawTransaction function
var Tx = require('ethereumjs-tx');
var keythereum = require("keythereum");
var keystorePath  = "keystore";
var keyObject = keythereum.importFromFile(address, keystorePath);
var password = "test123";
var privateKey = keythereum.recover(password, keyObject).toString('hex');
var privKey = Buffer.from(privateKey, 'hex');
console.log('privateKey: ' + privateKey);

gasPrice = web3.eth.gasPrice;
gasPriceHex = web3.toHex(gasPrice);
gasLimitHex = web3.toHex(300000);

console.log('Current gasPrice: ' + gasPrice + ' OR ' + gasPriceHex);

nonce =  web3.eth.getTransactionCount(address) ;
nonceHex = web3.toHex(nonce);
console.log('nonce (transaction count on fromAccount): ' + nonce + '(' + nonceHex + ')');

var rawTx = {
    nonce: nonceHex,
    gasPrice: gasPriceHex,
    gasLimit: gasLimitHex,
    to: testObjAddr,
    from: address,
    value: '0x00',
    data: payloadData
};

var tx = new Tx(rawTx);
tx.sign(privKey);

var serializedTx = tx.serialize();

//同步调用，本地签名
var res = web3.eth.sendRawTransaction('0x' + serializedTx.toString('hex'));
console.log("res= " + res);
/*
//异步调用，本地签名
web3.eth.sendRawTransaction('0x' + serializedTx.toString('hex'), function (err, hash) {
    if (err) {
        console.log('Error:');
        console.log(err);
    }
    else {
        console.log('Transaction receipt hash pending');
        console.log(hash);
    }
});
*/

while(true) {
    var num = test.get({from:web3.eth.accounts[0]});
    console.log("total=" + num);
    sleep(1000);
}


/*

// 同步调用，异地签名
sendtx(address, testObjAddr, 0, payloadData);


// 同步调用，异地签名
for ( i = 0; i < 100; i++) {
    console.log("calling web3.eth.sendTransaction ...");
    web3.eth.sendTransaction({from:address, to:testObjAddr, value: 0, data: payloadData}, function(err, address2) {
        if (!err)
            console.log(address2); 
        else
            console.log("send error:" + err);
    });
}


// 同步调用，不用Send函数，而是用Contract函数直接调用
for ( i = 0; i < 2; i++) {
    console.log("Adding one ...");
    test.add(1,{from:web3.eth.accounts[0]});
}

// 只读函数调用
var num = test.get({from:web3.eth.accounts[0]});
console.log("total=" + num);

// 测试简单转账
var testWallet = "0x5ab57b1e527fd843b6eb4b190f272ff0d5aadd88";
sendtx(address, testWallet, 10)
waitBalance(testWallet, 5);

*/


function waitBlock(transactionHash) {
    console.log("Waiting a mined block to include your contract...");
    
    while (true) {
      let receipt = web3.eth.getTransactionReceipt(transactionHash);
      if (receipt && receipt.contractAddress) {
        console.log("contract has been deployed at " + receipt.contractAddress);
        break;
      }
      console.log("block " + web3.eth.blockNumber + "...");
      sleep(50000);
    }
    return web3.eth.getTransactionReceipt(transactionHash).contractAddress;
}
  

function checkBalance(inaddr, inMcAmt) {
    if ( web3.eth.getBalance(inaddr)/1e18 >= inMcAmt ){
      return true;
    }else{
      return false;
    }
}
  
function sendtx(src, tgtaddr, amount, strData) {
    web3.eth.sendTransaction(
    {
        from: src,
        value:web3.toWei(amount,'ether'),
        to: tgtaddr,
        gas: "2000000",
        gasPrice: web3.eth.gasPrice,
        data: strData
    });
    
    console.log('sending from:' +   src + ' to:' + tgtaddr  + ' amount:' + amount + ' with data:' + strData);
}

function waitBalance(addr, target) {
    while (true) {
        let balance = web3.eth.getBalance(addr)/1000000000000000000;
        if (balance >= target) {
          console.log("account has enough balance " + balance);
          break;
        }
        console.log("Waiting the account has enough balance " + balance);
        sleep(5000);
    }
}

function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
      if ((new Date().getTime() - start) > milliseconds){
        break;
      }
    }
}