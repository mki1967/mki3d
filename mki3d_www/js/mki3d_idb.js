mki3d.idb={} // object related to IndexedDB

if (!window.indexedDB) {
    console.log("Your browser doesn't support a stable version of IndexedDB.");
} else {
    console.log("Your browser supports a stable version of IndexedDB.");
}


mki3d.idb.onupgradeneeded = function( event ) {
    // PODSTAWIAĆ JAKO CALLBACK DO REQUEST ...
    
    // PRZEROBIĆ:
    var db = event.target.result;

    // Create an objectStore for this database
    var objectStore = db.createObjectStore("files", {keyPath: 'id', autoIncrement:true});

}

mki3d.idb.dbName = "mki3d" // name of the database


mki3d.idb.openDB = function( ){
    var request = indexedDB.open(mki3d.idb.dbName);
    
    request.onupgradeneeded = mki3d.idb.onupgradeneeded;
    
    request.onerror = function( event) {
	console.log( event );
    };
    
    request.onsuccess = function( event ) {
	mki3d.idb.db = event.target.result;
    };

}
