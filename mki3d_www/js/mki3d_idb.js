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
    if(!db.objectStoreNames.contains("files")) {
	var os = db.createObjectStore("files", {keyPath: 'id', autoIncrement:true});
	os.createIndex("date", "date", {unique:false});
    }

}

mki3d.idb.remove = function( id , onsuccess){
    var request = mki3d.idb.db.transaction(["files"], "readwrite")
                .objectStore("files")
                .delete(id);
    request.onsuccess = function(event) {
	console.log(event);
	if( onsuccess ) onsuccess(event);
    };
    request.onerror = function(event) {
	// Handle errors.
	console.log(event);
    };
}

mki3d.idb.dataBackup=null;

mki3d.idb.oldIdx=null;

mki3d.idb.removeIndexed= function(){
    if( mki3d.idb.filesIdx >= 0 &&  mki3d.idb.filesIdx< mki3d.idb.filesFound.length){
	var item = mki3d.idb.filesFound[mki3d.idb.filesIdx];
	var onsuccess = function( event ) {
	    mki3d.idb.oldIdx = mki3d.idb.filesIdx;
	    mki3d.idb.findFiles( mki3d.idb.findFilesFinalFunction  );
	    mki3d.toast("REMOVED '"+item.name+"' (DATE: '"+item.date+"') FROM DATA-BASE !!!", 4000);
	}
	mki3d.idb.remove( item.id, onsuccess ); // remove the indexed entry
    }    
}

mki3d.idb.mergeIndexed= function(onsuccess){
    if( mki3d.idb.filesIdx >= 0 &&  mki3d.idb.filesIdx< mki3d.idb.filesFound.length){
	var id= mki3d.idb.filesFound[mki3d.idb.filesIdx].id;
	mki3d.idb.db.transaction(["files"]).objectStore("files").get(id).onsuccess = function(event) {
	    console.log( event );
	    if(  event.target.result) {
		mki3d.idb.restoreTmp();
		mki3d.setModelViewMatrix();
		mki3d.setProjectionMatrix();
		var data= JSON.parse( event.target.result.dataString);
		//// mki3d_merge_data( data ); ///
		// new way of merging - TO BE TESTED ...
		mki3d_texture.deleteTextureGlObjects( mki3d.data, mki3d.gl.context ); // remove GL objects of old data
		mki3d.mergeData(mki3d.data, data );
		mki3d_texture.makeGlInTextures(mki3d.data, mki3d.shadeFactor, mki3d.gl.context, mki3d.gl.compileAndLinkShaderProgram ); // make GL objects for loaded data
		mki3d.tmpRebuildSelected();
		///
		mki3d.action.escapeToCanvas();
		mki3d.messageAppend("<br>MERGED '" +mki3d.idb.filesFound[mki3d.idb.filesIdx].name
			     +"' (DATE: '"+mki3d.idb.filesFound[mki3d.idb.filesIdx].date+"') !!!");
		mki3d.redraw();
	    }
	
	}
    }
}

mki3d.idb.loadIndexed= function(onsuccess){
    if( mki3d.idb.filesIdx >= 0 &&  mki3d.idb.filesIdx< mki3d.idb.filesFound.length){
	var id= mki3d.idb.filesFound[mki3d.idb.filesIdx].id;
	mki3d.idb.db.transaction(["files"]).objectStore("files").get(id).onsuccess = function(event) {
	    console.log( event );
	    if(  event.target.result) {
		mki3d.idb.restoreTmp();
		/// changing mki3d.data
		mki3d_texture.deleteTextureGlObjects( mki3d.data, mki3d.gl.context ); // remove GL objects of old data
		mki3d.data= JSON.parse( event.target.result.dataString);
		mki3d_texture.makeGlInTextures(mki3d.data, mki3d.shadeFactor, mki3d.gl.context, mki3d.gl.compileAndLinkShaderProgram ); // make GL objects for loaded data
		///
		mki3d.tmpCancel();
		mki3d.setModelViewMatrix();
		mki3d.setProjectionMatrix();
		mki3d.action.escapeToCanvas();
		mki3d.file.suggestedName=mki3d.idb.filesFound[mki3d.idb.filesIdx].name;
		mki3d.messageAppend("<br>LOADED '" +mki3d.idb.filesFound[mki3d.idb.filesIdx].name
			     +"' (DATE: '"+mki3d.idb.filesFound[mki3d.idb.filesIdx].date+"') !!!");
		mki3d.redraw();
	    }
	
	}
    }
}

mki3d.idb.tmpLoad = function( id ){
    if(mki3d.idb.dataBackup == null) { // only once for the original edited data
	mki3d.idb.dataBackup=mki3d.data;
    }
    
    mki3d.idb.db.transaction(["files"]).objectStore("files").get(id).onsuccess = function(event) {
	console.log( event );
	if(  event.target.result) {
	    /// changing mki3d.data
	    mki3d_texture.deleteTextureGlObjects( mki3d.data, mki3d.gl.context ); // remove GL objects of old data
	    mki3d.data= JSON.parse( event.target.result.dataString);
	    mki3d_texture.makeGlInTextures(mki3d.data, mki3d.shadeFactor, mki3d.gl.context, mki3d.gl.compileAndLinkShaderProgram ); // make GL objects for loaded data
	    ///
            mki3d.tmpCancel();
	    mki3d.setModelViewMatrix();
	    mki3d.setProjectionMatrix();
	    mki3d.redraw();
	}
    };
    
}

mki3d.idb.tmpLoadIndexed = function() {
    if( mki3d.idb.filesIdx >= 0 &&  mki3d.idb.filesIdx< mki3d.idb.filesFound.length)
	mki3d.idb.tmpLoad( mki3d.idb.filesFound[mki3d.idb.filesIdx].id ); // load the last one if exists
}

mki3d.idb.restoreTmp = function() {
    if( mki3d.idb.dataBackup == null ) return; // nothing to be restored
    /// changing mki3d.data
    mki3d_texture.deleteTextureGlObjects( mki3d.data, mki3d.gl.context ); // remove GL objects of old data
    mki3d.data =  mki3d.idb.dataBackup;
    mki3d_texture.makeGlInTextures(mki3d.data, mki3d.shadeFactor, mki3d.gl.context, mki3d.gl.compileAndLinkShaderProgram ); // make GL objects for loaded data
    ///
    mki3d.tmpCancel();
    mki3d.setModelViewMatrix();
    mki3d.setProjectionMatrix();
    mki3d.redraw();
    mki3d.idb.dataBackup= null;
}


mki3d.idb.filesFound= [];
mki3d.idb.filesIdx= -1;

mki3d.idb.findFilesFinalFunction = function() {
    var len = mki3d.idb.filesFound.length;
    if( mki3d.idb.oldIdx !=null && len>0 ) {
	mki3d.idb.filesIdx= (mki3d.idb.oldIdx + len -1) %  len;
	mki3d.idb.oldIdx = null;
    } else
	mki3d.idb.filesIdx = len-1;
    mki3d.idb.tmpLoadIndexed(); // load the indexed one if exists
    mki3d.html.divUpperMessage.innerHTML =   document.querySelector("#divInspectIDBMenu").innerHTML ;
    mki3d.idb.fillIDBSpans();	
    
    /// add below ...
    window.onkeydown = mki3d.callback.inspectIDBMenuOnKeyDown;
}

mki3d.idb.findFiles= function( finalFunction ) {
    /*
      finalFunction - function called with the event argument after request.onsuccess
     */
    /* 
       REMADE FROM EXAMPLE:
       https://static.raymondcamden.com/demos/2013/jun/6/test1.html
    */

    var fromDate = mki3d.idb.filter.fromDate;
    var toDate = mki3d.idb.filter.toDate;
    var substring = mki3d.idb.filter.substring;
    var range=null;


    // console.log('doSearch',fromDate,toDate);
    var transaction = mki3d.idb.db.transaction(["files"],"readonly");
    var store = transaction.objectStore("files");
    var index = store.index("date");

    if(fromDate != "") fromDate = new Date(fromDate);
    if(toDate != "") toDate = new Date(toDate);
    
    if(fromDate != "" && toDate != "") {
	range = IDBKeyRange.bound(fromDate, toDate);
    } else if(toDate != "") {
	range = IDBKeyRange.upperBound(toDate);
    } else if(fromDate != "") {
	range = IDBKeyRange.lowerBound(fromDate);
    }

    mki3d.idb.filesFound= [];
    console.dir(range); /// test

    var request=index.openCursor(range);

    mki3d.idb.filesFound.finalFunction = finalFunction; // the function to be called when mki3d.idb.filesFound is complete
    
    request.onsuccess = function(e) {
	var cursor = e.target.result;
        console.log('got something');
	if(cursor) { // anything more found ...
	    var name =  cursor.value['name']
	    if(  name.includes(substring) ) { // substring filter ...
		item= {} ;
		item.id =  cursor.value['id'];
		item.date = cursor.value['date'];
		item.name = name;
		mki3d.idb.filesFound.push(item);
	    }
	    cursor.continue();
	} else {
	    if(  mki3d.idb.filesFound.finalFunction ) mki3d.idb.filesFound.finalFunction( e );
	}
    }

}


mki3d.idb.dbName = "mki3d" // name of the database


mki3d.idb.openDB = function( onsuccessFunction, onerrorFunction ){
    /* 
       onsuccessFunction - function to be called on success with event as parametr 
       onerrorFunction - function to be called on error with event as parametr 
     */
    var request = indexedDB.open(mki3d.idb.dbName);

    request.onsuccessFunction=onsuccessFunction;
    request.onerrorFunction=onerrorFunction;
    
    request.onupgradeneeded = mki3d.idb.onupgradeneeded;
    
    request.onerror = function( event) {
	console.log( event );
	if( this.onerrorFunction ) this.onerrorFunction( event );
    };
    
    request.onsuccess = function( event ) {
	mki3d.idb.db = event.target.result;
	console.log( event );
	if( this.onsuccessFunction )  this.onsuccessFunction( event );
    };

}

mki3d.idb.prepareItem= function(){
    var item = {}
    item.name = mki3d.file.suggestedName.repeat(1); // copy
    item.date = new Date();
    item.dataString = JSON.stringify(mki3d.data);
    return item;
}

mki3d.idb.addToIDB= function(){
    var item=  mki3d.idb.prepareItem() 
    mki3d.idb.db.transaction(["files"],"readwrite").objectStore("files").add(item);
    return "</br>'"+item.name+"' ADDED TO DATA BASE (DATE: '"+item.date+"')";
}

mki3d.idb.fillIDBSpans= function() {
    document.querySelector("#spanIDBTotal").innerHTML= mki3d.idb.filesFound.length;
    document.querySelector("#spanIDBIndex").innerHTML= mki3d.idb.filesIdx;
    document.querySelector("#spanIDBFromDate").innerHTML= mki3d.idb.filter.fromDate ;
    document.querySelector("#spanIDBToDate").innerHTML= mki3d.idb.filter.toDate ;
    document.querySelector("#spanIDBNameSubString").innerHTML= mki3d.idb.filter.substring ;
    if(  0 <= mki3d.idb.filesIdx && mki3d.idb.filesIdx <  mki3d.idb.filesFound.length ){
	document.querySelector("#spanIDBName").innerHTML= mki3d.idb.filesFound[ mki3d.idb.filesIdx].name;
	document.querySelector("#spanIDBDate").innerHTML= mki3d.idb.filesFound[ mki3d.idb.filesIdx].date;
    } else {
	document.querySelector("#spanIDBName").innerHTML= "";
	document.querySelector("#spanIDBDate").innerHTML= "";
    }
}

mki3d.idb.filter = {}; // object containing scanning filters
mki3d.idb.filter.substring = ""; // name substring
mki3d.idb.filter.fromDate = ""; // lower bound for date range
mki3d.idb.filter.toDate = ""; // upper bound for date range

mki3d.idb.readFilters= function(){
    mki3d.idb.filter.fromDate = document.querySelector("#inputIDBFromDate").value;
    mki3d.idb.filter.toDate = document.querySelector("#inputIDBToDate").value;
    mki3d.idb.filter.substring  = document.querySelector("#inputIDBNameSubString").value;
}

mki3d.idb.initFilters= function(){
    document.querySelector("#inputIDBFromDate").value = mki3d.idb.filter.fromDate;
    document.querySelector("#inputIDBToDate").value = mki3d.idb.filter.toDate;
    document.querySelector("#inputIDBNameSubString").value = mki3d.idb.filter.substring;
}

