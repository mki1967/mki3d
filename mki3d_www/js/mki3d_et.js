/* importing from et format of et-edit: https://github.com/mki1967/et-edit.git */

mki3d.et = {}; /* place for imported data */


/* general arrayInput functions */

mki3d_newArrayInput= function(string){
    var arrayInput={};
    arrayInput.array=string.split("\n");
    arrayInput.idx=0;
    return arrayInput;
}

mki3d_ArrayInput_toNonempty= function ( arrayInput ){
    while( arrayInput.idx<arrayInput.array.length &&
	   arrayInput.array[arrayInput.idx] == "" )
	arrayInput.idx++;
}

mki3d_ArrayInput_getNextNumber= function( arrayInput ) {
    mki3d_ArrayInput_toNonempty( arrayInput );
    if(arrayInput.idx<arrayInput.array.length) {
	arrayInput.idx++;
	return Number(arrayInput.array[arrayInput.idx-1]);
    }
    else return NaN;
}


/* et arrayInput functions */

mki3d_et_getVertex= function( arrayInput ){
    var x=mki3d_ArrayInput_getNextNumber( arrayInput );
    var y=mki3d_ArrayInput_getNextNumber( arrayInput );
    var z=mki3d_ArrayInput_getNextNumber( arrayInput );
    return mki3d.newPoint( x, y, z,  0, 0, 0 , 0 ); // color: [0,0,0], setIdx: 0
}

mki3d_et_getVertexArray= function( arrayInput, n ) {
    var vArray=[];
    
    var i;
    for(i=0; i<n; i++) 
	vArray.push( mki3d_et_getVertex( arrayInput ) );
    return vArray;
}

mki3d_et_getDataFromString= function( string ){
    var arrayInput=mki3d_newArrayInput(string);
    console.log( arrayInput); // test ...

    var et={}; // et object

    et.vNr= mki3d_ArrayInput_getNextNumber( arrayInput );
    
    et.vertexArray=mki3d_et_getVertexArray( arrayInput, et.vNr  );

    // to be continued ...

    console.log( et ); // test ...


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
