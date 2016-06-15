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


    console.log( et ); // test ...

    return et;
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
