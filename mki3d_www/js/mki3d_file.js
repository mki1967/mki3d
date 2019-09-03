/*** File operations ***/

mki3d.file = {};



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

    mki3d.html.textareaOutput.value=  htmlString;
    mki3d.saveInfo("Exporting to '*.html'");
    mki3d.saveName(mki3d.file.suggestedName.concat(".html"));
    mki3d.action.textSave(mki3d.file.suggestedName.concat(".html"));

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
    /* clean data from temporratry markers */
    mki3d.action.cancelSelection();
    /* unique-sort elements of the model */
    mki3d.modelSortUnique();
    let data= JSON.parse(JSON.stringify(mki3d.data)); // clone of data
    mki3d_texture.cleanGlFromElements( data );
    let myObjectString = JSON.stringify(data);
    mki3d.html.textareaOutput.value= myObjectString;
    mki3d.saveInfo("Saving to '*.mki3d'");
    mki3d.saveName(mki3d.file.suggestedName.concat(".mki3d"));
    mki3d.action.textSave(mki3d.file.suggestedName.concat(".mki3d"));
}


/** MERGING **/

mki3d_merge_data= function( data ) {
    mki3d.tmpCancel();
    mki3d.tmpCancel();
    mki3d.action.cancelSelection();
    mki3d.tmp.merged = data; // dangerous !!!
    mki3d.compressSetIndexes( mki3d.data );
    mki3d.compressSetIndexes( mki3d.tmp.merged );
    var setIdxShift= mki3d.getMaxSetIndex(mki3d.data)+1;
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


mki3d.file.startMerging = function ( ) {
    // set callback to consume textarea
    mki3d.textLoadConsume= function(){
	var data= JSON.parse(mki3d.html.textareaInput.value);
	// to do: test data consistency ...
	mki3d_merge_data(data);
	// console.log(data); /// for tests
	mki3d.action.escapeToCanvas();
    }
    mki3d.loadInfo("Merging from '*.mki3d'");
    mki3d.html.textareaInput.value=""; // clean input text area ?
    mki3d.action.textLoad('.mki3d');
}




/** LOADING **/

mki3d.file.startLoading = function ( ) {
    // set callback to consume textarea
    mki3d.textLoadConsume= function(){
	var data= JSON.parse(mki3d.html.textareaInput.value);
	// to do: test data consistency ...
	mki3d_texture.makeGlInTextures(data, mki3d.shadeFactor, mki3d.gl.context, mki3d.gl.compileAndLinkShaderProgram ); // make GL objects for loaded data
	mki3d_texture.deleteTextureGlObjects( mki3d.data, mki3d.gl.context ); // remove GL objects of old data
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

/** LOAD STRING **/


// Import ET
mki3d.file.startLoadingString = function ( ) {
    // set callback to consume textarea
    mki3d.textLoadConsume= function(){
	var data= mki3d_et_getDataFromString(mki3d.html.textareaInput.value);
	// to do: test data consistency ...
	mki3d_texture.deleteTextureGlObjects( mki3d.data); // remove GL objects of old data
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


