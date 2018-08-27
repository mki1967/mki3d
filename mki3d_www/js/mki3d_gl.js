mki3d.gl = {};

/*jshint multistr: true */
mki3d.gl.vertexShaderSource = " "+
    " attribute vec3 aVertexPosition; "+
    " attribute vec4 aVertexColor; "+
    " uniform mat4 uMVMatrix; "+
    " uniform mat4 uPMatrix; "+
    " varying vec4 vColor; "+
    " varying vec3 vPosition;"+
    " void main(void) { "+
    " gl_Position =   uPMatrix*uMVMatrix*vec4(aVertexPosition, 1.0); "+
    " vColor = aVertexColor; "+
    " vPosition = aVertexPosition; "+
    " }\n";

mki3d.gl.fragmentShaderSource = " "+
    " precision mediump float; "+
    " uniform vec3 uClipMax; "+
    " uniform vec3 uClipMin; "+
    " varying vec4 vColor; "+
    " varying vec3 vPosition;"+
    " void main(void) { "+
    " if( vPosition.x > uClipMax.x ) discard; "+
    " if( vPosition.y > uClipMax.y ) discard; "+
    " if( vPosition.z > uClipMax.z ) discard; "+
    " if( vPosition.x < uClipMin.x ) discard; "+
    " if( vPosition.y < uClipMin.y ) discard; "+
    " if( vPosition.z < uClipMin.z ) discard; "+
    " gl_FragColor = vColor; "+
    " }\n";





mki3d.gl.initGL= function(canvas) {
    var gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    // var gl = canvas.getContext("experimental-webgl");
    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;
    // console.log(gl); // tests
    mki3d.gl.context = gl;
    mki3d.gl.buffers.cursor = mki3d.gl.newBuffers(); // ( MKI3D_CURSOR_MAX_SEGMENTS , MKI3D_CURSOR_MAX_TRIANGLES );
    mki3d.gl.buffers.model = mki3d.gl.newBuffers(); //  ( MKI3D_MODEL_MAX_SEGMENTS , MKI3D_MODEL_MAX_TRIANGLES );
    /* special point shapes */
    mki3d.gl.buffers.selectedPoint = mki3d.gl.newBuffers(); // ( MKI3D_SELECTED_POINT.length ,  0 /* not used */);
    mki3d.gl.buffers.bookmarkedPoint = mki3d.gl.newBuffers(); // ( MKI3D_BOOKMARKED_POINT.length ,  0 /* not used */);
    mki3d.gl.initShaderProgram();
    mki3d.loadCursor();
}


/* object for storing  ids of GL buffers */
mki3d.gl.buffers = {};

mki3d.gl.newBuffers= function (/* maxSegments, maxTriangles */) {
    var gl = mki3d.gl.context;
    var buf = {}; 

    buf.segments = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf.segments);
    // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array( 2*MKI3D_VERTEX_POSITION_SIZE*maxSegments ), gl.DYNAMIC_DRAW );

    buf.segmentsColors = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf.segmentsColors);
    // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array( 2*MKI3D_VERTEX_COLOR_SIZE*maxSegments ), gl.DYNAMIC_DRAW );

    buf.triangles = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf.triangles);
    // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array( 3*MKI3D_VERTEX_POSITION_SIZE*maxTriangles ), gl.DYNAMIC_DRAW );

    buf.trianglesColors = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf.trianglesColors);
    // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array( 3*MKI3D_VERTEX_COLOR_SIZE*maxTriangles ), gl.DYNAMIC_DRAW );

    buf.nrOfSegments = 0;
    buf.nrOfTriangles = 0;

    return buf;
} 


// SHADER PROGRAM

mki3d.gl.compileAndLinkShaderProgram=function ( gl, vertexShaderSource, fragmentShaderSource ){

    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
	console.log(gl.getShaderInfoLog(vertexShader));
	console.log(gl);
	return null;
    }

    var fragmentShader =gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
	console.log(gl.getShaderInfoLog(fragmentShader));
	console.log(gl);
	return null;
    }

    var shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
	console.log("Could not initialise shaders");
	console.log(gl);
	return null;
    }
    // SUCCESS 
    return shaderProgram;
}

/* init default shader */
mki3d.gl.initShaderProgram= function(){
    var gl=mki3d.gl.context;

    var shaderProgram= mki3d.gl.compileAndLinkShaderProgram(  gl,  mki3d.gl.vertexShaderSource,  mki3d.gl.fragmentShaderSource );

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

mki3d.gl.setClipMax= function ( x, y, z) {
    mki3d.gl.context.uniform3f(mki3d.gl.shaderProgram.uClipMax,  x,y,z  );
}

mki3d.gl.setClipMin= function ( x, y, z) {
    mki3d.gl.context.uniform3f(mki3d.gl.shaderProgram.uClipMin,  x,y,z  );
}

