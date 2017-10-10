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
    
    // Create an objectStore and date as its index 
    if(!thisDB.objectStoreNames.contains("files")) {
	var os = thisDB.createObjectStore("files", {keyPath: 'key', autoIncrement:true});
	os.createIndex("date", "", {unique:false});
    }

}

mki3d.idb.filesFound= [];

mki3d.idb.findFiles= function() {
    /* 
       REMADE FROM EXAMPLE:
       https://static.raymondcamden.com/demos/2013/jun/6/test1.html
    */
    var fromDate = document.querySelector("#inputIDBFromDate").value;
    var toDate = document.querySelector("#inputIDBToDate").value;
    var substring = document.querySelector("#inputIDBNameSubString").value;
    var range=null;

    if(fromDate == "" && toDate == "") return;

    // console.log('doSearch',fromDate,toDate);
    var transaction = db.transaction(["files"],"readonly");
    var store = transaction.objectStore("files");
    var index = store.index("date");

    if(fromDate != "") fromDate = new Date(fromDate);
    if(toDate != "") toDate = new Date(toDate);
    
    if(fromDate != "" && toDate != "") {
	range = IDBKeyRange.bound(fromDate, toDate);
    } else if(fromDate == "") {
	range = IDBKeyRange.upperBound(toDate);
    } else if(toDate == "") {
	range = IDBKeyRange.lowerBound(fromDate);
    }

    mki3d.idb.filesFound= [];
    console.dir(range); /// test
    
    index.openCursor(range).onsuccess = function(e) {
	var cursor = e.target.result;
        console.log('got something');
	var name =  cursor.value['name']
	if(cursor) && ( name.includes(substring) ) {
	    item= {} ;
	    item.key = cursor.key;
	    item.date = cursor.value['date'];
	    item.name = name;
	    mki3d.idb.filesFound.push(item);
	    cursor.continue();
	}
    }

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

mki3d.idb.prepareItem= function(){
    var item = {}
    item.name = mki3d.file.suggestedName.repeat(1); // copy
    item.date = new Date();
    item.dataString = JSON.stringify(mki3d.data);
    return item;
}

