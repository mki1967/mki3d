/*** File operations ***/

mki3d.file = {};


mki3d.file.startSavingString= function( string, mySuggestedName ){
    var saver = {};
    saver.blob = new Blob([string], {type: 'text/plain'}); 
    saver.config = {
	type: 'saveFile', 
	suggestedName: mySuggestedName,	
    };
    saver.errorHandler = function(e) { console.error(e); }; 
    saver.savingEndHandler= mki3d.file.savingEndHandler;
    saver.writeEndHandler =   function(e){
	mki3d.file.savingEndHandler(saver); 
    };
    try{
	chrome.fileSystem.chooseEntry(saver.config, function(writableEntry){ mki3d.file.saveChooseEntryCallback(writableEntry, saver); });
    } catch( err ) {
	// console.log(err);
	// alert(err);

	// to do: set the contents of text area ...
	mki3d.html.textareaOutput.value= string;
	mki3d.action.textSave();
    }
}


mki3d.file.copyResourceToFile= function(path, name){
    mki3d.file.loadResource( path, name, function( data ) { mki3d.file.startSavingString(data,name); } );
}



/* default suggested name for data saving */
mki3d.file.suggestedName = "noname";

/* next suggested name from file chooser after loading to text area */
mki3d.file.selectedName="noname";

/* get the name without extension */
mki3d.file.withoutExtension= function( name ){
    var lastIdx = name.lastIndexOf(".");
    if(lastIdx<=0) return name;
    return name.substring(0, lastIdx );
}

/** EXPORTING **/

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

    if( mki3d.stereo.mode )  mki3d.tmp.exported.stereo = mki3d.stereo; // exporting in stereo mode

    var dataString = JSON.stringify(mki3d.tmp.exported);
    var htmlString = mki3d.template.exportedHtml.replace("{/* replace */}",dataString);
    saver.blob = new Blob([htmlString], {type: 'text/plain'}); 
    saver.config = {type: 'saveFile', suggestedName: mki3d.file.suggestedName.concat(".html")  };
    saver.errorHandler = function(e) { console.error(e); }; 
    saver.savingEndHandler= mki3d.file.savingEndHandler;
    saver.writeEndHandler =   function(e){
	// console.log(e); // for tests..
	mki3d.file.savingEndHandler(saver); 
    };
    try{
	chrome.fileSystem.chooseEntry(saver.config, function(writableEntry){ mki3d.file.saveChooseEntryCallback(writableEntry, saver); });
    } catch( err ) {
	// console.log(err);
	// alert(err);
	mki3d.html.textareaOutput.value=  htmlString;
	mki3d.saveInfo("Exporting to '*.html'");
	mki3d.saveName(mki3d.file.suggestedName.concat(".html"));
	mki3d.action.textSave(mki3d.file.suggestedName.concat(".html"));
    }

}


/** COOLADA **/
mki3d.file.exportCollada= function(){
    /* clean data from temporratry markers */
    mki3d.action.cancelSelection();
    /* unique-sort elements of the model */
    mki3d.modelSortUnique();
    mki3d.html.textareaOutput.value= mki3d_collada_export();
    mki3d.saveInfo("Exporting to COLLADA '*.dae'");
    mki3d.saveName(mki3d.file.suggestedName.concat(".dae"));
    mki3d.action.textSave(mki3d.file.suggestedName.concat(".dae"));
}

/** PLY **/
mki3d.file.exportPly= function(){
    /* clean data from temporratry markers */
    mki3d.action.cancelSelection();
    /* unique-sort elements of the model */
    mki3d.modelSortUnique();
    mki3d.html.textareaOutput.value= mki3d_ply();
    mki3d.saveInfo("Exporting to PLY '*.ply'");
    mki3d.saveName(mki3d.file.suggestedName.concat(".ply"));
    mki3d.action.textSave(mki3d.file.suggestedName.concat(".ply"));
}


/** SAVING **/

mki3d.file.startSaving = function () {
    var saver = {};

    /* clean data from temporratry markers */
    mki3d.action.cancelSelection();
    /* unique-sort elements of the model */
    mki3d.modelSortUnique();



    var myObjectString = JSON.stringify(mki3d.data);
    saver.blob = new Blob([myObjectString], {type: 'text/plain'}); 
    saver.config = {
	type: 'saveFile', 
	suggestedName: mki3d.file.suggestedName.concat(".mki3d"), 
	accepts: [{
	    extensions: ['mki3d']
	}]
    };
    
    saver.errorHandler = function(e) { console.error(e); }; 
    saver.savingEndHandler= mki3d.file.savingEndHandler;
    saver.writeEndHandler =   function(e){
	// console.log(e); // for tests..
	mki3d.file.savingEndHandler(saver); 
    };
    try{
	chrome.fileSystem.chooseEntry(saver.config, function(writableEntry){ mki3d.file.saveChooseEntryCallback(writableEntry, saver); });
    } catch( err ) {
	// console.log(err);
	// alert(err);
	mki3d.html.textareaOutput.value= myObjectString;
	mki3d.saveInfo("Saving to '*.mki3d'");
	mki3d.saveName(mki3d.file.suggestedName.concat(".mki3d"));
	mki3d.action.textSave(mki3d.file.suggestedName.concat(".mki3d"));
    }

}

mki3d.file.saveChooseEntryCallback= function  (writableEntry, saver) {
    saver.entry = writableEntry;
    if (chrome.runtime.lastError || !writableEntry) {
	console.log( 'Nothing selected.');
	mki3d.action.escapeToCanvas();
	mki3d.messageAppend("<br> NOTHING SAVED !!! (NO FILE NAME SELECTED)");
	return;
    }
    chrome.fileSystem.getDisplayPath(writableEntry, function (displayPath) { 
	// console.log(displayPath);  
        mki3d.file.selectedName= displayPath;
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
    mki3d.messageAppend("<br> SAVED TO FILE: "+mki3d.file.selectedName);
    mki3d.file.suggestedName= mki3d.file.withoutExtension(mki3d.file.selectedName); // what after exporting ?
} 


/** MERGING **/

mki3d_merge_data= function( data ) {
        mki3d.tmpCancel();
        mki3d.tmpCancel();
	mki3d.action.cancelSelection();
	mki3d.tmp.merged = data; // dangerous !!!
	mki3d.compressSetIndexes( mki3d.data );
	mki3d.compressSetIndexes( mki3d.tmp.merged );
	var setIdxShift= mki3d.getMaxSetIndex(mki3d.data.model)+1;
	var mergedSegments= mki3d.tmp.merged.model.segments;
	var mergedTriangles= mki3d.tmp.merged.model.triangles;
	var mergedEndpoints=mki3d.getEndpointsOfElements( mergedSegments.concat( mergedTriangles ) );
	var i;
	for(i=0; i<mergedEndpoints.length; i++) {
	    mergedEndpoints[i].set += setIdxShift; // shift set indexes
	    mergedEndpoints[i].selected = true; // select the merged endpoints
	}
	mki3d.data.model.segments = mki3d.data.model.segments.concat( mergedSegments );
	mki3d.data.model.triangles = mki3d.data.model.triangles.concat( mergedTriangles );
	mki3d.tmpRebuildSelected();
	mki3d.setModelViewMatrix(); // ?
	mki3d.backup();
}

mki3d.file.mergingEndHandler = function (loader){
    if(loader.loadedObject) {
	// start
	// console.log(loader.loadedObject); // for tests ...
	mki3d_merge_data( loader.loadedObject) ;
	// end
	mki3d.action.escapeToCanvas(); 
	mki3d.messageAppend("<br> MERGED AND SELECTED "
			    +mergedSegments.length+" SEGMENTS AND "
			    + mergedTriangles.length+" TRIANGLES FROM: "
			    + mki3d.file.selectedName
			   ); 
    }
} 

mki3d.file.startMerging = function ( ) {
    var myAccepts = [{
	//	mimeTypes: ['text/*'],
	extensions: ['mki3d']
    }];
    
    var loader = {};

    loader.loadHandler = function(e) { // processing of the result

	var myObjectString = e.target.result;
	loader.loadedObject = JSON.parse(myObjectString);
    };

    loader.loadEndHandler = function(e) { 
	// console.log(e);  // for tests ...
	mki3d.file.mergingEndHandler(loader); // process merged data
    }
    loader.errorHandler = function(e) { console.error(e); }; 

    loader.config = {type: 'openFile', accepts: myAccepts };
    try{
	chrome.fileSystem.chooseEntry(loader.config, function(theEntry) { mki3d.file.loadChooseEntryCallback(theEntry, loader); }); 
    } catch( err ) {
	// console.log(err);
	// alert(err);
	// set callback to consume textarea
	mki3d.textLoadConsume= function(){
	    var data= JSON.parse(mki3d.html.textareaInput.value);
	    // to do: test data consistency ...
	    mki3d_merge_data(data);
	    // console.log(data); /// for tests
	}
	mki3d.loadInfo("Merging from '*.mki3d'");
	mki3d.html.textareaInput.value=""; // clean input text area ?
	mki3d.action.textLoad('.mki3d');
    }
}




/** LOADING **/

mki3d.file.loadingEndHandler = function (loader){
    if(loader.loadedObject) {
	// console.log(loader.loadedObject); // for tests ...
	mki3d.data = loader.loadedObject; // dangerous !!!
        mki3d.tmpCancel();
	mki3d.setModelViewMatrix();
	mki3d.backup();
	mki3d.action.escapeToCanvas(); 
	mki3d.file.suggestedName= mki3d.file.withoutExtension(mki3d.file.selectedName);
	mki3d.messageAppend("<br> LOADED FROM: "+mki3d.file.selectedName);
    }
} 

mki3d.file.startLoading = function ( ) {
    var myAccepts = [{
	//	mimeTypes: ['text/*'],
	extensions: ['mki3d']
    }];
    
    var loader = {};

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
    try{
	chrome.fileSystem.chooseEntry(loader.config, function(theEntry) { mki3d.file.loadChooseEntryCallback(theEntry, loader); }); 
    } catch( err ) {
	// console.log(err);
	// alert(err);

	// set callback to consume textarea
	mki3d.textLoadConsume= function(){
	    var data= JSON.parse(mki3d.html.textareaInput.value);
	    // to do: test data consistency ...
	    mki3d.data = data;
            mki3d.tmpCancel();
	    mki3d.setModelViewMatrix();
	    mki3d.backup();
	    mki3d.file.suggestedName= mki3d.file.withoutExtension(mki3d.file.selectedName);
	    // console.log(data); /// for tests
	}
	mki3d.loadInfo("Loading from '*.mki3d'");
	mki3d.html.textareaInput.value=""; // clean input text area ?
	mki3d.action.textLoad('.mki3d');
    }

}

/** LOAD STRING **/

mki3d.file.loadingStringEndHandler = function (loader){
    if(loader.loadedString) {
	mki3d.file.loadedString = loader.loadedString;
	console.log(mki3d.file.loadedString); // for tests ...
	mki3d.data=mki3d_et_getDataFromString(mki3d.file.loadedString); // test ...
        mki3d.tmpCancel();
	console.log( mki3d.data ); // test ...
	mki3d.action.escapeToCanvas(); 
	mki3d.file.suggestedName= mki3d.file.withoutExtension(mki3d.file.selectedName);
	mki3d.messageAppend("<br> LOADED STRING FROM: "+mki3d.file.suggestedName);
    }
} 

mki3d.file.startLoadingString = function ( ) {
    var myAccepts = [{
	//	mimeTypes: ['text/*'];
	extensions: ['et']
    }];
    
    var loader = {};

    loader.loadHandler = function(e) { // processing of the result

	var myObjectString = e.target.result;
	loader.loadedString = myObjectString;
    };

    loader.loadEndHandler = function(e) { 
	// console.log(e);  // for tests ...
	mki3d.file.loadingStringEndHandler(loader); // process load
    }
    loader.errorHandler = function(e) { console.error(e); }; 

    loader.config = {type: 'openFile', accepts: myAccepts };
    try{
	chrome.fileSystem.chooseEntry(loader.config, function(theEntry) { mki3d.file.loadChooseEntryCallback(theEntry, loader); }); 
    } catch( err ) {
	// console.log(err);
	// alert(err);
	// set callback to consume textarea
	mki3d.textLoadConsume= function(){
	    var data= mki3d_et_getDataFromString(mki3d.html.textareaInput.value);
	    // to do: test data consistency ...
	    mki3d.data = data;
            mki3d.tmpCancel();
	    mki3d.setModelViewMatrix();
	    mki3d.backup();
	    mki3d.file.suggestedName= mki3d.file.withoutExtension(mki3d.file.selectedName);
	    // console.log(data); /// for tests
	}
	mki3d.html.textareaInput.value=""; // clean input text area ?
	mki3d.loadInfo("Importing from '*.et'");
	mki3d.action.textLoad('.et');
    }
    
}


/* common callbacks for loading and merging */

mki3d.file.loadChooseEntryCallback = function (theEntry, loader) { 
    /* checking for chrome.runtime.lastError */
    if (chrome.runtime.lastError || !theEntry) {
	console.log('No file selected.');
	mki3d.action.escapeToCanvas(); 
	mki3d.messageAppend('<br> NOTHING LOADED !!! (NO FILE SELECTED)');
        loader.canceled = true;
	return;
    }
    ////
    chrome.fileSystem.getDisplayPath(theEntry, function (displayPath) { 
	// console.log(displayPath);  
        mki3d.file.selectedName= displayPath;
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
