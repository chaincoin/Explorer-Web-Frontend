import React from 'react';
import { distinctUntilChanged } from 'rxjs/operators';

export default (props) =>{

    var [text, setText] = React.useState(null);


    React.useEffect(() => {

        const subscription = props.value.pipe(
            distinctUntilChanged((prev, curr) => prev == curr)
        ).subscribe((text) =>{
            setText(text);
        });
        
        return () =>{
          subscription.unsubscribe();
        }
      }, []);


    return <React.Fragment>
        {
            text == null ?
            (props.loadingText ||"") : 
            text
        }
    </React.Fragment>
}