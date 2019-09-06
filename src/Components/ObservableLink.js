import React from 'react';
import { distinctUntilChanged } from 'rxjs/operators';

import { Link } from "react-router-dom";

export default (props) =>{

    var [link, setLink] = React.useState(null);


    React.useEffect(() => {
        const subscription = props.value.pipe(
            distinctUntilChanged((prev, curr) => prev == curr)
        ).subscribe((link) =>{
            setLink(link);
        });
        
        return () =>{
          subscription.unsubscribe();
        }
      }, []); //TODO: should this be using prop change detection


    return <React.Fragment>
        <Link to={link}>
            {props.children}
        </Link>
    </React.Fragment>
}