
import React from 'react';
import { BehaviorSubject, Observable } from 'rxjs';

import MessageDialog from '../Components/Dialogs/MessageDialog'
import ConfirmationDialog from '../Components/Dialogs/ConfirmationDialog'


const dialogsSubject = new BehaviorSubject([]);






const showDialog = (Component,args) =>{

    return Observable.create(function(observer) {

        var dialog = {
            jsx: (<Component onClose={e => dialogComplete(dialog, e)} onError={e => dialogError(dialog, e)} {...args} />),
            observer: observer
        }

        setTimeout(() => dialogsSubject.next(dialogsSubject._value.concat([dialog])));

        return () =>{
            removeDialog(dialog)
        }
    })
}

const showMessage = (title, message) =>{

    

    return Observable.create(function(observer) {

        var dialog = {
            jsx: (<MessageDialog title={title} message={message} onClose={e => dialogComplete(dialog, e)} onError={e => dialogError(dialog, e)} />),
            observer: observer
        }

        setTimeout(() => dialogsSubject.next(dialogsSubject._value.concat([dialog])));

        return () =>{
            removeDialog(dialog)
        }
    })
}

const showConfirmation = (title, message) =>{

    return Observable.create(function(observer) {

        var dialog = {
            jsx: (<ConfirmationDialog title={title} message={message} onClose={e => dialogComplete(dialog, e)} onError={e => dialogError(dialog, e)}/>),
            observer: observer
        }

        setTimeout(() => dialogsSubject.next(dialogsSubject._value.concat([dialog])));

        return () =>{
            removeDialog(dialog)
        }
    })
}


const dialogComplete = (dialog, result) =>{
    dialog.observer.next(result);
    dialog.observer.complete(result);
    dialog.observer = null;
    removeDialog(dialog);
}

const removeDialog = (dialog) =>{
    const dialogs = dialogsSubject._value.concat([]);
    const index = dialogs.indexOf(dialog);

    if (index > -1)
    {
        dialogs.splice(dialogs.indexOf(dialog),1);
        dialogsSubject.next(dialogs);
    }
}

const dialogError = (dialog, error) =>{
    dialog.observer.error(error);
    dialog.observer = null;
    removeDialog(dialog);
}


export default { 
    dialogs: dialogsSubject,
    showDialog,
    showMessage,
    showConfirmation
}