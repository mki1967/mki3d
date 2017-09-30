mki3d.idb={} // object related to IndexedDB

if (!window.indexedDB) {
    console.log("Your browser doesn't support a stable version of IndexedDB.");
} else {
    console.log("Your browser supports a stable version of IndexedDB.");
}


mkid.idb.onupgradeneeded = function( event ) {
    // PODSTAWIAĆ JAKO CALLBACK DO REQUEST ...
    
    // PRZEROBIĆ:
    var db = event.target.result;

    // Create an objectStore for this database
    var objectStore = db.createObjectStore("name", { keyPath: "myKey" });

}

