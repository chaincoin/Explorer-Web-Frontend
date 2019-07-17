import { Observable, Subject, from, interval } from 'rxjs';
import { shareReplay, switchMap } from 'rxjs/operators';

import DataService from './DataService'
import Environment from './Environment';

const BlockCount = DataService.webSocket.pipe(
  switchMap(webSocket => webSocket ?
    DataService.subscription("BlockCount"):
    interval(30000).pipe(switchMap(blockCount => from(DataService.sendRequest({
      op: "getBlockCount"
    }))))
  ),
  shareReplay({
    bufferSize: 1,
    refCount: true
  })
);


  var blockObservables = {}

  var getBlock = (hash) =>{ //TODO: This is a memory leak

    var blockObservable = blockObservables[hash];
    

    if (blockObservable == null){

      blockObservable = DataService.webSocket.pipe(
        switchMap(webSocket => webSocket ?
          DataService.subscription("BlockExtended", {hash:hash}):
          BlockCount.pipe(switchMap(blockCount => from(DataService.sendRequest({
            op: "getBlockExtended",
            hash: hash
          }))))
        ),
        shareReplay({
          bufferSize: 1,
          refCount: true
        })
      );

      blockObservables[hash] = blockObservable;
    } 

    return blockObservable;
  }


  var blocksObservables = {}
  var getBlocks = (blockId, pageSize) =>{ //TODO: This is a memory leak

    var observable = blocksObservables[blockId + "-" + pageSize];
    
    if (observable == null){

      observable = DataService.webSocket.pipe(
        switchMap(webSocket => webSocket ?
          DataService.subscription("BlocksExtended",{blockId:blockId,pageSize:pageSize}):
          BlockCount.pipe(switchMap(blockCount => from(DataService.sendRequest({
            op: "getBlocksExtended",
            blockId: blockId,
            pageSize: pageSize,
          }))))
        ),
        shareReplay({
          bufferSize: 1,
          refCount: true
        })
      );

      blocksObservables[blockId + "-" + pageSize] = observable;
    } 

    return observable;
  }

  var transactionObservables = {}

  var getTransaction = (txid) =>{ //TODO: This is a memory leak

    var transactionObservable = transactionObservables[txid];

    if (transactionObservable == null)
    {
      transactionObservable = DataService.webSocket.pipe(
        switchMap(webSocket => webSocket ?
          DataService.subscription("TransactionExtended",{transactionId:txid}):
          BlockCount.pipe(switchMap(blockCount => from(DataService.sendRequest({
            op: "getTransactionExtended",
            transactionId: txid,
          }))))
        ),
        shareReplay({
          bufferSize: 1,
          refCount: true
        })
      );
      transactionObservables[txid] = transactionObservable;
    }

     return transactionObservable;
  }

  const addressUnspentObservables = {}
  const getAddressUnspent = (addressId) =>{ //TODO: This is a memory leak

    var addressUnspentObservable = addressUnspentObservables[addressId];

    if (addressUnspentObservable == null)
    {
      addressUnspentObservable = DataService.webSocket.pipe(
        switchMap(webSocket => webSocket ?
          DataService.subscription("AddressUnspent",{address:addressId}):
          getAddress(addressId).pipe(switchMap(blockCount => from(DataService.sendRequest({
            op: "getAddressUnspent",
            address: addressId
          }))))
        ),
        shareReplay({
          bufferSize: 1,
          refCount: true
        })
      );

      addressUnspentObservables[addressId] = addressUnspentObservable;
    }
      
     return addressUnspentObservable;
  }





  var addressObservables = {}
  var getAddress = (addressId) =>{ //TODO: This is a memory leak

    var addressObservable = addressObservables[addressId];

    if (addressObservable == null)
    {
      addressObservable = DataService.webSocket.pipe(
        switchMap(webSocket => webSocket ?
          DataService.subscription("Address",{address:addressId}):
          BlockCount.pipe(switchMap(blockCount => from(DataService.sendRequest({
            op: "getAddress",
            address: addressId
          }))))
        ),
        shareReplay({
          bufferSize: 1,
          refCount: true
        })
      );

      addressObservables[addressId] = addressObservable;
    }
      
     return addressObservable;
  }

  var getAddressTxs = (address, pos, rowsPerPage) => { //TODO: should this be an Observable, can the data change over time?
    return DataService.sendRequest({
      op: "getAddressTxs",
      address:address,
      pos:pos,
      pageSize: rowsPerPage,
      extended:true
    });
  }
  

  var masternodeCount = DataService.webSocket.pipe(
    switchMap(webSocket => webSocket ?
      DataService.subscription("MasternodeCount"):
      interval(30000).pipe(switchMap(blockCount => from(DataService.sendRequest({
        op: "getMasternodeCount",
      }))))
    ),
    shareReplay({
      bufferSize: 1,
      refCount: true
    })
  );

  


  var masternodeList = DataService.webSocket.pipe(
    switchMap(webSocket => webSocket ?
      DataService.subscription("MasternodeList"):
      interval(30000).pipe(switchMap(blockCount => from(DataService.sendRequest({
        op: "getMasternodeList",
      }))))
    ),
    shareReplay({
      bufferSize: 1,
      refCount: true
    })
  );


  var masternodeObservables = {}
  var masternode = (output) =>{  //TODO: This is a memory leak

    var masternodeObservable = masternodeObservables[output]

    if (masternodeObservable == null)
    {
      masternodeObservable = DataService.webSocket.pipe(
        switchMap(webSocket => webSocket ?
          DataService.subscription("MasternodeExtended",{output:output}):
          interval(30000).pipe(switchMap(blockCount => from(DataService.sendRequest({
            op: "getMasternodeExtended",
            output:output
          }))))
        ),
        shareReplay({
          bufferSize: 1,
          refCount: true
        })
      );

      masternodeObservables[output] = masternodeObservable;
    } 

    return masternodeObservable;
  }

  var getMasternodeEvents = (output, pos, rowsPerPage) => { //TODO: should this be an Observable, can the data change over time?
    return DataService.sendRequest({
      op: "getMasternodeEvents",
      output: output,
      pos: pos,
      pageSize: rowsPerPage
    })
  }

  var getPayoutStats = (address, type, unit) => { //TODO: should this be an Observable, can the data change over time?
    return DataService.sendRequest({
      op: "getPayOutStats",
      address: address,
      type: type,
      unit: unit
    }) 
  }
  
  var masternodeWinners = DataService.webSocket.pipe(
    switchMap(webSocket => webSocket ?
      DataService.subscription("MasternodeWinners"):
      interval(30000).pipe(switchMap(blockCount => from(DataService.sendRequest({
        op: "getMasternodeWinners",
      }))))
    ),
    shareReplay({
      bufferSize: 1,
      refCount: true
    })
  );
  

  var memPoolInfo = DataService.webSocket.pipe(
    switchMap(webSocket => webSocket ?
      DataService.subscription("MemPoolInfo"):
      interval(30000).pipe(switchMap(blockCount => from(DataService.sendRequest({
        op: "getMemPoolInfo",
      }))))
    ),
    shareReplay({
      bufferSize: 1,
      refCount: true
    })
  );
  


  var rawMemPool = DataService.webSocket.pipe(
    switchMap(webSocket => webSocket ?
      DataService.subscription("RawMemPool"):
      interval(30000).pipe(switchMap(blockCount => from(DataService.sendRequest({
        op: "getRawMemPool",
      }))))
    ),
    shareReplay({
      bufferSize: 1,
      refCount: true
    })
  );

  var memPool = DataService.webSocket.pipe(
    switchMap(webSocket => webSocket ?
      DataService.subscription("MemPool"):
      interval(30000).pipe(switchMap(blockCount => from(DataService.sendRequest({
        op: "getMemPool",
      }))))
    ),
    shareReplay({
      bufferSize: 1,
      refCount: true
    })
  );
  
  var chainTips = DataService.webSocket.pipe(
    switchMap(webSocket => webSocket ?
      DataService.subscription("ChainTips"):
      interval(30000).pipe(switchMap(blockCount => from(DataService.sendRequest({
        op: "getChainTips",
      }))))
    ),
    shareReplay({
      bufferSize: 1,
      refCount: true
    })
  );

  var peerInfo = DataService.webSocket.pipe(
    switchMap(webSocket => webSocket ?
      DataService.subscription("PeerInfo"):
      interval(30000).pipe(switchMap(blockCount => from(DataService.sendRequest({
        op: "getPeerInfo",
      }))))
    ),
    shareReplay({
      bufferSize: 1,
      refCount: true
    })
  );


  var richListCount = DataService.webSocket.pipe(
    switchMap(webSocket => webSocket ?
      DataService.subscription("RichListCount"):
      interval(30000).pipe(switchMap(blockCount => from(DataService.sendRequest({
        op: "getRichListCount",
      }))))
    ),
    shareReplay({
      bufferSize: 1,
      refCount: true
    })
  );
  

  var getRichList = (pos, rowsPerPage) => { //TODO: should this be an Observable, can the data change over time?
    return DataService.sendRequest({
      op: "getRichList",
      pos: pos,
      pageSize: rowsPerPage,
      extended: true
    });
  }


  var txOutSetInfo = DataService.webSocket.pipe(
    switchMap(webSocket => webSocket ?
      DataService.subscription("TxOutSetInfo"):
      interval(30000).pipe(switchMap(blockCount => from(DataService.sendRequest({
        op: "getTxOutSetInfo",
      }))))
    ),
    shareReplay({
      bufferSize: 1,
      refCount: true
    })
  );
  


  var networkHashps = DataService.webSocket.pipe(
    switchMap(webSocket => webSocket ?
      DataService.subscription("NetworkHashps"):
      interval(30000).pipe(switchMap(blockCount => from(DataService.sendRequest({
        op: "getNetworkHashps",
      }))))
    ),
    shareReplay({
      bufferSize: 1,
      refCount: true
    })
  );
  


  var validateAddress = (address) =>{
    return DataService.sendRequest({
      op: "validateAddress",
      address: address
    });
  };

  var sendRawTransaction = (hex, allowHighFees) =>{
    return DataService.sendRequest({
      op: "sendRawTransaction",
      hex: hex,
      allowHighFees: allowHighFees
    });
  };

  

  var Chaincoin = {
    messagePrefix: 'DarkCoin Signed Message:\n',
    bip32: {
      public: 0x02FE52F8,
      private: 0x02FE52CC
    },
    bech32: "chc",
    pubKeyHash: 0x1C,
    scriptHash: 0x04,
    wif: 0x9C
  };

  if (Environment.environment == "Test"){
    Chaincoin = {
      messagePrefix: 'DarkCoin Signed Message:\n',
      bip32: {
        public: 0x02FE52F8,
        private: 0x02FE52CC
      },
      bech32: "tchc",
      pubKeyHash: 0x50,
      scriptHash: 0x2c,
      wif: 0xd8
    }; 
  }

  export default { 
    blockCount: BlockCount, 
    getBlock: getBlock,
    getBlocks,
    getTransaction:getTransaction,
    getAddress: getAddress,
    getAddressTxs,
    getAddressUnspent: getAddressUnspent,
    masternodeCount: masternodeCount,
    masternodeList: masternodeList,
    masternode: masternode,
    getMasternodeEvents,
    masternodeWinners,

    peerInfo,
    chainTips,

    memPoolInfo,
    rawMemPool,
    memPool,

    richListCount,
    getRichList,

    txOutSetInfo,
    networkHashps,

    validateAddress,
    getPayoutStats,

    sendRawTransaction,

    Chaincoin
  }