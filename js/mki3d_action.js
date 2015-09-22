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

/* actions for arrows (depeding on the mode) */

mki3d.action.up = function(){
	mki3d.action.viewRotateUp( mki3d.action.rotationStep);
}

mki3d.action.down = function(){
	mki3d.action.viewRotateUp( -mki3d.action.rotationStep);
}

mki3d.action.right = function(){
	mki3d.action.viewRotateRight( mki3d.action.rotationStep);
}

mki3d.action.left = function(){
	mki3d.action.viewRotateRight( -mki3d.action.rotationStep);
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


/* cursor manipulations */

mki3d.action.cursorMove = function( dx, dy, dz ) {
    cursor = mki3d.data.cursor;
    mki3d.vectorMove(cursor.position, dx, dy, dz);
    mki3d.loadCursor();
    mki3d.redraw();
    mki3d.message( "CURSOR = "+cursor.position );
}
