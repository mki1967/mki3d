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
    mki3d.gl.buffers.cursor = mki3d.gl.newBuffers( MKI3D_CURSOR_MAX_SEGMENTS , MKI3D_CURSOR_MAX_TRIANGLES );
    mki3d.gl.buffers.model = mki3d.gl.newBuffers( MKI3D_MODEL_MAX_SEGMENTS , MKI3D_MODEL_MAX_TRIANGLES );
    mki3d.gl.initShaderProgram();
    mki3d.loadCursor();
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

///////////////// niżej - do przerobienia


function setMatrixUniforms() {
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}

function drawScene() {
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.depthFunc(gl.LEQUAL);
    if(collectedAlert) {
	gl.clearColor(1.0, 0.5, 0.5, 1.0); // PINK
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        collectedAlert=false;
        drawSectors();
	return;
    }
    if(alertAction){
        alertAction=false;
	switch (currentAction) {
	case ACTION_MOVE : 
	    drawAlert(moveMsg, 2); 
	    break;
	case ACTION_ROTATE : 
	    drawAlert(rotateMsg, 2); 
	    break;

	};
	return;
    }

    gl.clearColor(bgColor[0], bgColor[1], bgColor[2], 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


    mvMatrix= modelViewMatrix(traveler);
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);


    // setMatrixUniforms();
    // gl.uniform3fv(shaderProgram.vMov, glVector3( 0,0,0 ) );
    gl.uniform3f(shaderProgram.vMov,  0,0,0  );
    drawGraph(scene);
    drawGraph(frameBox);

    drawTokens();
    if(intervalAction === null ) drawSectors();


    if(tokenPositions.remaining===0) {
	/*
	  alert("CONGRATULATIONS !!!\n YOU HAVE COLLECTED ALL TOKENS.\n"+
          "Time: "+((new Date()).getTime()-startTime)+" milliseconds" );
	*/
	startGame();
    }
}
