/* updating example from: http://www.w3schools.com/json/json_http.asp */

var url = "./example.mki3d";

var xmlhttp = new XMLHttpRequest();

xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
        var myArr = JSON.parse(xmlhttp.responseText);
        myFunction(myArr);
    }
}
xmlhttp.open("GET", url, true);    // odkomentowac pozniej
xmlhttp.send();                   // odkomentowac pozniej

function myFunction(data) {
mki3d.data=data;
mki3d.redraw();
/*
    var out = "";
    var i;
    for(i = 0; i < arr.length; i++) {
        out += '<a href="' + arr[i].url + '">' + 
        arr[i].display + '</a><br>';
    }
    document.getElementById("id01").innerHTML = out;
*/
}


/***  snipetts from mki3d scripts ***/


/** from mki3d_constants.js **/

/* Constants used by mki3d */

/* sizes of elementary components */

const MKI3D_VERTEX_POSITION_SIZE = 3; // 3 floats: x,y,z
const MKI3D_VERTEX_COLOR_SIZE = 3; // 3 floats: r,g,b

/* State of the program */

const MKI3D_STATE_WORKING = "WORKING";
const MKI3D_STATE_SAVING = "SAVING";
const MKI3D_STATE_LOADING = "LOADING";

/* constants used to decide whether the element is degenerate */
const MKI3D_MIN_SEGMENT = 1e-20;
const MKI3D_MIN_TRIANGLE = 1e-20;


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


const MKI3D_MODEL_MAX_SEGMENTS  = 10000;
const MKI3D_MODEL_MAX_TRIANGLES = 10000;



/** from mki3d.js **/

var mki3d = {}; 

window.onload= function(){
    mki3d.html.initObjects();
    mki3d.gl.initGL( mki3d.html.canvas );
    window.onresize= mki3d.callback.onWindowResize;
    // mki3d.callback.onWindowResize();
    // mki3d.setProjectionMatrix();
    // mki3d.setModelViewMatrix();
    // mki3d.action.init(); // mki3d.action requires initialization
    mki3d.html.divUpperMessage.innerHTML += "  (Press 'H' for help.)";
    // mki3d.redraw();
    // window.onkeydown=mki3d.callback.canvasOnKeyDown;
    mki3d.callback.onWindowResize();
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

    // console.log( mki3d.matrixProduct( m, r) ); // for tests
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


/** from mki3d_html.js **/

/*
  mki3d.html -- the references to the relevant objects form html page DOM
*/

mki3d.html = {};
mki3d.html.divsArray= []; /* array of <div> objects */

mki3d.html.registerDiv = function( selectorString ) {
    divObject = document.querySelector(selectorString);
    mki3d.html.divsArray.push(divObject);
    return divObject;
}

mki3d.html.hideAllDivs = function() {
    var i=0;
    for(i=0; i<mki3d.html.divsArray.length; i++) 
	mki3d.html.divsArray[i].style.display="none";
}

mki3d.html.showDiv = function(divObject) {
    divObject.style.display="block";
}



mki3d.html.initObjects= function() {
    mki3d.html.html=document.querySelector('#htmlId');
    mki3d.html.divCanvas= mki3d.html.registerDiv('#divCanvas');

    mki3d.html.divUpperMessage= document.querySelector('#divUpperMessage');
    mki3d.html.hideAllDivs();
    mki3d.html.showDiv(mki3d.html.divCanvas);

    mki3d.html.canvas= document.querySelector("#canvasId");
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
    // console.log(gl); // tests
    mki3d.gl.context = gl;
    // mki3d.gl.buffers.cursor = mki3d.gl.newBuffers( MKI3D_CURSOR_MAX_SEGMENTS , MKI3D_CURSOR_MAX_TRIANGLES );
    mki3d.gl.buffers.model = mki3d.gl.newBuffers( MKI3D_MODEL_MAX_SEGMENTS , MKI3D_MODEL_MAX_TRIANGLES );
    // mki3d.gl.buffers.selectedPoint = mki3d.gl.newBuffers( MKI3D_SELECTED_POINT.length ,  0 /* not used */);
    mki3d.gl.initShaderProgram();
    // mki3d.loadCursor();
}


/* object for storing  ids of GL buffers */
mki3d.gl.buffers = {};

mki3d.gl.newBuffers= function ( maxSegments, maxTriangles ) {
    var gl = mki3d.gl.context;
    var buf = {}; 

    buf.segments = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf.segments);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array( 2*MKI3D_VERTEX_POSITION_SIZE*maxSegments ), gl.DYNAMIC_DRAW );

    buf.segmentsColors = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf.segmentsColors);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array( 2*MKI3D_VERTEX_COLOR_SIZE*maxSegments ), gl.DYNAMIC_DRAW );

    buf.triangles = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf.triangles);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array( 3*MKI3D_VERTEX_POSITION_SIZE*maxTriangles ), gl.DYNAMIC_DRAW );

    buf.trianglesColors = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf.trianglesColors);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array( 3*MKI3D_VERTEX_COLOR_SIZE*maxTriangles ), gl.DYNAMIC_DRAW );

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

    mki3d.setProjectionMatrix();
    mki3d.setModelViewMatrix();

    mki3d.redraw();
};



/** from mki3d_studio.js **/


/* shadeFactor is computed for triangles */
/* Color of the triangle is scaled by the shade factor before placing it into buffer of colors */
/* light parameter can be mki3d.data.light  */

mki3d.shadeFactor= function ( triangle, light) {
    var normal= mki3d.normalToPlane(triangle[0].position,triangle[1].position,triangle[2].position);
    var sp= mki3d.scalarProduct(light.vector, normal);
    return light.ambientFraction+(1-light.ambientFraction)*Math.abs(sp);  
}

mki3d.drawGraph = function (graph) {
    //    console.log(graph); // test

    var gl= mki3d.gl.context;
    var shaderProgram = mki3d.gl.shaderProgram;
    if(graph.triangles){
	/* draw triangles */
	gl.bindBuffer(gl.ARRAY_BUFFER, graph.triangles );
	gl.vertexAttribPointer(shaderProgram.aVertexPosition, MKI3D_VERTEX_POSITION_SIZE, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, graph.trianglesColors);
	gl.vertexAttribPointer(shaderProgram.aVertexColor, MKI3D_VERTEX_POSITION_SIZE, gl.FLOAT, false, 0, 0);
	gl.drawArrays(gl.TRIANGLES, 0, 3*graph.nrOfTriangles);
    }
    if(graph.segments){
	/* draw lines - after triangles */
	gl.bindBuffer(gl.ARRAY_BUFFER, graph.segments );
	gl.vertexAttribPointer(shaderProgram.aVertexPosition, MKI3D_VERTEX_POSITION_SIZE, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, graph.segmentsColors);
	gl.vertexAttribPointer(shaderProgram.aVertexColor, MKI3D_VERTEX_COLOR_SIZE, gl.FLOAT, false, 0, 0);
	gl.drawArrays(gl.LINES, 0, 2*graph.nrOfSegments);
    }
}

/* load projection to GL uPMatrix */
mki3d.setProjectionMatrix = function () {
    var projection = mki3d.data.projection;
    var gl = mki3d.gl.context;
    var xx=  projection.zoomY*gl.viewportHeight/gl.viewportWidth;
    var yy=  projection.zoomY;
    var zz=  (projection.zFar+projection.zNear)/(projection.zFar-projection.zNear);
    var zw= 1;
    var wz= -2*projection.zFar*projection.zNear/(projection.zFar-projection.zNear);


    var pMatrix = mki3d.gl.matrix4( xx,  0,  0,  0,
				    0, yy,  0,  0,
				    0,  0, zz, wz,
				    0,  0, zw,  0 );

    gl.uniformMatrix4fv(mki3d.gl.shaderProgram.uPMatrix, false, pMatrix);
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


/* general redraw function */

mki3d.redraw = function() {
    var gl = mki3d.gl.context;
    var bg = mki3d.data.backgroundColor;

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    gl.clearColor(bg[0], bg[1], bg[2], 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    mki3d.loadModel();
    // mki3d.setDataClipping()
    mki3d.drawGraph( mki3d.gl.buffers.model );
    // mki3d.unsetClipping();

}

/* load model to its GL buffer */

mki3d.loadModel= function (){
    var gl = mki3d.gl.context;
    var buf = mki3d.gl.buffers.model;

    // mki3d.tmpRefreshDisplayModel();
    // var model = mki3d.tmp.display.model;
    var model = mki3d.data.model;

    var elements = [];
    var elementsColors = [];

    var i,j;
    for(i=0; i<model.segments.length; i++){
	for(j=0; j<2; j++){
	    elements.push(model.segments[i][j].position[0]);
	    elements.push(model.segments[i][j].position[1]);
	    elements.push(model.segments[i][j].position[2]);
	    elementsColors.push(model.segments[i][j].color[0]);
	    elementsColors.push(model.segments[i][j].color[1]);
	    elementsColors.push(model.segments[i][j].color[2]);
	}
    }

    // load segments and colors to GL buffers


    gl.bindBuffer(gl.ARRAY_BUFFER, buf.segments);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array( elements ), gl.DYNAMIC_DRAW );
    
    gl.bindBuffer(gl.ARRAY_BUFFER, buf.segmentsColors);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array( elementsColors ), gl.DYNAMIC_DRAW );

    buf.nrOfSegments =  elements.length/(2*MKI3D_VERTEX_POSITION_SIZE); // + ... markers

    // TO DO: triangles

    elements = [];
    elementsColors = [];

    for(i=0; i<model.triangles.length; i++){
	if(!model.triangles[i].shade) 
	    model.triangles[i].shade = mki3d.shadeFactor( model.triangles[i], mki3d.data.light);
	for(j=0; j<3; j++){
	    elements.push(model.triangles[i][j].position[0]);
	    elements.push(model.triangles[i][j].position[1]);
	    elements.push(model.triangles[i][j].position[2]);
	    elementsColors.push(model.triangles[i][j].color[0]*model.triangles[i].shade);
	    elementsColors.push(model.triangles[i][j].color[1]*model.triangles[i].shade);
	    elementsColors.push(model.triangles[i][j].color[2]*model.triangles[i].shade);
	}
    }

    // load segments and colors to GL buffers


    gl.bindBuffer(gl.ARRAY_BUFFER, buf.triangles);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array( elements ), gl.DYNAMIC_DRAW );
    
    gl.bindBuffer(gl.ARRAY_BUFFER, buf.trianglesColors);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array( elementsColors ), gl.DYNAMIC_DRAW );

    buf.nrOfTriangles =  elements.length/(3*MKI3D_VERTEX_POSITION_SIZE); 
}




/** from mki3d_data.js **/

/* 
   mki3d.data -- object representing state of work. 
   This is to be saved and loaded 
*/

mki3d.data = {};

/* model is something that can be displayed */
mki3d.data.model = {};
mki3d.data.model.segments = [];
mki3d.data.model.triangles = [];

/* view describes transformation of the model before its projection. 
   The model undergoes the following transformations:               
      - move by -focusPoint
      - rotate by rotationMatrix
      - scale by the scale
      - move by screenShift
*/


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

mki3d.data.cursor = {};
mki3d.data.cursor.position = [0,0,0]; // position in the model space 
mki3d.data.cursor.marker1 = null;
mki3d.data.cursor.marker2 = null;
mki3d.data.cursor.color = [1,1,1]; // white
mki3d.data.cursor.step = 1; // initial value 


mki3d.data.clipMaxVector = [MKI3D_MAX_CLIP_ABS, MKI3D_MAX_CLIP_ABS, MKI3D_MAX_CLIP_ABS];
mki3d.data.clipMinVector = [-MKI3D_MAX_CLIP_ABS, -MKI3D_MAX_CLIP_ABS, -MKI3D_MAX_CLIP_ABS];

mki3d.data.light = {};
mki3d.data.light.vector = [0,0,1]; 
// mki3d.data.light.serialNumber = 0;
mki3d.data.light.ambientFraction = 0.2; // the rest is diffuse fraction

mki3d.data.set = {};
mki3d.data.set.current = 0; // current set index
