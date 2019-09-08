import React from 'react';
import { distinctUntilChanged } from 'rxjs/operators';

import { withRouter } from "react-router-dom";

export default withRouter((props) =>{

    var anchor = null;
    var link = null;

    React.useEffect(() => {
        const subscription = props.value.pipe(
            distinctUntilChanged((prev, curr) => prev == curr)
        ).subscribe((newLink) =>{
            link = newLink;
            if (anchor != null) anchor.href = link;
        });
        
        return () =>{
          subscription.unsubscribe();
        }
    }, [props.value]); //TODO: should this be using prop change detection


    const onClick = (e) =>{
        e.preventDefault();
        props.history.push(link);
    }


    return <React.Fragment>
        <a ref={elem => anchor = elem }  onClick={onClick}>
            {props.children}
        </a>
    </React.Fragment>
})