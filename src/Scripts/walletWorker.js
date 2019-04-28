export default () => {
	/*
	self.window = {};
	self.importScripts("bitcoinjs.js?6");

	self.bitcoin = window.bitcoin;

	var Chaincoin = {
		messagePrefix: 'DarkCoin Signed Message:\n',
		bip32: {
		public: 0x02FE52F8,
		private: 0x02FE52CC
		},
		pubKeyHash: 0x1C,
		scriptHash: 0x04,
		wif: 0x9C
	}*/
		
	var databaseVersion = 2;
	var databaseName = "Wallet";
		
	var databaseOpenState = {
		none: 0,
		opening: 1,
		open: 2,
		
		failed: 99
	}

	var databaseOpen = databaseOpenState.none;
	var dbPromise = null;


	var processRequest = function(e, postMessage) {
			
			var request = e.data;
			
			var method = functions[request.op];
			
			var response = {
				id: request.id,
				op: request.op,
				success: false
			};
			
			if (method != null){
				var promise = method(request);
				promise.then(function(data){
					response.success = true;
					response.data = data;
					postMessage(response);
				});
				
				promise.catch(function(error){
					response.error = error;
					postMessage(response);
				});
			}
			else{
				postMessage(response);
			}

		}

	

	if (addEventListener != null) // eslint-disable-line no-restricted-globals
	{
		addEventListener('message', function(e){ // eslint-disable-line no-restricted-globals
			processRequest(e,postMessage);
		});
	}






	dbPromise = new Promise(function(resolve, reject){
		
		var _indexedDB = indexedDB || mozIndexedDB || webkitIndexedDB || msIndexedDB; // eslint-disable-line no-undef
		var openRequest = _indexedDB.open(databaseName, 7);
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

				if (masternodesObjectStore.indexNames.contains("by_name") == false) masternodesObjectStore.createIndex("by_name", "name");

				var addressesObjectStore = null;
				if (db.objectStoreNames.contains("addresses") == false) addressesObjectStore = db.createObjectStore("addresses", { keyPath: "address", unique: true });
				else addressesObjectStore = transaction.objectStore("addresses");

				if (addressesObjectStore.indexNames.contains("by_name") == false) addressesObjectStore.createIndex("by_name", "name");

			}
			
			
		};
		
	});




	var functions = {
		createAddress:function(request){
			return dbPromise.then(function(db){
				return new Promise(function(resolve, reject) {
			
					var dbRequest = db.transaction("addresses", "readwrite").objectStore("addresses").add({
						name: request.name,
						address: request.address,
						WIF:request.WIF
					});
					
					dbRequest.onsuccess = function(event) {
						resolve();
						sendEvent("addedAddress");
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
					var dbRequest = db.transaction(["addresses"], "readonly").objectStore("addresses").getAll();
					dbRequest.onsuccess = function(event) {
						resolve(event.target.result);
					};
					dbRequest.onerror = function(event) {
						reject();
					};
				});
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
		deleteAddress: function(request){
			return dbPromise.then(function(db){
				return new Promise(function(resolve, reject) {
					var dbRequest= db.transaction(["addresses"], "readwrite").objectStore("addresses").delete(request.address);
					
					dbRequest.onsuccess = function(event) {
						resolve();
						sendEvent("deletedAddress");
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
						privateKey:request.privateKey
					});
					
					dbRequest.onsuccess = function(event) {
						resolve();
						sendEvent("addedMasternode");
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
						sendEvent("deletedMasternode");
					};
					dbRequest.onerror = function(event) {
						reject();
					};
				});
			});
		}
	}

	var sendEvent = function(event, data){

		postMessage({
			event: event,
			data:data
		});
	
	}

}



