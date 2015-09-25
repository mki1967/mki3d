/** editing actions invoked by the event calbacks **/

mki3d.action = {};

/** some constants **/
/* mode constants */
mki3d.action.ROTATE_MODE = "ROTATE";
mki3d.action.CURSOR_MODE = "CURSOR";

/* rotation step */
mki3d.action.rotationStep = Math.PI / 36; // 5 degrees 

/* array of some modes and current mode index */

mki3d.action.modes = [
    mki3d.action.ROTATE_MODE,
    mki3d.action.CURSOR_MODE
];

mki3d.action.modeIdx = 0;

mki3d.action.mode = mki3d.action.modes[mki3d.action.modeIdx]; // default starting mode

/* action of switching the mode */

mki3d.action.nextMode= function() {
    /* slect next mode from mki3d.action.modes */
    mki3d.action.modeIdx = (mki3d.action.modeIdx + 1) % mki3d.action.modes.length;
    mki3d.action.mode = mki3d.action.modes[mki3d.action.modeIdx];
    mki3d.action.setModeActions();
}

/* actions for arrows (depeding on the mode) */

/* ROTATE */

mki3d.action.upRotate = function(){
    mki3d.action.viewRotateUp( mki3d.action.rotationStep);
}

mki3d.action.downRotate = function(){
    mki3d.action.viewRotateUp( -mki3d.action.rotationStep);
}

mki3d.action.rightRotate = function(){
    mki3d.action.viewRotateRight( mki3d.action.rotationStep);
}

mki3d.action.leftRotate = function(){
    mki3d.action.viewRotateRight( -mki3d.action.rotationStep);
}

mki3d.action.forwardRotate = function(){
    mki3d.action.viewRotateForward( mki3d.action.rotationStep);
}

mki3d.action.backRotate = function(){
    mki3d.action.viewRotateForward( -mki3d.action.rotationStep);
}

/* editing actions */

mki3d.action.enter = function(){ 
    var p = mki3d.data.cursor.position;
    var c = mki3d.data.cursor.color;
    var point = mki3d.newPoint( p[0], p[1], p[2],  
				c[0], c[1], c[2] ,  
				mki3d.data.set.current );
    var cursor = mki3d.data.cursor;

    mki3d.message("ENTER: ");
    if(cursor.marker1 === null) {
	// enter the first endpoint
	cursor.marker1 =  point;
    } else { // mki3d.data.cursor.marker1 is not null
	if(cursor.marker2 === null) { 
	    if(mki3d.vectorCompare(cursor.marker1.position, point.position) != 0 ) { // enter segment
		mki3d.modelInsertElement( mki3d.data.model.segments, 
					  mki3d.newSegment( cursor.marker1, point ) );
		mki3d.messageAppend(" SEGMENT INSERTED");
		cursor.marker1 = point;
	    } else
		mki3d.messageAppend("DEGENERATE SEGMENT -- not inserted");
	} else {
	    var normal = mki3d.normalToPlane( cursor.marker1.position, cursor.marker2.position, point.position );
	    if( 
		mki3d.scalarProduct( normal, normal ) != 0 
 	    ) { // enter triangle 
		mki3d.modelInsertElement( mki3d.data.model.triangles, 
					  mki3d.newTriangle( cursor.marker1, cursor.marker2, point ) );
		mki3d.messageAppend(" TRIANGLE INSERTED");
		cursor.marker1 = point;
		cursor.marker2 = null;
	    } else 
		mki3d.messageAppend("DEGENERATE TRIANGLE -- not inserted");	
	}
    }

    mki3d.messageAppend("<br> MARKER1 ="+ JSON.stringify(mki3d.data.cursor.marker1)+
			"<br> MARKER2 ="+ JSON.stringify(mki3d.data.cursor.marker2) 
		       );

    mki3d.redraw();
};

mki3d.action.escape = function(){ 
    mki3d.data.cursor.marker1=null;
    mki3d.data.cursor.marker2=null;
    mki3d.message("MARKERS CANCELED");
    mki3d.redraw();
}

mki3d.action.toggleMarker2 = function(){
    mki3d.message("TOGGLE MARKER2: ");
    var p = mki3d.data.cursor.position;
    var c = mki3d.data.cursor.color;
    var point = mki3d.newPoint( p[0], p[1], p[2],  
				c[0], c[1], c[2] ,  
				mki3d.data.set.current );
    var cursor = mki3d.data.cursor;
    if(mki3d.data.cursor.marker1 === null ) {
	mki3d.messageAppend("First you have to set MARKER1 with Enter.");
        return;
    }

    if(mki3d.data.cursor.marker2 === null ) {
       if(mki3d.vectorCompare(cursor.marker1.position, point.position) != 0 ) {
	   mki3d.data.cursor.marker2 = point;
       }
    } else {
	   mki3d.data.cursor.marker2 = null;
    }

    mki3d.messageAppend("<br> MARKER1 ="+ JSON.stringify(mki3d.data.cursor.marker1)+
			"<br> MARKER2 ="+ JSON.stringify(mki3d.data.cursor.marker2) 
		       );

    mki3d.redraw();
}



/* CURSOR */

mki3d.action.upCursor = function(){
    /* temporary: fixed directons ... */
    mki3d.action.cursorMove(0, mki3d.data.cursor.step, 0);
}

mki3d.action.downCursor = function(){
    /* temporary: fixed directons ... */
    mki3d.action.cursorMove(0, -mki3d.data.cursor.step, 0);
}

mki3d.action.rightCursor = function(){
    /* temporary: fixed directons ... */
    mki3d.action.cursorMove(mki3d.data.cursor.step, 0, 0);
}

mki3d.action.leftCursor = function(){
    /* temporary: fixed directons ... */
    mki3d.action.cursorMove(-mki3d.data.cursor.step, 0, 0);
}

mki3d.action.forwardCursor = function(){
    /* temporary: fixed directons ... */
    mki3d.action.cursorMove( 0, 0, mki3d.data.cursor.step);
}

mki3d.action.backCursor = function(){
    /* temporary: fixed directons ... */
    mki3d.action.cursorMove( 0, 0, -mki3d.data.cursor.step);
}



/* setting actions for the mode */

mki3d.action.setModeActions= function(){
    /* sets actions for current mki3d.action.mode */
    mki3d.message("MODE: <strong>"+mki3d.action.mode+"</strong>" );
    switch(mki3d.action.mode){
    case mki3d.action.ROTATE_MODE:
	mki3d.action.up = mki3d.action.upRotate;
	mki3d.action.down = mki3d.action.downRotate;
	mki3d.action.right = mki3d.action.rightRotate;
	mki3d.action.left = mki3d.action.leftRotate;
	mki3d.action.forward = mki3d.action.forwardRotate;
	mki3d.action.back = mki3d.action.backRotate;
	// ...
	mki3d.data.view.focusPoint = mki3d.vectorClone( mki3d.data.cursor.position );
	mki3d.setModelViewMatrix();
        mki3d.redraw();
	break;
    case mki3d.action.CURSOR_MODE:
	mki3d.action.up = mki3d.action.upCursor;
	mki3d.action.down = mki3d.action.downCursor;
	mki3d.action.right = mki3d.action.rightCursor;
	mki3d.action.left = mki3d.action.leftCursor;
	mki3d.action.forward = mki3d.action.forwardCursor;
	mki3d.action.back = mki3d.action.backCursor;
	// ...
	mki3d.messageAppend(" (CURSOR = "+JSON.stringify(mki3d.data.cursor.position)+")" );
	break;
    }

}



/* initialisation of actions */

mki3d.action.init= function() {
    mki3d.action.setModeActions(); // set the actions for initial mode
}





/* view manipulations */

mki3d.action.viewRotateUp = function(alpha) {
    view = mki3d.data.view;
    view.rotationMatrix= mki3d.matrixRotatedYZ(view.rotationMatrix, alpha );
    mki3d.setModelViewMatrix();
    mki3d.redraw();
}

mki3d.action.viewRotateRight = function(alpha) {
    view = mki3d.data.view;
    view.rotationMatrix= mki3d.matrixRotatedXZ(view.rotationMatrix, alpha );
    mki3d.setModelViewMatrix();
    mki3d.redraw();
}

mki3d.action.viewRotateForward = function(alpha) {
    view = mki3d.data.view;
    view.rotationMatrix= mki3d.matrixRotatedXY(view.rotationMatrix, -alpha );
    mki3d.setModelViewMatrix();
    mki3d.redraw();
}


mki3d.action.viewAlignRotation = function() {
    view = mki3d.data.view;
    mki3d.tmp.refreshVersorsMatrix();
    view.rotationMatrix= mki3d.matrixTransposed( mki3d.tmp.versorsMatrix );
    mki3d.setModelViewMatrix();
    mki3d.redraw();
} 

/* cursor manipulations */

mki3d.action.cursorMove = function( dx, dy, dz ) {
    mki3d.tmp.refreshVersorsMatrix();
    var d = mki3d.matrixVectorProduct( mki3d.tmp.versorsMatrix , [dx,dy,dz] );
    cursor = mki3d.data.cursor;
    mki3d.vectorMove(cursor.position, d[0], d[1], d[2]);
    // mki3d.loadCursor(); // -- is in redraw()
    mki3d.redraw();
    mki3d.message( "CURSOR = "+JSON.stringify(cursor.position) );
}



/* display help */
mki3d.action.help = function() {
    mki3d.html.hideAllDivs();
    mki3d.html.showDiv(mki3d.html.divHelp);
    window.onkeydown = mki3d.callback.helpOnKeyDown;
}

/* menu actions */

mki3d.action.escapeToCanvas = function(){
    mki3d.html.hideAllDivs();
    mki3d.html.showDiv(mki3d.html.divCanvas);
    mki3d.action.setModeActions(); // reset current mode and message
    mki3d.redraw();
    window.onkeydown = mki3d.callback.canvasOnKeyDown;
}

mki3d.action.mainMenu = function(){
    mki3d.message( mki3d.html.divMainMenu.innerHTML );
    window.onkeydown = mki3d.callback.mainMenuOnKeyDown;
}

mki3d.action.colorMenu = function(){
    mki3d.message( mki3d.html.divColorMenu.innerHTML );
    window.onkeydown = mki3d.callback.colorMenuOnKeyDown; ////// temporary
}

mki3d.action.cursorMenu = function(){
    mki3d.message( mki3d.html.divCursorMenu.innerHTML );
    window.onkeydown = mki3d.callback.cursorMenuOnKeyDown; ////// temporary
}

