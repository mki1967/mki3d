/* functions and procedures for manipulating mki3d.data */



mki3d.newPoint = function ( x, y, z,  r, g, b , setIdx ){
    return { position: [x,y,z], color: [r,g,b], set: setIdx };
}

mki3d.pointCompare= function( point1, point2 ){
    var cmp= mki3d.vectorCompare( point1.position , point2.position );
    if(cmp != 0 ) return cmp;
    return point2.set-point1.set;
    // curently the color is ignored
}


/* segment is a sorted array of two points */
mki3d.newSegment = function ( point1, point2 ){
    var points= [point1, point2];
    points.sort( mki3d.pointCompare );
    return points; 
}

/* triangle is a sorted array of three points */
mki3d.newTriangle = function ( point1, point2, point3 ){
    var points= [point1, point2, point3];
    points.sort( mki3d.pointCompare );
    return points; 
}

/* An element is either a segment or a triangle.
   areEqual( el1, el2 )  tests equality of two elements  */

mki3d.areEqual= function( element1, element2 ){
    element1.sort( mki3d.pointCompare );
    element2.sort( mki3d.pointCompare );
    if( element1.length != element2.length ) return false;
    var i;
    for( i=0 ; i<element1.length; i++)
	if( mki3d.pointCompare(element1[i], element2[i]) != 0 ) return false;
    return true;
}

/* shading */

/* shadeFactor is computed for triangles */
/* Color of the triangle is scaled by the shade factor before placing it into buffer of colors */
/* light parameter can be mki3d.data.light  */

mki3d.shadeFactor= function ( triangle, light) {
    var normal= mki3d.normalToPlane(triangle.points[0],triangle.points[1],triangle.points[2]);
    var sp= mki3d.scalarProduct(light.vector, normal);
    return light.ambientFraction+(1-light.ambientFraction)*Math.abs(sp);  
}



/* find versors corresponding to Up and Right arrow keys */
// ...


/* general redraw function */

mki3d.redraw = function() {
    var gl = mki3d.gl.context;
    var bg = mki3d.data.backgroundColor;

    gl.clearColor(bg[0], bg[1], bg[2], 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    mki3d.drawGraph( mki3d.gl.buffers.cursor );
}



/* load cursor to its GL buffer */

mki3d.loadCursor= function (){
    var cPos = mki3d.vectorClone(mki3d.data.cursor.position);
    var step=  mki3d.data.cursor.step;
    mki3d.vectorScale( cPos, step, step, step);
    var cCol = mki3d.data.cursor.color;
    var segments = [];
    var i,j;
    var point;
    // load the line endpoints 
    for( i=0 ; i<MKI3D_CURSOR_SHAPE.length; i++) {
	for(j=0; j<2; j++){
	    point = mki3d.vectorClone(MKI3D_CURSOR_SHAPE[i][j]);
            mki3d.vectorMove(point, cPos[0], cPos[1], cPos[2]);
            segments.push(point[0]);
            segments.push(point[1]);
            segments.push(point[2]);
	}
    }
    // TO DO:  ... markers, plane indicator ...

    var gl = mki3d.gl.context;
    var buf = mki3d.gl.buffers.cursor;

//    console.log(buf);

    gl.bindBuffer(gl.ARRAY_BUFFER, buf.segments);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array( segments ), gl.DYNAMIC_DRAW );
 //   console.log( segments ); /////


    var colors = [];
    for( i=0 ; i<2*MKI3D_CURSOR_SHAPE.length; i++) {
        colors.push(cCol[0]);
        colors.push(cCol[1]);
        colors.push(cCol[2]);
    }
    // TO DO:  ... markers, plane indicator ...
    
    
    gl.bindBuffer(gl.ARRAY_BUFFER, buf.segmentsColors);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array( colors ), gl.DYNAMIC_DRAW );
//    console.log( colors ); /////
     
    buf.nrOfSegments = MKI3D_CURSOR_SHAPE.length; // + ... markers, plane indicator ...
    buf.nrOfTriangles = 0;   // + ... markers, plane indicator ...
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
/*
    var pMatrix = mki3d.gl.matrix4( 
	1, 0, 0,  0,
	0, 1, 0,  0,
	0, 0, 1,  0,
	0, 0, 0,  1 
    );
*/

    gl.uniformMatrix4fv(mki3d.gl.shaderProgram.uPMatrix, false, pMatrix);
}

/* load model view  to GL uMVMatrix */
mki3d.setModelViewMatrix = function () {
    var projection = mki3d.data.projection;
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
    
/*
    var mvMatrix = mki3d.gl.matrix4( 
	1, 0, 0,  0,
	0, 1, 0,  0,
	0, 0, 1,  0,
	0, 0, 0,  1 
    );
*/
    gl.uniformMatrix4fv(mki3d.gl.shaderProgram.uMVMatrix, false, mvMatrix);

}


mki3d.drawGraph = function (graph) {
//    console.log(graph); // test

    var gl= mki3d.gl.context;
    var shaderProgram = mki3d.gl.shaderProgram;
    /* draw lines */
    gl.bindBuffer(gl.ARRAY_BUFFER, graph.segments );
    gl.vertexAttribPointer(shaderProgram.aVertexPosition, MKI3D_VERTEX_POSITION_SIZE, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, graph.segmentsColors);
    gl.vertexAttribPointer(shaderProgram.aVertexColor, MKI3D_VERTEX_COLOR_SIZE, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.LINES, 0, 2*graph.nrOfSegments);
    /* draw triangles */
    gl.bindBuffer(gl.ARRAY_BUFFER, graph.triangles );
    gl.vertexAttribPointer(shaderProgram.aVertexPosition, MKI3D_VERTEX_POSITION_SIZE, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, graph.trianglesColors);
    gl.vertexAttribPointer(shaderProgram.aVertexColor, MKI3D_VERTEX_POSITION_SIZE, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3*graph.nrOfTriangles);

}


mki3d.message = function ( messageText ) {
    mki3d.html.divUpperMessage.innerHTML = messageText;
}
