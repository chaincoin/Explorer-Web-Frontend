

var walletApi = null;

{
	var databaseVersion = 10;
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
		var openRequest = _indexedDB.open(databaseName, 10);
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

		};
		
	});




	walletApi = {
		isWalletEncrypted: function(){
			const walletPasswordVerification = window.localStorage["walletPasswordVerification"];
			return walletPasswordVerification != null  && walletPasswordVerification != "";
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
			
					var dbRequest = db.transaction("addresses", "readwrite").objectStore("addresses").put({
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
			
					var dbRequest = db.transaction("masternodes", "readwrite").objectStore("masternodes").put({
						name: request.name,
						output:request.output,
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
		listInputLockStates: function(request){
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
		}
	}

}
