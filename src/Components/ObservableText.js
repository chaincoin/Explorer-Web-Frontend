import React from 'react';

export default (props) =>{

    var [text, setText] = React.useState(null);


    React.useEffect(() => {

        const subscription = props.value.subscribe((text) =>{
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