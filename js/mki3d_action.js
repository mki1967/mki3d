/** editing actions invoked by the event calbacks **/

mki3d.action = {};

/** some constants **/
/* mode constants */
mki3d.action.ROTATE_MODE = "ROTATE MODE";
mki3d.action.CURSOR_MODE = "CURSOR MODE";

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
    mki3d.message("ACTION MODE: "+mki3d.action.mode );
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
    if( mki3d.invalidVersorsMatrix() ) mki3d.makeVersorsMatrix();
    view.rotationMatrix= mki3d.matrixTransposed( mki3d.tmp.versorsMatrix );
    mki3d.setModelViewMatrix();
    mki3d.redraw();
} 

/* cursor manipulations */

mki3d.action.cursorMove = function( dx, dy, dz ) {
    if( mki3d.invalidVersorsMatrix() ) mki3d.makeVersorsMatrix();
    var d = mki3d.matrixVectorProduct( mki3d.tmp.versorsMatrix , [dx,dy,dz] );
    cursor = mki3d.data.cursor;
    mki3d.vectorMove(cursor.position, d[0], d[1], d[2]);
    mki3d.loadCursor();
    mki3d.redraw();
    mki3d.message( "CURSOR = "+JSON.stringify(cursor.position) );
}



/* display help */
mki3d.action.help = function() {
    mki3d.html.hideAllDivs();
    mki3d.html.showDiv(mki3d.html.divHelp);
    window.onkeydown = mki3d.callback.helpOnKeyDown;
}
