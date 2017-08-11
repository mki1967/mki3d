/*
  
  mki3d_view  version 4

  THIS SCRIPT SHOULD BE SAVED IN THE FOLDER WITH HTML PAGES EXPORTED
  FROM THE MKI 3D RAPID MODELLER ( https://github.com/mki1967/mki3d ).
  IT IS USED BY THE EXPORTED PAGES FOR RENDERING AND USER INTERACTION.

  Copyright (C) 2015  Marcin Kik mki1967@gmail.com
  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.
  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.
  You should have received a copy of the GNU General Public License
  along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

/** from mki3d_constants.js **/

/* Constants used by mki3d */

/* sizes of elementary components */

const MKI3D_VERTEX_POSITION_SIZE = 3; // 3 floats: x,y,z
const MKI3D_VERTEX_COLOR_SIZE = 3; // 3 floats: r,g,b

/* upper limit for absoloute value of clipping coordinate */
const MKI3D_MAX_CLIP_ABS = 1e+20;

/* upper and lower bounds on the scale */
const MKI3D_MAX_SCALE = 1024.0; 
const MKI3D_MIN_SCALE = 1/ MKI3D_MAX_SCALE;

/* Initial view parameters */

const MKI3D_SCREEN_Z = 60;

/* Initial projection parameters */

const MKI3D_PROJECTION_Z_NEAR = 0.25;
const MKI3D_PROJECTION_Z_FAR = 300;
const MKI3D_PROJECTION_ZOOM_Y = 4.0;




/** from mki3d.js **/

var mki3d = {}; 

window.onload= function(){
    mki3d.html.initObjects();
    mki3d.gl.initGL( mki3d.html.canvas );
    mki3d.dataReset();
    window.onresize= mki3d.callback.onWindowResize;
    mki3d.loadExported();
    mki3d.callback.onWindowResize();
    mki3d.redraw();
}



/** from mki3d_algebra.js **/
/** vector and matrix operations **/


/** Vector is an array [x,y,z] **/


mki3d.vectorClone= function (v){
    return [v[0],v[1],v[2]]; 
};

/* lexicographic ordering */
mki3d.vectorCompare = function( v1, v2 ){
    var cmp=0;
    cmp= v1[0]-v2[0];
    if(cmp != 0) return cmp;
    cmp= v1[1]-v2[1];
    if(cmp != 0) return cmp;
    cmp= v1[2]-v2[2];
    return cmp;
};


mki3d.vectorProductOrdered = function( v, w){
    return v[0]<=w[0] && v[1]<=w[1] && v[2]<=w[2];
}

/* Set elements of the existing vector v */
mki3d.vectorSet = function(v, x,y,z ) {
    v[0]=x;
    v[1]=y;
    v[2]=z;
};

mki3d.vectorMove = function(v, dx, dy, dz ) {
    v[0]+= dx;
    v[1]+= dy;
    v[2]+= dz;
};

mki3d.vectorScale = function(v, sx, sy, sz ) {
    v[0]*= sx;
    v[1]*= sy;
    v[2]*= sz;
};


mki3d.scalarProduct= function( v, w ) {
    return v[0]*w[0]+v[1]*w[1]+v[2]*w[2];
};

mki3d.distanceSquare = function(v, w) {
    var a=[ v[0]-w[0], v[1]-w[1], v[2]-w[2] ];
    return mki3d.scalarProduct( a,a);
}

mki3d.vectorProduct= function( a, b ) { // cross product
    return [ a[1]*b[2]-a[2]*b[1],
             a[2]*b[0]-a[0]*b[2],
             a[0]*b[1]-a[1]*b[0]  ];
};

mki3d.vectorLength = function (a) {
    return Math.sqrt(mki3d.scalarProduct(a,a));
};

mki3d.vectorNormalized = function (v) { 
    var len= mki3d.vectorLength(v);
    if(len==0) return [0,0,0]; // normalized zero vector :-(
    var vn= mki3d.vectorClone(v);
    var s =1/len; 
    mki3d.vectorScale(vn,  s,s,s);
    return vn;
};

mki3d.normalToPlane = function ( a, b, c ) { // a,b,c are three points of the plane
    var v1 = [ b[0]-a[0], b[1]-a[1], b[2]-a[2] ];
    var v2 = [ c[0]-a[0], c[1]-a[1], c[2]-a[2] ];
    return mki3d.vectorNormalized( mki3d.vectorProduct( v1, v2 ) );
};

/* Matrix is an array of three vectors (rows of the matrix) */


/* returns new Identity matrix */
mki3d.newIdMatrix = function () {
    return [ [ 1, 0, 0],
             [ 0, 1, 0],
             [ 0, 0, 1] ]; 

};

mki3d.matrixClone = function( m ) {
    return [ mki3d.vectorClone( m[0] ),
	     mki3d.vectorClone( m[1] ),
	     mki3d.vectorClone( m[2] ) ];
};


mki3d.matrixScale = function( m, s ) {
    mki3d.vectorScale( m[0], s,s,s );
    mki3d.vectorScale( m[1], s,s,s );
    mki3d.vectorScale( m[2], s,s,s );
}; 


mki3d.matrixDeterminant = function(m)
{
    return    m[0][2]*( m[1][0]*m[2][1]-m[2][0]*m[1][1] )
        -m[1][2]*( m[0][0]*m[2][1]-m[0][1]*m[2][0] )
        +m[2][2]*( m[0][0]*m[1][1]-m[0][1]*m[1][0] );

}

mki3d.matrixInverse= function( m ){
    var det = mki3d.matrixDeterminant(m);

    if(det == 0) {
	// console.log(m);
	Throw ("mki3d.matrixInverse: non-invertible matrix");
    }

    var s= 1/det;
    
    var r= [ 
        mki3d.vectorProduct( mki3d.matrixColumn( m, 1),  mki3d.matrixColumn( m, 2) ),
        mki3d.vectorProduct( mki3d.matrixColumn( m, 2),  mki3d.matrixColumn( m, 0) ),
        mki3d.vectorProduct( mki3d.matrixColumn( m, 0),  mki3d.matrixColumn( m, 1) ) 
    ];
    

    mki3d.vectorScale( r[0],  s, s, s );
    mki3d.vectorScale( r[1],  s, s,s );
    mki3d.vectorScale( r[2],  s, s, s );

    return r;
}


mki3d.matrixColumn = function ( matrix, i ){
    return [ matrix[0][i], matrix[1][i], matrix[2][i] ];
};

mki3d.matrixTransposed = function ( matrix ){
    return [ mki3d.matrixColumn(matrix, 0),
	     mki3d.matrixColumn(matrix, 1),
	     mki3d.matrixColumn(matrix, 2) ];
};

mki3d.matrixVectorProduct = function ( m, v ) {
    var sp = mki3d.scalarProduct;
    return [ sp(m[0],v), sp(m[1],v), sp(m[2],v)];
};

mki3d.matrixProduct = function( m1, m2){ 
    var sp = mki3d.scalarProduct;
    var col = mki3d.matrixColumn;
    return [ [ sp(m1[0], col(m2, 0)) , sp(m1[0], col(m2, 1)),  sp(m1[0], col(m2, 2)) ], 
	     [ sp(m1[1], col(m2, 0)) , sp(m1[1], col(m2, 1)),  sp(m1[1], col(m2, 2)) ], 
	     [ sp(m1[2], col(m2, 0)) , sp(m1[2], col(m2, 1)),  sp(m1[2], col(m2, 2)) ] ];
};

mki3d.matrixRotatedXY= function(matrix, alpha ){
    var c = Math.cos( alpha );
    var s = Math.sin( alpha ); 
    var rot = [ [ c, -s, 0 ],
		[ s,  c, 0 ],
		[ 0,  0, 1 ] ];

    return mki3d.matrixProduct( rot, matrix );
};

mki3d.matrixRotatedXZ= function(matrix, alpha ){
    var c = Math.cos( alpha );
    var s = Math.sin( alpha ); 
    var rot = [ [ c,  0, -s ],
		[ 0,  1,  0 ],
		[ s,  0,  c ] ];

    return mki3d.matrixProduct( rot, matrix );
};

mki3d.matrixRotatedYZ= function(matrix, alpha ){
    var c = Math.cos( alpha );
    var s = Math.sin( alpha ); 
    var rot = [ [ 1,  0,  0 ],
		[ 0,  c, -s ],
		[ 0,  s,  c ] ];

    return mki3d.matrixProduct( rot, matrix );
};

/** 4-dimmensional vectors and matrices **/

mki3d.scalarProduct4= function( v, w ) {
    return v[0]*w[0]+v[1]*w[1]+v[2]*w[2]+v[3]*w[3];
};


/* extend 3d matrix to 4d matrix */
mki3d.matrix3to4= function( m ) {
    return [ 
	[ m[0][0], m[0][1], m[0][2], 0 ],
	[ m[1][0], m[1][1], m[1][2], 0 ],
	[ m[2][0], m[2][1], m[2][2], 0 ],
	[       0,       0,       0, 1 ]
    ];
};



mki3d.matrix4Column = function ( matrix, i ){
    return [ matrix[0][i], matrix[1][i], matrix[2][i], matrix[3][i] ];
};

mki3d.matrix4Product = function( m1, m2){ 
    var sp = mki3d.scalarProduct4;
    var col = mki3d.matrix4Column;
    return [ 
	[ sp(m1[0], col(m2, 0)) , sp(m1[0], col(m2, 1)),  sp(m1[0], col(m2, 2)),  sp(m1[0], col(m2, 3)) ], 
	[ sp(m1[1], col(m2, 0)) , sp(m1[1], col(m2, 1)),  sp(m1[1], col(m2, 2)),  sp(m1[1], col(m2, 3)) ], 
	[ sp(m1[2], col(m2, 0)) , sp(m1[2], col(m2, 1)),  sp(m1[2], col(m2, 2)),  sp(m1[2], col(m2, 3)) ], 
	[ sp(m1[3], col(m2, 0)) , sp(m1[3], col(m2, 1)),  sp(m1[3], col(m2, 2)),  sp(m1[3], col(m2, 3)) ] 
    ];
};


/** from mki3d_stereo.js **/
mki3d.stereoProjection= function(eyeShift){
    var d=eyeShift;
    var shift1 = [
	[ 1, 0, 0, -d],
	[ 0, 1, 0,  0],
	[ 0, 0, 1,  0],
	[ 0, 0, 0,  1]
    ];

    
    var screenZ = mki3d.data.view.screenShift[2];
    var projection = mki3d.data.projection;
    var gl = mki3d.gl.context;
    
    var dx = d* projection.zoomY / screenZ * gl.viewportHeight/gl.viewportWidth;

    var shift2 = [
	[ 1, 0, 0, dx],
	[ 0, 1, 0,  0],
	[ 0, 0, 1,  0],
	[ 0, 0, 0,  1]
    ];

    var m= mki3d.matrix4Product( mki3d.projectionMatrix(), shift1 );

    return  mki3d.matrix4Product( shift2, m );
    
}

mki3d.setProjectionGLMatrices= function(){
    mki3d.monoProjectionGL=  mki3d.gl.matrix4toGL(mki3d.projectionMatrix());
    if( mki3d.stereo.mode ) {
	mki3d.stereo.leftProjectionGL=  mki3d.gl.matrix4toGL(mki3d.stereoProjection( -mki3d.stereo.eyeShift ));
	mki3d.stereo.rightProjectionGL=  mki3d.gl.matrix4toGL(mki3d.stereoProjection( mki3d.stereo.eyeShift ));
    }
}




/** from mki3d_html.js **/

/*
  mki3d.html -- the references to the relevant objects form html page DOM
*/

mki3d.html = {};
mki3d.html.divsArray= []; /* array of <div> objects */
mki3d.html.directionButtonArray= []; /* array of direction buttons */
mki3d.html.actionButtonArray= []; /* array of action buttons */

mki3d.html.registerInArray = function( selectorString, array ) {
    htmlObject = document.querySelector(selectorString);
    array.push(htmlObject);
    return htmlObject;
}

mki3d.html.hideAllDivs = function() {
    var i=0;
    for(i=0; i<mki3d.html.divsArray.length; i++) 
	mki3d.html.divsArray[i].style.display="none";
}

mki3d.html.showDiv = function(divObject) {
    divObject.style.display="block";
}


mki3d.ROTATE_ACTION_IDX=0;
mki3d.MOVE_ACTION_IDX=1;

mki3d.DEFAULT_COLOR = "black";
mki3d.DIRECTION_ACTIVE_COLOR= "red";
mki3d.ACTION_ACTIVE_COLOR= "blue";


mki3d.ACTION_INTERVAL=50; // 50 ms

mki3d.actionIdx=mki3d.ROTATE_ACTION_IDX;

mki3d.stopIntervalAction =function(){
    if(!mki3d.tmp.intervalAction) return; // nothing to stop
    window.clearInterval(mki3d.tmp.intervalAction);
    mki3d.tmp.intervalAction=null;
    mki3d.html.setStyleKeys(mki3d.html.directionButtonArray, "color", mki3d.DEFAULT_COLOR);
}

mki3d.html.setStyleKeys= function( array, key, value){
    var i;
    for(i=0; i<array.length; i++) {
	array[i].style[key]=value;
    }

}

mki3d.directionSetOnClickClosure = function( buttonIdxIn,  actionArrayIn ){
    var idx= buttonIdxIn;
    mki3d.html.directionButtonArray[idx].mki3dAction=actionArrayIn;

    return function(){
	if(!mki3d.tmp.intervalAction) {
	    mki3d.tmp.intervalAction=window.setInterval(
		mki3d.html.directionButtonArray[idx].mki3dAction[mki3d.actionIdx],
		mki3d.ACTION_INTERVAL
	    );
	    mki3d.html.directionButtonArray[idx].style.color= mki3d.DIRECTION_ACTIVE_COLOR; 
	} else {
	    mki3d.stopIntervalAction();
	}

    }
}


mki3d.actionSetOnClickClosure = function( buttonIdxIn,  callback ){
    var idx= buttonIdxIn;
    return function(){
	mki3d.stopIntervalAction();
	callback(idx);
    }
}

mki3d.buttonMoveCallback= function( buttonIdx ) {
    mki3d.actionIdx=mki3d.MOVE_ACTION_IDX;   // uncomment later ...
    mki3d.html.setStyleKeys(mki3d.html.actionButtonArray, "color", mki3d.DEFAULT_COLOR);
    mki3d.html.actionButtonArray[buttonIdx].style.color= mki3d.ACTION_ACTIVE_COLOR; 
}

mki3d.buttonRotateCallback= function( buttonIdx ) {
    mki3d.actionIdx=mki3d.ROTATE_ACTION_IDX;   
    mki3d.html.setStyleKeys(mki3d.html.actionButtonArray, "color", mki3d.DEFAULT_COLOR);
    mki3d.html.actionButtonArray[buttonIdx].style.color= mki3d.ACTION_ACTIVE_COLOR; 
}

// for mouse and touch move
mki3d.deltaAction= function( dx, dy ){
    switch(mki3d.actionIdx) {
    case mki3d.ROTATE_ACTION_IDX:
	if( Math.abs(dx) >= Math.abs(dy) ) {
	    mki3d.action.viewRotateRight(dx/mki3d.html.canvas.width*2*Math.PI);
	} else {
	    mki3d.action.viewRotateUp(-dy/mki3d.html.canvas.height*2*Math.PI);
	}
	break;
    case mki3d.MOVE_ACTION_IDX:
	var c=2*mki3d.data.view.screenShift[2]/mki3d.data.projection.zoomY;
	mki3d.moveFocusPoint([-dx/mki3d.html.canvas.height*c, dy/mki3d.html.canvas.height*c,0]);
	break;
    }
    mki3d.redraw();
}

mki3d.lastMouse={};

mki3d.onMouseMove= function(e){
    var dx= e.clientX-mki3d.lastMouse.clientX;
    var dy= e.clientY-mki3d.lastMouse.clientY;
    mki3d.lastMouse.clientX=e.clientX;
    mki3d.lastMouse.clientY=e.clientY;
    mki3d.deltaAction( dx, dy );
}

// touch callbacks 
mki3d.lastTouch={};

mki3d.onTouchMove=function(e){
    e.preventDefault();
    var dx= e.touches[0].clientX-mki3d.lastTouch.clientX;
    var dy= e.touches[0].clientY-mki3d.lastTouch.clientY;
    mki3d.lastTouch.clientX=e.touches[0].clientX;
    mki3d.lastTouch.clientY=e.touches[0].clientY;
    mki3d.deltaAction( dx, dy );
}




mki3d.html.initObjects= function() {
    mki3d.html.html=document.querySelector('#htmlId');
    // mki3d.html.html.style.overflowY="";
    mki3d.html.divCanvas= mki3d.html.registerInArray('#divCanvas', mki3d.html.divsArray);

    var idx;
    /* Register direction buttons */
    mki3d.html.leftButton= mki3d.html.registerInArray('#leftButton', mki3d.html.directionButtonArray);
    idx = mki3d.html.directionButtonArray.length-1,
    mki3d.html.directionButtonArray[idx].onclick = mki3d.directionSetOnClickClosure(idx, mki3d.directionActions.left)

    mki3d.html.rightButton= mki3d.html.registerInArray('#rightButton', mki3d.html.directionButtonArray);
    idx = mki3d.html.directionButtonArray.length-1, 
    mki3d.html.directionButtonArray[idx].onclick = mki3d.directionSetOnClickClosure(idx, mki3d.directionActions.right)

    mki3d.html.upButton= mki3d.html.registerInArray('#upButton', mki3d.html.directionButtonArray);
    idx = mki3d.html.directionButtonArray.length-1, 
    mki3d.html.directionButtonArray[idx].onclick = mki3d.directionSetOnClickClosure(idx, mki3d.directionActions.up)

    mki3d.html.downButton= mki3d.html.registerInArray('#downButton', mki3d.html.directionButtonArray);
    idx = mki3d.html.directionButtonArray.length-1, 
    mki3d.html.directionButtonArray[idx].onclick = mki3d.directionSetOnClickClosure(idx, mki3d.directionActions.down)

    mki3d.html.backButton= mki3d.html.registerInArray('#backButton', mki3d.html.directionButtonArray);
    idx = mki3d.html.directionButtonArray.length-1, 
    mki3d.html.directionButtonArray[idx].onclick = mki3d.directionSetOnClickClosure(idx, mki3d.directionActions.back)

    mki3d.html.forwardButton= mki3d.html.registerInArray('#forwardButton', mki3d.html.directionButtonArray);
    idx = mki3d.html.directionButtonArray.length-1, 
    mki3d.html.directionButtonArray[idx].onclick = mki3d.directionSetOnClickClosure(idx, mki3d.directionActions.forward)

    /* Register action buttons */
    mki3d.html.rotateButton= mki3d.html.registerInArray('#rotateButton', mki3d.html.actionButtonArray);
    idx = mki3d.html.actionButtonArray.length-1, 
    mki3d.html.actionButtonArray[idx].onclick  = mki3d.actionSetOnClickClosure(idx,
									       mki3d.buttonRotateCallback
									      );

    mki3d.html.moveButton= mki3d.html.registerInArray('#moveButton', mki3d.html.actionButtonArray);
    idx = mki3d.html.actionButtonArray.length-1, 
    mki3d.html.actionButtonArray[idx].onclick  = mki3d.actionSetOnClickClosure(idx,
									       mki3d.buttonMoveCallback
									      );
    mki3d.html.scaleUpButton= mki3d.html.registerInArray('#scaleUpButton', mki3d.html.actionButtonArray);
    idx = mki3d.html.actionButtonArray.length-1, 
    mki3d.html.actionButtonArray[idx].onclick  = mki3d.actionSetOnClickClosure(idx,
									       mki3d.scaleUpCallback
									      );
    mki3d.html.scaleDownButton= mki3d.html.registerInArray('#scaleDownButton', mki3d.html.actionButtonArray);
    idx = mki3d.html.actionButtonArray.length-1, 
    mki3d.html.actionButtonArray[idx].onclick  = mki3d.actionSetOnClickClosure(idx,
									       mki3d.scaleDownCallback
									      );
    mki3d.html.alignButton= mki3d.html.registerInArray('#alignButton', mki3d.html.actionButtonArray);
    idx = mki3d.html.actionButtonArray.length-1, 
    mki3d.html.actionButtonArray[idx].onclick  = mki3d.actionSetOnClickClosure(idx,
									       mki3d.action.viewAlignRotation
									      );
    mki3d.html.resetButton= mki3d.html.registerInArray('#resetButton', mki3d.html.actionButtonArray);
    idx = mki3d.html.actionButtonArray.length-1, 
    mki3d.html.actionButtonArray[idx].onclick  = function() {
	mki3d.stopIntervalAction();
	mki3d.dataReset();
	mki3d.redraw();
    };


    mki3d.html.divUpperMessage= document.querySelector('#divUpperMessage');
    mki3d.html.hideAllDivs();
    mki3d.html.showDiv(mki3d.html.divCanvas);

    mki3d.html.canvas= document.querySelector("#canvasId");


    /* touch callbacks */

    function onTouchDown(evt){
	evt.preventDefault();
	mki3d.stopIntervalAction();
	mki3d.lastTouch.clientX=evt.touches[0].clientX;
	mki3d.lastTouch.clientY=evt.touches[0].clientY;
	mki3d.html.canvas.addEventListener("touchmove",   mki3d.onTouchMove, false);
    }

    function onTouchUp(evt){
	evt.preventDefault();
	mki3d.html.canvas.removeEventListener("touchmove",   mki3d.onTouchMove);
    }

    mki3d.html.canvas.addEventListener("touchstart", onTouchDown, false);
    mki3d.html.canvas.addEventListener("touchend", onTouchUp, false);


    

    /* mouse callbacs */

    mki3d.html.canvas.onmousedown= function (e){
	mki3d.stopIntervalAction();
	mki3d.lastMouse.clientX=e.clientX;
	mki3d.lastMouse.clientY=e.clientY;
	mki3d.html.canvas.onmousemove=mki3d.onMouseMove;
    }

    mki3d.html.canvas.onmouseup= function (e){
	mki3d.html.canvas.onmousemove=null;
    }



    mki3d.html.canvas.onwheel= function (e){
	if(!e.deltaY) return;
	if(e.deltaY==0) return;
	var sign= e.deltaY/Math.abs(e.deltaY);
	switch(mki3d.actionIdx) {
	case mki3d.ROTATE_ACTION_IDX:
	    mki3d.action.viewRotateForward(-sign*Math.PI/10);
	    break;
	case mki3d.MOVE_ACTION_IDX:
	    mki3d.moveFocusPoint([0,0, sign*1]);
	    break;
	}
	mki3d.redraw();
    }

}




/* scaling callbacks */

mki3d.MAX_SCALE= 128; // power of two
mki3d.MIN_SCALE= 1/mki3d.MAX_SCALE;

mki3d.scaleUpCallback= function( buttonIdx ) {
    var view=mki3d.data.view;
    view.scale= Math.min(MKI3D_MAX_SCALE, 2*view.scale);
    mki3d.redraw();
} 

mki3d.scaleDownCallback= function( buttonIdx ) {
    var view=mki3d.data.view;
    view.scale= Math.max(MKI3D_MIN_SCALE, view.scale/2);
    mki3d.redraw();
} 


/** from mki3d_gl.js **/

mki3d.gl = {};

/*jshint multistr: true */
mki3d.gl.vertexShaderSource = " \
attribute vec3 aVertexPosition; \
attribute vec4 aVertexColor; \
uniform mat4 uMVMatrix; \
uniform mat4 uPMatrix; \
varying vec4 vColor; \
varying vec3 vPosition;\
void main(void) { \
gl_Position =   uPMatrix*uMVMatrix*vec4(aVertexPosition, 1.0); \
vColor = aVertexColor; \
vPosition = aVertexPosition; \
}";

mki3d.gl.fragmentShaderSource = " \
precision mediump float; \
uniform vec3 uClipMax; \
uniform vec3 uClipMin; \
varying vec4 vColor; \
varying vec3 vPosition;\
void main(void) { \
if( vPosition.x > uClipMax.x ) discard; \
if( vPosition.y > uClipMax.y ) discard; \
if( vPosition.z > uClipMax.z ) discard; \
if( vPosition.x < uClipMin.x ) discard; \
if( vPosition.y < uClipMin.y ) discard; \
if( vPosition.z < uClipMin.z ) discard; \
gl_FragColor = vColor; \
}";





mki3d.gl.initGL= function(canvas) {
    var gl = canvas.getContext("experimental-webgl");
    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;
    mki3d.gl.context = gl;
    mki3d.gl.buffers.model = mki3d.gl.newBuffers();
    mki3d.gl.initShaderProgram();
}


/* object for storing  ids of GL buffers */
mki3d.gl.buffers = {};

mki3d.gl.newBuffers= function () {
    var gl = mki3d.gl.context;
    var buf = {}; 

    buf.segments = gl.createBuffer();
    buf.segmentsColors = gl.createBuffer();
    buf.triangles = gl.createBuffer();
    buf.trianglesColors = gl.createBuffer();
    buf.nrOfSegments = 0;
    buf.nrOfTriangles = 0;
    return buf;
} 


// SHADER PROGRAM

mki3d.gl.initShaderProgram= function(){
    var gl=mki3d.gl.context;

    var fragmentShader =gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, mki3d.gl.fragmentShaderSource);
    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        console.log(gl.getShaderInfoLog(fragmentShader));
	return;
    }

    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, mki3d.gl.vertexShaderSource);
    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        console.log(gl.getShaderInfoLog(vertexShader));
	return;
    }

    var shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        console.log("Could not initialise shaders");
	return;
    }
    gl.useProgram(shaderProgram);

    shaderProgram.aVertexPosition = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.aVertexPosition);

    shaderProgram.aVertexColor = gl.getAttribLocation(shaderProgram, "aVertexColor");
    gl.enableVertexAttribArray(shaderProgram.aVertexColor);


    shaderProgram.uPMatrix = gl.getUniformLocation(shaderProgram, "uPMatrix");
    shaderProgram.uMVMatrix = gl.getUniformLocation(shaderProgram, "uMVMatrix");

    shaderProgram.uClipMax = gl.getUniformLocation(shaderProgram, "uClipMax");
    shaderProgram.uClipMin = gl.getUniformLocation(shaderProgram, "uClipMin");

    mki3d.gl.shaderProgram = shaderProgram;
}

mki3d.gl.vector3 = function ( x,y,z ){
    return new Float32Array(x,y,z);
}

mki3d.gl.matrix4 = function (  xx, yx, zx, wx,
			       xy, yy, zy, wy,
			       xz, yz, zz, wz,
			       xw, yw, zw, ww )
{
    // sequence of concatenated columns
    return new Float32Array( [ xx, xy, xz, xw,
                               yx, yy, yz, yw,
                               zx, zy, zz, zw,
                               wx, wy, wz, ww ] );
}

mki3d.gl.setClipMax= function ( x, y, z) {
    mki3d.gl.context.uniform3f(mki3d.gl.shaderProgram.uClipMax,  x,y,z  );
}

mki3d.gl.setClipMin= function ( x, y, z) {
    mki3d.gl.context.uniform3f(mki3d.gl.shaderProgram.uClipMin,  x,y,z  );
}



/** from mki3d_callback.js **/

/* event callbacks */

mki3d.callback = {};

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

    // mki3d.setProjectionMatrix();
    mki3d.setProjectionGLMatrices()

    mki3d.setModelViewMatrix();

    mki3d.redraw();
};



/** from mki3d_studio.js **/


mki3d.drawGraph = function (graph) {
    //    console.log(graph); // test

    var gl= mki3d.gl.context;
    var shaderProgram = mki3d.gl.shaderProgram;
    if(graph.triangles && graph.nrOfTriangles>0 ){
	/* draw triangles */
	gl.bindBuffer(gl.ARRAY_BUFFER, graph.triangles );
	gl.vertexAttribPointer(shaderProgram.aVertexPosition, MKI3D_VERTEX_POSITION_SIZE, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, graph.trianglesColors);
	gl.vertexAttribPointer(shaderProgram.aVertexColor, MKI3D_VERTEX_COLOR_SIZE, gl.FLOAT, false, 0, 0);
	gl.drawArrays(gl.TRIANGLES, 0, 3*graph.nrOfTriangles);
    }
    if(graph.segments && graph.nrOfSegments>0 ){
	/* draw lines - after triangles */
	gl.bindBuffer(gl.ARRAY_BUFFER, graph.segments );
	gl.vertexAttribPointer(shaderProgram.aVertexPosition, MKI3D_VERTEX_POSITION_SIZE, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, graph.segmentsColors);
	gl.vertexAttribPointer(shaderProgram.aVertexColor, MKI3D_VERTEX_COLOR_SIZE, gl.FLOAT, false, 0, 0);
	gl.drawArrays(gl.LINES, 0, 2*graph.nrOfSegments);
    }
}


/* 4d matrix to GL format */
mki3d.gl.matrix4toGL = function ( m )
{
    // sequence of concatenated columns
    return new Float32Array( [
	m[0][0], m[1][0], m[2][0], m[3][0],
	m[0][1], m[1][1], m[2][1], m[3][1],
	m[0][2], m[1][2], m[2][2], m[3][2],
	m[0][3], m[1][3], m[2][3], m[3][3]
    ] );
}



/* compute projection matrix */

mki3d.projectionMatrix = function(){
    var projection = mki3d.data.projection;
    var gl = mki3d.gl.context;
    var xx=  projection.zoomY*gl.viewportHeight/gl.viewportWidth;
    var yy=  projection.zoomY;
    var zz=  (projection.zFar+projection.zNear)/(projection.zFar-projection.zNear);
    var zw= 1;
    var wz= -2*projection.zFar*projection.zNear/(projection.zFar-projection.zNear);

    
    var pMatrix = [
	[xx,  0,  0,  0],
	[ 0, yy,  0,  0],
	[ 0,  0, zz, wz],
	[ 0,  0, zw,  0]
    ];
    
    return pMatrix;
}


/* load model view  to GL uMVMatrix */
mki3d.setModelViewMatrix = function () {
    var gl = mki3d.gl.context;
    var mov = mki3d.vectorClone( mki3d.data.view.focusPoint);
    mki3d.vectorScale( mov, -1, -1, -1);
    var rot = mki3d.matrixClone( mki3d.data.view.rotationMatrix);
    var scale= mki3d.data.view.scale;

    mki3d.vectorScale( rot[0], scale, scale, scale);
    mki3d.vectorScale( rot[1], scale, scale, scale);
    mki3d.vectorScale( rot[2], scale, scale, scale);
    
    var scrSh= mki3d.data.view.screenShift;
    
    var mvMatrix =  mki3d.gl.matrix4( 
	rot[0][0], rot[0][1], rot[0][2], mki3d.scalarProduct(rot[0],mov)+scrSh[0],
	rot[1][0], rot[1][1], rot[1][2], mki3d.scalarProduct(rot[1],mov)+scrSh[1],
	rot[2][0], rot[2][1], rot[2][2], mki3d.scalarProduct(rot[2],mov)+scrSh[2],
        0,                 0,         0,                                        1 );
    
    gl.uniformMatrix4fv(mki3d.gl.shaderProgram.uMVMatrix, false, mvMatrix);

}

mki3d.setDataClipping= function (){
    var v= mki3d.data.clipMaxVector;
    mki3d.gl.setClipMax(v[0], v[1], v[2]);
    v= mki3d.data.clipMinVector;
    mki3d.gl.setClipMin(v[0], v[1], v[2]);
}

mki3d.unsetClipping= function () {
    mki3d.gl.setClipMax(MKI3D_MAX_CLIP_ABS, MKI3D_MAX_CLIP_ABS, MKI3D_MAX_CLIP_ABS);
    mki3d.gl.setClipMin(-MKI3D_MAX_CLIP_ABS, -MKI3D_MAX_CLIP_ABS, -MKI3D_MAX_CLIP_ABS);
}


/* loadf exported data to the GL buffers */
mki3d.loadExported= function() {
    var gl = mki3d.gl.context;
    var buf = mki3d.gl.buffers.model;
    // load segments and colors to GL buffers
    var elements=mki3d.exported.segments;
    var elementsColors = mki3d.exported.segmentsColors;

    gl.bindBuffer(gl.ARRAY_BUFFER, buf.segments);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array( elements ), gl.STATIC_DRAW );
    
    gl.bindBuffer(gl.ARRAY_BUFFER, buf.segmentsColors);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array( elementsColors ), gl.STATIC_DRAW );

    buf.nrOfSegments =  elements.length/(2*MKI3D_VERTEX_POSITION_SIZE); // + ... markers

    // load triangles and colors to GL buffers
    elements=mki3d.exported.triangles;
    elementsColors = mki3d.exported.trianglesColors;


    gl.bindBuffer(gl.ARRAY_BUFFER, buf.triangles);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array( elements ), gl.STATIC_DRAW );
    
    gl.bindBuffer(gl.ARRAY_BUFFER, buf.trianglesColors);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array( elementsColors ), gl.STATIC_DRAW );

    buf.nrOfTriangles =  elements.length/(3*MKI3D_VERTEX_POSITION_SIZE); 

}

/* general redraw function */

mki3d.redraw = function() {
    
    var gl = mki3d.gl.context;
    var bg = mki3d.data.backgroundColor;

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    mki3d.setModelViewMatrix();
    
    /// mki3d.stereo.mode=true // test stereo mode

    if(mki3d.stereo.mode){  /// test stereo version for white colors only ;-)
	gl.clearColor(0.0, 0.0, 0.0, 1.0); // stereo background 
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // clear everything
	/* LEFT */
	gl.colorMask(true, false, false, true ); /// red filter
	mki3d.redrawProjection( mki3d.stereo.leftProjectionGL); // monoscopic view
	/* RIGHT */
	gl.clear(gl.DEPTH_BUFFER_BIT); // clear depth buffer only
	gl.colorMask(false, false, true, true ); /// blue filter
	mki3d.redrawProjection( mki3d.stereo.rightProjectionGL); // monoscopic view
	gl.colorMask(true, true, true, true ); /// reset filter
    } else {
	gl.clearColor(bg[0], bg[1], bg[2], 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	mki3d.redrawProjection(mki3d.monoProjectionGL); // monoscopic view
    }

}

mki3d.redrawProjection = function( projectionMatrixGL ) {
    mki3d.gl.context.useProgram( mki3d.gl.shaderProgram ); // use the default shader program
    mki3d.gl.context.uniformMatrix4fv(mki3d.gl.shaderProgram.uPMatrix, false,  projectionMatrixGL  ); // projectionMatrixGL

    
    mki3d.setDataClipping()
    mki3d.drawGraph( mki3d.gl.buffers.model );
    mki3d.unsetClipping();

}


/** from mki3d_data.js **/

mki3d.data = {};


mki3d.dataReset= function(){
    mki3d.data = {};
    mki3d.data.view = {};
    mki3d.data.view.focusPoint = [0,0,0];
    mki3d.data.view.rotationMatrix = mki3d.newIdMatrix();
    mki3d.data.view.scale = 1;
    mki3d.data.view.screenShift = [0,0, MKI3D_SCREEN_Z];

    mki3d.data.projection = {}; 
    mki3d.data.projection.zNear = MKI3D_PROJECTION_Z_NEAR;
    mki3d.data.projection.zFar  = MKI3D_PROJECTION_Z_FAR;
    mki3d.data.projection.zoomY = MKI3D_PROJECTION_ZOOM_Y;

    mki3d.data.backgroundColor = [0,0,0]; // black

    mki3d.data.clipMaxVector = [MKI3D_MAX_CLIP_ABS, MKI3D_MAX_CLIP_ABS, MKI3D_MAX_CLIP_ABS];
    mki3d.data.clipMinVector = [-MKI3D_MAX_CLIP_ABS, -MKI3D_MAX_CLIP_ABS, -MKI3D_MAX_CLIP_ABS];
    if(mki3d.exported.view) mki3d.data.view = JSON.parse(JSON.stringify(mki3d.exported.view)); // clone
    if(mki3d.exported.projection) mki3d.data.projection = JSON.parse(JSON.stringify(mki3d.exported.projection)); // clone
    if(mki3d.exported.backgroundColor) mki3d.data.backgroundColor = JSON.parse(JSON.stringify(mki3d.exported.backgroundColor)); // clone
    mki3d.stereo= { mode: false };
    if(mki3d.exported.stereo)	mki3d.stereo = JSON.parse(JSON.stringify(mki3d.exported.stereo)); // clone
    // recompute matrices 
    mki3d.setProjectionGLMatrices();
    mki3d.setModelViewMatrix();
}


/** from mki3d_action.js **/



/* ROTATE */
mki3d.action = {};
/* rotation step */
mki3d.action.rotationStep = Math.PI / 36; // 5 degrees 


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

/* moving focus point in obervers coordinates */

mki3d.moveFocusPoint= function( vector ){
    var view= mki3d.data.view;
    var rs=1/view.scale;
    mki3d.vectorScale(vector, rs, rs, rs);
    var matrix= mki3d.matrixInverse(view.rotationMatrix);
    var v= mki3d.matrixVectorProduct(matrix, vector);
    mki3d.vectorMove(view.focusPoint, v[0], v[1], v[2]);
    mki3d.setModelViewMatrix();
    mki3d.redraw();
}



/* direction callbacks for MOVE */

mki3d.MOVE_STEP=0.5;

mki3d.moveLeft = function() {
    mki3d.moveFocusPoint([mki3d.MOVE_STEP,0,0]);
}

mki3d.moveRight = function() {
    mki3d.moveFocusPoint([-mki3d.MOVE_STEP,0,0]);
}

mki3d.moveUp = function() {
    mki3d.moveFocusPoint([0,-mki3d.MOVE_STEP,0]);
}

mki3d.moveDown = function() {
    mki3d.moveFocusPoint([0,mki3d.MOVE_STEP,0]);
}

mki3d.moveForward = function() {
    mki3d.moveFocusPoint([0,0,-mki3d.MOVE_STEP]);
}

mki3d.moveBack = function() {
    mki3d.moveFocusPoint([0,0,mki3d.MOVE_STEP]);
}



mki3d.directionActions = {
    left: [mki3d.action.leftRotate, mki3d.moveLeft],
    right: [mki3d.action.rightRotate, mki3d.moveRight],
    up: [mki3d.action.upRotate, mki3d.moveUp],
    down: [mki3d.action.downRotate, mki3d.moveDown],
    back: [mki3d.action.backRotate, mki3d.moveBack],
    forward: [mki3d.action.forwardRotate, mki3d.moveForward]
}

window.onkeydown = function (e){
    // var code=e.keyCode? e.keyCode : e.charCode;
    const rotStep = Math.PI / 36; // 5 degrees 
    var code= e.which || e.keyCode;
    switch(code)
    {
	/* direction actions */
	case 38: // up
	case 73: // I
	mki3d.directionActions.up[mki3d.actionIdx]();
	break;
	case 40: // down
	case 75: // K
	mki3d.directionActions.down[mki3d.actionIdx]();
	break;
	case 37: // left
	case 74:// J
	mki3d.directionActions.left[mki3d.actionIdx]();
	break;
	case 39:// right
	case 76: // L
	mki3d.directionActions.right[mki3d.actionIdx]();
	break;
	case 70: // F
	mki3d.directionActions.forward[mki3d.actionIdx]();
	break;
	case 66: // B
	case 86: // V
	mki3d.directionActions.back[mki3d.actionIdx]();
	break;

	/* action buttons */
	case 82: // R
	mki3d.html.rotateButton.onclick();
	break;
	case 77: // M
	mki3d.html.moveButton.onclick();
	break;

	case 85: // U
	mki3d.html.scaleUpButton.onclick();
	break;
	case 68: // D
	mki3d.html.scaleDownButton.onclick();
	break;
	case 13: // enter
	case 27: // escape
	case 81: // Q
	mki3d.html.resetButton.onclick();
	break;
	case 32: // space
	mki3d.html.alignButton.onclick();
	break;

    }
};


/** from mki3d_tmp.js **/

mki3d.tmp={};

/* (re)creation of tmp data */

mki3d.tmpMakeVersorsMatrix = function() {

    var rot = mki3d.data.view.rotationMatrix;

    var imageXYZRows = [ { img : mki3d.matrixColumn(rot, 0), idx : 0 , row: [1,0,0] },
			 { img : mki3d.matrixColumn(rot, 1), idx : 1 , row: [0,1,0] },
			 { img : mki3d.matrixColumn(rot, 2), idx : 2 , row: [0,0,1] }];

    var spMaxAbs, spNext, tmp; 

    /* Move best image for Right key to imageXYZRows[0]  */

    spMaxAbs = mki3d.scalarProduct( imageXYZRows[0].img, [1,0,0] );
    spNext   = mki3d.scalarProduct( imageXYZRows[1].img, [1,0,0] );
    if( Math.abs(spMaxAbs) < Math.abs(spNext) ) { // swap 
	tmp = imageXYZRows[0];
	imageXYZRows[0] = imageXYZRows[1];
        imageXYZRows[1] = tmp;
        spMaxAbs=spNext; // new record
    } 
    spNext   = mki3d.scalarProduct( imageXYZRows[2].img, [1,0,0] );
    if( Math.abs(spMaxAbs) < Math.abs(spNext) ) { // swap 
	tmp = imageXYZRows[0];
	imageXYZRows[0] = imageXYZRows[2];
        imageXYZRows[2] = tmp;
        spMaxAbs=spNext; // new record
    } 
    /* set direction */
    if(spMaxAbs < 0 ) mki3d.vectorScale( imageXYZRows[0].row, -1, -1, -1); 

    /* Move best image for Up key to  imageXYZRows[1] */

    spMaxAbs = mki3d.scalarProduct( imageXYZRows[1].img, [0,1,0] );
    spNext   = mki3d.scalarProduct( imageXYZRows[2].img, [0,1,0] );
    if( Math.abs(spMaxAbs) < Math.abs(spNext) ) { // swap 
	tmp = imageXYZRows[1];
	imageXYZRows[1] = imageXYZRows[2];
        imageXYZRows[2] = tmp;
        spMaxAbs=spNext; // new record
    } 
    /* set direction */
    if(spMaxAbs < 0 ) mki3d.vectorScale( imageXYZRows[1].row, -1, -1, -1); 

    /* set direction of the last versor */
    if(mki3d.scalarProduct( imageXYZRows[2].img, [0,0,1] )<0) mki3d.vectorScale( imageXYZRows[2].row, -1, -1, -1); 

    /* set the versorsMatrix */

    var alignedMatrix = [ imageXYZRows[0].row,
			  imageXYZRows[1].row,
			  imageXYZRows[2].row ];
    mki3d.tmp.versorsMatrix = mki3d.matrixTransposed(alignedMatrix); // reverse of the alignedMatrix
    mki3d.tmp.versorsMatrix.input = rot;
};

mki3d.tmpInvalidVersorsMatrix= function(){
    if(!mki3d.tmp.versorsMatrix) return true;
    return mki3d.tmp.versorsMatrix.input !== mki3d.data.view.rotationMatrix;
}; 

mki3d.tmpRefreshVersorsMatrix= function(){
    if( mki3d.tmpInvalidVersorsMatrix() ) mki3d.tmpMakeVersorsMatrix();
};
