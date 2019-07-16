
import React from 'react';
import { BehaviorSubject } from 'rxjs';

import MessageDialog from '../Components/Dialogs/MessageDialog'

const dialogsSubject = new BehaviorSubject([]);






const showDialog = (Component) =>{

    var dialog = {
        jsx: (<Component onClose={e => removeDialog(dialog)} />)
    }
    
    dialogsSubject.next(dialogsSubject._value.concat([dialog]));
}

const showMessage = (title, message) =>{

    var dialog = {
        jsx: (<MessageDialog title={title} message={message} onClose={e => removeDialog(dialog)}/>)
    }
    
    dialogsSubject.next(dialogsSubject._value.concat([dialog]));
}



const removeDialog = (dialog) =>{
    const dialogs = dialogsSubject._value.concat([]);

    dialogs.splice(dialogs.indexOf(dialog),1);

    dialogsSubject.next(dialogs);
}


export default { 
    dialogs: dialogsSubject,
    showDialog,
    showMessage
}