/* event callbacks */

mki3d.callback = {};

mki3d.callback.textureUVMenuOnKeyDown = async function (e){
    var code= e.keyCode;
    var actionMessage="";
    // TO DO
    // mki3d.backup.prepare(); // submenu ...
    switch(code)
    {
	case 81: // Q
	case 27: // Esc
	mki3d.action.escapeToCanvas();
	break;
	case 73: // I
	document.getElementById('texScaleU').value=1.0;
	document.getElementById('texScaleV').value=1.0;
	document.getElementById('texMoveU').value= 0.0;
	document.getElementById('texMoveV').value= 0.0;
	mki3d.html.divUpperMessage.innerHTML = document.querySelector("#divTextureUVMenu").innerHTML;
	mki3d.redraw();
	return;
	case 83: // S
	{  // scale
	    let uv = [
		Number(document.getElementById('texScaleU').value),
		Number(document.getElementById('texScaleV').value)
	    ];
	    mki3d_texture.scaleSelected( uv, mki3d.data );
	    mki3d.redraw();
	    return;
	}
	break;
	case 77: // M
	{   // move
	    let uv = [
		Number(document.getElementById('texMoveU').value),
		Number(document.getElementById('texMoveV').value)
	    ];
	    mki3d_texture.moveSelected( uv, mki3d.data );
	    mki3d.redraw();
	    return;
	}
	break;
	case 88: // X
	// swap U with V
	mki3d_texture.swapUVSelected( mki3d.data );
	mki3d.redraw();
	return;
	break;
	case 82: // R
	// reset default
	mki3d_texture.resetUVSelected( mki3d.data );
	mki3d.redraw();
	return;
	case 86: // V
	mki3d.callback.setDisplayMode();
	mki3d.redraw();
	return;
	break;
    }
}

mki3d.callback.textureMenuOnKeyDown = async function (e){
    var code= e.keyCode;
    var actionMessage="";
    // TO DO
    mki3d.backup.prepare();
    switch(code)
    {
	case 81: // Q
	case 27: // Esc
	mki3d.action.escapeToCanvas();
	break;
	case 37: // Left
	case 38: // Up
	if( mki3d.data.texture && mki3d.data.texture.elements.length > 0 ) {
	    let t=mki3d.data.texture;
	    t.index = (t.index + t.elements.length - 1) % t.elements.length;
	    mki3d_texture.display();
	}
	break;

	// case 78: // N
	case 39: // Right
	case 40: // Down
	if( mki3d.data.texture && mki3d.data.texture.elements.length > 0 ) {
	    let t=mki3d.data.texture;
	    t.index = (t.index + 1) % t.elements.length;
	    mki3d_texture.display();
	}
	break;

	case 84: // T
	if( mki3d.data.texture && mki3d.data.texture.elements.length > 0 ) {
	    mki3d_texture.textureSelectedTriangles();
	    mki3d.redraw();
	    mki3d.action.escapeToCanvas();
	}
	break;

	case 85: // U
	if( mki3d.data.texture && mki3d.data.texture.elements.length > 0 ) {
	    mki3d.data.model.triangles=  mki3d.data.model.triangles.concat(
		mki3d_texture.getAndDeleteSelectedTriangles( mki3d.data )
	    );
	    mki3d.redraw();
	    mki3d.action.escapeToCanvas();
	}
	break;

	case 82: // R
	if( mki3d.data.texture && mki3d.data.texture.elements.length > 0 ) {
	    mki3d_texture.deleteCurrentElement();
	    mki3d_texture.display();
	}
	break;

	case 76: // L
	try{
            await mki3d_texture.load( mki3d.data, mki3d.gl.context, mki3d.gl.compileAndLinkShaderProgram );
            mki3d_texture.display();
	} catch (err) {
	    console.log(err)
	}
	return; // submenu - do not escape to canvas 
	break;
	case 80: // P
	try{
            await mki3d_texture.paste( mki3d.data, mki3d.gl.context, mki3d.gl.compileAndLinkShaderProgram );
	    mki3d_texture.display();
	} catch (err) {
	    console.log(err)
	}
	return; // submenu - do not escape to canvas
	case 86: // V
	if( mki3d.data.texture && mki3d.data.texture.elements.length > 0 ) {
	    mki3d.callback.setDisplayMode();
	    mki3d_texture.display();
	}
	break;
	case 77: // M
	mki3d.redraw();
	mki3d.action.textureUVMenu();
	break;
    };
    // mki3d.action.escapeToCanvas();
    // mki3d.messageAppend( actionMessage );
}

mki3d.callback.IDBFiltersOnKeyDown = function (e){
    var code= e.keyCode;
    var actionMessage="";
    switch(code)
    {
	case 27: // Esc
	mki3d.idb.restoreTmp();
	mki3d.action.inspectIDBMenu(); // return to inspecting
	break;
	case 13: // Enter
	mki3d.idb.readFilters(); 
	mki3d.idb.restoreTmp();
	mki3d.action.inspectIDBMenu(); // return to inspecting
	break;
    }
}


mki3d.callback.inspectIDBMenuOnKeyDown = function (e){
    var code= e.keyCode;
    switch(code)
    {
	case 27: // Esc
	case 81: // Q
	/// restore data ...
	mki3d.idb.restoreTmp();
	mki3d.action.escapeToCanvas();
	break;
	
	case 70: // F
	/// FILTER ENTRIES ...
	mki3d.idb.restoreTmp();
	window.onkeydown = mki3d.callback.IDBFiltersOnKeyDown;
	mki3d.html.divUpperMessage.innerHTML =   document.querySelector("#divIDBFilters").innerHTML ;
	mki3d.idb.initFilters(); // after displaying
	break;

	case 82: // R
	if( mki3d.idb.filesIdx >= 0 &&  mki3d.idb.filesIdx< mki3d.idb.filesFound.length){
	    /// REMOVE ENTRY ...
	    var yesAction = function(){
		// mki3d.idb.restoreTmp(); // ?
		if( mki3d.idb.filesIdx >= 0 &&  mki3d.idb.filesIdx< mki3d.idb.filesFound.length)
		    mki3d.idb.removeIndexed();
	    }
	    mki3d.action.confirm("REMOVE ENTRY: '"+mki3d.idb.filesFound[mki3d.idb.filesIdx].name
				 +"' (DATE: '"+mki3d.idb.filesFound[mki3d.idb.filesIdx].date+"')?", yesAction);
	} else  mki3d.toast("NOTHING TO REMOVE !!!", 2000);
	break;
	
	case 76: // L
	if( mki3d.idb.filesIdx >= 0 &&  mki3d.idb.filesIdx< mki3d.idb.filesFound.length){
	    /// LOAD ENTRY ...
	    var yesAction = function(){
		if( mki3d.idb.filesIdx >= 0 &&  mki3d.idb.filesIdx< mki3d.idb.filesFound.length){
		    mki3d.idb.loadIndexed(); // merge the indexed entry
		}
	    }
	    mki3d.action.confirm("LOAD ENTRY: '"+mki3d.idb.filesFound[mki3d.idb.filesIdx].name
				 +"' (DATE: '"+mki3d.idb.filesFound[mki3d.idb.filesIdx].date+"')?", yesAction);
	} else  mki3d.toast("NOTHING TO LOAD !!!", 2000);
	break;
	
	case 77: // M
	if( mki3d.idb.filesIdx >= 0 &&  mki3d.idb.filesIdx< mki3d.idb.filesFound.length){
	    /// MERGE ENTRY ...
	    var yesAction = function(){
		if( mki3d.idb.filesIdx >= 0 &&  mki3d.idb.filesIdx< mki3d.idb.filesFound.length){
		    mki3d.idb.mergeIndexed(); // merge the indexed entry
		}
	    }
	    mki3d.action.confirm("MERGE ENTRY: '"+mki3d.idb.filesFound[mki3d.idb.filesIdx].name
				 +"' (DATE: '"+mki3d.idb.filesFound[mki3d.idb.filesIdx].date+"')?", yesAction);
	} else  mki3d.toast("NOTHING TO MERGE !!!", 2000);
	break;
	
	case 80: // P
	case 37: // Left
	case 38: // Up
	if( mki3d.idb.filesFound.length > 0 ) {
	    mki3d.idb.filesIdx = (mki3d.idb.filesIdx + mki3d.idb.filesFound.length - 1) % mki3d.idb.filesFound.length;
	    mki3d.idb.fillIDBSpans();
	    mki3d.idb.tmpLoad( mki3d.idb.filesFound[mki3d.idb.filesIdx].id );
	}
	break;
	
	case 78: // N
	case 39: // Right
	case 40: // Down
	if( mki3d.idb.filesFound.length > 0 ) {
	    mki3d.idb.filesIdx = (mki3d.idb.filesIdx + 1) % mki3d.idb.filesFound.length;
	    mki3d.idb.fillIDBSpans();
	    mki3d.idb.tmpLoad( mki3d.idb.filesFound[mki3d.idb.filesIdx].id );
	}
	break;
	
	case 86: // V
	mki3d.callback.setDisplayMode();
	break;	
    }
}

mki3d.callback.indexedDBMenuOnKeyDown = function (e){
    var code= e.keyCode;
    var msg="";
    switch(code)
    {
	case 27: // Esc
	case 81: // Q
	mki3d.action.escapeToCanvas();
	break;
	case 73: // I
	mki3d.backup.prepare(); // mki3d.action.inspectIDBMenu() may change mki3d.data and escape to canvas
	mki3d.action.inspectIDBMenu();
	break;
	case 65: // A
	msg=mki3d.idb.addToIDB();
	mki3d.action.escapeToCanvas();
	mki3d.messageAppend( msg );
	break;
    }
}


mki3d.callback.helpOnKeyDown = function (e){
    var code= e.keyCode;
    switch(code)
    {
	case 27: // Esc
	case 81: // Q
	mki3d.html.html.style.overflowY="";
	mki3d.action.escapeToCanvas();
	break;
    }
}

mki3d.callback.inputsOnKeyDown = function (e){
    var code= e.keyCode;
    var actionMessage="";
    switch(code)
    {
	case 27: // Esc
	// case 81: // Q //// collides with typing letter 'q' or 'Q' in the 'CURRENT NAME'
	mki3d.html.html.style.overflowY="";
	mki3d.action.escapeToCanvas();
	break;
	case 13: // Enter
	mki3d.html.html.style.overflowY="";
	actionMessage=mki3d.action.inputsEnter();
	mki3d.action.escapeToCanvas();
	mki3d.messageAppend( actionMessage );
	break;
    }
}

mki3d.textLoadConsume=null; 

mki3d.callback.textLoadOnKeyDown = function (e){
    var code= e.keyCode;
    // e.stopPropagation();  ///
    // console.log("TEST");

    var actionMessage="";
    document.getElementById('files').blur();
    switch(code)
    {
	case 27: // Esc
	case 81: // Q
	mki3d.html.html.style.overflowY="";
	mki3d.action.escapeToCanvas();
	break;
	case 13: // Enter
	mki3d.backup.prepare(); // new data can be loaded or merged
	mki3d.html.html.style.overflowY="";
	// actionMessage=mki3d.action.inputsEnter();
	try{
	    mki3d.textLoadConsume();
	} catch( err ) {
	    actionMessage="<br> There was an error in data: "+err;
	}
	mki3d.action.escapeToCanvas();
	mki3d.messageAppend( actionMessage );
	break;
	case 88: // X
	mki3d.html.textareaInput.value="";
	break;
	case 70: // F
	//console.log("test");
	mki3d.action.selectFile();
	break;
    }
}

mki3d.callback.textSaveOnKeyDown = function (e){
    var code= e.keyCode;
    var actionMessage="";
    switch(code)
    {
	case 27: // Esc
	case 81: // Q
	mki3d.html.html.style.overflowY="";
	mki3d.action.escapeToCanvas();
	break;
	case 13: // Enter // the same as Q or Esc
	mki3d.html.html.style.overflowY="";
	mki3d.action.escapeToCanvas();
	break;
	case 83: // S
	mki3d.action.selectFileSave();
	
	// mki3d.action.escapeToCanvas(); // prevent click-loop ???
	break;
	case 78: // N
	document.querySelector("#saveName").select();
	document.execCommand("Copy");
	break;
	case 65: // A
	mki3d.html.textareaOutput.select();
	document.execCommand("Copy");
	break;
	
    }
}


mki3d.callback.colorMenuOnKeyDown = function (e){
    var actionMessage="";
    var color = null;
    var code= e.keyCode;
    if( "0".charCodeAt(0) <= code && code <= "7".charCodeAt(0)) { 
	var id = "#ddColor"+String.fromCharCode( code );
	var ddColor = document.querySelector(id);
	if(ddColor !== null ) {
	    color = JSON.parse(ddColor.innerHTML);
	}
	if(color !== null && mki3d.tmp.colorMenuOutput!== null ){
            mki3d.vectorSet(mki3d.tmp.colorMenuOutput, color[0], color[1], color[2]);
	}
    } else
	switch(code)
    {
	case 69: // E
	mki3d.updateColorComponent(mki3d.tmp.colorMenuOutput, 0, -1.0 / 256);
	break;
	case 82: // R
	mki3d.updateColorComponent(mki3d.tmp.colorMenuOutput, 0, +1.0 / 256);
	break;
	case 70: // F
	mki3d.updateColorComponent(mki3d.tmp.colorMenuOutput, 1, -1.0 / 256);
	break;
	case 71: // G
	mki3d.updateColorComponent(mki3d.tmp.colorMenuOutput, 1, +1.0 / 256);
	break;
	case 86: // V
	mki3d.updateColorComponent(mki3d.tmp.colorMenuOutput, 2, -1.0 / 256);
	break;
	case 66: // B
	mki3d.updateColorComponent(mki3d.tmp.colorMenuOutput, 2, +1.0 / 256);
	break;
	case 78: // N
	//...
	if(mki3d.tmp.selectedColors.length >= 1){
	    mki3d.tmp.selectedColors.index= (mki3d.tmp.selectedColors.index+1)%mki3d.tmp.selectedColors.length;
	    color=mki3d.tmp.selectedColors[mki3d.tmp.selectedColors.index];
            mki3d.vectorSet(mki3d.tmp.colorMenuOutput, color[0], color[1], color[2]);	    
	}
	break;
	case 27: // Esc
	case 13: // Enter
	case 81: // Q
	actionMessage="COLOR SET TO: "+JSON.stringify(mki3d.tmp.colorMenuOutput);
	mki3d.action.escapeToCanvas();
	mki3d.messageAppend("<br>"+actionMessage);
	break;
    }
    
    if(mki3d.tmp.colorMenuOutput!== null){
	document.querySelector("#spanRGB").innerHTML=JSON.stringify(mki3d.tmp.colorMenuOutput);
    }
    // ...
    mki3d.redraw();
    // mki3d.message("COLOR SET TO: "+JSON.stringify(mki3d.tmp.colorMenuOutput));
    // mki3d.action.escapeToCanvas();
}

mki3d.callback.mainMenuOnKeyDown = function (e){
    var code= e.keyCode;
    // TO DO
    switch(code)
    {
	case 67: // C
	mki3d.action.cursorMenu(); /// for tests ...
	break;
	case 68: // D
	mki3d.action.dataMenu(); /// for tests ...
	break;
	case 70: // F
	mki3d.action.fileMenu(); /// for tests ...
	break;
	
	case 88: // X
	mki3d.action.clipMenu(); /// for tests ...
	break;

	case 83: // S
	mki3d.action.selectionMenu();
	break;

	case 84: // T
	mki3d.action.textureMenu();
	break;

	case 86: // V
	mki3d.action.viewMenu();
	break;
	
	case 80: // P
	mki3d.action.pointsMenu();
	break;
	case 77: // M
        mki3d.action.constructiveMenu();
	break;
	case 78: // N
        mki3d.action.setMenu();
	break;
	
	case 73: // I
        mki3d.action.inputs();
	break;
	
	case 66: // B
        mki3d.action.indexedDBMenu();
	break;
	
	case 85: // u
        mki3d.action.urlMenu();
	break;
	
	default:
	mki3d.action.escapeToCanvas();
	// temporary escape to canvas
    };
}

mki3d.callback.cursorMenuOnKeyDown = function (e){
    var actionMessage="";
    var code= e.keyCode;
    // TO DO
    switch(code)
    {
	case 67: // C
        mki3d.tmp.colorMenuOutput = mki3d.data.cursor.color; // reference to the object
	mki3d.action.colorMenu(); 
	return; // submenu 
	break;
	
	case 74: // J
	var endpoints= mki3d.getEndpointsOfElements( 
	    mki3d.data.model.segments.concat(mki3d.data.model.triangles).concat( mki3d_texture.triangles( mki3d.data ) )
	);
	actionMessage=mki3d.action.cursorMoveToNearestEndpoint(endpoints);
	break;
	case 83: // S
	var endpoints= mki3d.tmp.selected;
	actionMessage=mki3d.action.cursorMoveToNearestEndpoint(endpoints);
	break;
	case 85: // U
	if(mki3d.data.links)
	    actionMessage=mki3d.action.cursorMoveToNearestEndpoint(mki3d.data.links);
	break;
    };
    mki3d.action.escapeToCanvas();
    mki3d.messageAppend("<br>"+actionMessage);
}

mki3d.callback.urlMenuOnKeyDown = function (e){
    var actionMessage="";
    var code= e.keyCode;
    // TO DO
    switch(code)
    {
	
	case 65: // A
	let link= mki3d.url.newLink() ;
	link.position= JSON.parse(JSON.stringify(mki3d.data.cursor.position)); // clone
	actionMessage= mki3d.url.addLink( link );
	break;
	case 88: // X
	{
	    let position= JSON.parse(JSON.stringify(mki3d.data.cursor.position)); // clone
	    let idx=mki3d.url.linkIdxAtPosition(position );
	    
	    if(idx === -1 ) {
		actionMessage="THERE IS NO LINK AT CURSOR POSITION: "+JSON.stringify(position)+" !"+"<br>(USE 'QCU' TO JUMP TO EXISTING LINK)";
	    } else {
		actionMessage= mki3d.url.cutLinkAtIdx(idx );
	    }
	}
	break;
	
	case 86: // X
	{
	    let position= JSON.parse(JSON.stringify(mki3d.data.cursor.position)); // clone
	    actionMessage=mki3d.url.pasteLinkIdxAtPosition(position );
	}
	break;
	
	case 69: // E
	{
	    let position= JSON.parse(JSON.stringify(mki3d.data.cursor.position)); // clone
	    mki3d.url.editedIdx=mki3d.url.linkIdxAtPosition(position );

	    if(mki3d.url.editedIdx === -1 ) {
		actionMessage="THERE IS NO LINK AT CURSOR POSITION: "+JSON.stringify(position)+" !"+"<br>(USE 'QCU' TO JUMP TO EXISTING LINK)";
	    } else {
		mki3d.html.divUpperMessage.innerHTML =   document.querySelector("#divURLEdit").innerHTML ;
	    	
		document.querySelector("#inputURLLabel").value=mki3d.data.links[mki3d.url.editedIdx].label;
		document.querySelector("#inputURLOpener").value=mki3d.data.links[mki3d.url.editedIdx].opener;
		document.querySelector("#inputURL").value=mki3d.data.links[mki3d.url.editedIdx].url;
		window.onkeydown = mki3d.callback.urlEditMenuOnKeyDown;
		return; // go to sub-menu 
	    }
	}
	break;
    };
    mki3d.action.escapeToCanvas();
    mki3d.messageAppend("<br>"+actionMessage);
}

mki3d.callback.urlEditMenuOnKeyDown = function (e){
    var code= e.keyCode;
    var actionMessage="";
    let exit=false;
    switch(code)
    {
	case 27: // Esc
	//
	exit=true;
	break;
	case 13: // Enter
	// read data to link
	// mki3d.data.links[mki3d.url.editedIdx]= ...
	mki3d.data.links[mki3d.url.editedIdx].label=document.querySelector("#inputURLLabel").value;
	mki3d.data.links[mki3d.url.editedIdx].opener=document.querySelector("#inputURLOpener").value;
	mki3d.data.links[mki3d.url.editedIdx].url=document.querySelector("#inputURL").value;
	exit=true;
	break;
	case 9: // Tab
	// test link
	let opener=document.querySelector("#inputURLOpener").value;
	let input=document.querySelector("#inputURL").value;
	window.open(mki3d.url.completeLink( opener, input), "_blank");
	break;
    }
    // console.log(code); /// test
    if (exit) {
	mki3d.action.escapeToCanvas();
	mki3d.messageAppend("<br>"+actionMessage);
    }
}





mki3d.callback.fileMenuOnKeyDown = function (e){
    var code= e.keyCode;
    // TO DO
    switch(code)
    {
	case 76: // L
	// LOAD
	mki3d.file.startLoading();
	break;
	case 77: // M
	// MERGE
	mki3d.file.startMerging();
	break;
	
	case 83: // S
	// SAVE
        mki3d.file.startSaving();
	break;
	case 69: // E
	// EXPORT
        mki3d.file.startExporting();
	break;
	case 84: // T
	// IMPORT *.et
        mki3d.file.startLoadingString();
	break;
	case 67: // C
	// COLLADA EXPORT
        mki3d.file.exportCollada();
	break;
	case 80: // P
	// PLY EXPORT
        mki3d.file.exportPly();
	break;
	
	default:
	mki3d.action.escapeToCanvas();
	mki3d.messageAppend("<br> NO FILE ACTION SELECTED !");
	// temporary escape to canvas
    };
}

mki3d.callback.dataCopyMenuOnKeyDown = function (e){
    var code= e.keyCode;
    var actionMessage="";
    mki3d.backup.prepare(); // copying may change data
    switch(code)
    {
	case 48: // 0
	mki3d.action.copySelected();
	mki3d.action.cancelSelection();
	mki3d.action.selectCurrentSet();
        actionMessage=
	    "<br> COPIED SELECTED TO SET: "+mki3d.data.set.current + " (CURENT SET)"+
	    "<br>NEW SET IS NOW SELECTED";
	break;
	case 49: // 1
	mki3d.action.copySelected();
	mki3d.action.glueSegments();
	mki3d.action.cancelSelection();
	mki3d.action.selectCurrentSet();
        actionMessage="<br> COPIED SELECTED TO SET: "+mki3d.data.set.current + " (CURENT SET)"+
	    "<br> WITH 'GLUES' BETWEEN SEGMENTS' ENDPOINTS"+
            "<br>NEW SET IS NOW SELECTED";
	break;
	case 50: // 2
	mki3d.action.copySelected();
	mki3d.action.glueTriangles();
	mki3d.action.cancelSelection();
	mki3d.action.selectCurrentSet();
	actionMessage=
	    "<br> COPIED SELECTED TO SET: "+mki3d.data.set.current + " (CURENT SET)"+
            "<br> WITH 'GLUES' BETWEEN SEGMENTS"+
            "<br>NEW SET IS NOW SELECTED";
	break;
	case 51: // 3
	mki3d.action.copySelected();
	mki3d.action.glueSegments();
	mki3d.action.glueTriangles();
	mki3d.action.cancelSelection();
	mki3d.action.selectCurrentSet();
        actionMessage=
	    "<br> COPIED SELECTED TO SET: "+mki3d.data.set.current + " (CURENT SET)"+
	    "<br> WITH 'GLUES' BETWEEN SEGMENTS' ENDPOINTS AND SEGMENTS"+
            "<br>NEW SET IS NOW SELECTED";
	break;
    };
    mki3d.action.escapeToCanvas();
    mki3d.messageAppend( actionMessage );
}


mki3d.callback.dataMenuOnKeyDown = function (e){
    var code= e.keyCode;
    var actionMessage="";
    // TO DO
    mki3d.backup.prepare();
    switch(code)
    {
	case 48: //0 
	mki3d.action.paintSelectedEndpoints();
	actionMessage="<br> SELECTED SEGMENTS PAINTED WITH CURSOR COLOR.";
	break; 
	case 50: // 2
	mki3d.action.paintSelectedSegments();
	actionMessage="<br> SELECTED SEGMENTS PAINTED WITH CURSOR COLOR.";
	break; 
	case 51: // 3
	mki3d.action.paintSelectedTriangles();
	actionMessage="<br> SELECTED TRIANGLES PAINTED WITH CURSOR COLOR.";
	break; 
	case 52: // 4
	mki3d.action.deleteSelectedSegments();
	actionMessage="<br> SELECTED SEGMENTS DELETED.";
	break; 
	case 53: // 5
	mki3d.action.deleteSelectedTriangles();
	actionMessage="<br> SELECTED TRIANGLES DELETED.";
	break; 
	case 66: // B
        mki3d.tmp.colorMenuOutput = mki3d.data.backgroundColor; // reference to the object
	mki3d.action.colorMenu(); 
	return; // submenu -  do not escape to canvas 
	break;
	case 76: // L
	// LIGHT
	mki3d.action.setLight();
	break;
	case 67: // C
	mki3d.action.dataCopyMenu();
	return; // submenu - do not escape to canvas 
	break;
    };
    mki3d.action.escapeToCanvas();
    mki3d.messageAppend( actionMessage );
}

mki3d.callback.clipMenuOnKeyDown =function (e){
    var code= e.keyCode;
    // TO DO
    switch(code)
    {
	case 38: // up
	case 73: // I
	mki3d.action.upClip();
	//mki3d.action.viewRotateUp( rotStep);
	break;
	case 40: // down
	case 75: // K
	mki3d.action.downClip();
	// mki3d.action.viewRotateUp(-rotStep);
	break;
	case 37: // left
	case 74:// J
	mki3d.action.leftClip();
	// mki3d.action.viewRotateRight(-rotStep);
	break;
	case 39:// right
	case 76: // L
	mki3d.action.rightClip();
	// mki3d.action.viewRotateRight( rotStep);
	break;
	case 70: // F
	mki3d.action.forwardClip();
	break;
	case 66: // B
	case 86: // V
	mki3d.action.backClip();
	break;

	case 82: // R
	mki3d.action.unclip();
	break;

	default:
    };
    mki3d.action.escapeToCanvas();
    mki3d.messageAppend("<br> CLIP MIN = "+ JSON.stringify(mki3d.data.clipMinVector)+
			"<br> CLIP MAX = "+ JSON.stringify(mki3d.data.clipMaxVector)
		       );
    
    // temporary escape to canvas
} 

/* selection */
mki3d.callback.selectionMenuOnKeyDown = function (e){
    var code= e.keyCode;
    var actionMessage="";
    // TO DO
    switch(code)
    {
	case 69: // E
	actionMessage=mki3d.action.extractSelectedToNewSet();
	break;
	case 82: // R
	mki3d.action.cancelSelection();
	break;
	case 88: // X
	mki3d.action.selectInClipBox();
	break;
	case 66: // B
	mki3d.action.bookmarkSelection();
	break;
	case 65: // A
	mki3d.action.selectBookmarked();
	break;
	case 67: // C
	mki3d.action.selectByCursor();
	break;
	case 83: // S
	mki3d.action.selectCurrentSet();
	break;
	case 50: // 2
	mki3d.action.extendSelectionByIncident(mki3d.data.model.segments);
	break;
	case 51: // 3
	mki3d.action.extendSelectionByIncident(mki3d.data.model.triangles.concat( mki3d_texture.triangles( mki3d.data ) ));
	break;
	case 52: // 4
	mki3d.action.unselect(mki3d.data.model.segments);
	break;
	case 53: // 5
	mki3d.action.unselect(mki3d.data.model.triangles.concat( mki3d_texture.triangles( mki3d.data ) ));
	break;
	// ... add remaining cases	
	default:
	mki3d.action.escapeToCanvas();
	// temporary escape to canvas
    };
    mki3d.action.escapeToCanvas();
    if(mki3d.tmp.selected)
	mki3d.messageAppend("<br>"+actionMessage+"<br> SELECTED ENDPOINTS: "+mki3d.tmp.selected.length);
    // temporary escape to canvas
}

mki3d.callback.viewMenuOnKeyDown = function (e){
    var code= e.keyCode;
    var actionMessage="";
    // TO DO
    switch(code)
    {
	case 49: // 1
	mki3d.action.viewSelectedElements();
	actionMessage=
	    "<br> VIEW RESTRICTED TO SELECTED ELEMENTS."+
	    "<br>(PRESS 'QVC' TO CANCEL VIEW RESTRICTIONS.)";
	break; 
	case 50: // 2
	mki3d.action.viewSelectedSegments();
	actionMessage=
	    "<br> VIEW RESTRICTED TO SELECTED SEGMENTS."+
	    "<br>(PRESS 'QVC' TO CANCEL VIEW RESTRICTIONS.)";
	break; 
	case 51: // 3
	mki3d.action.viewSelectedTriangles();
	actionMessage=
	    "<br> VIEW RESTRICTED TO SELECTED TRIANGLES."+
	    "<br>(PRESS 'QVC' TO CANCEL VIEW RESTRICTIONS.)";
	break; 
	case 67: // C
	mki3d.action.cancelVisibilityRestrictions();
	actionMessage=
	    "<br> VIEW RESTRICTIONS CANCELED.";
	break;
	case 85: // U
	mki3d.action.viewScaleUp();
	actionMessage=
	    "<br> VIEW SCALE: "+mki3d.data.view.scale+
	    "<br> CURSOR STEP: "+mki3d.data.cursor.step;
	break;
	case 68: // D
	mki3d.action.viewScaleDown();
	actionMessage=
	    "<br> VIEW SCALE: "+mki3d.data.view.scale+
	    "<br> CURSOR STEP: "+mki3d.data.cursor.step;
	break;
	case 83: // S
	mki3d.stereo.mode= !mki3d.stereo.mode;
	actionMessage=
	    "<br> STEREO MODE: "+mki3d.stereo.mode;
	break;
	
    };
    mki3d.action.escapeToCanvas();
    mki3d.messageAppend( actionMessage );
}



mki3d.callback.pointsMenuOnKeyDown = function (e){
    var code= e.keyCode;
    var actionMessage="";
    // TO DO
    switch(code)
    {
	case 83: // S
	// set the callback 
	mki3d.tmp.afterPointsSelect= mki3d.setPointCallback;
	// go to point selection submenu ...
	mki3d.action.pointsSelectMenu();
	return;
	break; 
	case 68: // D
	// set the callback 
	mki3d.tmp.afterPointsSelect= mki3d.hidePointCallback;
	// go to point selection submenu ...
	mki3d.action.pointsSelectMenu();
	return;
	break; 
	case 74: // J
	// set the callback 
	mki3d.tmp.afterPointsSelect= mki3d.jumpToPointCallback;
	// go to point selection submenu ...
	mki3d.action.pointsSelectMenu();
	return;
	break; 
	case 72: // H
	mki3d.pointsHide();
	actionMessage="<br> ALL CONSTRUCTIVE POINTS ARE HIDDEN. (USE 'QPJ...' TO FIND AND DISPLAY A POINT.)";
	break; 
	default:
	mki3d.tmp.afterPointsSelect= null;
	break;
    }

    mki3d.action.escapeToCanvas();
    mki3d.messageAppend( actionMessage );
}

mki3d.callback.pointsSelectMenuOnKeyDown = function (e){
    var code= e.keyCode;
    var actionMessage="";
    if( "A".charCodeAt(0)<= code && code<= "Z".charCodeAt(0) ){
	actionMessage=mki3d.tmp.afterPointsSelect( String.fromCharCode(code) ); 
	/* mki3d.tmp.afterPointsSelect should be set by the procedure invoking this menu */
    } else {
	actionMessage="<br>NOT VALID POINT KEY PRESSED !!! (USE THE KEYS FROM THE RANGE 'A' ... 'Z' ONLY.)"; 
    }
    mki3d.tmp.afterPointsSelect=null; 
    mki3d.action.escapeToCanvas();	
    mki3d.messageAppend( actionMessage );
}

mki3d.callback.constructiveCursorMenuOnKeyDown = function (e){
    var code= e.keyCode;
    var actionMessage="";
    // TO DO
    switch(code)
    {
	case 48: // 0
	actionMessage= mki3d.moveCursorToPointsCenter();
	break;
	case 67: // C
	actionMessage=mki3d.moveCursorToCenteroidOfSelected() ;
	break;
	case 49: // 1
	actionMessage= mki3d.moveCursorToIntersectionABandCDE();
	break;
    }

    mki3d.action.escapeToCanvas();
    mki3d.messageAppend( actionMessage );
}

mki3d.callback.constructiveMovingMenuOnKeyDown = function (e){
    var code= e.keyCode;
    var actionMessage="";
    // TO DO
    switch(code)
    {
	case 48: // 0
	actionMessage= mki3d.constructiveMoveAB();
	break;
	case 49: // 1
	actionMessage= mki3d.constructiveMoveInDirABLenCD();
	break;
    }

    mki3d.action.escapeToCanvas();
    mki3d.messageAppend( actionMessage );
}

mki3d.callback.projectionsMenuOnKeyDown = function (e){
    var code= e.keyCode;
    var actionMessage="";
    // TO DO
    switch(code)
    {
	case 48: // 0
	actionMessage= mki3d.parallelProjection_AB_CDE();
	break;
	case 49: // 1
	actionMessage= mki3d.sphereProjection_O_AB();
	break;
    }

    mki3d.action.escapeToCanvas();
    mki3d.messageAppend( actionMessage );
}

mki3d.callback.constructiveScalingMenuOnKeyDown = function (e){
    var code= e.keyCode;
    var actionMessage="";
    // TO DO
    switch(code)
    {
	case 83: // S
	actionMessage= mki3d.constructiveSetScalingFactorToABOverCD();
	break;
	case 48: // 0
	actionMessage= mki3d.constructiveScaleWithFixedPointO();
	break;
	case 49: // 1
	actionMessage= mki3d.constructiveScaleByABOverCD();
	break;
	case 50: // 2
	actionMessage= mki3d.constructiveScaleInDirectionEF();
	break;
	case 51: // 3
	actionMessage= mki3d.constructiveScaleOrthogonalToEF();
	break;
    }

    mki3d.action.escapeToCanvas();
    mki3d.messageAppend( actionMessage );
}

mki3d.callback.constructiveInsertingMenuOnKeyDown = function (e){
    var code= e.keyCode;
    var actionMessage="";
    // TO DO
    switch(code)
    {
	case 48: // 0
	actionMessage= mki3d.SelectedBookmarkedTriangleIntersection();
	break;
	case 51: // 3
	actionMessage= mki3d.constructivePolygonInsert();
	break;
	case 52: // 4
	actionMessage= mki3d.constructivePolygonTriangles();
	break;
    }

    mki3d.action.escapeToCanvas();
    mki3d.messageAppend( actionMessage );
}


mki3d.callback.constructiveMenuOnKeyDown = function (e){
    var code= e.keyCode;
    var actionMessage="";
    // TO DO
    mki3d.backup.prepare();
    switch(code)
    {
	case 77: // M
	mki3d.action.constructiveMovingMenu();
	return;
	case 80: // P
	actionMessage= mki3d.action.projectionsMenu();
	return;
	case 83: // S
	mki3d.action.constructiveScalingMenu();
	return;
	case 73: // I
	mki3d.action.constructiveInsertingMenu();
	return;
	case 74: // J
	mki3d.action.constructiveCursorMenu();
	return;

	case 66: // B
	actionMessage=mki3d.constructiveBBoxOfSelectedUW();
	break; 
	case 84: // T
	actionMessage= mki3d.constructiveThreePointTransformation();
	break;
	case 70: // F
	actionMessage= mki3d.constructiveFolding();
	break;
    }

    mki3d.action.escapeToCanvas();
    mki3d.messageAppend( actionMessage );
}

mki3d.callback.setMenuOnKeyDown = function (e){
    var code= e.keyCode;
    var actionMessage="";
    // TO DO
    switch(code)
    {
	case 78: // N
	actionMessage=mki3d.action.nextSetIdx();
	break;
	case 48: // 0
	actionMessage=mki3d.action.setInculedView();
	break;
	case 49: // 1
	actionMessage=mki3d.action.setIncidentView();
	break;
	case 80: // P
	actionMessage="<br>"+mki3d.currentSetStatistics(mki3d.data);
	break;
    }
    mki3d.action.escapeToCanvas();
    mki3d.messageAppend( actionMessage );
}


mki3d.callback.actionMenuOnKeyDown = function (e){
    var code= e.keyCode;
    // TO DO
    switch(code)
    {
	case 82: // R
	mki3d.action.mode = mki3d.action.ROTATE_MODE;
	break;
	case 67: // C
	mki3d.action.mode = mki3d.action.CURSOR_MODE;
	break;
	case 83: // S
	mki3d.action.mode = mki3d.action.SELECTED_MODE;
	break;
	case 76: // L
	mki3d.action.mode = mki3d.action.SELECTED_ROTATE_MODE;
	break;
	case 77: // M
	mki3d.action.mode = mki3d.action.SELECTED_MIRROR_MODE;
	break;
	default:
	// temporary escape to canvas
    };
    mki3d.action.escapeToCanvas();
    mki3d.action.setModeActions();
}

/* CANVAS */

mki3d.callback.canvasOnKeyUp = function (e){
    var code= e.keyCode;
    switch(code)
    {
	case 16: // shift
        mki3d.action.mode = mki3d.action.ROTATE_MODE;
	mki3d.action.modeIdx = 0;
	mki3d.action.setModeActions();
        window.onkeyup = null; 
	break;
    }

}

mki3d.callback.displayOnKeyDown = function (e){
    mki3d.callback.cancelDisplayMode();
}

mki3d.callback.cancelDisplayMode = function(){
    if( !mki3d.displayMode ) return;
    mki3d.displayMode=false;
    mki3d.html.showDiv(mki3d.html.divUpperMessage);
    mki3d.redraw();
    // window.onkeydown=mki3d.callback.canvasOnKeyDown;
    window.onkeydown=mki3d.callback.preDisplayOnKeyDown;
}

mki3d.callback.setDisplayMode = function(){
    if(	mki3d.displayMode ) return;
    mki3d.displayMode=true;
    mki3d.html.hideDiv(mki3d.html.divUpperMessage);
    mki3d.html.hideDiv(document.querySelector("#divInfoMessage"));
    mki3d.redraw();
    mki3d.callback.preDisplayOnKeyDown =  window.onkeydown;
    window.onkeydown = mki3d.callback.displayOnKeyDown; 
}


mki3d.callback.canvasOnKeyDown = function (e){
    // var code=e.keyCode? e.keyCode : e.charCode;
    const rotStep = Math.PI / 36; // 5 degrees 
    var code= e.keyCode;
    switch(code)
    {
	case 16: // shift
        window.onkeyup = mki3d.callback.canvasOnKeyUp; 
	mki3d.action.mode = mki3d.action.CURSOR_MODE;
	mki3d.action.modeIdx = 0;
	mki3d.action.setModeActions();
	break;
	case 68: // D
	mki3d.callback.setDisplayMode();
	break;
	case 13: // enter
	mki3d.backup.prepare();
        mki3d.action.enter();
	mki3d.backup.commit();
	break;
	case 27: // escape
	case 67: // C
        mki3d.action.escape();
	break;
	case 32: // space
	mki3d.action.viewAlignRotation();
	break;
	case 38: // up
	case 73: // I
	mki3d.action.up();
	//mki3d.action.viewRotateUp( rotStep);
	break;
	case 40: // down
	case 75: // K
	mki3d.action.down();
	// mki3d.action.viewRotateUp(-rotStep);
	break;
	case 37: // left
	case 74:// J
	mki3d.action.left();
	// mki3d.action.viewRotateRight(-rotStep);
	break;
	case 39:// right
	case 76: // L
	mki3d.action.right();
	// mki3d.action.viewRotateRight( rotStep);
	break;
	case 70: // F
	mki3d.action.forward();
	break;
	case 66: // B
	case 86: // V
	mki3d.action.back();
	break;
	case 65: // A
	// old : mki3d.action.nextMode();
	mki3d.action.actionMenu();
	break;
	case 72: // H
	mki3d.action.help();
	break;
	case 81: // Q
	mki3d.action.mainMenu();
	break;
	case 84: // T
	mki3d.action.toggleMarker2();
	break;
	case 85: // U
	mki3d.undo();
	break;
	case 78: // N
        mki3d.action.nextSetIndex();
	break;
	case 187: // =
	{
	    var msg="<strong>INFO:</strong>";
	    msg+="<br> Number of segments: "+ mki3d.data.model.segments.length;
	    msg+="<br> Number of triangles: "+ mki3d.data.model.triangles.length;
	    
	    var cursor = mki3d.data.cursor
	    if(cursor.marker1 != null){
		
		var m1=cursor.marker1.position;
		var c=cursor.position;
		msg+="<br> MARKER1-CURSOR  distance = "+mki3d.vectorLength([m1[0]-c[0],m1[1]-c[1],m1[2]-c[2]])
		
	    }
	    mki3d.message(msg);
	}
	break;

	/*
	  case 82: // R
	  case 81: // Q
	  case 69: // E
	  case 191: // ?
	  case 68: // D
	  case 187: // +
	  case 189: // -
	  case 86: // V
	  case 46: // Delete
	  case 51: // #
	  case 56: // *
	  case 88: // X
	  case 74: // J
	  break;
	*/
    }
};



mki3d.setCanvasSize= function( wth, hth ){
    var canvas = mki3d.html.canvas;
    var gl = mki3d.gl.context;
    canvas.setAttribute("width", ''+wth);
    canvas.setAttribute("height", ''+hth);
    gl.viewportWidth = wth;
    gl.viewportHeight = hth;
    gl.viewport(0,0,wth,hth);

    mki3d.setProjectionMatrix();
    mki3d.setModelViewMatrix();

    mki3d.redraw();
}

mki3d.callback.onWindowResize = function () {
    var wth = parseInt(window.innerWidth); //-30;
    var hth = parseInt(window.innerHeight); //-30;
    mki3d.setCanvasSize( wth, hth );
};

