import { zip, combineLatest } from 'rxjs';
import { shareReplay, switchMap, map } from 'rxjs/operators';
import BlockchainServices from '../../BlockchainServices';
import bigDecimal from 'js-big-decimal';

export default (myWalletService) =>{

    return myWalletService.myAddresses
    .pipe(
    switchMap(myAddresses => zip(... 
      myAddresses.filter(myAddress => myAddress.WIF != null || myAddress.encryptedWIF != null).map(myAddress => 
        combineLatest(
          BlockchainServices.getAddress(myAddress.address),
          BlockchainServices.getAddressUnspent(myAddress.address),
          myWalletService.inputLockStates, 
          BlockchainServices.blockCount, 
          BlockchainServices.memPool, 
          BlockchainServices.masternodeList
        )
        .pipe(
          map(([address,unspent, inputLockStates,blockCount, memPool, masternodeList]) =>{
              return {
                  myAddress,
                  address: address,
                  inputs: unspent.map(unspent => {
                      var value = new bigDecimal(unspent.value);
  
                      var confirmations = (blockCount - unspent.blockHeight) + 1;
  
                      var isMatureCoins = unspent.payout == null ? true : confirmations > 102;
                      var inMemPool = memPool.find(r => r.vin.find(v => v.txid == unspent.txid && v.vout == unspent.vout )) != null;
                      var inMnList = masternodeList[unspent.txid + "-" + unspent.vout] != null;
                      var lockState = inputLockStates[unspent.txid + "-" + unspent.vout];
                      return {
                          myAddress,
                          unspent: unspent,
                          value: value,
                          satoshi: parseFloat(value.multiply(new bigDecimal("100000000")).getValue()),
                          confirmations: confirmations,
                          lockState: lockState,
                          disabled: lockState != null ? lockState : inMemPool || inMnList || isMatureCoins == false,
                          isMatureCoins: isMatureCoins,
                          inMemPool: inMemPool,
                          inMnList: inMnList 
                      }
                  }).concat()
              }
          })
        )
      )
    )),
    shareReplay({
      bufferSize: 1,
      refCount: true
    })
  );
}


