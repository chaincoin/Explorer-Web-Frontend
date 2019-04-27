import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';




const BlockCount = Observable.create(function(observer) {

    observer.next('Hello');
  
    observer.next('World');
  
    //observer.complete();

    return () => {

        console.log("Unsubscribe");

    }
  
  }).pipe(shareReplay({
    bufferSize: 1,
    refCount: true
  }));





  export default {
    BlockCount: BlockCount
  }