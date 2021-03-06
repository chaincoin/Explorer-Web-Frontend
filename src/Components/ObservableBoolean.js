import React from 'react';
import { distinctUntilChanged } from 'rxjs/operators';

export default props =>{

    var [boolean, setBoolean] = React.useState(null);


    React.useEffect(() => {
        const subscription = props.value.pipe(
            distinctUntilChanged((prev, curr) => prev == curr)
        ).subscribe((boolean) =>{
            setBoolean(boolean);
        });
        
        return () =>{
          subscription.unsubscribe();
        }
    }, [props.value]); 


    return <React.Fragment>
        {
            boolean == true ?
            props.children :
            null
        }
    </React.Fragment>
}