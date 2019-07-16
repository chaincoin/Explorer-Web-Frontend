
import React from 'react';
import { BehaviorSubject, ReplaySubject } from 'rxjs';

import MessageDialog from '../Components/Dialogs/MessageDialog'
import ConfirmationDialog from '../Components/Dialogs/ConfirmationDialog'

const dialogsSubject = new BehaviorSubject([]);






const showDialog = (Component,args) =>{

    var dialog = {
        jsx: (<Component onClose={e => removeDialog(dialog, e)} {...args}/>),
        subject: new ReplaySubject(1)
    }
    
    dialogsSubject.next(dialogsSubject._value.concat([dialog]));

    return dialog.subject;
}

const showMessage = (title, message) =>{

    var dialog = {
        jsx: (<MessageDialog title={title} message={message} onClose={e => removeDialog(dialog, e)}/>),
        subject: new ReplaySubject(1)
    }
    
    dialogsSubject.next(dialogsSubject._value.concat([dialog]));

    return dialog.subject;
}

const showConfirmation = (title, message) =>{

    var dialog = {
        jsx: (<ConfirmationDialog title={title} message={message} onClose={e => removeDialog(dialog, e)}/>),
        subject: new ReplaySubject(1)
    }
    
    dialogsSubject.next(dialogsSubject._value.concat([dialog]));

    return dialog.subject;
}



const removeDialog = (dialog, e) =>{
    const dialogs = dialogsSubject._value.concat([]);

    dialogs.splice(dialogs.indexOf(dialog),1);

    dialogsSubject.next(dialogs);

    dialog.subject.next(e);
    dialog.subject.complete(e);
}


export default { 
    dialogs: dialogsSubject,
    showDialog,
    showMessage,
    showConfirmation
}