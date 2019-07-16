import React from 'react';


import DialogService from '../Services/DialogService';




export default () => {
    const [dialogs, setDialogs] = React.useState([]);
    
  
  
    React.useEffect(() => {
        var subscription = DialogService.dialogs.subscribe((dialogs) =>{
            setDialogs(dialogs);
        })
        return () =>{
            subscription.unsubscribe();
        };
    });


    return (
        <React.Fragment>
            {dialogs.map(dialog =>(
                dialog.jsx
            ))}
        </React.Fragment>
    );
};