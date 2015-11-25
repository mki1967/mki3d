/* text textures */

mki3d.text={};

mki3d.text.FONT_SIZE=30;
mki3d.text.FONT_FAMILY="Monospace";

mki3d.text.SYMBOLS=" 0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

mki3d.text.createSymbolsImage= function(FONT_SIZE, FONT_FAMILY, SYMBOLS){
    // ctx - 2d context for text
    var ctx = document.createElement("canvas").getContext("2d");

    ctx.font = ""+FONT_SIZE+"px "+FONT_FAMILY;

    var maxWidth=0;

    for(var i=0; i<SYMBOLS.length; i++) {
	var text = ctx.measureText(SYMBOLS.substring(i,i+1));
	if(text.width>maxWidth) maxWidth=text.width;
    }

    ctx.canvas.style.backgroundColor="rgb(0,0,0,0)";
    ctx.canvas.width=maxWidth+1;
    ctx.canvas.height=FONT_SIZE*SYMBOLS.length;

    ctx.fillStyle="white";
    // ctx.fillStyle="rgb(0,0,0,0)";
    ctx.fillRect(0,0, ctx.canvas.width, ctx.canvas.height);

    ctx.fillStyle="black";
    ctx.strokeStyle="black";

    ctx.font = ""+FONT_SIZE+"px "+FONT_FAMILY;
    ctx.textBaseline = "top";
    // ctx.textBaseline = "hanging";

    for(var i=0; i<SYMBOLS.length; i++) {
	ctx.fillText(SYMBOLS.substring(i,i+1),0,i*FONT_SIZE);
	ctx.strokeText(SYMBOLS.substring(i,i+1),0,i*FONT_SIZE);
    }

    return ctx.canvas;
}


/*jshint multistr: true */
mki3d.text.TEX_VERTEX_SHADER = 
    "attribute  vec4 a_position;"+
    "attribute vec2 a_texcoord;"+
    "uniform mat4 uReverseRot; "+
    "uniform mat4 uMVMatrix; "+
    "uniform mat4 uPMatrix; "+
    "uniform float scale_x;\n"+
    "uniform vec3 mov;\n"+
    "varying vec2 v_texcoord;"+
    "void main() {"+
    "  vec4 position = a_position;"+
    "  position.x= position.x*scale_x;"+
    "  position= uReverseRot*position;"+
    "  position.xyz= position.xyz+mov;"+
    "  gl_Position = uPMatrix*uMVMatrix*position;"+
    "  v_texcoord = a_texcoord; "+
    "}"+
    "\n";


mki3d.text.TEX_FRAGMENT_SHADER =
    "precision mediump float;\n"+
    "varying vec2 v_texcoord;\n"+
    "uniform float step_y;\n"+
    "uniform float idx_y;\n"+
    "uniform sampler2D u_texture;\n"+
    "void main() {"+
    "   gl_FragColor = texture2D(u_texture, vec2(v_texcoord.x, v_texcoord.y*step_y+idx_y*step_y));"+
    "}"+
    "\n";

mki3d.text.TEXTURE_UNIT=1; // texture unit for text

mki3d.text.initTexShaderProgram= function(){
    var gl=mki3d.gl.context;

    var shaderProgram= mki3d.gl.compileAndLinkShaderProgram(gl, mki3d.text.TEX_VERTEX_SHADER, mki3d.text.TEX_FRAGMENT_SHADER);
    
    gl.useProgram(shaderProgram);

    // shaderProgram.aPosition = gl.getAttribLocation(shaderProgram, "a_position");
    shaderProgram.aPosition = gl.getAttribLocation(shaderProgram, "a_position");
    gl.enableVertexAttribArray(shaderProgram.aPosition);

    shaderProgram.aTexCoord = gl.getAttribLocation(shaderProgram, "a_texcoord");
    gl.enableVertexAttribArray(shaderProgram.aTexCoord);

    /* uniform variables  */
    shaderProgram.idxY = gl.getUniformLocation(shaderProgram, "idx_y");
    shaderProgram.stepY = gl.getUniformLocation(shaderProgram, "step_y");
    shaderProgram.scaleX = gl.getUniformLocation(shaderProgram, "scale_x");
    shaderProgram.mov = gl.getUniformLocation(shaderProgram, "mov");
    shaderProgram.uTexture = gl.getUniformLocation(shaderProgram, "u_texture");
    shaderProgram.uPMatrix = gl.getUniformLocation(shaderProgram, "uPMatrix");
    shaderProgram.uMVMatrix = gl.getUniformLocation(shaderProgram, "uMVMatrix");
    shaderProgram.uReverseRot = gl.getUniformLocation(shaderProgram, "uReverseRot");

    /* load fixed attributes */
    
    
    // Create a buffer and put a single clipspace rectangle in
    // it (2 triangles)
    mki3d.text.bufferTex = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, mki3d.text.bufferTex);
    gl.bufferData(
	gl.ARRAY_BUFFER,
	new Float32Array([
	    0.0,  0.0,
	    1.0,  0.0,
	    0.0,  1.0,
	    0.0,  1.0,
	    1.0,  0.0,
	    1.0,  1.0]),
	gl.STATIC_DRAW);
    gl.vertexAttribPointer(shaderProgram.aTexCoord, 2, gl.FLOAT, false, 0, 0);

    mki3d.text.bufferPos = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, mki3d.text.bufferPos);
    gl.bufferData(
	gl.ARRAY_BUFFER,
	new Float32Array([
	    0.0,  1.0, 0.0,
	    1.0,  1.0, 0.0,
	    0.0,  0.0, 0.0,
	    0.0,  0.0, 0.0,
	    1.0,  1.0, 0.0,
	    1.0,  0.0, 0.0]),
	gl.STATIC_DRAW);
    gl.vertexAttribPointer(shaderProgram.aPosition, 3, gl.FLOAT, false, 0, 0);

    mki3d.text.shaderProgram= shaderProgram;
    gl.useProgram(shaderProgram);
    mki3d.text.symTexParams= mki3d.text.prepareSymbolsTexture(gl, 
							      mki3d.text.TEXTURE_UNIT, 
							      mki3d.text.FONT_SIZE, 
							      mki3d.text.FONT_FAMILY, 
							      mki3d.text.SYMBOLS
							     );
    // mki3d.text.redraw(); // test

    gl.useProgram( mki3d.gl.shaderProgram ); // after initialisation use the default shader program
}



mki3d.text.prepareSymbolsTexture = function(gl, textureUnitNr, FONT_SIZE, FONT_FAMILY, SYMBOLS){ 
    var symbolsImage=mki3d.text.createSymbolsImage(FONT_SIZE, FONT_FAMILY, SYMBOLS);
    var textWidth  = symbolsImage.width;
    var textHeight = symbolsImage.height;
    var textTex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0+textureUnitNr); // texture unit textureUnitNr
    gl.bindTexture(gl.TEXTURE_2D, textTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, symbolsImage);
    // make sure we can render it even if it's not a power of 2
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return { 
	unit: textureUnitNr, 
	scaleX:(symbolsImage.width/symbolsImage.height)*SYMBOLS.length,
	SYMBOLS: SYMBOLS
    };  
}

mki3d.text.drawTextureSymbol= function(gl, symbolIdx, shaderProgram ){
    // test version

    gl.uniform1f(shaderProgram.idxY, symbolIdx );
    gl.drawArrays(gl.TRIANGLES, 0, 6);
};


mki3d.text.redraw= function(){
    // test version
    var gl = mki3d.gl.context;
    gl.useProgram(mki3d.text.shaderProgram);
    var shaderProgram=mki3d.text.shaderProgram;

    gl.bindBuffer(gl.ARRAY_BUFFER, mki3d.text.bufferPos);
    gl.vertexAttribPointer(shaderProgram.aPosition, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, mki3d.text.bufferTex);
    gl.vertexAttribPointer(shaderProgram.aTexCoord, 2, gl.FLOAT, false, 0, 0);

    gl.uniform1i(shaderProgram.uTexture ,   mki3d.text.symTexParams.unit ); // texture unit 1

    gl.uniform1f(shaderProgram.scaleX,  mki3d.text.symTexParams.scaleX);
    gl.uniform1f(shaderProgram.stepY, 1/ mki3d.text.symTexParams.SYMBOLS.length );

    /* set matrces */
    mki3d.gl.context.uniformMatrix4fv(mki3d.text.shaderProgram.uPMatrix, false, mki3d.projectionMatrix() );
    mki3d.gl.context.uniformMatrix4fv(mki3d.text.shaderProgram.uReverseRot, false, 
				      mki3d.gl.matrix4toGL(mki3d.matrix3to4(mki3d.matrixInverse( mki3d.data.view.rotationMatrix ))) );

    mki3d.gl.context.uniformMatrix4fv(mki3d.text.shaderProgram.uMVMatrix, false, 
				      mki3d.gl.matrix4toGL( mki3d.modelViewMatrix() )
				     );
    
    gl.uniform3f(shaderProgram.mov, 0.0, 0.0, 0.0);
    mki3d.text.drawTextureSymbol (gl, mki3d.text.SYMBOLS.length-2,shaderProgram, mki3d.text.symTexParams);
    

    gl.uniform3f(shaderProgram.mov, 1.0, 2.0, 2.0);
    mki3d.text.drawTextureSymbol (gl, mki3d.text.SYMBOLS.length-1,shaderProgram, mki3d.text.symTexParams);
    
    // console.log(gl);// test

    gl.useProgram( mki3d.gl.shaderProgram ); //  use the default shader program
};

/*

  gl.clearColor( 0,0.5,0.5, 1); 
  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

  gl.enable(gl.DEPTH_TEST);
  // gl.enable(gl.CULL_FACE); // not now ...
  // Clear the canvas AND the depth buffer.
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.uniform3f(texShaderProgram.mov, -0.5, -0.2, 0.0);
  drawTextureSymbol (gl, SYMBOLS.length-1,texShaderProgram, symTexParams);

  gl.uniform3f(texShaderProgram.mov, 0.0, 0.0, 0.1);
  drawTextureSymbol (gl, SYMBOLS.length-2,texShaderProgram, symTexParams);
  console.log(gl);

*/
