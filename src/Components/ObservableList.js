import React from 'react';
import { map, distinctUntilChanged } from 'rxjs/operators';

export default (props) =>{

    var [size, setSize] = React.useState(null);
  
  
    React.useEffect(() => {
      const subscription = props.value.pipe(
        map(list => list.length),
        distinctUntilChanged((prev, curr) => prev == curr)
      ).subscribe((size) =>setSize(size));
      return () =>subscription.unsubscribe();
    }, []); //TODO: should this be using prop change detection
  
  
    var components = [];
  
    for(let i = 0; i < size; i++)
    {
      components.push((
        <props.rowComponent value={props.value.pipe(map(list => list[i]))} {...props.options} />
      ))
    }
  
    return(
      <React.Fragment>
        {components}
      </React.Fragment>
    )
  }
  
  
  