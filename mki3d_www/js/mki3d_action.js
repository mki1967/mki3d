/** editing actions invoked by the event calbacks **/

mki3d.action = {};

/* EACH OF THE TWO FUNCTIONS BELOW MUST BE CALLED AT THE END OF A KEY_EVENT CALLBACK */

mki3d.toast = function( msg, milliseconds ) {
    var divInfo=document.querySelector("#divInfoMessage");
    divInfo.innerHTML=msg;
    divInfo.style.display="block"; // show
    var hideMessage = function(){
	divInfo.style.display="none";
    }
    setTimeout(hideMessage, milliseconds); // hide afer milliseconds
    
}


mki3d.action.confirm = function( actionMsg, yesAction ){
    mki3d.action.previousOnKeyDown = window.onkeydown;
    mki3d.action.previousMsg =  mki3d.html.divUpperMessage.innerHTML;

    mki3d.message(""+actionMsg+" (PRESS 'Y' TO CONFIRM.)")
    window.onkeydown = function(e){
	var code= e.keyCode;
	window.onkeydown =  mki3d.action.previousOnKeyDown;
	mki3d.html.divUpperMessage.innerHTML= mki3d.action.previousMsg;
	if( code == 89 ) yesAction(); // perform the action on code 'Y'
    }
    
}

/***/

/** some constants **/
/* mode constants */
mki3d.action.ROTATE_MODE = "ROTATE";
mki3d.action.CURSOR_MODE = "CURSOR";
mki3d.action.SELECTED_MODE = "SELECTED_MOVE";
mki3d.action.SELECTED_ROTATE_MODE = "SELECTED_ROTATE";
mki3d.action.SELECTED_MIRROR_MODE = "SELECTED_MIRROR";
/* rotation step */
mki3d.action.rotationStep = Math.PI / 36; // 5 degrees 

/* array of some modes and current mode index */

mki3d.action.modes = [
    mki3d.action.ROTATE_MODE,
    mki3d.action.CURSOR_MODE,
    mki3d.action.SELECTED_MODE
];

mki3d.action.modeIdx = 0;

mki3d.action.mode = mki3d.action.modes[mki3d.action.modeIdx]; // default starting mode


/* setting actions for the mode */

mki3d.action.setModeActions= function(){
    var nothingSelectedWarning= "<br>NOTHING SELECTED !!! (YOU MAY USE Shift KEY TO LEAVE SELECTION MODES)"
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
    case mki3d.action.SELECTED_MODE:
	mki3d.action.up = mki3d.action.upSelected;
	mki3d.action.down = mki3d.action.downSelected;
	mki3d.action.right = mki3d.action.rightSelected;
	mki3d.action.left = mki3d.action.leftSelected;
	mki3d.action.forward = mki3d.action.forwardSelected;
	mki3d.action.back = mki3d.action.backSelected;
	// ...
	if(!mki3d.tmp.selected)
	    mki3d.messageAppend(nothingSelectedWarning);
	else
	    mki3d.messageAppend(" (NUMBER OF SELECTED POINTS = "+JSON.stringify(mki3d.tmp.selected.length)+")" );
	break;
    case mki3d.action.SELECTED_ROTATE_MODE:
	mki3d.action.up = mki3d.action.rotate90Up;
	mki3d.action.down = mki3d.action.rotate90Down;
	mki3d.action.right = mki3d.action.rotate90Right;
	mki3d.action.left = mki3d.action.rotate90Left;
	mki3d.action.forward = mki3d.action.rotate90Forward;
	mki3d.action.back = mki3d.action.rotate90Back;
	// ...
	if(!mki3d.tmp.selected)
	    mki3d.messageAppend(nothingSelectedWarning);
	else
	    mki3d.messageAppend(" (NUMBER OF SELECTED POINTS = "+JSON.stringify(mki3d.tmp.selected.length)+")" );
	break;
    case mki3d.action.SELECTED_MIRROR_MODE:
	mki3d.action.up = mki3d.action.mirrorY;
	mki3d.action.down = mki3d.action.mirrorY;
	mki3d.action.right = mki3d.action.mirrorX;
	mki3d.action.left = mki3d.action.mirrorX;
	mki3d.action.forward = mki3d.action.mirrorZ;
	mki3d.action.back = mki3d.action.mirrorZ;
	// ...
	if(!mki3d.tmp.selected)
	    mki3d.messageAppend(nothingSelectedWarning);
	else
	    mki3d.messageAppend(" (NUMBER OF SELECTED POINTS = "+JSON.stringify(mki3d.tmp.selected.length)+")" );
	break;

    }

}

/* initialisation of actions */

mki3d.action.init= function() {
    mki3d.action.setModeActions(); // set the actions for initial mode
}


/* action of switching the set index */
mki3d.action.nextSetIndex= function() {
    if(mki3d.set.restriction==""){
	mki3d.compressSetIndexes( mki3d.data );
	var maxIdx = mki3d.getMaxSetIndex( mki3d.data );
	mki3d.data.set.current = (mki3d.data.set.current + 1) % (maxIdx+2);
	mki3d.set.restriction="inSet";
	mki3d.viewInSet(mki3d.data.set.current, mki3d.data);
	mki3d.redraw();
	mki3d.message( mki3d.currentSetStatistics(mki3d.data) );
	mki3d.messageAppend("<br>VIEW RESTRICTED TO INCLUDED ELEMENTS (PRESS 'N' AGAIN TO DISPLAY ALL INCIDENT ELEMENTS.)");
    } else if(mki3d.set.restriction=="inSet") {
	mki3d.set.restriction="incidentToSet";
	mki3d.viewIncidentToSet(mki3d.data.set.current, mki3d.data);
	mki3d.redraw();
	mki3d.message( mki3d.currentSetStatistics(mki3d.data) );
	mki3d.messageAppend("<br>VIEW RESTRICTED TO INCIDENT ELEMENTS (PRESS 'N' AGAIN TO RESTORE PREVIOUS DISPLAY.)");
    } else {
	mki3d.set.restriction="";
	mki3d.action.cancelVisibilityRestrictions();
	mki3d.message( mki3d.currentSetStatistics(mki3d.data) );
	mki3d.messageAppend("<br>(PRESS 'N' AGAIN TO CHANGE CURRENT SET.)");
	mki3d.redraw();
    }
}

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
		var seg = mki3d.newSegment( cursor.marker1, point );
		mki3d.modelInsertElement( mki3d.data.model.segments, seg);
		mki3d.messageAppend(" SEGMENT "+JSON.stringify(seg)
				    +" INSERTED.<br>NR OF SEGMENTS: "+mki3d.data.model.segments.length);
		cursor.marker1 = point;
	    } else
		mki3d.messageAppend("DEGENERATE SEGMENT "+JSON.stringify(seg)+" -- not inserted");
	} else {
	    var normal = mki3d.normalToPlane( cursor.marker1.position, cursor.marker2.position, point.position );
	    if( 
		mki3d.scalarProduct( normal, normal ) != 0 
 	    ) { // enter triangle 
		var tr = mki3d.newTriangle( cursor.marker1, cursor.marker2, point );
		mki3d.modelInsertElement( mki3d.data.model.triangles, tr);
		mki3d.messageAppend(" TRIANGLE "+JSON.stringify(tr)
				    +" INSERTED. <br>NR OF TRIANGLES: "+mki3d.data.model.triangles.length);
		cursor.marker1 = point;
		cursor.marker2 = null;
	    } else 
		mki3d.messageAppend("DEGENERATE TRIANGLE "+JSON.stringify(tr)+"-- not inserted");	
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

mki3d.action.cursorScaleUp = function() {
    if( 2*mki3d.data.cursor.step*mki3d.data.view.scale > 4 ) return; // upper bound 
    mki3d.data.cursor.step = 2*mki3d.data.cursor.step ;
    mki3d.redraw();
}

mki3d.action.cursorScaleDown = function() {
    if( mki3d.data.cursor.step*mki3d.data.view.scale/2 < 1/4 ) return; // upper bound 
    mki3d.data.cursor.step = 2*mki3d.data.cursor.step ;
    mki3d.redraw();
}


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

/* cursor manipulations */

mki3d.action.cursorMove = function( dx, dy, dz ) {
    mki3d.tmpRefreshVersorsMatrix();
    var d = mki3d.matrixVectorProduct( mki3d.tmp.versorsMatrix , [dx,dy,dz] );
    cursor = mki3d.data.cursor;
    mki3d.vectorMove(cursor.position, d[0], d[1], d[2]);
    // mki3d.loadCursor(); // -- is in redraw()
    mki3d.redraw();
    mki3d.message( "CURSOR = "+JSON.stringify(cursor.position) );
}


/* selection manipulations */

mki3d.action.selectedMove = function( dx, dy, dz ) {
    if( !mki3d.tmp.selected ) return; // nothing to be moved
    mki3d.tmpRefreshVersorsMatrix();
    var d = mki3d.matrixVectorProduct( mki3d.tmp.versorsMatrix , [dx,dy,dz] );
    selected =mki3d.tmp.selected;
    var i;
    for(i=0; i<selected.length; i++){
	mki3d.vectorMove(selected[i].position, d[0], d[1], d[2]);
    }

    mki3d.cancelShades();
    mki3d.redraw();
    mki3d.message( "SELECTED ENDPOINTS MOVED BY: "+JSON.stringify(d) );
}


mki3d.action.upSelected = function(){
    /* temporary: fixed directons ... */
    mki3d.action.selectedMove(0, mki3d.data.cursor.step, 0);
}

mki3d.action.downSelected = function(){
    /* temporary: fixed directons ... */
    mki3d.action.selectedMove(0, -mki3d.data.cursor.step, 0);
}

mki3d.action.rightSelected = function(){
    /* temporary: fixed directons ... */
    mki3d.action.selectedMove(mki3d.data.cursor.step, 0, 0);
}

mki3d.action.leftSelected = function(){
    /* temporary: fixed directons ... */
    mki3d.action.selectedMove(-mki3d.data.cursor.step, 0, 0);
}

mki3d.action.forwardSelected = function(){
    /* temporary: fixed directons ... */
    mki3d.action.selectedMove( 0, 0, mki3d.data.cursor.step);
}

mki3d.action.backSelected = function(){
    /* temporary: fixed directons ... */
    mki3d.action.selectedMove( 0, 0, -mki3d.data.cursor.step);
}


/* CLIP */

mki3d.action.upClip = function(){
    /* temporary: fixed directons ... */
    mki3d.action.clip(0,1, 0);
}

mki3d.action.downClip = function(){
    /* temporary: fixed directons ... */
    mki3d.action.clip(0, -1, 0);
}

mki3d.action.rightClip = function(){
    /* temporary: fixed directons ... */
    mki3d.action.clip(1, 0, 0);
}

mki3d.action.leftClip = function(){
    /* temporary: fixed directons ... */
    mki3d.action.clip(-1, 0, 0);
}

mki3d.action.forwardClip = function(){
    /* temporary: fixed directons ... */
    mki3d.action.clip( 0, 0,1);
}

mki3d.action.backClip = function(){
    /* temporary: fixed directons ... */
    mki3d.action.clip( 0, 0, -1);
}


/* select 90-degrees rotations */
mki3d.ROTATION_90_UP      = [ [  1,  0,  0],
			      [  0,  0, -1],
			      [  0,  1,  0]  ];

mki3d.ROTATION_90_DOWN    = [ [  1,  0,  0],
		 	      [  0,  0,  1],
			      [  0, -1,  0]  ];

mki3d.ROTATION_90_LEFT    = [ [  0,  0, -1],
		 	      [  0,  1,  0],
			      [  1,  0,  0]  ];

mki3d.ROTATION_90_RIGHT   = [ [  0,  0,  1],
		 	      [  0,  1,  0],
			      [ -1,  0,  0]  ];

mki3d.ROTATION_90_BACK    = [ [  0, -1,  0],
		 	      [  1,  0,  0],
			      [  0,  0,  1]  ];

mki3d.ROTATION_90_FORWARD = [ [  0,  1,  0],
		 	      [ -1,  0,  0],
			      [  0,  0,  1]  ];

mki3d.ROTATIONS_90 = [
    mki3d.ROTATION_90_UP,
    mki3d.ROTATION_90_DOWN,
    mki3d.ROTATION_90_LEFT,
    mki3d.ROTATION_90_RIGHT,
    mki3d.ROTATION_90_BACK,
    mki3d.ROTATION_90_FORWARD
];



mki3d.action.rotate90Up = function(){
    mki3d.action.rotate90( [0,0,-1], [0,1,0]); 
}

mki3d.action.rotate90Down = function(){
    mki3d.action.rotate90( [0,0,-1],  [0,-1,0]); 
}

mki3d.action.rotate90Left = function(){
    mki3d.action.rotate90( [0,0,1],  [1,0,0]); 
}

mki3d.action.rotate90Right = function(){
    mki3d.action.rotate90( [0,0,1], [-1,0,0]); 
}

mki3d.action.rotate90Back = function(){
    mki3d.action.rotate90([1,0,0], [0,1,0]); 
}

mki3d.action.rotate90Forward = function(){
    mki3d.action.rotate90([1,0,0], [0,-1,0]); 
}



mki3d.action.rotate90 = function( myIn, myOut ){
    if(!mki3d.tmp.selected) return; // nothing selected
    mki3d.tmpRefreshVersorsMatrix();
    var vIn = mki3d.matrixVectorProduct(mki3d.tmp.versorsMatrix , 
					myIn );
    var vOut = mki3d.matrixVectorProduct(mki3d.tmp.versorsMatrix , 
					 myOut );
    var rotation=null;
    var i;
    for(i=0; i<mki3d.ROTATIONS_90.length; i++) {
        var out=mki3d.matrixVectorProduct(mki3d.ROTATIONS_90[i], vIn);
	if( mki3d.vectorCompare(out, vOut) == 0 ) {
	    rotation= mki3d.ROTATIONS_90[i];
	    break;
	}
    } 

    mki3d.rotateEndpointsArround( mki3d.tmp.selected, rotation, mki3d.data.cursor.position );
    mki3d.cancelShades();
    mki3d.redraw();
}

/* mirror actions */

mki3d.action.mirrorX= function() {
    mki3d.action.mirror([1,0,0]);
}

mki3d.action.mirrorY= function() {
    mki3d.action.mirror([0,1,0]);
}

mki3d.action.mirrorZ= function() {
    mki3d.action.mirror([0,0,1]);
}

mki3d.action.mirror= function( myDirection ) {
    if(!mki3d.tmp.selected) return; // nothing selected
    mki3d.tmpRefreshVersorsMatrix();
    var v = mki3d.matrixVectorProduct(mki3d.tmp.versorsMatrix , 
				      myDirection );
    var scale = [1-2*Math.abs(v[0]), 1-2*Math.abs(v[1]), 1-2*Math.abs(v[2])]; // set -1 on one coordinate and 1 on the remaining
    mki3d.scaleEndpointsArround( mki3d.tmp.selected, scale, mki3d.data.cursor.position );
    mki3d.cancelShades();
    mki3d.redraw();    
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
    mki3d.tmpRefreshVersorsMatrix();
    view.rotationMatrix= mki3d.matrixTransposed( mki3d.tmp.versorsMatrix );
    mki3d.setModelViewMatrix();
    mki3d.redraw();
} 




/* cursor jumping to endpoints */

mki3d.action.cursorMoveToNearestEndpoint = function( endpoints ) {
    var found= mki3d.findNearestEndpoint( mki3d.data.cursor.position,
					  endpoints
					);
    if( found === null) return "NO ENPOINT FOUND";
    mki3d.vectorSet( 
	mki3d.data.cursor.position, 
	found.position[0], found.position[1], found.position[2] 
    );
    mki3d.redraw();
    return "CURSOR JUMPED TO POSITION: " + JSON.stringify(mki3d.data.cursor.position);
}



/* clipping */

mki3d.action.clip = function ( dx, dy, dz ) {
    mki3d.tmpRefreshVersorsMatrix();
    var d = mki3d.matrixVectorProduct( mki3d.tmp.versorsMatrix , [dx,dy,dz] );
    var i;
    for(i=0; i<3; i++) { // toggle clippings
	if( d[i] > 0 ) {
	    if(  mki3d.data.clipMinVector[i] == -MKI3D_MAX_CLIP_ABS ){   
		mki3d.data.clipMinVector[i]= mki3d.data.cursor.position[i];
	    } 
	    else { 
		mki3d.data.clipMinVector[i]= -MKI3D_MAX_CLIP_ABS;
	    }
	}
	if( d[i] < 0 ) {
	    if(  mki3d.data.clipMaxVector[i] == MKI3D_MAX_CLIP_ABS ){
		mki3d.data.clipMaxVector[i]= mki3d.data.cursor.position[i];
	    }
	    else {
		mki3d.data.clipMaxVector[i]= MKI3D_MAX_CLIP_ABS;
	    }
	}
    }
    mki3d.redraw();
}

mki3d.action.unclip = function (){
    mki3d.data.clipMaxVector = [MKI3D_MAX_CLIP_ABS, MKI3D_MAX_CLIP_ABS, MKI3D_MAX_CLIP_ABS];
    mki3d.data.clipMinVector = [-MKI3D_MAX_CLIP_ABS, -MKI3D_MAX_CLIP_ABS, -MKI3D_MAX_CLIP_ABS];
    mki3d.redraw();
}

/* data */
mki3d.action.paintSelectedEndpoints = function(){
    if(!mki3d.tmp.selected) return;
    mki3d.paintEndpoints(mki3d.tmp.selected);
}

mki3d.action.paintSelectedSegments = function(){
    var sel = mki3d.getSelectedElements(mki3d.data.model.segments);
    mki3d.paintElements( sel );
    mki3d.redraw();
}

mki3d.action.paintSelectedTriangles = function(){
    mki3d.data.model.triangles=mki3d.data.model.triangles.concat( mki3d_texture.getAndDeleteSelectedTriangles(mki3d.data) );
    var sel = mki3d.getSelectedElements(mki3d.data.model.triangles);
    mki3d.paintElements( sel );
    mki3d.redraw();
}


mki3d.action.deleteSelectedSegments = function(){
    mki3d.data.model.segments = mki3d.getNotSelectedElements( mki3d.data.model.segments );
    mki3d.action.cancelVisibilityRestrictions();
    mki3d.redraw();
}

mki3d.action.deleteSelectedTriangles = function(){
    mki3d.data.model.triangles = mki3d.getNotSelectedElements( mki3d.data.model.triangles );
    mki3d_texture.getAndDeleteSelectedTriangles(mki3d.data);
    mki3d.action.cancelVisibilityRestrictions();
    mki3d.redraw();
}



mki3d.action.copySelected = function(){
    mki3d.compressSetIndexes(mki3d.data);
    var newIdx = mki3d.getMaxSetIndex( mki3d.data )+1; // empty set

    /* copy segments */
    var copy = mki3d.copyOfSelected( mki3d.data.model.segments, newIdx );
    mki3d.data.model.segments = mki3d.data.model.segments.concat(copy);
    /* copy triangles */
    copy = mki3d.copyOfSelected( mki3d.data.model.triangles, newIdx );
    mki3d.data.model.triangles = mki3d.data.model.triangles.concat(copy);

    /*copy textured triangles */
    mki3d_texture.copySelected( mki3d.data, newIdx )

    mki3d.data.set.current=newIdx;
    mki3d.action.cancelVisibilityRestrictions();
}

/* glue selected segments' endpoints with current set */
mki3d.action.glueSegments = function(){
    var endpoints = mki3d.getElementsEndpoints(mki3d.getSelectedElements(mki3d.data.model.segments));
    var glues = mki3d.glueSegmentsOfEndpoints( endpoints, mki3d.data.set.current);
    mki3d.data.model.segments = mki3d.data.model.segments.concat(glues);
}

/* glue selected segments with current set */
mki3d.action.glueTriangles = function(){
    var segs = mki3d.getSelectedElements(mki3d.data.model.segments);
    var glues = mki3d.glueTrianglesOfSegments( segs, mki3d.data.set.current);
    mki3d.data.model.triangles = mki3d.data.model.triangles.concat(glues);
}


/* light */

mki3d.action.setLight = function(){
    mki3d.setLight();
    mki3d.message("LIGHT ="+JSON.stringify(mki3d.data.light.vector));
    mki3d.redraw();
}

/* selections */
mki3d.action.cancelSelection= function(){
    mki3d.cancelSelection( mki3d.data );
    mki3d.tmp.selected=[];
}


mki3d.action.bookmarkSelection= function(){
    // if(!mki3d.tmp.selected) return; // nothing selected
    mki3d.tmp.bookmarked=mki3d.tmp.selected;
    mki3d.action.cancelSelection();
}

mki3d.action.selectBookmarked= function(){
    if(!mki3d.tmp.bookmarked) return; // nothing bookmarked
    var i;
    for(i=0; i< mki3d.tmp.bookmarked.length; i++) {
	mki3d.tmp.bookmarked[i].selected=true;
    }
    mki3d.tmpRebuildSelected();  
}

mki3d.action.unselect= function(elements){
    mki3d.cleanElementEndpointsFromKey(elements, 'selected');
    mki3d.tmpRebuildSelected();
}

mki3d.action.extractSelectedToNewSet= function(){
    if(!mki3d.tmp.selected) {
	return ("NOTHING SELECTED!");
    } 
    var newIdx= mki3d.getMaxSetIndex( mki3d.data )+1;
    mki3d.data.set.current=newIdx;
    var i;
    for(i=0; i<mki3d.tmp.selected.length; i++)
	mki3d.tmp.selected[i].set=newIdx;
    mki3d.compressSetIndexes(mki3d.data);
    return ("THE "+mki3d.tmp.selected.length+" SELECTED POINTS ARE NOW IN THE NEW SET: "+mki3d.data.set.current);
}


mki3d.action.selectByCursor= function(){
    let cursor= mki3d.data.cursor;

    if(!mki3d.tmp.selected) mki3d.tmp.selected=[];
    let points = mki3d.getElementsEndpoints(
	mki3d.data.model.segments.concat(
	    mki3d.data.model.triangles
	).concat(
	    mki3d_texture.triangles( mki3d.data )
	)
    );
    for(let i=0; i<points.length; i++)
	if( mki3d.vectorCompare( points[i].position, cursor.position ) == 0 ||
            (cursor.marker1 &&  mki3d.vectorCompare( points[i].position, cursor.marker1.position ) == 0) ||
            (cursor.marker2 &&  mki3d.vectorCompare( points[i].position, cursor.marker2.position ) == 0) 
	  ) {
	    points[i].selected=true;
	}
    mki3d.tmpRebuildSelected();
}

mki3d.action.selectInClipBox= function(){
    if(!mki3d.tmp.selected) mki3d.tmp.selected=[];
    var points = mki3d.elementEndpointsInBox(
	mki3d.data.model.segments.concat(
	    mki3d.data.model.triangles
	).concat(
	    mki3d_texture.triangles( mki3d.data )
	),
	mki3d.data.clipMinVector,
	mki3d.data.clipMaxVector
    );
    for(let i=0; i<points.length; i++) points[i].selected=true;
    mki3d.tmpRebuildSelected();
}

mki3d.action.selectCurrentSet= function(){
    var model = mki3d.data.model;
    var elements = model.segments.concat( model.triangles ).concat( mki3d_texture.triangles( mki3d.data ) );
    var i,j;
    for(i=0; i<elements.length; i++) 
	for(j=0; j<elements[i].length; j++){
	    if(elements[i][j].set == mki3d.data.set.current ) elements[i][j].selected=true;
	}
    mki3d.tmpRebuildSelected();
}

/* extend selection by remaining endpoints of incident elements */
mki3d.action.extendSelectionByIncident= function(elements){
    var incident= mki3d.getIncidentToSelectedElements( elements );
    var i;
    for(i =0 ; i<incident.length; i++) mki3d.selectElement(incident[i]);
    mki3d.tmpRebuildSelected();
    mki3d.redraw();    
}



/* view */

mki3d.action.cancelVisibilityRestrictions= function() {
    mki3d.tmpResetDisplayModel(); /// ???
    mki3d.unblockElements( mki3d.data.model.segments.
			   concat( mki3d.data.model.triangles ).
			   concat( mki3d_texture.triangles( mki3d.data ) )
			 )
    mki3d.action.unclip(); // clipping is also a view restriction
    mki3d.redraw();
}

mki3d.action.viewSelectedElements = function() {
    mki3d.action.cancelVisibilityRestrictions();
    let allElements= mki3d.data.model.segments.
	concat( mki3d.data.model.triangles ).
	concat( mki3d_texture.triangles( mki3d.data ) )
    let selectedElements=  mki3d.getSelectedElements( allElements );
    mki3d.blockElements( allElements );
    mki3d.unblockElements( selectedElements );
    mki3d.redraw();
}


mki3d.action.viewSelectedSegments = function() {
    mki3d.action.cancelVisibilityRestrictions();
    let allElements= mki3d.data.model.segments.
	concat( mki3d.data.model.triangles ).
	concat( mki3d_texture.triangles( mki3d.data ) )
    let selectedElements=  mki3d.getSelectedElements( mki3d.data.model.segments );
    mki3d.blockElements( allElements );
    mki3d.unblockElements( selectedElements );
    mki3d.redraw();
}

mki3d.action.viewSelectedTriangles = function() {
    mki3d.action.cancelVisibilityRestrictions();
    let allElements= mki3d.data.model.segments.
	concat( mki3d.data.model.triangles ).
	concat( mki3d_texture.triangles( mki3d.data ) )
    let selectedElements=  mki3d.getSelectedElements(
	mki3d.data.model.triangles.concat( mki3d_texture.triangles( mki3d.data ) )
    );
    mki3d.blockElements( allElements );
    mki3d.unblockElements( selectedElements );
    mki3d.redraw();
}




mki3d.action.viewScaleUp = function() {
    if( 2*mki3d.data.view.scale > MKI3D_MAX_SCALE ) return; // upper bound 
    mki3d.data.view.scale = 2*mki3d.data.view.scale;
    mki3d.data.cursor.step = 1/ mki3d.data.view.scale;
    mki3d.setModelViewMatrix();
    mki3d.redraw();
}

mki3d.action.viewScaleDown = function() {
    if( mki3d.data.view.scale/2 < MKI3D_MIN_SCALE ) return; // upper bound 
    mki3d.data.view.scale = mki3d.data.view.scale/2;
    mki3d.data.cursor.step = 1/ mki3d.data.view.scale;
    mki3d.setModelViewMatrix();
    mki3d.redraw();
}

/* display help */
mki3d.action.help = function() {
    mki3d.html.hideAllDivs();
    mki3d.html.html.style.overflowY="auto";
    mki3d.html.showDiv(mki3d.html.divHelp);
    window.onkeydown = mki3d.callback.helpOnKeyDown;
}

/* menu actions */

mki3d.action.escapeToCanvas = function(){
    mki3d.html.hideAllDivs();
    mki3d.html.showDiv(mki3d.html.divCanvas);
    mki3d.action.setModeActions(); // reset current mode and message
    mki3d.backup.commit(); // if the backup was prepared in the menu then commit it now
    mki3d.redraw();
    window.onkeydown = mki3d.callback.canvasOnKeyDown;
}

mki3d.action.mainMenu = function(){
    mki3d.message( mki3d.html.divMainMenu.innerHTML );
    window.onkeydown = mki3d.callback.mainMenuOnKeyDown;
}

mki3d.action.colorMenu = function(){
    mki3d.tmp.selectedColors=[];
    var i;
    if(mki3d.tmp.selected)
	for(i=0;i<mki3d.tmp.selected.length;i++)
	    mki3d.tmp.selectedColors.push(mki3d.tmp.selected[i].color);
    mki3d.tmp.selectedColors= mki3d.uniqueSorted(mki3d.tmp.selectedColors, mki3d.vectorCompare);
    mki3d.tmp.selectedColors.index=mki3d.tmp.selectedColors.length;
    /*
      mki3d.message( mki3d.html.divColorMenu.innerHTML );
      mki3d.messageAppend( '<p> RGB= <span id="spanRGB"></span></p>' );
    */
    mki3d.html.divUpperMessage.innerHTML =  mki3d.html.divColorMenu.innerHTML;
    if(mki3d.tmp.colorMenuOutput!== null){
	document.querySelector("#spanRGB").innerHTML=JSON.stringify(mki3d.tmp.colorMenuOutput);
    }

    window.onkeydown = mki3d.callback.colorMenuOnKeyDown; ////// temporary
}

mki3d.action.cursorMenu = function(){
    mki3d.message( mki3d.html.divCursorMenu.innerHTML );
    window.onkeydown = mki3d.callback.cursorMenuOnKeyDown;
}

mki3d.action.urlMenu = function(){
    mki3d.message( document.querySelector("#divURLMenu").innerHTML );
    window.onkeydown = mki3d.callback.urlMenuOnKeyDown;
}

mki3d.action.textureMenu = function(){
    mki3d.html.divUpperMessage.innerHTML = document.querySelector("#divTextureMenu").innerHTML;
    mki3d_texture.display();
    window.onkeydown = mki3d.callback.textureMenuOnKeyDown;
}

mki3d.action.textureUVMenu = function(){
    mki3d.html.divUpperMessage.innerHTML = document.querySelector("#divTextureUVMenu").innerHTML;
    window.onkeydown = mki3d.callback.textureUVMenuOnKeyDown;
}

mki3d.action.fileMenu = function(){
    mki3d.html.spanCurrentName.innerHTML=mki3d.file.suggestedName;
    mki3d.message( mki3d.html.divFileMenu.innerHTML );
    window.onkeydown = mki3d.callback.fileMenuOnKeyDown;
}

mki3d.action.indexedDBMenu = function(){
    var onsuccess = function( event ) {
	mki3d.html.divUpperMessage.innerHTML =  mki3d.html.divIndexedDBMenu.innerHTML ;
	document.querySelector("#spanCurrentNameIDB").innerHTML=mki3d.file.suggestedName; // referenced span from mki3d.html.divIndexedDBMenu.innerHTML
	/// ...
	window.onkeydown = mki3d.callback.indexedDBMenuOnKeyDown;
    }

    var onerror  = function( event ) {
	mki3d.action.escapeToCanvas();
	mki3d.messageAppend( "<br>COULD NOT OPEN DATA BASE !!!" );
    }

    mki3d.message("OPENING DATA BASE ... ");
    
    mki3d.idb.openDB( onsuccess, onerror);
}

mki3d.action.inspectIDBMenu = function(){


    mki3d.message("SCANNING DATA BASE ... ");
    /// test if database has any elements ...
    mki3d.idb.findFiles( mki3d.idb.findFilesFinalFunction  );

}


///---

    // FROM: https://dirask.com/posts/JavaScript-input-file-dialog-closed-event-pYkrR1
    
    function addDialogClosedListener(input, callback) {
        var onFocus = function() {
            window.removeEventListener('focus', onFocus);
			callback();
        };
        var onClick = function() {
            window.addEventListener('focus', onFocus);
        };
        input.addEventListener('click', onClick);
        return function() {
            input.removeEventListener('click', onClick);
            window.removeEventListener('focus', onFocus);
        };
    }



mki3d.action.selectFile= function(){
    window.onkeydown = null; // stop serving key events
    var input = document.createElement('input');
    input.type = 'file';
    input.accept=mki3d.file.fileExtension;
    input.onchange= function(evt) {
	var file = evt.target.files[0]; // select only one
	var reader = new FileReader();
	reader.readAsText(file,'UTF-8');
	
	reader.onload = readerEvent => {
	    var content = readerEvent.target.result; // this is the content!
	    mki3d.html.textareaInput.value=content;
	    mki3d.file.selectedName=escape(file.name);
	    // mki3d.html.hideAllDivs();
	    // mki3d.html.showDiv(mki3d.html.divTextLoad);
	    // window.onkeydown = mki3d.callback.textLoadOnKeyDown;
	} 
    }

    addDialogClosedListener(input, function() {
        // console.log('File-LOAD dialog closed!');
	window.onkeydown = mki3d.callback.textLoadOnKeyDown;
    });

    input.click();
}

mki3d.action.textLoad = function(file_extension){
    mki3d.file.fileExtension=file_extension;
    mki3d.html.hideAllDivs();
    mki3d.html.html.style.overflowY="auto";
    mki3d.html.showDiv(mki3d.html.divTextLoad);
    window.onkeydown = mki3d.callback.textLoadOnKeyDown;
}


mki3d.action.selectFileSave= function(){
    window.onkeydown = null; // stop serving key events
    let a=document.createElement('a');
    var file = new Blob([mki3d.html.textareaOutput.value], {type:'text/plain'});
    a.href = URL.createObjectURL(file);
    a.download = mki3d.file.suggestedSaveName;

    addDialogClosedListener(a, function() {
        // console.log('File-SAVE dialog closed!');
	window.onkeydown = mki3d.callback.textSaveOnKeyDown;
    });

    
    a.click();
    
} 


mki3d.action.textSave = function(name){
    // mki3d.message( mki3d.html.divTextSave.innerHTML );
    mki3d.file.suggestedSaveName = name;
    mki3d.html.hideAllDivs();
    mki3d.html.html.style.overflowY="auto";
    mki3d.html.showDiv(mki3d.html.divTextSave);
    mki3d.html.textareaOutput.select();
    window.onkeydown = mki3d.callback.textSaveOnKeyDown;
}



mki3d.action.dataMenu = function(){
    mki3d.message( mki3d.html.divDataMenu.innerHTML );
    window.onkeydown = mki3d.callback.dataMenuOnKeyDown;
}

mki3d.action.dataCopyMenu = function(){
    mki3d.message( mki3d.html.divDataCopyMenu.innerHTML );
    window.onkeydown = mki3d.callback.dataCopyMenuOnKeyDown;
}

mki3d.action.clipMenu = function(){
    mki3d.message( mki3d.html.divClipMenu.innerHTML );
    window.onkeydown = mki3d.callback.clipMenuOnKeyDown;
}

mki3d.action.selectionMenu = function(){
    mki3d.message( mki3d.html.divSelectionMenu.innerHTML );
    window.onkeydown = mki3d.callback.selectionMenuOnKeyDown;
}

mki3d.action.viewMenu = function(){
    mki3d.message( mki3d.html.divViewMenu.innerHTML );
    window.onkeydown = mki3d.callback.viewMenuOnKeyDown;
}

mki3d.action.actionMenu = function(){
    mki3d.message( mki3d.html.divActionMenu.innerHTML );
    window.onkeydown = mki3d.callback.actionMenuOnKeyDown;
}



mki3d.action.setMenu = function(){
    mki3d.action.cancelVisibilityRestrictions();

    mki3d.compressSetIndexes( mki3d.data );
    var maxIdx = mki3d.getMaxSetIndex( mki3d.data );
    // mki3d.data.set.current = (mki3d.data.set.current + 1) % (maxIdx+2);

    mki3d.html.spanSetMaxIdx.innerHTML= maxIdx;
    mki3d.html.spanSetCurrentIdx.innerHTML= mki3d.data.set.current;

    mki3d.message( mki3d.html.divSetMenu.innerHTML );
    window.onkeydown = mki3d.callback.setMenuOnKeyDown;
}

mki3d.action.setInculedView = function(){
    mki3d.viewInSet(mki3d.data.set.current, mki3d.data);
    mki3d.redraw();
    return "<br>VIEW RESTRICTED TO ELEMENTS INCLUDED IN SET: "+mki3d.data.set.current+". (PRESS 'QVC' TO CANCEL VIEW RESTRICTIONS)";
}

mki3d.action.setIncidentView = function(){
    mki3d.viewIncidentToSet(mki3d.data.set.current, mki3d.data);
    mki3d.redraw();
    return "<br>VIEW RESTRICTED TO ELEMENTS INCIDENT TO SET: "+mki3d.data.set.current+". (PRESS 'QVC' TO CANCEL VIEW RESTRICTIONS)";
}

mki3d.action.nextSetIdx= function(){
    var maxIdx = mki3d.getMaxSetIndex( mki3d.data );
    mki3d.data.set.current = (mki3d.data.set.current + 1) % (maxIdx+2);
    return "<br> CURRENT SET INDEX IS: "+mki3d.data.set.current;
}


mki3d.action.pointsMenu = function(){
    mki3d.message( mki3d.html.divPointsMenu.innerHTML );
    window.onkeydown = mki3d.callback.pointsMenuOnKeyDown;
}

mki3d.action.pointsSelectMenu = function(){
    mki3d.message( mki3d.html.divPointsSelectMenu.innerHTML );
    window.onkeydown = mki3d.callback.pointsSelectMenuOnKeyDown;
}

mki3d.action.constructiveMenu = function(){
    /* set <span> texts */
    mki3d.html.spanScalingFactor.innerHTML=mki3d.constructive.scalingFactor;
    mki3d.html.spanPolygonNumberOfVertices.innerHTML=mki3d.constructive.polygonNumberOfVertices;

    mki3d.message( mki3d.html.divConstructiveMenu.innerHTML );
    window.onkeydown = mki3d.callback.constructiveMenuOnKeyDown;
}

mki3d.action.constructiveMovingMenu = function(){
    /* <span> texts  are set by mki3d.action.constructiveMenu */

    mki3d.message( mki3d.html.divConstructiveMovingMenu.innerHTML );
    window.onkeydown = mki3d.callback.constructiveMovingMenuOnKeyDown;
}

mki3d.action.projectionsMenu = function(){
    /* <span> texts  are set by mki3d.action.constructiveMenu */

    mki3d.message( mki3d.html.divProjectionsMenu.innerHTML );
    window.onkeydown = mki3d.callback.projectionsMenuOnKeyDown;
}

mki3d.action.constructiveScalingMenu = function(){
    /* <span> texts  are set by mki3d.action.constructiveMenu */

    mki3d.message( mki3d.html.divConstructiveScalingMenu.innerHTML );
    window.onkeydown = mki3d.callback.constructiveScalingMenuOnKeyDown;
}

mki3d.action.constructiveInsertingMenu= function(){
    /* <span> texts  are set by mki3d.action.constructiveMenu */

    mki3d.message( mki3d.html.divConstructiveInsertingMenu.innerHTML );
    window.onkeydown = mki3d.callback.constructiveInsertingMenuOnKeyDown;
}

mki3d.action.constructiveCursorMenu = function(){
    /* <span> texts  are set by mki3d.action.constructiveMenu */

    mki3d.message( mki3d.html.divConstructiveCursorMenu.innerHTML );
    window.onkeydown = mki3d.callback.constructiveCursorMenuOnKeyDown;
}

mki3d.action.inputs = function(){
    /* Prepare Inputs page */
    mki3d.html.inputCursorX.value= mki3d.data.cursor.position[0];
    mki3d.html.inputCursorY.value= mki3d.data.cursor.position[1];
    mki3d.html.inputCursorZ.value= mki3d.data.cursor.position[2];
    
    mki3d.html.inputCursorStep.value= mki3d.data.cursor.step;
    
    mki3d.html.inputScreenZ.value= mki3d.data.view.screenShift[2];

    mki3d.html.inputStereoRed.value= mki3d.stereo.red;
    mki3d.html.inputStereoBlue.value= mki3d.stereo.blue;
    mki3d.html.inputStereoEyeShift.value= mki3d.stereo.eyeShift;


    mki3d.html.inputZoom.value= mki3d.data.projection.zoomY;

    mki3d.html.inputScalingFactor.value= mki3d.constructive.scalingFactor;
    mki3d.html.inputPolygonNumberOfVertices.value= mki3d.constructive.polygonNumberOfVertices;
    mki3d.html.inputCurrentName.value= mki3d.file.suggestedName;

    document.querySelector("#inputCanvasWidth").value= document.querySelector("#canvasId").getAttribute("width");
    document.querySelector("#inputCanvasHeight").value= document.querySelector("#canvasId").getAttribute("height");

    /* display inputs page */
    mki3d.html.hideAllDivs();
    mki3d.html.html.style.overflowY="auto";
    mki3d.html.showDiv(mki3d.html.divInputs);

    //    mki3d.message( mki3d.html.divInputs.innerHTML );
    window.onkeydown = mki3d.callback.inputsOnKeyDown;
}

mki3d.action.inputsEnter= function(){
    var msg="";
    var value;
    var oldValue;

    oldValue=mki3d.data.cursor.position[0];
    value=Number(mki3d.html.inputCursorX.value);
    if( value != oldValue ) 
	if(-MKI3D_MAX_CLIP_ABS < value &&
	   value < MKI3D_MAX_CLIP_ABS ) {
	    mki3d.data.cursor.position[0]=value;
	    msg+="<br>CURSOR X SET TO: "+mki3d.data.cursor.position[0];	
	} else {
	    msg+="<br>CURSOR X CAN NOT BE "+value;
	}
    oldValue=mki3d.data.cursor.position[1];
    value=Number(mki3d.html.inputCursorY.value);
    if( value != oldValue) 
	if(-MKI3D_MAX_CLIP_ABS < value && value < MKI3D_MAX_CLIP_ABS ) {
	    mki3d.data.cursor.position[1]=value;
	    msg+="<br>CURSOR Y SET TO: "+mki3d.data.cursor.position[1];	
	} else {
	    msg+="<br>CURSOR Y CAN NOT BE "+value;
	}
    oldValue=mki3d.data.cursor.position[2];
    value=Number(mki3d.html.inputCursorZ.value);
    if( value != oldValue)
	if(-MKI3D_MAX_CLIP_ABS < value && value < MKI3D_MAX_CLIP_ABS ) {
	    mki3d.data.cursor.position[2]=value;
	    msg+="<br>CURSOR Z SET TO: "+mki3d.data.cursor.position[2];	
	} else {
	    msg+="<br>CURSOR Z CAN NOT BE "+value;
	}

    oldValue=mki3d.data.cursor.step;
    value=Number(mki3d.html.inputCursorStep.value);
    if( value != oldValue ) {
	if( (MKI3D_MIN_SCALE <= value && value <= MKI3D_MAX_SCALE) ||
	    (-MKI3D_MAX_SCALE <= value && value <= -MKI3D_MIN_SCALE) ) {
	    mki3d.data.cursor.step=value;
	    mki3d.data.view.scale= 1.0/value;
	    msg+="<br>CURSOR STEP SET TO: "+value;	
	} else {
	    msg+="<br>CURSOR STEP CAN NOT BE "+value;
	}
    }


    oldValue=mki3d.data.view.screenShift[2];
    value=Number(mki3d.html.inputScreenZ.value);
    if( value != oldValue)
	if( MKI3D_MIN_SCREEN_Z <= value && value <= MKI3D_MAX_SCREEN_Z ) {
	    mki3d.data.view.screenShift[2]=value;
	    msg+="<br>SCREEN Z SET TO: "+mki3d.data.view.screenShift[2];	
	} else {
	    msg+="<br>SCREEN Z CAN NOT BE "+value+" (outside ["+MKI3D_MIN_SCREEN_Z+","+MKI3D_MAX_SCREEN_Z+"])";
	}
    
    oldValue=mki3d.stereo.red;
    value=Number(mki3d.html.inputStereoRed.value);
    if( value != oldValue)
	if( 0 <= value && value <= 1 ) {
	    mki3d.stereo.red=value;
	    msg+="<br>STEREO RED SET TO: "+mki3d.stereo.red;	
	} else {
	    msg+="<br>STEREO RED CAN NOT BE "+value+" (outside ["+0+","+1+"])";
	}
    
    oldValue=mki3d.stereo.blue;
    value=Number(mki3d.html.inputStereoBlue.value);
    if( value != oldValue)
	if( 0 <= value && value <= 1 ) {
	    mki3d.stereo.blue=value;
	    msg+="<br>STEREO BLUE SET TO: "+mki3d.stereo.blue;	
	} else {
	    msg+="<br>STEREO BLUE CAN NOT BE "+value+" (outside ["+0+","+1+"])";
	}
    
    oldValue=mki3d.stereo.eyeShift;
    value=Number(mki3d.html.inputStereoEyeShift.value);
    if( value != oldValue)
	if( 0 <= value && value <= 10 ) {
	    mki3d.stereo.eyeShift=value;
	    mki3d.setProjectionGLMatrices(); // reset of projection matrices needed
	    msg+="<br>STEREO EYE SHIFT SET TO: "+mki3d.stereo.eyeShift;	
	} else {
	    msg+="<br>STEREO EYE SHIFT CAN NOT BE "+value+" (outside ["+0+","+10+"])";
	}
    
    oldValue=mki3d.data.projection.zoomY;
    value=Number(mki3d.html.inputZoom.value);
    if( value != oldValue)
	if(  MKI3D_MIN_ZOOM <= value && value <= MKI3D_MAX_ZOOM ) {
	    mki3d.data.projection.zoomY=value;
	    msg+="<br>ZOOM SET TO: "+mki3d.data.projection.zoomY;
	    mki3d.setProjectionMatrix();
	    mki3d.redraw();
	} else {
	    msg+="<br>ZOOM CAN NOT BE "+value+" (outside ["+MKI3D_MIN_ZOOM+","+MKI3D_MAX_ZOOM+"])";
	}
    



    oldValue=mki3d.constructive.scalingFactor;
    value=Number(mki3d.html.inputScalingFactor.value);
    if( value != oldValue ) {
	if( (MKI3D_MIN_SCALE <= value && value <= MKI3D_MAX_SCALE) ||
	    (-MKI3D_MAX_SCALE <= value && value <= -MKI3D_MIN_SCALE) ) {
	    mki3d.constructive.scalingFactor=value;
	    msg+="<br>SCALING FACTOR SET TO: "+mki3d.constructive.scalingFactor;	
	} else {
	    msg+="<br>SCALING FACTOR CAN NOT BE "+value;
	}
    }

    oldValue=mki3d.constructive.polygonNumberOfVertices;
    value=Number(mki3d.html.inputPolygonNumberOfVertices.value);
    if( value != oldValue ) {
	if( (MKI3D_POLYGON_MIN_VERTICES<= value && value <= MKI3D_POLYGON_MAX_VERTICES)) {
	    mki3d.constructive.polygonNumberOfVertices=value;
	    msg+="<br>NUMBER OF POLYGON VERTICES SET TO: "+mki3d.constructive.polygonNumberOfVertices;	
	} else {
	    msg+="<br>NUMBER OF POLYGON VERTICES CAN NOT BE "+value;
	}
    }

    oldValue= mki3d.file.suggestedName;
    value=mki3d.html.inputCurrentName.value;
    if( value != oldValue ) {
	mki3d.file.suggestedName=value;
	msg+="<br>NEW CURRENT NAME: '"+value+"'";
    }


    mki3d.setCanvasSize( document.querySelector("#inputCanvasWidth").value,
			 document.querySelector("#inputCanvasHeight").value
		       );

    return msg;
}


setDefaultCanvasInput= function() {
    document.querySelector('#inputCanvasWidth').value= parseInt(window.innerWidth)-30;
    document.querySelector('#inputCanvasHeight').value= parseInt(window.innerHeight)-30;
}
