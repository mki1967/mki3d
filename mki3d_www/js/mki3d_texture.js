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


/* draw texure on full viewport */
mki3d_texture.drawTextureVS=""+
    "attribute vec3 posAttr;\n"+
    "attribute vec2 texAttr;\n"+
    "uniform vec2 sxy;\n"+
    "varying vec2 texCoords;\n"+
    "void main()\n"+
    "{\n"+
    "    gl_Position = vec4(posAttr.xyz, 1.0);\n"+
    "    texCoords = texAttr*sxy;\n"+
    "}\n";

mki3d_texture.drawTextureFS=""+
    "precision mediump float;\n"+
    "varying vec2 texCoords;\n"+
    "uniform sampler2D texSampler;\n"+
    "void main()\n"+
    "{\n"+
    "    gl_FragColor = texture2D(texSampler, texCoords);\n"+
    "}\n";

mki3d_texture.posAttrFloat32Array= new Float32Array( [
    -1,  -1,  0,
    -1,  +1,  0,
    +1,  +1,  0,
    +1,  +1,  0,
    +1,  -1,  0,
    -1,  -1,  0 
] );

mki3d_texture.texAttrFloat32Array= new Float32Array( [
    0,  0,
    0,  1,
    1,  1,
    1,  1,
    1,  0,
    0,  0 
] );




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
    def /* the Texturion definition */
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

    let makeShaderProgramTool=mki3d.gl.compileAndLinkShaderProgram; // use the function from mki3d.gl
    
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

mki3d_texture.drawTexture= function(gl, textureId){
    if( !mki3d_texture.drawTextureShaderProgram ){

	let makeShaderProgramTool=mki3d.gl.compileAndLinkShaderProgram; // use the function from mki3d.gl

	mki3d_texture.drawTextureShaderProgram=  makeShaderProgramTool(gl, mki3d_texture.drawTextureVS , mki3d_texture.drawTextureFS );
	mki3d_texture.posAttr=gl.getAttribLocation(mki3d_texture.drawTextureShaderProgram, "posAttr");
	mki3d_texture.texAttr=gl.getAttribLocation(mki3d_texture.drawTextureShaderProgram, "texAttr");
	mki3d_texture.texSampler=gl.getUniformLocation(mki3d_texture.drawTextureShaderProgram, "texSampler");
	mki3d_texture.sxy=gl.getUniformLocation(mki3d_texture.drawTextureShaderProgram, "sxy");
	// create and load data buffers
	mki3d_texture.posAttrBufferId= gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, mki3d_texture.posAttrBufferId );
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array( mki3d_texture.posAttrFloat32Array ) , gl.STATIC_DRAW );
	mki3d_texture.texAttrBufferId= gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, mki3d_texture.texAttrBufferId );
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array( mki3d_texture.texAttrFloat32Array ) , gl.STATIC_DRAW );
    }

    /// TODO: draw texture
    gl.useProgram(mki3d_texture.drawTextureShaderProgram);
    gl.enableVertexAttribArray(mki3d_texture.posAttr);
    gl.enableVertexAttribArray(mki3d_texture.texAttr);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, mki3d_texture.posAttrBufferId );
    gl.vertexAttribPointer( mki3d_texture.posAttr, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, mki3d_texture.texAttrBufferId );
    gl.vertexAttribPointer( mki3d_texture.texAttr, 2, gl.FLOAT, false, 0, 0);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textureId );
    gl.uniform1i(mki3d_texture.texSampler, 0 );
    let viewport=gl.getParameter(gl.VIEWPORT);
    gl.uniform2f(mki3d_texture.sxy, viewport[2]/mki3d_texture.texSize, viewport[3]/mki3d_texture.texSize ); // scale to have natural size and propoprtions of the texture

    gl.clearColor( 0,0,0,1 );
    gl.clear(gl.COLOR_BUFFER_BIT );
    gl.drawArrays(gl.TRIANGLES, 0, 6 );
    gl.useProgram( mki3d.gl.shaderProgram );
}

mki3d_texture.loadDef= async function(){ // usage:  data= await mki3d_texture.loadDef()
    JSONLoadPromise=new Promise( function(resolve, reject){
	var input = document.createElement('input');
	input.type = 'file';
	input.accept='.texturion';

	input.onchange = e => {

	    // getting a hold of the file reference
	    let file = e.target.files[0];

	    // setting up the reader
	    let reader = new FileReader();
	    reader.readAsText(file,'UTF-8');

	    // here we tell the reader what to do when it's done reading...
	    reader.onload = readerEvent => {
		let content = readerEvent.target.result; // this is the content!
		resolve(content);  /// ONLY THIS UPDATED !!!
	    }

	}

	input.click();
    });

    let out= await JSONLoadPromise.then( (x) => x , (err)=>{ console.log(err); }) ;
    // console.log(out);
    return JSON.parse(out);
}

// temporary test
mki3d_texture.load=  async function(){ // loads texture definition, if new then adds the texture element, updates the index of the current element
    let data=  mki3d.data;
    let def=  await mki3d_texture.loadDef();
    if( data.texture ) {
	for( let i=0; i< data.texture.elements.length; i++) {
	    if( mki3d_texture.equalDefs( data.texture.elements[i].def, def) ) { // found !
		data.texture.index=i;
		return;
	    }
	}
    }

    let element= mki3d_texture.createElement( def ); // try to create new element ...

    if( element === null ) return ; // could not create element from def

    mki3d_texture.pushElement( element ); // pushing updates the index
}


// try to create and return object wit GL references for the element
// with the texture defined by element.def
mki3d_texture.makeGlInElement= function( element, light ){
    let gl=mki3d.gl.context;
    element.gl=null;
    let texID = mki3d_texture.createTexture(gl, element.def ); // try to generate the texture
    if( !texID ) return; // there was some problem
    element.gl={}; // temporary data with GL IDs
    element.gl.textureId = texID; // temporary GL ID (to be removed while saving the data)
    element.gl.posAttrBuffer=gl.createBuffer();
    element.gl.texAttrBuffer=gl.createBuffer();
    mki3d_texture.loadElementGlBuffers( element, light ); // update GL buffers
}

// Create an object that conatins texture and the triangles textured with this texture
mki3d_texture.createElement= function( def ){
    let element={};
    element.def=def; // store the texturion definition for comparison
    element.texturedTriangles= []; // initially empty array of the textured triangles
    mki3d_texture.makeGlInElement( element, [0,0,1] /* light - not used */ );
    if ( element.gl === null ) return null; // failed to create GL data
    return element;
}

// Delete current element with its gl objects and untexture its triangles
mki3d_texture.deleteCurrentElement= function( ){
    if( !mki3d.data.texture || mki3d.data.texture.index<0 ||  mki3d.data.texture.index >= mki3d.data.texture.elements.length ) {
	return;
    }
    let element=mki3d.data.texture.elements[ mki3d.data.texture.index ]; // the element to be removed
    // remove the GL objects
    mki3d_texture.deleteElementGlObjects( element ); // delete GL objects
    // untexture the triangles:
    for( let i=0; i < element.texturedTriangles.length; i++ ) {
	mki3d.data.model.triangles.push(element.texturedTriangles[i].triangle);
    }
    // remove the element and update the index:
    mki3d.data.texture.elements.splice( mki3d.data.texture.index, 1 );
    mki3d.data.texture.index=  mki3d.data.texture.index % mki3d.data.texture.elements.length;
}


// delete the GL objecst referenced by the texture element
mki3d_texture.deleteElementGlObjects= function( element ){
    let gl=mki3d.gl.context;
    gl.deleteTexture(  element.gl.textureId );
    gl.deleteBuffer(element.gl.posAttrBuffer);
    gl.deleteBuffer(element.gl.texAttrBuffer);
}

// release GL object used by the old data to be replaced after loading new data
mki3d_texture.deleteTextureGlObjects= function( data ){
    if( ! data.texture ) {
	return; // no texture data
    }

    let elements=data.texture.elements;

    for(let i=0; i<elements.length; i++) {
	mki3d_texture.deleteElementGlObjects( elements[i] );
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
mki3d_texture.makeGlInTextures= function( data ){
     if(! data.texture ) { // no textured data
	return;
    }
    let elements= data.texture.elements;
    for(let i=0; i< elements.length; i++){
	mki3d_texture.makeGlInElement( elements[i], data.light );
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

mki3d_texture.pushElement=function( element ){
    let data=mki3d.data;
    if( !data.texture ) { // This is the first texture. Create 'texture' sub-object.
	data.texture={};
	data.texture.elements=[];
	data.texture.index=-1; // not valid index
    }

    data.texture.index=data.texture.elements.length;
    data.texture.elements.push( element );
}


mki3d_texture.display= function(){
    if( mki3d.data.texture &&  mki3d.data.texture.elements.length > 0 ){
	let t= mki3d.data.texture ;
	mki3d_texture.drawTexture( mki3d.gl.context, t.elements[t.index].gl.textureId );
	document.querySelector("#textureSpan").innerHTML=t.elements[t.index].def.label+
	    ' ('+t.index+'/'+t.elements.length+'): '+
	    t.elements[t.index].texturedTriangles.length+' TRIANGLES';
    } else {
	document.querySelector("#textureSpan").innerHTML="";
	mki3d.redraw();
    }

}



// textured triangles

mki3d_texture.textureSelectedTriangles= function(){
    if( mki3d.data.texture &&  mki3d.data.texture.elements.length > 0 ){
	let t= mki3d.data.texture ;
	let element= t.elements[t.index];
	let selected=mki3d.getSelectedElements( mki3d.data.model.triangles );
	mki3d.data.model.triangles = mki3d.getNotSelectedElements( mki3d.data.model.triangles ); // remove the triangles to be textured

	for ( let i=0; i< selected.length; i++ ){
	    let textured=mki3d_texture.makeTexturedTriangle( selected[i] );
	    if ( textured === null ) {
		mki3d.data.model.triangles.push( selected[i] ); // give back degenerate triangle
	    } else {
		mki3d_texture.addTexturedTriangleToElement( textured, element );
	    }
	}

	mki3d_texture.loadElementGlBuffers( element, mki3d.data.light ); // update GL buffers
    }
}



// mki3d_texture.makeTexturedTriangle returns a structure with a reference to the triangle with an uvTriangle of its endpoints' texture coordinades.
// If the triangle is degenerated, then null is returned.
mki3d_texture.makeTexturedTriangle= function( triangle ){
    let triangleUV= mki3d.createTriangleUV( triangle );
    if ( triangleUV === null ) {
	return null; // triangle is degenerated
    }

    let obj={}
    obj.triangle=triangle;
    obj.triangleUV=triangleUV;

    return obj;
}


// Adds the new textured triangle to the texture element and updates GL buffers of the element
mki3d_texture.addTexturedTriangleToElement= function( texturedTriangle, element ){
    element.texturedTriangles.push( texturedTriangle ); // add the textured triangle
    // mki3d_texture.loadElementGlBuffers( element ); // don't forget to update GL buffers
}


// gets sub-array of selected textured triangles from the array of textured triangles
mki3d_texture.getSelectedTexturedTriangles= function( texturedTriangles ){
    let out=[];
    for ( let i=0; i<texturedTriangles.length; i++){
	if ( mki3d.elementSelected(texturedTriangles[i].triangle) ){
	    out.push( texturedTriangles[i] );
	}
    }
    return out;
}

// gets sub-array of not selected textured triangles from the array of textured triangles
mki3d_texture.getNotSelectedTexturedTriangles= function( texturedTriangles ){
    let out=[];
    for ( let i=0; i<texturedTriangles.length; i++){
	if ( !mki3d.elementSelected(texturedTriangles[i].triangle) ){
	    out.push( texturedTriangles[i] );
	}
    }
    return out;
}

// get array of triangles from array of textured triangles
mki3d_texture.untexteredTriangles= function( texturedTrinagles ){
    return texturedTrinagles.map( function( texturedTriangle ){ return texturedTriangle.triangle } );
}


// Global number of textured triangles
mki3d_texture.numberOfTexturedTriangles= function(){
    if( !mki3d.data.texture || !mki3d.data.texture.elements ) return 0;
    let sum=0;
    for( let i=0; i<mki3d.data.texture.elements.length; i++ ) {
	sum= sum + mki3d.data.texture.elements[i].texturedTriangles.length;
    }
    return sum;
}


// Get the array of texture elements that contain any textured triangles
mki3d_texture.getArrayOfNonEmptyElements= function(){
    if( !mki3d.data.texture || !mki3d.data.texture.elements ) return [];
    let array=[];
    for( let i=0; i<mki3d.data.texture.elements.length; i++ ) {
	if( mki3d.data.texture.elements[i].texturedTriangles.length > 0 ){
	    array.push( mki3d.data.texture.elements[i] );
	}
    }
    return array;
}


// mki3d_texture.loadElementGlBuffers loads the data buffer for the shader drawing texured triangles of the texture element
mki3d_texture.loadElementGlBuffers= function(
    element, // element where the GL buffers need to be reloaded
    light  // light for the recomputation of the triangle's shades
){
    let gl= mki3d.gl.context;
    {
	// load positions
	let pos=[]; // positions floating array
	for(let i=0; i<element.texturedTriangles.length; i++){
	    let triangle=element.texturedTriangles[i].triangle;
	    if(!triangle.shade) { // ensure that shade is computed in the next phase
		triangle.shade = mki3d.shadeFactor( triangle, light);
	    }
	    for(let j=0; j<3; j++){
		pos.push(triangle[j].position[0]);
		pos.push(triangle[j].position[1]);
		pos.push(triangle[j].position[2]);
	    }
	}
	gl.bindBuffer(gl.ARRAY_BUFFER, element.gl.posAttrBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array( pos ), gl.DYNAMIC_DRAW );
	console.log(pos); /// test
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
	console.log(tex); /// test
    }
}


mki3d_texture.redraw=function(){

    let gl= mki3d.gl.context;
    // build the object with drawing program and references, if needed
    if ( !mki3d_texture.drawElement ) {
	mki3d_texture.drawElement= {};
	let makeShaderProgramTool=mki3d.gl.compileAndLinkShaderProgram; // use the function from mki3d.gl

	mki3d_texture.drawElement.shaderProgram=  makeShaderProgramTool(gl, mki3d_texture.drawElementVS , mki3d_texture.drawElementFS );
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
			mki3d.gl.matrix4toGL(mki3d.modelViewMatrix()) );  // to be optimised ...
    gl.uniformMatrix4fv(mki3d_texture.drawElement.uPMatrix, false,   mki3d.monoProjectionGL );

    { // clipping
	let v= mki3d.data.clipMaxVector;
	gl.uniform3f(mki3d_texture.drawElement.uClipMax,  v[0], v[1], v[2] );
	v= mki3d.data.clipMinVector;
	gl.uniform3f(mki3d_texture.drawElement.uClipMin,  v[0], v[1], v[2] );
    }
    gl.enableVertexAttribArray(mki3d_texture.drawElement.posAttr);
    gl.enableVertexAttribArray(mki3d_texture.drawElement.texAttr);

    let elements=mki3d_texture.getArrayOfNonEmptyElements();
    for ( let i=0; i< elements.length; i++) { // for each element
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, elements[i].gl.textureId );

	// assume that input buffers are up to date
	gl.bindBuffer(gl.ARRAY_BUFFER, elements[i].gl.posAttrBuffer );
	gl.vertexAttribPointer( mki3d_texture.drawElement.posAttr, 3, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, elements[i].gl.texAttrBuffer );
	gl.vertexAttribPointer( mki3d_texture.drawElement.texAttr, 3, gl.FLOAT, false, 0, 0);

	gl.drawArrays(gl.TRIANGLES, 0, 3*elements[i].texturedTriangles.length);
    }
    gl.useProgram( mki3d.gl.shaderProgram ); // default shader
}



/// debug
mki3d_texture.debugTest=async function(){ // usage in the console: await mki3d_texture.debugTest()
    let def={};
    def.label="myTexture";
    def.R="0.5*(1.0+sin(2.0*PI*y))";
    def.G="0.5*(1.0+cos(2.0*PI*x))";
    def.B="G(x,y)";
    def.A="1.0";

    let texID = mki3d_texture.createTexture(mki3d.gl.context, def );

    mki3d_texture.drawTexture( mki3d.gl.context, texID );

    mki3d.gl.context.deleteTexture( texID );

    let def2= await  mki3d_texture.loadDef();

    console.log( def2 );

    texID = mki3d_texture.createTexture(mki3d.gl.context, def2 );

    mki3d_texture.drawTexture( mki3d.gl.context, texID );
}
