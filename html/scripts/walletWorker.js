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
  wif: 0x80
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

onconnect = function(e) {
  var port = e.ports[0];

  port.addEventListener('message', function(e){
	  processRequest(e,port.postMessage);
  });

  port.start(); // Required when using addEventListener. Otherwise called implicitly by onmessage setter.
  
  debugger;
};

if (addEventListener != null)
{
	addEventListener('message', function(e){
	  processRequest(e,postMessage);
  });
}






dbPromise = new Promise(function(resolve, reject){
	
	var _indexedDB = indexedDB || mozIndexedDB || webkitIndexedDB || msIndexedDB;
	var openRequest = _indexedDB.open(databaseName, 4);
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
		var db = event.target.result;
				
		if (event.oldVersion < 1) {
			var addressesObjectStore = db.createObjectStore("addresses", { keyPath: "address", unique: true });
		}

		if (event.oldVersion < 2) {
			var masternodesObjectStore = db.createObjectStore("masternodes", { keyPath: "output", unique: true });
		}
		
		if (event.oldVersion < 4) {
			var masternodesObjectStore = openRequest.transaction.objectStore("masternodes");
			var masternodesNameIndex = masternodesObjectStore.createIndex("by_name", "name");

			var addressesObjectStore = openRequest.transaction.objectStore("addresses");
			var addressesNameIndex = addressesObjectStore.createIndex("by_name", "name");
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
					privateKey:request.privateKey
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
				var dbRequest = db.transaction(["masternodes"], "readonly").objectStore("masternodes").getAll();
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
	}
}