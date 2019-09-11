
import { map } from 'rxjs/operators';

export default (myWalletService) =>{

    return (address) =>{
        return myWalletService.myAddresses.pipe(map(myAddresses => myAddresses.find(myMn => myMn.address == address)));  //TODO: this needs to be smarter now
      }
}


