/* the code for dealing with texturing */

mki3d_texture={};

mki3d_texture.texSize= 256; // the default size of the texture

// def contains fields def.R, def.G, def.B, def.A with strings defining R,G,B,A dependencies on x,y coordinates
mki3d_texture.renderTextureVS= function(def){
    return ""+
	"const float PI = " + Math.PI +";\n"+
	"const int texSize= "+mki3d_texture.texSize+";\n"+
	"float G(float x,float y);\n"+
	"float B(float x,float y);\n"+
	"float A(float x,float y);\n"+
	"float R(float x,float y){ return  "+def.R+"; }\n"+
	"float G(float x,float y){ return  "+def.G+"; }\n"+
	"float B(float x,float y){ return  "+def.B+"; }\n"+
	"float A(float x,float y){ return  "+def.A+"; }\n"+
	"attribute float h;\n"+
	"uniform float v;\n"+
	"varying vec4 color;\n"+
	"void main()\n"+
	"{\n"+
	"  float  args[6];\n"+
	"  float h=h-float(texSize)/2.0;\n"+
	"  float v=v-float(texSize)/2.0;\n"+
	"  float x= 2.0*h/float(texSize); \n"+
	"  float y= 2.0*v/float(texSize); \n"+
	"  color= vec4( R(x,y), G(x,y), B(x,y), A(x,y) );\n"+
	"  gl_Position = vec4( x, y, 0.0, 1.0 );\n"+ /// w=0.5 for perspective division
	"  gl_PointSize=1.0;\n"+ /// test it
	"}\n";
}



/* draw defined pixels on the texture */
mki3d_texture.renderTextureFS=""+
    "precision mediump float;\n"+
    "varying vec4 color;\n"+
    "void main()\n"+
    "{\n"+
    "  gl_FragColor= color;\n"+
    "}\n";





/* draw texured elements */
mki3d_texture.drawElementVS=""+
    "attribute vec3 posAttr;\n"+
    "attribute vec3 texAttr;\n"+ // (u,v,shade)
    "uniform mat4 uMVMatrix; "+
    "uniform mat4 uPMatrix; "+
    "varying vec3 vPosition;"+
    "varying vec3 texUVS;\n"+
    "void main()\n"+
    "{\n"+
    "    gl_Position =   uPMatrix*uMVMatrix*vec4(posAttr, 1.0); "+
    "    texUVS = texAttr;\n"+
    "    vPosition = posAttr; "+
    "}\n";

mki3d_texture.drawElementFS= ""+
    "precision mediump float;\n"+
    "varying vec3 texUVS;\n"+
    "varying vec3 vPosition;"+
    "uniform vec3 uClipMax; "+
    "uniform vec3 uClipMin; "+
    "uniform sampler2D texSampler;\n"+
    "void main()\n"+
    "{\n"+
    "    if( vPosition.x > uClipMax.x ) discard; "+
    "    if( vPosition.y > uClipMax.y ) discard; "+
    "    if( vPosition.z > uClipMax.z ) discard; "+
    "    if( vPosition.x < uClipMin.x ) discard; "+
    "    if( vPosition.y < uClipMin.y ) discard; "+
    "    if( vPosition.z < uClipMin.z ) discard; "+
    "    gl_FragColor = vec4(texUVS.z*texture2D(texSampler, texUVS.xy).rgb, 1.0);\n"+ // color of texel scaled by shade
    // "    gl_FragColor = texture2D(texSampler, texUVS.xy);\n"+ 
    "}\n";


// returns the id of the new defined texture
mki3d_texture.createTexture= function(
    gl, /* the GL context */
    def, /* the Texturion definition */
    makeShaderProgramTool /* the tool to make compiled and linked shader from vertex and fragment shaders */
){
    let texSize= mki3d_texture.texSize;
    
    /* load buffer data */
    if( !mki3d_texture.hBufferId ) {
	mki3d_texture.hBufferId= gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, mki3d_texture.hBufferId );

	let hIn=[];
	for(var i=0; i< texSize+4; i++) {
	    hIn.push(i-2);
	}
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array( hIn ) , gl.STATIC_DRAW );
    }



    /* create texture object and allocate image memories */
    let textureId=gl.createTexture();
    if(!textureId) return textureId; // reutrn null or zero here ..
    // render the texture image ...
    gl.bindTexture(gl.TEXTURE_2D, textureId);
    gl.texImage2D(gl.TEXTURE_2D , 0, gl.RGBA, texSize, texSize, 0 /* border */,
		  gl.RGBA, gl.UNSIGNED_BYTE, null);   
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

    
    if(!mki3d_texture.frameBufferId) {
	/* create framebuffer object */
	mki3d_texture.frameBufferId=gl.createFramebuffer();
    }

    /* make texture rendering program */
    if( mki3d_texture.renderTextureShaderProgram ){
	gl.deleteProgram( mki3d_texture.renderTextureShaderProgram );
    }


    mki3d_texture.renderTextureShaderProgram=  makeShaderProgramTool(gl, mki3d_texture.renderTextureVS(def) , mki3d_texture.renderTextureFS );
    if( !mki3d_texture.renderTextureShaderProgram ){
	return null; // there was some failure
    }
    mki3d_texture.hLocation=gl.getAttribLocation(mki3d_texture.renderTextureShaderProgram, "h");
    mki3d_texture.vLocation=gl.getUniformLocation(mki3d_texture.renderTextureShaderProgram, "v");

    /* render texture */
    gl.useProgram(mki3d_texture.renderTextureShaderProgram);
    
    let defaultFBO = gl.getParameter(gl.FRAMEBUFFER_BINDING);
    let oldViewport=gl.getParameter(gl.VIEWPORT);
    
    gl.bindFramebuffer(gl.FRAMEBUFFER, mki3d_texture.frameBufferId);

    gl.viewport(0,0,texSize,texSize);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, textureId, 0); // assign the texture to the framebuffer

    gl.enableVertexAttribArray(mki3d_texture.hLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, mki3d_texture.hBufferId);
    for( j=0; j<texSize+4; j++) {
	gl.uniform1f(mki3d_texture.vLocation, j-2);
	gl.vertexAttribPointer( mki3d_texture.hLocation, 1, gl.FLOAT, false, 0, 0);
	gl.drawArrays(gl.POINTS, 0, texSize+4);
    }
    
    gl.bindTexture(gl.TEXTURE_2D, textureId);
    gl.generateMipmap(gl.TEXTURE_2D);

    gl.bindFramebuffer(gl.FRAMEBUFFER, defaultFBO); // return to default screen FBO
    gl.viewport(0,0, oldViewport[2], oldViewport[3]); // restore old size
    
    return textureId; // here return the id of the ready texture
    
}


// try to create and return object wit GL references for the element
// with the texture defined by element.def
mki3d_texture.makeGlInElement= function( element, light, shadeFactor, gl, compileAndLinkShaderProgram ){
    element.gl=null;
    let texID = mki3d_texture.createTexture(gl, element.def, compileAndLinkShaderProgram ); // try to generate the texture
    if( !texID ) return; // there was some problem
    element.gl={}; // temporary data with GL IDs
    element.gl.textureId = texID; // temporary GL ID (to be removed while saving the data)
    element.gl.posAttrBuffer=gl.createBuffer();
    element.gl.texAttrBuffer=gl.createBuffer();
    mki3d_texture.loadElementGlBuffers( element, light, shadeFactor, gl ); // update GL buffers
}

// Create an object that conatins texture and the triangles textured with this texture
mki3d_texture.createElement= function( def, shadeFactor, gl, compileAndLinkShaderProgram){
    let element={};
    element.def=def; // store the texturion definition for comparison
    element.texturedTriangles= []; // initially empty array of the textured triangles
    mki3d_texture.makeGlInElement( element, [0,0,1] /* light - not used */, shadeFactor, gl, compileAndLinkShaderProgram );
    if ( element.gl === null ) return null; // failed to create GL data
    return element;
}




// delete the GL objecst referenced by the texture element
mki3d_texture.deleteElementGlObjects= function( element, gl ){
    gl.deleteTexture(  element.gl.textureId );
    gl.deleteBuffer(element.gl.posAttrBuffer);
    gl.deleteBuffer(element.gl.texAttrBuffer);
}

// release GL object used by the old data to be replaced after loading new data
mki3d_texture.deleteTextureGlObjects= function( data, gl ){
    if( ! data.texture ) {
	return; // no texture data
    }

    let elements=data.texture.elements;

    for(let i=0; i<elements.length; i++) {
	mki3d_texture.deleteElementGlObjects( elements[i], gl );
    }
}

// clean gl reference from the texture element in the data copy to be saved
mki3d_texture.cleanGlFromElements= function( data ){
    if(! data.texture ) { // no textured data
	return;
    }
    let elements= data.texture.elements;
    for(let i=0; i< elements.length; i++){
	delete elements[i].gl;
    }
}

// rebuild GL objects in loaded data
mki3d_texture.makeGlInTextures= function( data, shadeFactor, gl, compileAndLinkShaderProgram ){
     if(! data.texture ) { // no textured data
	return;
    }
    let elements= data.texture.elements;
    for(let i=0; i< elements.length; i++){
	mki3d_texture.makeGlInElement( elements[i], data.light, shadeFactor, gl, compileAndLinkShaderProgram );
    }
}


// check if two texturion definitions are identical
mki3d_texture.equalDefs= function( def1, def2 ){
    if( def1 == def2 ) return true;
    if(
	def1.label === def2.label  &&
	    def1.R === def2.R  &&
	    def1.G === def2.G  &&
	    def1.B === def2.B  &&
	    def1.A === def2.A
    ) { // all fields have the same values
	return true;
    };

    return false;
}

mki3d_texture.pushElement=function( element, data ){
    if( !data.texture ) { // This is the first texture. Create 'texture' sub-object.
	data.texture={};
	data.texture.elements=[];
	data.texture.index=-1; // not valid index
    }
    data.texture.index=data.texture.elements.length;
    data.texture.elements.push( element );
}




// textured triangles



// Adds the new textured triangle to the texture element and updates GL buffers of the element
mki3d_texture.addTexturedTriangleToElement= function( texturedTriangle, element ){
    element.texturedTriangles.push( texturedTriangle ); // add the textured triangle
    element.gl.validBuffers=false; //  don't forget to update GL buffers
}



// Get the array of data.texture elements that contain any textured triangles
mki3d_texture.getArrayOfNonEmptyElements= function(data){
    if( !data.texture || !data.texture.elements ) return [];
    let array=[];
    for( let i=0; i<data.texture.elements.length; i++ ) {
	if( data.texture.elements[i].texturedTriangles.length > 0 ){
	    array.push( data.texture.elements[i] );
	}
    }
    return array;
}


// reload GL buffers in all  data.texture.elements
mki3d_texture.reloadAllGlBuffers= function( data, shadeFactor, gl ){
    if( !data.texture ) return; // nothing textured
    elements=data.texture.elements;
    for(let i=0; i<elements.length; i++ ) {
	mki3d_texture.loadElementGlBuffers( elements[i], data.light, shadeFactor, gl );
    }
}

// mki3d_texture.loadElementGlBuffers loads the data buffer for the shader drawing texured triangles of the texture element
mki3d_texture.loadElementGlBuffers= function(
    element, // element where the GL buffers need to be reloaded
    light,  // light for the recomputation of the triangle's shades
    shadeFactor, // function: shadeFactor( triangle, light)
    gl // gl context
){
    {
	// load positions
	let pos=[]; // positions floating array
	for(let i=0; i<element.texturedTriangles.length; i++){
	    let triangle=element.texturedTriangles[i].triangle;
	    if(!triangle.shade) { // ensure that shade is computed in the next phase
		triangle.shade = shadeFactor( triangle, light);
	    }
	    for(let j=0; j<3; j++){
		pos.push(triangle[j].position[0]);
		pos.push(triangle[j].position[1]);
		pos.push(triangle[j].position[2]);
	    }
	}
	gl.bindBuffer(gl.ARRAY_BUFFER, element.gl.posAttrBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array( pos ), gl.DYNAMIC_DRAW );
	// console.log(pos); /// test
    }

    {
	// load (u,v, shade) parameters
	let tex=[]; // positions floating array
	for(let i=0; i<element.texturedTriangles.length; i++){
	    let shade=element.texturedTriangles[i].triangle.shade; // shade must exist here
	    let triangleUV=element.texturedTriangles[i].triangleUV;
	    for(let j=0; j<3; j++){
		tex.push(triangleUV[j][0]);
		tex.push(triangleUV[j][1]);
		tex.push(shade);
	    }
	}
	gl.bindBuffer(gl.ARRAY_BUFFER, element.gl.texAttrBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array( tex ), gl.DYNAMIC_DRAW );
	// console.log(tex); /// test
    }
    element.gl.validBuffers=true;
}


mki3d_texture.redraw=function(gl, modelViewGL, monoProjectionGL, data, shadeFactor, compileAndLinkShaderProgram){
    let oldProgram= gl.getParameter( gl.CURRENT_PROGRAM );
    // build the object with drawing program and references, if needed
    if ( !mki3d_texture.drawElement ) {
	mki3d_texture.drawElement= {};
	mki3d_texture.drawElement.shaderProgram= compileAndLinkShaderProgram (gl, mki3d_texture.drawElementVS , mki3d_texture.drawElementFS );
	let shaderProgram= mki3d_texture.drawElement.shaderProgram;

	mki3d_texture.drawElement.posAttr=gl.getAttribLocation(shaderProgram, "posAttr");
	mki3d_texture.drawElement.texAttr=gl.getAttribLocation(shaderProgram, "texAttr");
	mki3d_texture.drawElement.texSampler=gl.getUniformLocation(shaderProgram, "texSampler");

	mki3d_texture.drawElement.uPMatrix = gl.getUniformLocation(shaderProgram, "uPMatrix");
	mki3d_texture.drawElement.uMVMatrix = gl.getUniformLocation(shaderProgram, "uMVMatrix");

	mki3d_texture.drawElement.uClipMax = gl.getUniformLocation(shaderProgram, "uClipMax");
	mki3d_texture.drawElement.uClipMin = gl.getUniformLocation(shaderProgram, "uClipMin");
	gl.useProgram( shaderProgram );
	gl.uniform1i(mki3d_texture.drawElement.texSampler, 0 );  // use the same texture unit: 0
    }

    let shaderProgram= mki3d_texture.drawElement.shaderProgram;
    gl.useProgram( shaderProgram );
    gl.uniformMatrix4fv(mki3d_texture.drawElement.uMVMatrix, false,
			modelViewGL );  // to be optimised ...
    gl.uniformMatrix4fv(mki3d_texture.drawElement.uPMatrix, false,   monoProjectionGL );

    { // clipping
	let v= data.clipMaxVector;
	gl.uniform3f(mki3d_texture.drawElement.uClipMax,  v[0], v[1], v[2] );
	v= data.clipMinVector;
	gl.uniform3f(mki3d_texture.drawElement.uClipMin,  v[0], v[1], v[2] );
    }
    gl.enableVertexAttribArray(mki3d_texture.drawElement.posAttr);
    gl.enableVertexAttribArray(mki3d_texture.drawElement.texAttr);

    let elements=mki3d_texture.getArrayOfNonEmptyElements(data);
    for ( let i=0; i< elements.length; i++) { // for each element
	if( !elements[i].gl.validBuffers ) { // refresh GL buffers
	    mki3d_texture.loadElementGlBuffers( elements[i], data.light, shadeFactor, gl );
	}
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, elements[i].gl.textureId );

	// assume that input buffers are up to date
	gl.bindBuffer(gl.ARRAY_BUFFER, elements[i].gl.posAttrBuffer );
	gl.vertexAttribPointer( mki3d_texture.drawElement.posAttr, 3, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, elements[i].gl.texAttrBuffer );
	gl.vertexAttribPointer( mki3d_texture.drawElement.texAttr, 3, gl.FLOAT, false, 0, 0);

	gl.drawArrays(gl.TRIANGLES, 0, 3*elements[i].texturedTriangles.length);
    }
    gl.useProgram( oldProgram  );
}



