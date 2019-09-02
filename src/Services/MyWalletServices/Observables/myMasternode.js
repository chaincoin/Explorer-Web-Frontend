
import { Observable} from 'rxjs';
import { map } from 'rxjs/operators';

export default (myWalletService) =>{

    return (output) =>{
        return myWalletService.myMasternodes.pipe(map(myMns => myMns.find(myMn => myMn.output == output)));  //TODO: this needs to be smarter now
      }
}


