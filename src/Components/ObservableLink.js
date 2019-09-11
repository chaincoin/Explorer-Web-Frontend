import React from 'react';
import { distinctUntilChanged, first } from 'rxjs/operators';

import { withRouter } from "react-router-dom";

export default withRouter(props =>{

    var anchor = null;

    const setAnchor = React.useMemo(() =>(element) => anchor = element);



    const onClick = React.useMemo(() =>(e) =>{
        e.preventDefault();
        props.value.pipe(first()).subscribe((url) =>{
            if (url.startsWith("http://") || url.startsWith("https://")) window.location.href = url;
            else props.history.push(url)
            
        });
    });


    React.useEffect(() => {
        const subscription = props.value.pipe(
            distinctUntilChanged((prev, curr) => prev == curr)
        ).subscribe((link) =>{
            anchor.href = link;
        });
        
        return () =>{
          subscription.unsubscribe();
        }
    }, [props.value]); 

    return <React.Fragment>
        <a ref={setAnchor}  onClick={onClick}>
            {props.children}
        </a>
    </React.Fragment>
})