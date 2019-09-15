import React from 'react';
import { distinctUntilChanged } from 'rxjs/operators';

export default React.memo(props =>{
    var span = null;

    const setSpan = React.useMemo(() =>(element) => span = element);

    React.useEffect(() => {
        const subscription = props.value.pipe(
            distinctUntilChanged((prev, curr) => prev == curr)
        ).subscribe((text) =>{
            if (span != null) span.textContent = text;
        });
        
        return () =>{
          subscription.unsubscribe();
        }
      }, [props.value]);


    return (
        <React.Fragment>
            <span ref={setSpan}>{props.loadingText ||null}</span>
        </React.Fragment>
    )
})

