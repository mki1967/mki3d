/*** importing from et format of et-edit: https://github.com/mki1967/et-edit.git ***/

mki3d.et = {}; /* place for imported data */


/** general arrayInput functions **/

/* initialise array of lines from string */
mki3d_newArrayInput= function(string){
    var arrayInput={};
    arrayInput.array=string.split("\n");
    arrayInput.idx=0;
    return arrayInput;
}

/* move arrayInput.idx to nonempty input element */
mki3d_ArrayInput_toNonempty= function ( arrayInput ){
    while( arrayInput.idx<arrayInput.array.length &&
	   arrayInput.array[arrayInput.idx] == "" )
	arrayInput.idx++;
}

mki3d_ArrayInput_getNumber= function( arrayInput ) {
    mki3d_ArrayInput_toNonempty( arrayInput );
    if(arrayInput.idx<arrayInput.array.length) {
	arrayInput.idx++;
	return Number(arrayInput.array[arrayInput.idx-1]);
    }
    else return NaN;
}

/* get nonempty string */
mki3d_ArrayInput_getString= function( arrayInput ) {
    mki3d_ArrayInput_toNonempty( arrayInput );
    if(arrayInput.idx<arrayInput.array.length) {
	arrayInput.idx++;
	return arrayInput.array[arrayInput.idx-1];
    }
    else return null;
}

/* get array of n elements wth the getter function ... */
mki3d_getArray= function( arrayInput, n, getter ) {
    var array=[];
    var i;
    for(i=0; i<n; i++)
	array.push( getter( arrayInput ) );
    return array;
}


/** et arrayInput functions **/


/* get single vertex as a point to be cloned later ... */
mki3d_et_getVertex= function( arrayInput ){
    var x=mki3d_ArrayInput_getNumber( arrayInput );
    var y=mki3d_ArrayInput_getNumber( arrayInput );
    var z=mki3d_ArrayInput_getNumber( arrayInput );
    return mki3d.newPoint( x, y, z,  0, 0, 0 , 0 ); // color: [0,0,0], setIdx: 0
}

/* get single edge as indexes of endpoint in vertex array and index of color */
mki3d_et_getEdge= function( arrayInput ){
    var edge={};
    edge.e1=mki3d_ArrayInput_getNumber( arrayInput );
    edge.e2=mki3d_ArrayInput_getNumber( arrayInput );
    edge.colorIdx=mki3d_ArrayInput_getNumber( arrayInput );
    return edge;
}

/* get single triangle as indexes of endpoint in vertex array and index of color */
mki3d_et_getTriangle= function( arrayInput ){
    var triangle={};
    triangle.t1=mki3d_ArrayInput_getNumber( arrayInput );
    triangle.t2=mki3d_ArrayInput_getNumber( arrayInput );
    triangle.t3=mki3d_ArrayInput_getNumber( arrayInput );
    triangle.colorIdx=mki3d_ArrayInput_getNumber( arrayInput );
    return triangle;
}



mki3d_et_getDataFromString= function( string ){
    var arrayInput=mki3d_newArrayInput(string);
    console.log( arrayInput); // test ...

    var et={}; // et object

    /* read vertices as points to be cloned */
    et.vNr= mki3d_ArrayInput_getNumber( arrayInput );
    et.vertexArray=mki3d_getArray( arrayInput, et.vNr, mki3d_et_getVertex  );
    /* read edges */
    et.eNr= mki3d_ArrayInput_getNumber( arrayInput );
    et.edgeArray=mki3d_getArray( arrayInput, et.eNr, mki3d_et_getEdge  );
    /* read triangles */
    et.tNr= mki3d_ArrayInput_getNumber( arrayInput );
    et.triangleArray=mki3d_getArray( arrayInput, et.tNr, mki3d_et_getTriangle  );

    /* from: et-variables.c 
       char transformation_label[]="TRANSFORMATION";
       char light_label[]="LIGHT";
       char background_label[]="BACKGROUND";
       char cursor_label[]="CURSOR";
       char group_label[]="GROUPS";
    */

    et.transformation_label="TRANSFORMATION";
    et.light_label="LIGHT";
    et.background_label="BACKGROUND";
    et.cursor_label="CURSOR";
    et.group_label="GROUPS";

    /* read transformation */
    et.transformation={};
    et.transformation.label= mki3d_ArrayInput_getString( arrayInput );
    et.transformation.mov=mki3d_getArray( arrayInput, 3 ,mki3d_ArrayInput_getNumber );
    et.transformation.M=mki3d_getArray( arrayInput, 16 ,mki3d_ArrayInput_getNumber ); // GL rotation matrix
    et.transformation.R=mki3d_getArray( arrayInput, 16 ,mki3d_ArrayInput_getNumber ); // GL reverse of M

    /* read light */
    et.light={};
    et.light.label= mki3d_ArrayInput_getString( arrayInput );
    et.light.direction= mki3d_getArray( arrayInput, 3 ,mki3d_ArrayInput_getNumber );

    /* read backgound */
    et.bg={};
    et.bg.label=mki3d_ArrayInput_getString( arrayInput );
    et.bg.colorIdx=mki3d_ArrayInput_getNumber( arrayInput );

    /* read cursor */
    et.cursor={};
    et.cursor.label=mki3d_ArrayInput_getString( arrayInput );
    et.cursor.position=mki3d_getArray( arrayInput, 3 ,mki3d_ArrayInput_getNumber );
    et.cursor.step=mki3d_ArrayInput_getNumber( arrayInput );

    /* read groups */
    et.groups={};
    et.groups.label=mki3d_ArrayInput_getString( arrayInput );
    et.groups.vNr=mki3d_ArrayInput_getNumber( arrayInput );
    et.groups.groupArray=mki3d_getArray( arrayInput, et.groups.vNr ,mki3d_ArrayInput_getNumber );

    /* update setIdx in veret points from groups */
    var i;
    for( i=0; i<et.vNr; i++) 
	et.vertexArray[i].set= et.groups.groupArray[i];
    
    /* prepare data */

    et.data= mki3d_newData();

    /* prepare model: segments and triangles */
    var segments=et.data.model.segments;
    for(i=0; i<et.eNr; i++){
	segments.push( mki3d.newSegment( et.vertexArray[ et.edgeArray[i].e1 ],
					 et.vertexArray[ et.edgeArray[i].e2 ] ) // mki3d.newSegment clones the endpoints 
		     );
	segments[segments.length-1][0].color=mki3d.et.color[ et.edgeArray[i].colorIdx ].slice(0); // clone [r,g,b] 
	segments[segments.length-1][1].color=mki3d.et.color[ et.edgeArray[i].colorIdx ].slice(0); // clone [r,g,b] 
    }

    var triangles=et.data.model.triangles;
    for(i=0; i<et.tNr; i++){
	triangles.push( mki3d.newTriangle( et.vertexArray[ et.triangleArray[i].t1 ],
					   et.vertexArray[ et.triangleArray[i].t2 ],
					   et.vertexArray[ et.triangleArray[i].t3 ] ) // mki3d.newTriangle clones the endpoints 
		      );
	triangles[triangles.length-1][0].color=mki3d.et.color[ et.triangleArray[i].colorIdx ].slice(0); // clone [r,g,b] 
	triangles[triangles.length-1][1].color=mki3d.et.color[ et.triangleArray[i].colorIdx ].slice(0); // clone [r,g,b] 
	triangles[triangles.length-1][2].color=mki3d.et.color[ et.triangleArray[i].colorIdx ].slice(0); // clone [r,g,b] 
    }
    
    /* we ignore transformation */

    /* set cursor.position */
    if(et.cursor.label==et.cursor_label)
	et.data.cursor.position=et.cursor.position;

    /* set backgroundColor */
    if(et.bg.label==et.background_label)
	et.data.backgroundColor=mki3d.et.color[ et.bg.colorIdx ].slice(0); // clone [r,g,b]

    /* set light.vector */
    if(et.light.label==et.light_label)
	et.data.light.vector=et.light.direction;

    console.log( et ); // test ...

    return et.data;
}



/* colors of et from et-variables.c:

   float color[COLOR_MAX][3] =
   {
   { 1.0, 1.0, 1.0},
   { 1.0, 0.0, 0.0},
   { 0.0, 1.0, 0.0},
   { 0.0, 0.0, 1.0},
   { 1.0, 1.0, 0.0},
   { 1.0, 0.0, 1.0},
   { 0.0, 1.0, 1.0},
   { 1.0, 0.5, 0.5},
   { 0.5, 1.0, 0.5},
   { 0.5, 0.5, 1.0},
   { 0.5, 0.5, 0.5},
   { 0.0, 0.0, 0.0},
   };

*/

mki3d.et.color=   [
    [ 1.0, 1.0, 1.0],
    [ 1.0, 0.0, 0.0],
    [ 0.0, 1.0, 0.0],
    [ 0.0, 0.0, 1.0],
    [ 1.0, 1.0, 0.0],
    [ 1.0, 0.0, 1.0],
    [ 0.0, 1.0, 1.0],
    [ 1.0, 0.5, 0.5],
    [ 0.5, 1.0, 0.5],
    [ 0.5, 0.5, 1.0],
    [ 0.5, 0.5, 0.5],
    [ 0.0, 0.0, 0.0],
];

// console.log(mki3d.et.color); // test ...
