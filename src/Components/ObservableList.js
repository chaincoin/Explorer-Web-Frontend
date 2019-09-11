import React from 'react';
import { distinctUntilChanged } from 'rxjs/operators';

export default React.memo((props) =>{

    var [list, setList] = React.useState(null);
  
  
    React.useEffect(() => {
      const subscription = props.value.pipe(
        distinctUntilChanged((prev, curr) => prev == curr)
      ).subscribe(setList);
      return () =>subscription.unsubscribe();
    }, [props.value]); 
  
  
    var components = [];
    if (list != null)
    {
      for(let i = 0; i < list.length; i++)
      {
        components.push((
          <props.rowComponent value={list[i]} {...props.options} />
        ))
      }
    }
    
  
    return(
      <React.Fragment>
        {components}
      </React.Fragment>
    )
  });
  
  
  