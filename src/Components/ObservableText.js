import React from 'react';
import { distinctUntilChanged } from 'rxjs/operators';

export default (props) =>{
    var span = null;


    React.useEffect(() => {
        const subscription = props.value.pipe(
            distinctUntilChanged((prev, curr) => prev == curr)
        ).subscribe((text) =>{
            if (span != null) span.textContent = text;
        });
        
        return () =>{
          subscription.unsubscribe();
        }
      }, [props.value]); //TODO: should this be using prop change detection


    return (
        <React.Fragment>
            <span ref={elem => span = elem }>{props.loadingText ||""}</span>
        </React.Fragment>
    )
}

