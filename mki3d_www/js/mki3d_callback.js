/* event callbacks */

mki3d.callback = {};

mki3d.callback.helpOnKeyDown = function (e){
    var code= e.which || e.keyCode;
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
    var code= e.which || e.keyCode;
    var actionMessage="";
    switch(code)
    {
	case 27: // Esc
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
    var code= e.which || e.keyCode;
    var actionMessage="";
    switch(code)
    {
	case 27: // Esc
	mki3d.html.html.style.overflowY="";
	mki3d.action.escapeToCanvas();
	break;
	case 13: // Enter
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
    }
}

mki3d.callback.textSaveOnKeyDown = function (e){
    var code= e.which || e.keyCode;
    var actionMessage="";
    switch(code)
    {
	case 27: // Esc
	mki3d.html.html.style.overflowY="";
	mki3d.action.escapeToCanvas();
	break;
	case 13: // Enter
	mki3d.html.html.style.overflowY="";
	// actionMessage=mki3d.action.inputsEnter();
	mki3d.action.escapeToCanvas();
	mki3d.messageAppend( actionMessage );
	break;
	case 65: // A
	mki3d.html.textareaOutput.select();
	break;
	
    }
}


mki3d.callback.colorMenuOnKeyDown = function (e){
    var actionMessage="";
    var color = null;
    var code= e.which || e.keyCode;
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
    
    // ...
    mki3d.redraw();
    // mki3d.message("COLOR SET TO: "+JSON.stringify(mki3d.tmp.colorMenuOutput));
    // mki3d.action.escapeToCanvas();
}

mki3d.callback.mainMenuOnKeyDown = function (e){
    var code= e.which || e.keyCode;
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
	
    default:
	mki3d.action.escapeToCanvas();
	// temporary escape to canvas
    };
}

mki3d.callback.cursorMenuOnKeyDown = function (e){
    var actionMessage="";
    var code= e.which || e.keyCode;
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
	    mki3d.data.model.segments.concat(mki3d.data.model.triangles)
	);
	actionMessage=mki3d.action.cursorMoveToNearestEndpoint(endpoints);
	break;
    case 83: // S
	var endpoints= mki3d.tmp.selected;
	actionMessage=mki3d.action.cursorMoveToNearestEndpoint(endpoints);
	break;
    };
    mki3d.action.escapeToCanvas();
    mki3d.messageAppend("<br>"+actionMessage);
}

mki3d.callback.fileMenuOnKeyDown = function (e){
    var code= e.which || e.keyCode;
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
	// TEST STRING LOAD
        mki3d.file.startLoadingString();
	break;
	
    default:
	mki3d.action.escapeToCanvas();
	mki3d.messageAppend("<br> NO FILE ACTION SELECTED !");
	// temporary escape to canvas
    };
}

mki3d.callback.dataCopyMenuOnKeyDown = function (e){
    var code= e.which || e.keyCode;
    var actionMessage="";
    // TO DO
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
    mki3d.backup();
}


mki3d.callback.dataMenuOnKeyDown = function (e){
    var code= e.which || e.keyCode;
    var actionMessage="";
    // TO DO
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
    mki3d.backup();
}

mki3d.callback.clipMenuOnKeyDown =function (e){
    var code= e.which || e.keyCode;
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
    var code= e.which || e.keyCode;
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
	mki3d.action.extendSelectionByIncident(mki3d.data.model.triangles);
	break;
    case 52: // 4
	mki3d.action.unselect(mki3d.data.model.segments);
	break;
    case 53: // 5
	mki3d.action.unselect(mki3d.data.model.triangles);
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
    var code= e.which || e.keyCode;
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
    };
    mki3d.action.escapeToCanvas();
    mki3d.messageAppend( actionMessage );
}



mki3d.callback.pointsMenuOnKeyDown = function (e){
    var code= e.which || e.keyCode;
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
    var code= e.which || e.keyCode;
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
    var code= e.which || e.keyCode;
    var actionMessage="";
    // TO DO
    switch(code)
    {
    case 48: // 0
	actionMessage= mki3d.moveCursorToPointsCenter();
	break;
    case 49: // 1
	actionMessage= mki3d.moveCursorToIntersectionABandCDE();
	break;
    }

    mki3d.action.escapeToCanvas();
    mki3d.messageAppend( actionMessage );
}

mki3d.callback.constructiveMovingMenuOnKeyDown = function (e){
    var code= e.which || e.keyCode;
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

mki3d.callback.constructiveScalingMenuOnKeyDown = function (e){
    var code= e.which || e.keyCode;
    var actionMessage="";
    // TO DO
    switch(code)
    {
    case 48: // 0
	actionMessage= mki3d.constructiveScaleWithFixedPointO();
	break;
    case 49: // 1
	actionMessage= mki3d.constructiveScaleByABOverCD();
	break;
    }

    mki3d.action.escapeToCanvas();
    mki3d.messageAppend( actionMessage );
}

mki3d.callback.constructiveInsertingMenuOnKeyDown = function (e){
    var code= e.which || e.keyCode;
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
    var code= e.which || e.keyCode;
    var actionMessage="";
    // TO DO
    switch(code)
    {
    case 77: // M
	mki3d.action.constructiveMovingMenu();
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
    var code= e.which || e.keyCode;
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
    var code= e.which || e.keyCode;
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
    var code= e.which || e.keyCode;
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

mki3d.callback.canvasOnKeyDown = function (e){
    // var code=e.keyCode? e.keyCode : e.charCode;
    const rotStep = Math.PI / 36; // 5 degrees 
    var code= e.which || e.keyCode;
    switch(code)
    {
    case 16: // shift
        window.onkeyup = mki3d.callback.canvasOnKeyUp; 
	mki3d.action.mode = mki3d.action.CURSOR_MODE;
	mki3d.action.modeIdx = 0;
	mki3d.action.setModeActions();
	break;
    case 13: // enter
        mki3d.action.enter();
	break;
    case 27: // escape
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


mki3d.callback.onWindowResize = function () {
    var wth = parseInt(window.innerWidth)-30;
    var hth = parseInt(window.innerHeight)-30;
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
};

