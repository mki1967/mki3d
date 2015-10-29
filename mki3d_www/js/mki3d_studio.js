/** functions and procedures for manipulating mki3d.data **/

mki3d.modelChange = function() {
    mki3d.tmp.modelChanged = true;
}



/* New version: For position pos find nearest endpoint from array of endpoints */

mki3d.findNearestEndpoint = function( pos, endpoints ) {
    if(!endpoints) return null;
    if(endpoints.length == 0) return null;
    var found=endpoints[0];
    var minDist = mki3d.distanceSquare(pos, found.position);
    var i;
    for( i=0; i<endpoints.length; i++){
	var next = endpoints[i];
	var ds = mki3d.distanceSquare(pos, next.position);
	if( ds < minDist ) {
	    minDist=ds;
	    found=next;
	}
    }
    return found;
}



/* updating the model */

mki3d.modelInsertElement = function(array, element) {
    /* either replaces equal or adds new element to the array */
    var i;
    for( i=0; i< array.length; i++) {
	if(mki3d.areEqualElements( array[i], element )) { // found!
	    array[i]= element; // replace
	    return; // finished!
	}
    }
    // not found
    array.push(element);
}


/* shading */

mki3d.cancelShades = function() {
    var triangles=mki3d.data.model.triangles;
    var i;
    for(i=0; i<triangles.length; i++)
	triangles[i].shade=null;
}

/* shadeFactor is computed for triangles */
/* Color of the triangle is scaled by the shade factor before placing it into buffer of colors */
/* light parameter can be mki3d.data.light  */

mki3d.shadeFactor= function ( triangle, light) {
    var normal= mki3d.normalToPlane(triangle[0].position,triangle[1].position,triangle[2].position);
    var sp= mki3d.scalarProduct(light.vector, normal);
    return light.ambientFraction+(1-light.ambientFraction)*Math.abs(sp);  
}


mki3d.setLight = function() {
    var r= mki3d.matrixInverse( mki3d.data.view.rotationMatrix );
    var l= mki3d.matrixVectorProduct(r, [0,0,1]); // basic light direction is [0,0,1]
    // console.log(l); ////////
    mki3d.data.light.vector = l; 
    var i;
    var triangles = mki3d.data.model.triangles;
    for( i=0 ; i<triangles.length; i++) 
	triangles[i].shade=mki3d.shadeFactor(triangles[i], mki3d.data.light); 
}



/* clipping */

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

/* general redraw function */

mki3d.redraw = function() {
    var gl = mki3d.gl.context;
    var bg = mki3d.data.backgroundColor;

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    gl.clearColor(bg[0], bg[1], bg[2], 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    mki3d.loadModel();
    mki3d.setDataClipping()
    mki3d.drawGraph( mki3d.gl.buffers.model );
    mki3d.unsetClipping();

    mki3d.loadCursor();
    mki3d.drawGraph( mki3d.gl.buffers.cursor );

    if(mki3d.tmp.selected)  
	mki3d.drawPoints( MKI3D_SELECTED_POINT, mki3d.tmp.selected, mki3d.gl.buffers.selectedPoint );
    /*   // for tests
	 mki3d.drawPoints( MKI3D_SELECTED_POINT,  
	 mki3d.elementEndpointsInBox( mki3d.data.model.segments, mki3d.data.clipMinVector, mki3d.data.clipMaxVector ),
	 mki3d.gl.buffers.selectedPoint
	 );
    */
}

/* load model to its GL buffer */

mki3d.loadModel= function (){
    var gl = mki3d.gl.context;
    var buf = mki3d.gl.buffers.model;

    mki3d.tmpRefreshDisplayModel();
    // var model = mki3d.data.model;
    var model = mki3d.tmp.display.model;

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

/* load cursor to its GL buffer */

mki3d.loadCursor= function (){
    var gl = mki3d.gl.context;
    var buf = mki3d.gl.buffers.cursor;

    var cPos = mki3d.vectorClone(mki3d.data.cursor.position);
    var step=  mki3d.data.cursor.step;
    var cCol = mki3d.data.cursor.color;
    var segments = [];
    var i,j;
    var point;
    // load the shape of the cursor
    for( i=0 ; i<MKI3D_CURSOR_SHAPE.length; i++) {
	for(j=0; j<2; j++){
	    point = mki3d.vectorClone(MKI3D_CURSOR_SHAPE[i][j]);
	    mki3d.vectorScale( point, step, step, step);
	    mki3d.vectorMove(point, cPos[0], cPos[1], cPos[2]);
	    segments.push(point[0]);
	    segments.push(point[1]);
	    segments.push(point[2]);
	}
    }
    // append plane makers
    mki3d.tmpRefreshVersorsMatrix();
    for( i=0 ; i<MKI3D_PLANE_MARKER.length; i++) {
	for(j=0; j<2; j++){
	    point = mki3d.matrixVectorProduct( mki3d.tmp.versorsMatrix , MKI3D_PLANE_MARKER[i][j]);
	    mki3d.vectorScale( point, step, step, step);
	    mki3d.vectorMove(point, cPos[0], cPos[1], cPos[2]);
	    segments.push(point[0]);
	    segments.push(point[1]);
	    segments.push(point[2]);
	}
    }

    var colors = [];
    for( i=0 ; i<2*(MKI3D_CURSOR_SHAPE.length+MKI3D_PLANE_MARKER.length); i++) {
        colors.push(cCol[0]);
        colors.push(cCol[1]);
        colors.push(cCol[2]);
    }
    

    var marker1 = mki3d.data.cursor.marker1;
    if( marker1 !== null ) { // append line from cursor to marker1
        // push marker
        segments.push( marker1.position[0] );
        segments.push( marker1.position[1] );
        segments.push( marker1.position[2] );
        colors.push( marker1.color[0] );
        colors.push( marker1.color[1] );
        colors.push( marker1.color[2] );
        // push cursor
        segments.push(cPos[0]);
        segments.push(cPos[1]);
        segments.push(cPos[2]);
        colors.push(cCol[0]);
        colors.push(cCol[1]);
        colors.push(cCol[2]);
    }


    // load segments and colors to GL buffers


    gl.bindBuffer(gl.ARRAY_BUFFER, buf.segments);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array( segments ), gl.DYNAMIC_DRAW );
    
    gl.bindBuffer(gl.ARRAY_BUFFER, buf.segmentsColors);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array( colors ), gl.DYNAMIC_DRAW );

    buf.nrOfSegments =  segments.length/(2*MKI3D_VERTEX_POSITION_SIZE); // + ... markers

    // TO DO: triangles
    var triangles = [];
    colors =[]; // reusing variable 
    var marker2 = mki3d.data.cursor.marker2;

    if( marker1 !== null && marker2 !== null) { // draw triangle (cursor, marker1, marker2)
        var light = mki3d.data.light;
        var point = mki3d.newPoint( cPos[0], cPos[1], cPos[2],  cCol[0], cCol[1], cCol[2], mki3d.data.set.current );
        var triangle = mki3d.newTriangle( marker1, marker2, point );
	var shade = mki3d.shadeFactor( triangle, light);
        // console.log(shade);
        // push marker 1
        triangles.push( marker1.position[0] );
        triangles.push( marker1.position[1] );
        triangles.push( marker1.position[2] );
        colors.push( marker1.color[0]*shade );
        colors.push( marker1.color[1]*shade );
        colors.push( marker1.color[2]*shade );
        // push marker 2
        triangles.push( marker2.position[0] );
        triangles.push( marker2.position[1] );
        triangles.push( marker2.position[2] );
        colors.push( marker2.color[0]*shade );
        colors.push( marker2.color[1]*shade );
        colors.push( marker2.color[2]*shade );
        // push cursor
        triangles.push(cPos[0]);
        triangles.push(cPos[1]);
        triangles.push(cPos[2]);
        colors.push(cCol[0]*shade);
        colors.push(cCol[1]*shade);
        colors.push(cCol[2]*shade);
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, buf.triangles);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array( triangles ), gl.DYNAMIC_DRAW );
    
    gl.bindBuffer(gl.ARRAY_BUFFER, buf.trianglesColors);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array( colors ), gl.DYNAMIC_DRAW );

    buf.nrOfTriangles =  triangles.length/(3*MKI3D_VERTEX_POSITION_SIZE);
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


// ...
mki3d.drawPoints = function( pointShape, points, buf ) {
    if( !points || points.length == 0) return; 
    var gl = mki3d.gl.context;
    var shaderProgram = mki3d.gl.shaderProgram;
    var buf = mki3d.gl.buffers.cursor;

    var cPos = mki3d.vectorClone(mki3d.data.cursor.position);
    var step=  mki3d.data.cursor.step;
    var cCol = mki3d.data.cursor.color;

    var revMatrix = mki3d.matrixInverse( mki3d.data.view.rotationMatrix );
    var segments = [];
    var i,j;
    var point;
    // load the shape of the point
    for( i=0 ; i<pointShape.length; i++) {
	for(j=0; j<2; j++){
	    // point = mki3d.vectorClone(pointShape[i][j]);
	    point = mki3d.matrixVectorProduct(revMatrix, pointShape[i][j]);
	    mki3d.vectorScale( point, step, step, step); /* points as scaled according to the cursor */
	    segments.push(point[0]);
	    segments.push(point[1]);
	    segments.push(point[2]);
	}
    }

    var colors = [];
    for( i=0 ; i < 2*(pointShape.length); i++) {
        colors.push(cCol[0]);
        colors.push(cCol[1]);
        colors.push(cCol[2]);
    }
    
    /* draw each point -- segments moved by point position */
    for(i=0; i<points.length; i++) {
	var pos= points[i].position;
        var movedShape=[];
        for(j=0; j<segments.length; j++) {
	    movedShape.push(segments[j]+pos[ j%3 ] );
	}

	// load movedShape and colors to GL buffers


	gl.bindBuffer(gl.ARRAY_BUFFER, buf.segments);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array( movedShape ), gl.DYNAMIC_DRAW );
	
	gl.bindBuffer(gl.ARRAY_BUFFER, buf.segmentsColors);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array( colors ), gl.DYNAMIC_DRAW );

	buf.nrOfSegments =  segments.length/(2*MKI3D_VERTEX_POSITION_SIZE); // + ... markers


	// draw lines only
	gl.bindBuffer(gl.ARRAY_BUFFER, buf.segments );
	gl.vertexAttribPointer(shaderProgram.aVertexPosition, MKI3D_VERTEX_POSITION_SIZE, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, buf.segmentsColors);
	gl.vertexAttribPointer(shaderProgram.aVertexColor, MKI3D_VERTEX_COLOR_SIZE, gl.FLOAT, false, 0, 0);
	gl.drawArrays(gl.LINES, 0, 2*buf.nrOfSegments);
	
    }
    
    // ...
}

/* return array of endpoints of elements */

mki3d.getElementsEndpoints= function(elements){
    var out=[];
    var i,j;
    for(i=0; i<elements.length; i++) 
	for(j=0; j<elements[i].length; j++)
	    out.push(elements[i][j]);
    return out;
}

/* return array of references to the endpoints in the box */
mki3d.elementEndpointsInBox = function (elements, boxMin, boxMax) {
    var selected=[];
    var i,j;
    for(i=0; i<elements.length; i++) 
	for(j=0; j<elements[i].length; j++)
	    if( mki3d.vectorProductOrdered(boxMin, elements[i][j].position) &&
		mki3d.vectorProductOrdered( elements[i][j].position, boxMax)
	      )
		selected.push(elements[i][j]);
    return selected;
}



/* clean data model */

mki3d.modelSortUnique= function(){
    mki3d.data.model.segments = mki3d.uniqueSorted(mki3d.data.model.segments, mki3d.elementCompare);
    mki3d.data.model.triangles = mki3d.uniqueSorted(mki3d.data.model.triangles, mki3d.elementCompare);
}


/* painting elements with cursor color */
mki3d.paintElements = function(elements){
    for(i=0; i<elements.length; i++) {
	for( j=0; j<elements[i].length; j++ )
	    elements[i][j].color = mki3d.vectorClone(mki3d.data.cursor.color);
    }

}

/* painting endpoints with cursor color */
mki3d.paintEndpoints = function(endpoints){
    var j;
    for( j=0; j<endpoints.length; j++ )
	endpoints[j].color = mki3d.vectorClone(mki3d.data.cursor.color);
}

/* updating color component within the range [0,1] */
mki3d.updateColorComponent= function(  color, rgbIdx, delta ){
    // color is an array of length 3
    // rgbIdx is in range 0..2
    color[rgbIdx]= Math.min(1, Math.max(0, color[rgbIdx]+delta));
}

/* messages */

mki3d.message = function ( messageText ) {
    mki3d.html.divUpperMessage.innerHTML = messageText;
}

mki3d.messageAppend = function ( messageText ) {
    mki3d.html.divUpperMessage.innerHTML += messageText;
}

/* Transformations of endpoins positions (constructive methods) */

mki3d.rotateEndpointsArround= function( endpoints, rotation, fixedPoint ){
    var i;
    for(i=0; i<endpoints.length; i++) {
	var v= endpoints[i].position; // reference to the position of endpoints[i]
	mki3d.vectorMove(v, -fixedPoint[0], -fixedPoint[1], -fixedPoint[2]);
	var w = mki3d.matrixVectorProduct( rotation, v);
        mki3d.vectorMove(w,  fixedPoint[0], fixedPoint[1], fixedPoint[2]);
        mki3d.vectorSet(v, w[0], w[1], w[2]);
    }
}

mki3d.scaleEndpointsArround= function( endpoints, vectorScale, fixedPoint ){
    var i;
    for(i=0; i<endpoints.length; i++) {
	var v= endpoints[i].position; // reference to the position of endpoints[i]
	mki3d.vectorMove(v, -fixedPoint[0], -fixedPoint[1], -fixedPoint[2]);
        mki3d.vectorScale( v, vectorScale[0], vectorScale[1], vectorScale[2]);
        mki3d.vectorMove(v,  fixedPoint[0], fixedPoint[1], fixedPoint[2]);
    }
}
