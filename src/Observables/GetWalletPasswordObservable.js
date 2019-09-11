import { from } from 'rxjs'

import GetPassword from './GetPasswordObservable'

import myWalletService from '../Services/MyWalletServices/MyWalletServices';

export default GetPassword({
    title:"Wallet Password",
    passwordLabel: "Password",
    checkPassword: (password) =>from(myWalletService.checkWalletPassword(password))
})