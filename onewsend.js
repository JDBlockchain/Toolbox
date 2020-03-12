const Web3 = require('web3');

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
    
/*
    if (web3.personal.unlockAccount(address, 'yyy123')) {
        console.log(`${address} is unlocked`);
    }else{
        console.log(`unlock failed, ${address}`);
        throw new Error('unlock failed ' + address);
    }
*/

}


for(i=0; i<100; i++) {
    
    web3.eth.sendTransaction({from:address, to:"0xd8f9f721a3b535edebd189df9a83a212832f2048", value: 1000000000000}, function(err, address2) {
        if (!err)
            console.log(address2); // "0x7f9fade1c0d57a7af66ab4ead7c2eb7b11a91385"
        else
            console.log("send error:" + err);
    });
}

function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
      if ((new Date().getTime() - start) > milliseconds){
        break;
      }
    }
}
