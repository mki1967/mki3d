/* File operations */

mki3d.file = {};

/* load recource named identified the "path/name". 
   callback function will process the returned string. */

mki3d.file.loadResource= function( path, name, callback ){
    var url= chrome.extension.getURL(path+"/"+name);
    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange=function() {
	if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            callback(xmlhttp.responseText);
	}
    }
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}

mki3d.file.startSavingString= function( string, mySuggestedName ){
    var saver = {};
    saver.blob = new Blob([string], {type: 'text/plain'}); 
    saver.config = {type: 'saveFile', suggestedName: mySuggestedName  };
    saver.errorHandler = function(e) { console.error(e); }; 
    saver.savingEndHandler= mki3d.file.savingEndHandler;
    saver.writeEndHandler =   function(e){
	mki3d.file.savingEndHandler(saver); 
    };
    chrome.fileSystem.chooseEntry(saver.config, function(writableEntry){ mki3d.file.saveChooseEntryCallback(writableEntry, saver); });
}


mki3d.file.copyResourceToFile= function(path, name){
    mki3d.file.loadResource( path, name, function( data ) { mki3d.file.startSavingString(data,name); } );
}



/* default suggested name for data saving */
mki3d.file.suggestedName = "noname";

mki3d.file.withoutExtenstion= function( name ){
    var lastIdx = name.lastIndexOf(".");
    if(lastIdx<=0) return name;
    return name.substring(0, lastIdx );
}

/* EXPORTING */

mki3d.file.startExporting = function () {
    var saver = {};

    /* clean data from temporratry markers */
    mki3d.action.cancelSelection();
    /* unique-sort elements of the model */
    mki3d.modelSortUnique();

    /* prepare exported data */
    mki3d.loadModel(); // refresh mki3d.tmp.exported buffers
    mki3d.tmp.exported.view =mki3d.data.view;
    mki3d.tmp.exported.projection =mki3d.data.projection;
    mki3d.tmp.exported.backgroundColor=mki3d.data.backgroundColor;

    var dataString = JSON.stringify(mki3d.tmp.exported);
    var htmlString = mki3d.template.exportedHtml.replace("{/* replace */}",dataString);
    saver.blob = new Blob([htmlString], {type: 'text/plain'}); 
    saver.config = {type: 'saveFile', suggestedName: mki3d.file.suggestedName.concat(".html")  };
    saver.errorHandler = function(e) { console.error(e); }; 
    //    saver.savingEndHandler= savingEndHandler;
    saver.savingEndHandler= mki3d.file.savingEndHandler;
    saver.writeEndHandler =   function(e){
	// console.log(e); // for tests..
	mki3d.file.savingEndHandler(saver); 
    };
    chrome.fileSystem.chooseEntry(saver.config, function(writableEntry){ mki3d.file.saveChooseEntryCallback(writableEntry, saver); });
}


/* SAVING */

mki3d.file.startSaving = function () {
    var saver = {};

    /* clean data from temporratry markers */
    mki3d.action.cancelSelection();
    /* unique-sort elements of the model */
    mki3d.modelSortUnique();



    var myObjectString = JSON.stringify(mki3d.data);
    saver.blob = new Blob([myObjectString], {type: 'text/plain'}); 
    saver.config = {type: 'saveFile', suggestedName: mki3d.file.suggestedName.concat(".mki3d")   };
    saver.errorHandler = function(e) { console.error(e); }; 
    //    saver.savingEndHandler= savingEndHandler;
    saver.savingEndHandler= mki3d.file.savingEndHandler;
    saver.writeEndHandler =   function(e){
	// console.log(e); // for tests..
	mki3d.file.savingEndHandler(saver); 
    };
    chrome.fileSystem.chooseEntry(saver.config, function(writableEntry){ mki3d.file.saveChooseEntryCallback(writableEntry, saver); });
}

mki3d.file.saveChooseEntryCallback= function  (writableEntry, saver) {
    saver.entry = writableEntry;
    if (!writableEntry) {
	console.log( 'Nothing selected.');
	saver.savingEndHandler(saver); 
	return;
    }
    chrome.fileSystem.getDisplayPath(writableEntry, function (displayPath) { 
	// console.log(displayPath);  
        mki3d.file.suggestedName= mki3d.file.withoutExtension(displayPath);
    }
				    );
    writableEntry.createWriter(function(writer){ mki3d.file.writerCallback(writer,saver); });	
}

/* function waitForIO from: 
   https://github.com/GoogleChrome/chrome-app-samples/blob/master/samples/filesystem-access/js/app.js
*/ 

function waitForIO(writer, callback) {
    // set a watchdog to avoid eventual locking:
    var start = Date.now();
    // wait for a few seconds
    var reentrant = function() {
	if (writer.readyState===writer.WRITING && Date.now()-start<4000) {
	    setTimeout(reentrant, 100);
	    return;
	}
	if (writer.readyState===writer.WRITING) {
	    console.error("Write operation taking too long, aborting!"+
			  " (current writer readyState is "+writer.readyState+")");
	    writer.abort();
	} 
	else {
	    callback();
	}
    };
    setTimeout(reentrant, 100);
}



mki3d.file.writerCallback= function (writer, saver) {
    saver.writer=writer;
    writer.onerror = saver.errorHandler;
    writer.onwriteend = saver.writeEndHandler;
    writer.truncate(saver.blob.size);
    /*
      writer.seek(0);
      writer.write(saver.blob);
    */
    waitForIO(writer, function() {
        writer.seek(0);
        writer.write(saver.blob);
    });

}

mki3d.file.savingEndHandler=   function (saver){
    // console.log(saver); // for tests ...
    mki3d.action.escapeToCanvas();
} 

/* LOADING */

mki3d.file.loadingEndHandler = function (loader){
    if(loader.loadedObject) {
	// console.log(loader.loadedObject); // for tests ...
	mki3d.data = loader.loadedObject; // dangerous !!!
        mki3d.tmpCancel();
	mki3d.setModelViewMatrix();
	mki3d.action.escapeToCanvas(); 
    }
} 

mki3d.file.startLoading = function ( ) {
    var myAccepts = [{
	//	mimeTypes: ['text/*'],
	extensions: ['mki3d']
    }];
    
    var loader = {};

    loader.loadingEndHandler = mki3d.file.loadingEndHandler;
    loader.loadHandler = function(e) { // processing of the result

	var myObjectString = e.target.result;
	loader.loadedObject = JSON.parse(myObjectString);
    };

    loader.loadEndHandler = function(e) { 
	// console.log(e);  // for tests ...
	mki3d.file.loadingEndHandler(loader); // process load
    }
    loader.errorHandler = function(e) { console.error(e); }; 

    loader.config = {type: 'openFile', accepts: myAccepts };
    chrome.fileSystem.chooseEntry(loader.config, function(theEntry) { mki3d.file.loadChooseEntryCallback(theEntry, loader); }); 
    
}



mki3d.file.loadChooseEntryCallback = function (theEntry, loader) {
    if (!theEntry) {
	console.log('No file selected.');
        loader.canceled = true;
	loader.loadingEndHandler( loader );
	return;
    }
    ////
    chrome.fileSystem.getDisplayPath(theEntry, function (displayPath) { 
	// console.log(displayPath);  
        mki3d.file.suggestedName= mki3d.file.withoutExtenstion(displayPath);
    }
				    );

    theEntry.file( function(file) { mki3d.file.loadFileCallback(file, loader); });
}

mki3d.file.loadFileCallback = function (file, loader) {
    var reader = new FileReader();

    reader.onerror = loader.errorHandler;
    reader.onload = loader.loadHandler;
    reader.onloadend = loader.loadEndHandler;

    reader.readAsText(file);
}
