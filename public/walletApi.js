

var walletApi = null;

{
	var databaseVersion = 12;
	var databaseName = "Wallet";
		
	var databaseOpenState = {
		none: 0,
		opening: 1,
		open: 2,
		
		failed: 99
	}

	var databaseOpen = databaseOpenState.none;
	var dbPromise = new Promise(function(resolve, reject){
		
		var _indexedDB = indexedDB || mozIndexedDB || webkitIndexedDB || msIndexedDB; // eslint-disable-line no-undef
		var openRequest = _indexedDB.open(databaseName, 12);
		databaseOpen = databaseOpenState.opening;

		openRequest.onsuccess  = function(event) {
			databaseOpen = databaseOpenState.open;
			
			resolve(event.target.result);
		};
		openRequest.onerror = function(event) {
			databaseOpen = databaseOpenState.failed;
			
			reject();
		};


		openRequest.onupgradeneeded = function(event) {
			var db = openRequest.result;
			var transaction = openRequest.transaction;
					
			if (event.oldVersion < 1) {
				
			}

			if (event.oldVersion < 2) {
				
			}
			
			if (event.oldVersion < 4) {

			}
			
			if (event.oldVersion < 7)
			{
				var masternodesObjectStore = null;
				if (db.objectStoreNames.contains("masternodes") == false) masternodesObjectStore = db.createObjectStore("masternodes", { keyPath: "output", unique: true });
				else masternodesObjectStore = transaction.objectStore("masternodes");

				if (masternodesObjectStore.indexNames.contains("by_name") == false) masternodesObjectStore.createIndex("by_name", "name"); //TODO: this is case sensitive orders lower and upper case strangle

				var addressesObjectStore = null;
				if (db.objectStoreNames.contains("addresses") == false) addressesObjectStore = db.createObjectStore("addresses", { keyPath: "address", unique: true });
				else addressesObjectStore = transaction.objectStore("addresses");

				if (addressesObjectStore.indexNames.contains("by_name") == false) addressesObjectStore.createIndex("by_name", "name"); //TODO: this is case sensitive orders lower and upper case strangle

			}
			
			if (event.oldVersion < 8)
			{
				
			}

			if (event.oldVersion < 9)
			{
				db.createObjectStore("inputLockStates", { keyPath: "output", unique: true });
			}

			if (event.oldVersion < 10)
			{
				db.createObjectStore("notifications", { keyPath: "id", unique: true });
			}

			if (event.oldVersion < 12)
			{
				var configurationStore = db.createObjectStore("configuration", { keyPath: "id", unique: true });
				configurationStore.put({id: "walletPasswordVerification", value:window.localStorage["walletPasswordVerification"]});
			}

		};
		
	});




	walletApi = {
		getConfiguration:function(id){
			return dbPromise.then(function(db){
				return new Promise(function(resolve, reject) {
					var dbRequest = db.transaction(["configuration"], "readonly").objectStore("configuration").get(id);
					dbRequest.onsuccess = function(event) {
						resolve(event.target.result != null ? event.target.result.value : null);
					};
					dbRequest.onerror = function(event) {
						reject();
					};
				})
			})
		},
		isWalletEncrypted: function(){
			return walletApi.getConfiguration("walletPasswordVerification").then(function(result){
				return result != null && result != "";
			});
		},
		getWalletPasswordVerification: function(){
			return walletApi.getConfiguration("walletPasswordVerification");
		},
		createAddress:function(request){
			return dbPromise.then(function(db){
				return new Promise(function(resolve, reject) {
			
					var dbRequest = db.transaction("addresses", "readwrite").objectStore("addresses").add({
						name: request.name,
						address: request.address,
						WIF:request.WIF,
						encryptedWIF: request.encryptedWIF
					});
					
					dbRequest.onsuccess = function(event) {
						resolve();
					};
					dbRequest.onerror = function(event) {
						reject();
					};
				});
			});
		},
		listAddresses: function(request){
			return dbPromise.then(function(db){
				return new Promise(function(resolve, reject) {
					var addressesStore = db.transaction(["addresses"], "readonly").objectStore("addresses");
					var nameIndex = addressesStore.index("by_name");
					var dbRequest = nameIndex.openCursor();

					var addresses = [];

					dbRequest.onsuccess = function(event) {

						var cursor = event.target.result;
						if (cursor) {
							addresses.push(cursor.value);
							cursor.continue();
						}
						else
						{
							resolve(addresses);
						}

						
					};
					dbRequest.onerror = function(event) {
						reject();
					};
				})
			});
		},
		getAddress: function(request){
			return dbPromise.then(function(db){
				return new Promise(function(resolve, reject) {
					var dbRequest = db.transaction(["addresses"], "readonly").objectStore("addresses").get(request.address);
					dbRequest.onsuccess = function(event) {
						resolve(event.target.result);
					};
					dbRequest.onerror = function(event) {
						reject();
					};
				});
			});
		},
		updateAddress:function(request){
			return dbPromise.then(function(db){
				return new Promise(function(resolve, reject) {

					const transaction = db.transaction(["addresses"], "readwrite")
					const addressStore = transaction.objectStore("addresses")
					const getAddressRequest = addressStore.get(request.address);


					getAddressRequest.onsuccess = (event) =>{
						addressStore.put(Object.assign({},event.target.result,request))
					};

					transaction.oncomplete = function(event) {
						resolve();
					};
					transaction.onerror = function(event) {
						reject();
					};
				});
			});
		},
		deleteAddress: function(request){
			return dbPromise.then(function(db){
				return new Promise(function(resolve, reject) {
					var dbRequest= db.transaction(["addresses"], "readwrite").objectStore("addresses").delete(request.address);
					
					dbRequest.onsuccess = function(event) {
						resolve();
					};
					dbRequest.onerror = function(event) {
						reject();
					};
				});
			});
		},
		createMasternode:function(request){
			return dbPromise.then(function(db){
				return new Promise(function(resolve, reject) {

					var dbRequest = db.transaction("masternodes", "readwrite").objectStore("masternodes").add({
						name: request.name,
						output: request.output,
						privateKey:request.privateKey,
						encryptedPrivateKey: request.encryptedPrivateKey
					});
					
					dbRequest.onsuccess = function(event) {
						resolve();
					};
					dbRequest.onerror = function(event) {
						reject();
					};
				});
			});
		},
		updateMasternode:function(request){
			return dbPromise.then(function(db){
				return new Promise(function(resolve, reject) {

					const transaction = db.transaction(["masternodes"], "readwrite")
					const masternodesStore = transaction.objectStore("masternodes")
					const getMasternodeRequest = masternodesStore.get(request.output);


					getMasternodeRequest.onsuccess = (event) =>{
						masternodesStore.put(Object.assign({},event.target.result,request))
					};

					transaction.oncomplete = function(event) {
						resolve();
					};
					transaction.onerror = function(event) {
						reject();
					};

				});
			});
		},
		listMasternodes: function(request){
			return dbPromise.then(function(db){
				return new Promise(function(resolve, reject) {
					
					var masternodesStore = db.transaction(["masternodes"], "readonly").objectStore("masternodes");
					var nameIndex = masternodesStore.index("by_name");
					var dbRequest = nameIndex.openCursor();

					var masternodes = [];

					dbRequest.onsuccess = function(event) {

						var cursor = event.target.result;
						if (cursor) {
							masternodes.push(cursor.value);
							cursor.continue();
						}
						else
						{
							resolve(masternodes);
						}

						
					};
					dbRequest.onerror = function(event) {
						reject();
					};
				});
			});
		},
		getMasternode: function(request){
			return dbPromise.then(function(db){
				return new Promise(function(resolve, reject) {
					var dbRequest = db.transaction(["masternodes"], "readonly").objectStore("masternodes").get(request.output);
					dbRequest.onsuccess = function(event) {
						resolve(event.target.result);
					};
					dbRequest.onerror = function(event) {
						reject();
					};
				});
			});
		},
		deleteMasternode: function(request){
			return dbPromise.then(function(db){
				return new Promise(function(resolve, reject) {
					var dbRequest= db.transaction(["masternodes"], "readwrite").objectStore("masternodes").delete(request.output);
					
					dbRequest.onsuccess = function(event) {
						resolve();
					};
					dbRequest.onerror = function(event) {
						reject();
					};
				});
			});
		},
		createInputLockState:function(request){
			return dbPromise.then(function(db){
				return new Promise(function(resolve, reject) {
			
					var dbRequest = db.transaction("inputLockStates", "readwrite").objectStore("inputLockStates").add({
						output: request.output,
						lockState: request.lockState
					});
					
					dbRequest.onsuccess = function(event) {
						resolve();
					};
					dbRequest.onerror = function(event) {
						reject();
					};
				});
			});
		},
		updateInputLockState:function(request){
			return dbPromise.then(function(db){
				return new Promise(function(resolve, reject) {
			
					var dbRequest = db.transaction("inputLockStates", "readwrite").objectStore("inputLockStates").put({  //TODO: this should be update not put
						output: request.output,
						lockState: request.lockState
					});
					
					dbRequest.onsuccess = function(event) {
						resolve();
					};
					dbRequest.onerror = function(event) {
						reject();
					};
				});
			});
		},
		listInputLockStates: function(request){ //TODO: the data return here should be a list, RXJS can be used to compute this to an object, data should be read as is
			return dbPromise.then(function(db){
				return new Promise(function(resolve, reject) {
					
					var dbRequest = db.transaction(["inputLockStates"], "readonly").objectStore("inputLockStates").getAll();

					dbRequest.onsuccess = function(event) {

						var result = {};
						event.target.result.forEach(lockState => {
							result[lockState.output] = lockState.lockState;
						});

						resolve(result);
					};
					dbRequest.onerror = function(event) {
						reject();
					};
				});
			});
		},
		deleteInputLockState: function(request){
			return dbPromise.then(function(db){
				return new Promise(function(resolve, reject) {
					var dbRequest= db.transaction(["inputLockStates"], "readwrite").objectStore("inputLockStates").delete(request.output);
					
					dbRequest.onsuccess = function(event) {
						resolve();
					};
					dbRequest.onerror = function(event) {
						reject();
					};
				});
			});
		},
		

		createNotification:function(notification){
			return dbPromise.then(function(db){
				return new Promise(function(resolve, reject) {
			
					var dbRequest = db.transaction("notifications", "readwrite").objectStore("notifications").add(notification);
					
					dbRequest.onsuccess = function(event) {
						resolve();
					};
					dbRequest.onerror = function(event) {
						reject();
					};
				});
			});
		},
		listNotifications: function(request){
			return dbPromise.then(function(db){
				return new Promise(function(resolve, reject) {
					var dbRequest = db.transaction(["notifications"], "readonly").objectStore("notifications").getAll();
					dbRequest.onsuccess = function(event) {
						resolve(event.target.result);
					};
					dbRequest.onerror = function(event) {
						reject();
					};
				});
			});
		},
		deleteNotification: function(id){
			return dbPromise.then(function(db){
				return new Promise(function(resolve, reject) {
					var dbRequest= db.transaction(["notifications"], "readwrite").objectStore("notifications").delete(id);
					
					dbRequest.onsuccess = function(event) {
						resolve();
					};
					dbRequest.onerror = function(event) {
						reject();
					};
				});
			});
		},
		deleteNotifications: function(request){
			return dbPromise.then(function(db){
				return new Promise(function(resolve, reject) {
					var dbRequest= db.transaction(["notifications"], "readwrite").objectStore("notifications").clear();
					
					dbRequest.onsuccess = function(event) {
						resolve();
					};
					dbRequest.onerror = function(event) {
						reject();
					};
				});
			});
		},
		encryptWallet:function(walletPasswordVerification, encryptFunc){
			return dbPromise.then(function(db){
				return new Promise(function(resolve, reject) {

					var transaction = db.transaction(["addresses","masternodes", "configuration"], "readwrite");
					var configurationStore = transaction.objectStore("configuration");
					var addressesStore = transaction.objectStore("addresses");
					var masternodesStore = transaction.objectStore("masternodes");


					var getWalletPasswordVerification = configurationStore.get("walletPasswordVerification");


					getWalletPasswordVerification.onsuccess = function(event){
						if (event.target.result != null && event.target.result.value != null && event.target.result.value != "") {
							reject("Wallet already encrypted");
							return;
						}

						configurationStore.put({id:"walletPasswordVerification", value:walletPasswordVerification});
						

						var getAllAddressesRequest = addressesStore.getAll();

						getAllAddressesRequest.onsuccess = function(event){
							event.target.result.forEach(address =>{
	
								if (address.WIF != null)
								{
									var update = {
										WIF:null,
										encryptedWIF:encryptFunc(address.WIF)
									};
									addressesStore.put(Object.assign({}, address,update))
								}
								
							})
	
						};
	
						var getAllMasternodesRequest = masternodesStore.getAll();
	
						getAllMasternodesRequest.onsuccess = function(event){
							event.target.result.forEach(masternode =>{
	
								if (masternode.privateKey != null)
								{
									var update = {
										privateKey: null,
										encryptedPrivateKey:encryptFunc(masternode.privateKey)
									};
									masternodesStore.put(Object.assign({}, masternode,update))
								}
							})
						};
	
						transaction.oncomplete = function(event) {
							resolve();
						};
						transaction.onerror = function(event) {
							reject();
						};
					}

					
					
				});
			});
		},
		decryptWallet:function(decryptFunc){
			return dbPromise.then(function(db){
				return new Promise(function(resolve, reject) {

					var transaction = db.transaction(["addresses","masternodes", "configuration"], "readwrite");
					var configurationStore = transaction.objectStore("configuration");
					var addressesStore = transaction.objectStore("addresses");
					var masternodesStore = transaction.objectStore("masternodes");

					var getWalletPasswordVerification = configurationStore.get("walletPasswordVerification");


					getWalletPasswordVerification.onsuccess = function(event){
						if (event.target.result == null || event.target.result.value == null || event.target.result.value == "") {
							reject("Wallet not encrypted");
							return;
						}

						configurationStore.put({id:"walletPasswordVerification", value:null});
						

						var getAllAddressesRequest = addressesStore.getAll();

						getAllAddressesRequest.onsuccess = function(event){
							event.target.result.forEach(address =>{
								if (address.encryptedWIF != null)
								{
									var update = {
										WIF:decryptFunc(address.encryptedWIF),
										encryptedWIF:null
									};
									addressesStore.put(Object.assign({}, address,update))
								}
							})

						};


						var getAllMasternodesRequest = masternodesStore.getAll();

						getAllMasternodesRequest.onsuccess = function(event){
							event.target.result.forEach(masternode =>{

								if (masternode.encryptedPrivateKey != null)
								{
									var update = {
										privateKey:decryptFunc(masternode.encryptedPrivateKey),
										encryptedPrivateKey:null
									};
									masternodesStore.put(Object.assign({}, masternode,update))
								}
							})
						};
					};

					transaction.oncomplete = function(event) {
						resolve();
					};
					transaction.onerror = function(event) {
						reject();
					};
					
				});
			});
		},
		importMyWalletdata: function(myWalletData){
			return dbPromise.then(function(db){
				return new Promise(function(resolve, reject) {

					const transaction = db.transaction(["configuration", "addresses","masternodes", "inputLockStates", "notifications"], "readwrite");
					const configurationStore = transaction.objectStore("configuration");
					const addressesStore = transaction.objectStore("addresses");
					const masternodesStore = transaction.objectStore("masternodes");
					const inputLockStatesStore = transaction.objectStore("inputLockStates");
					const notificationsStore = transaction.objectStore("notifications")


					const clearConfigurationeRequest = configurationStore.clear();
					const clearAddressesRequest = addressesStore.clear();
					const clearMasternodesRequest = masternodesStore.clear();
					const clearInputLockStatesRequest = inputLockStatesStore.clear();
					const clearNotificationsStoreRequest = notificationsStore.clear();

					Promise.all([
						IDBRequestToPromise(clearConfigurationeRequest),
						IDBRequestToPromise(clearAddressesRequest),
						IDBRequestToPromise(clearMasternodesRequest),
						IDBRequestToPromise(clearInputLockStatesRequest),
						IDBRequestToPromise(clearNotificationsStoreRequest)
					]).then(function(){


						configurationStore.put({id:"walletPasswordVerification", value:myWalletData.walletPasswordVerification});
						myWalletData.myAddresses.forEach(function(myAddress){
							addressesStore.add(myAddress)
						});

						myWalletData.myMasternodes.forEach(function(myMasternode){
							masternodesStore.add(myMasternode)
						});

						/*myWalletData.inputLockStates.forEach(function(inputLockState){  //TODO; once the data is stored in export in array then uncomment this code
							inputLockStatesStore.add(inputLockState)
						});*/

					}).catch(reject)
					

					transaction.oncomplete = function(event) {
						resolve();
					};
					transaction.onerror = function(event) {
						reject();
					};
					
				});
			});
		},
		clearMyWalletdata: function(){
			return dbPromise.then(function(db){
				return new Promise(function(resolve, reject) {

					const transaction = db.transaction(["configuration","addresses","masternodes", "inputLockStates", "notifications"], "readwrite");
					const configurationStore = transaction.objectStore("configuration");
					const addressesStore = transaction.objectStore("addresses");
					const masternodesStore = transaction.objectStore("masternodes");
					const inputLockStatesStore = transaction.objectStore("inputLockStates");
					const notificationsStore = transaction.objectStore("notifications")

					const clearConfigurationeRequest = configurationStore.clear();
					const clearAddressesRequest = addressesStore.clear();
					const clearMasternodesRequest = masternodesStore.clear();
					const clearInputLockStatesRequest = inputLockStatesStore.clear();
					const clearNotificationsStoreRequest = notificationsStore.clear();

				

					transaction.oncomplete = function(event) {
						resolve();
					};
					transaction.onerror = function(event) {
						reject();
					};
					
				});
			});
		}
	}

}


const IDBRequestToPromise = function(dbRequest)
{
	return new Promise(function(resolve, reject){
		dbRequest.onsuccess = resolve;
		dbRequest.onerror = reject
	});
}