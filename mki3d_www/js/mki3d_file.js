/* File operations */

mki3d.file = {};

mki3d.file.suggestedName = "noname.mki3d";

/* SAVING */

mki3d.file.startSaving = function () {
    var saver = {};
    var myObjectString = JSON.stringify(mki3d.data);
    saver.blob = new Blob([myObjectString], {type: 'text/plain'}); 
    saver.config = {type: 'saveFile', suggestedName: mki3d.file.suggestedName  };
    saver.errorHandler = function(e) { console.error(e); }; 
//    saver.savingEndHandler= savingEndHandler;
    saver.savingEndHandler= mki3d.file.savingEndHandler;
    saver.writeEndHandler =   function(e){
	console.log("e"); // for tests..
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
	console.log(displayPath);  
        mki3d.file.suggestedName= displayPath;
    }
				    );
    writableEntry.createWriter(function(writer){ mki3d.file.writerCallback(writer,saver); });	
}


mki3d.file.writerCallback= function (writer, saver) {
    saver.writer=writer;
    writer.onerror = saver.errorHandler;
    writer.onwriteend = saver.writeEndHandler;
    writer.seek(0);
    writer.write(saver.blob);
}

mki3d.file.savingEndHandler=   function (saver){
    console.log(saver); // for tests ...
    mki3d.action.escapeToCanvas();
   } 

/* LOADING */

mki3d.file.loadingEndHandler = function (loader){
    if(loader.loadedObject) {
	console.log(loader.loadedObject); // for tests ...
	mki3d.data = loader.loadedObject; // dangerous !!!
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
	console.log(e);  // for tests ...
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
	console.log(displayPath);  
        mki3d.file.suggestedName= displayPath;
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



// do przerobienia ...



/** startLoading initiates the process of choosing and loading of the file by the user.
    Its argument loadEndHandler should be a funtcion with one parameter that is a load object.
    This function is called after the process of loading is finished.
    If load is successful, then load object contains a field loadedObject that contains the object loaded from
    the file.
    Example loadingEndHandler :
    
**/





/**
   mySaveStart( myObject, mySuggestedName, saveEndHandler)  initiates the process of choosing the file by the user 
   and saving myObject in the file.
   Its argument writeEndHandler should be a funtcion with one parameter that is a saver object.
   This function is called after the process of saving is finished.

   Example saveEndHandler :
   
   function saveEndHandler(saver){
   console.log(saver); // for tests ...
   } 
**/




