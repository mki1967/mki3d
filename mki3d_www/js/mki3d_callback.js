/* event callbacks */

mki3d.callback = {};

mki3d.callback.helpOnKeyDown = function (e){
    mki3d.action.escapeToCanvas();
}


mki3d.callback.colorMenuOnKeyDown = function (e){
    var color = null;
    var code= e.which || e.keyCode;
    if( "0".charCodeAt(0) <= code && code <= "7".charCodeAt(0)) { 
	var id = "#ddColor"+String.fromCharCode( code );
	var ddColor = document.querySelector(id);
	if(ddColor !== null ) {
	    color = JSON.parse(ddColor.innerHTML);
	}
    }
    // ...
    if(color !== null && mki3d.tmp.colorMenuOutput!== null ){
        mki3d.vectorSet(mki3d.tmp.colorMenuOutput, color[0], color[1], color[2]);
    }
    mki3d.action.escapeToCanvas();
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
	
    default:
	mki3d.action.escapeToCanvas();
	// temporary escape to canvas
    };
}

mki3d.callback.cursorMenuOnKeyDown = function (e){
    var code= e.which || e.keyCode;
    // TO DO
    switch(code)
    {
    case 67: // C
        mki3d.tmp.colorMenuOutput = mki3d.data.cursor.color; // reference to the object
	mki3d.action.colorMenu(); 
	break;
	
    case 74: // J
	mki3d.action.cursorMoveToNearestEndpoint ();
	mki3d.action.escapeToCanvas();
	break;
	
    default:
	mki3d.action.escapeToCanvas();
	// temporary escape to canvas
    };
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
	
    case 83: // S
	// SAVE
        mki3d.file.startSaving();
	break;
	
    default:
	mki3d.action.escapeToCanvas();
	// temporary escape to canvas
    };
}

mki3d.callback.dataCopyMenuOnKeyDown = function (e){
    var code= e.which || e.keyCode;
    // TO DO
    switch(code)
    {
    case 48: // 0
	mki3d.action.copySelected();
	mki3d.action.cancelSelection();
	mki3d.action.selectCurrentSet();
	mki3d.action.escapeToCanvas();
        mki3d.messageAppend("<br> COPIED SELECTED TO SET: "+mki3d.data.set.current + " (CURENT SET)");
        mki3d.messageAppend("<br>NEW SET IS NOW SELECTED");
	break;
    case 49: // 1
	mki3d.action.copySelected();
	mki3d.action.glueSegments();
	mki3d.action.cancelSelection();
	mki3d.action.selectCurrentSet();
	mki3d.action.escapeToCanvas();
        mki3d.messageAppend("<br> COPIED SELECTED TO SET: "+mki3d.data.set.current + " (CURENT SET)");
        mki3d.messageAppend("<br> WITH 'GLUES' BETWEEN SEGMENTS' ENDPOINTS");
        mki3d.messageAppend("<br>NEW SET IS NOW SELECTED");
	break;
    case 50: // 2
	mki3d.action.copySelected();
	mki3d.action.glueTriangles();
	mki3d.action.cancelSelection();
	mki3d.action.selectCurrentSet();
	mki3d.action.escapeToCanvas();
        mki3d.messageAppend("<br> COPIED SELECTED TO SET: "+mki3d.data.set.current + " (CURENT SET)");
        mki3d.messageAppend("<br> WITH 'GLUES' BETWEEN SEGMENTS' ENDPOINTS");
        mki3d.messageAppend("<br>NEW SET IS NOW SELECTED");
	break;
    case 51: // 3
	mki3d.action.copySelected();
	mki3d.action.glueSegments();
	mki3d.action.glueTriangles();
	mki3d.action.cancelSelection();
	mki3d.action.selectCurrentSet();
	mki3d.action.escapeToCanvas();
        mki3d.messageAppend("<br> COPIED SELECTED TO SET: "+mki3d.data.set.current + " (CURENT SET)");
        mki3d.messageAppend("<br> WITH 'GLUES' BETWEEN SEGMENTS' ENDPOINTS");
        mki3d.messageAppend("<br>NEW SET IS NOW SELECTED");
	break;
    default:
	mki3d.action.escapeToCanvas();
	// temporary escape to canvas
    };
}


mki3d.callback.dataMenuOnKeyDown = function (e){
    var code= e.which || e.keyCode;
    // TO DO
    switch(code)
    {
    case 50: // 2
	mki3d.action.paintSelectedSegments();
	mki3d.action.escapeToCanvas();
	mki3d.messageAppend("<br> SELECTED SEGMENTS PAINTED WITH CURSOR COLOR.");
	break; 
    case 51: // 3
	mki3d.action.paintSelectedTriangles();
	mki3d.action.escapeToCanvas();
	mki3d.messageAppend("<br> SELECTED TRIANGLES PAINTED WITH CURSOR COLOR.");
	break; 
    case 52: // 4
	mki3d.action.deleteSelectedSegments();
	mki3d.action.escapeToCanvas();
	mki3d.messageAppend("<br> SELECTED SEGMENTS DELETED.");
	break; 
    case 53: // 5
	mki3d.action.deleteSelectedTriangles();
	mki3d.action.escapeToCanvas();
	mki3d.messageAppend("<br> SELECTED TRIANGLES DELETED.");
	break; 
    case 66: // B
        mki3d.tmp.colorMenuOutput = mki3d.data.backgroundColor; // reference to the object
	mki3d.action.colorMenu(); 
	break;
    case 76: // L
	// LIGHT
	mki3d.action.setLight();
	break;
    case 67: // C
	mki3d.action.dataCopyMenu();
	break;
    default:
	mki3d.action.escapeToCanvas();
	// temporary escape to canvas
    };
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
    // TO DO
    switch(code)
    {
    case 82: // R
	mki3d.action.cancelSelection();
	break;
    case 88: // X
	mki3d.action.selectInClipBox();
	break;
    case 67: // C
	mki3d.action.selectByCursor();
	break;
    case 83: // S
	mki3d.action.selectCurrentSet();
	break;
	// ... add remaining cases	
    default:
	mki3d.action.escapeToCanvas();
	// temporary escape to canvas
    };
    mki3d.action.escapeToCanvas();
    if(mki3d.tmp.selected)
	mki3d.messageAppend("<br> SELECTED ENDPOINTS: "+mki3d.tmp.selected.length);
    // temporary escape to canvas
}

mki3d.callback.viewMenuOnKeyDown = function (e){
    var code= e.which || e.keyCode;
    // TO DO
    switch(code)
    {
    case 49: // 1
	mki3d.action.viewSelectedElements();
	mki3d.action.escapeToCanvas();
	mki3d.messageAppend("<br> VIEW RESTRICTED TO SELECTED ELEMENTS.");
	mki3d.messageAppend("<br>(PRESS 'QVC' TO CANCEL VIEW RESTRICTIONS.)");
	break; 
    case 50: // 2
	mki3d.action.viewSelectedSegments();
	mki3d.action.escapeToCanvas();
	mki3d.messageAppend("<br> VIEW RESTRICTED TO SELECTED SEGMENTS.");
	mki3d.messageAppend("<br>(PRESS 'QVC' TO CANCEL VIEW RESTRICTIONS.)");
	break; 
    case 51: // 3
	mki3d.action.viewSelectedTriangles();
	mki3d.action.escapeToCanvas();
	mki3d.messageAppend("<br> VIEW RESTRICTED TO SELECTED TRIANGLES.");
	mki3d.messageAppend("<br>(PRESS 'QVC' TO CANCEL VIEW RESTRICTIONS.)");
	break; 
    case 67: // C
	mki3d.action.cancelVisibilityRestrictions();
	mki3d.action.escapeToCanvas();
	mki3d.messageAppend("<br> VIEW RESTRICTIONS CANCELED.");
	break;
    case 85: // U
	mki3d.action.viewScaleUp();
	mki3d.action.escapeToCanvas();
	mki3d.messageAppend("<br> VIEW SCALE: "+mki3d.data.view.scale+
			    "<br> CURSOR STEP: "+mki3d.data.cursor.step);
	break;
    case 68: // D
	mki3d.action.viewScaleDown();
	mki3d.action.escapeToCanvas();
	mki3d.messageAppend("<br> VIEW SCALE: "+mki3d.data.view.scale+
			    "<br> CURSOR STEP: "+mki3d.data.cursor.step);
	break;
    default:
	mki3d.action.escapeToCanvas();
	// temporary escape to canvas
    };
    // temporary escape to canvas
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
	mki3d.action.nextMode();
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
    var wth = parseInt(window.innerWidth)-10;
    var hth = parseInt(window.innerHeight)-10;
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

// niżej - do przerobienia


function onWindowResize() {

    stopIntervalAction();

    var wth = parseInt(window.innerWidth)-10;
    var hth = parseInt(window.innerHeight)-10;
    var canvas = document.getElementById("canvasId");

    canvas.setAttribute("width", ''+wth);
    canvas.setAttribute("height", ''+hth);
    gl.viewportWidth = wth;
    gl.viewportHeight = hth;
    projection.screenX=wth;
    projection.screenY=hth;

    pMatrix= projectionMatrix(projection);

    gl.viewport(0,0,wth,hth);
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
    drawScene();

}
