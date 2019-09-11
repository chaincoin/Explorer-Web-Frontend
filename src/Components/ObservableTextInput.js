import React from 'react';
import { distinctUntilChanged } from 'rxjs/operators';
import { TextField } from '@material-ui/core';

export default React.memo(props =>{
    
    const [input, setInput] = React.useState("");

    React.useEffect(() => {
        const subscription = props.value.pipe(
            distinctUntilChanged((prev, curr) => prev == curr)
        ).subscribe((text) =>{
            setInput(text);
        });
        
        return () =>{
          subscription.unsubscribe();
        }
    }, [props.value]);

    const setInputObservable = React.useMemo(() => (e) => props.value.next(e.target.value), [props.value])

    return (
        <TextField
          id="standard-name"
          label="Search"
          value={input}
          onChange={setInputObservable}
          margin="normal"
          fullWidth
        />
    )
})

