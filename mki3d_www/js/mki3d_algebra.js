/** vector and matrix operations **/


/** Vector is an array [x,y,z] **/


mki3d.vectorClone= function (v){
    return [v[0],v[1],v[2]]; 
};

/* lexicographic ordering */
mki3d.vectorCompare = function( v1, v2 ){
    var cmp=0;
    cmp= v1[0]-v2[0];
    if(cmp != 0) return cmp;
    cmp= v1[1]-v2[1];
    if(cmp != 0) return cmp;
    cmp= v1[2]-v2[2];
    return cmp;
};


mki3d.vectorProductOrdered = function( v, w){
    return v[0]<=w[0] && v[1]<=w[1] && v[2]<=w[2];
}

/* Set elements of the existing vector v */
mki3d.vectorSet = function(v, x,y,z ) {
    v[0]=x;
    v[1]=y;
    v[2]=z;
};

mki3d.vectorMove = function(v, dx, dy, dz ) {
    v[0]+= dx;
    v[1]+= dy;
    v[2]+= dz;
};

mki3d.vectorScale = function(v, sx, sy, sz ) {
    v[0]*= sx;
    v[1]*= sy;
    v[2]*= sz;
};

mki3d.vectorSwapCoordinates = function(v, i,j ) {
    var tmp=v[i];
    v[i]=v[j];
    v[j]=tmp;
};


mki3d.scalarProduct= function( v, w ) {
    return v[0]*w[0]+v[1]*w[1]+v[2]*w[2];
};

mki3d.distanceSquare = function(v, w) {
    var a=[ v[0]-w[0], v[1]-w[1], v[2]-w[2] ];
    return mki3d.scalarProduct( a,a);
}

mki3d.vectorProduct= function( a, b ) { // cross product
    return [ a[1]*b[2]-a[2]*b[1],
             a[2]*b[0]-a[0]*b[2],
             a[0]*b[1]-a[1]*b[0]  ];
};

mki3d.vectorLength = function (a) {
    return Math.sqrt(mki3d.scalarProduct(a,a));
};

mki3d.vectorNormalized = function (v) { 
    var len= mki3d.vectorLength(v);
    if(len==0) return [0,0,0]; // normalized zero vector :-(
    var vn= mki3d.vectorClone(v);
    var s =1/len; 
    mki3d.vectorScale(vn,  s,s,s);
    return vn;
};

mki3d.normalToPlane = function ( a, b, c ) { // a,b,c are three points of the plane
    var v1 = [ b[0]-a[0], b[1]-a[1], b[2]-a[2] ];
    var v2 = [ c[0]-a[0], c[1]-a[1], c[2]-a[2] ];
    return mki3d.vectorNormalized( mki3d.vectorProduct( v1, v2 ) );
};

/* Matrix is an array of three vectors (rows of the matrix) */


/* returns new Identity matrix */
mki3d.newIdMatrix = function () {
    return [ [ 1, 0, 0],
             [ 0, 1, 0],
             [ 0, 0, 1] ]; 

};

mki3d.matrixClone = function( m ) {
    return [ mki3d.vectorClone( m[0] ),
	     mki3d.vectorClone( m[1] ),
	     mki3d.vectorClone( m[2] ) ];
};


mki3d.matrixScale = function( m, s ) {
    mki3d.vectorScale( m[0], s,s,s );
    mki3d.vectorScale( m[1], s,s,s );
    mki3d.vectorScale( m[2], s,s,s );
}; 


mki3d.matrixDeterminant = function(m)
{
return    m[0][2]*( m[1][0]*m[2][1]-m[2][0]*m[1][1] )
         -m[1][2]*( m[0][0]*m[2][1]-m[0][1]*m[2][0] )
         +m[2][2]*( m[0][0]*m[1][1]-m[0][1]*m[1][0] );

}

mki3d.matrixInverse= function( m ){
    var det = mki3d.matrixDeterminant(m);

    if(det == 0) {
	// console.log(m);
	Throw ("mki3d.matrixInverse: non-invertible matrix");
    }

    var s= 1/det;
  
    var r= [ 
            mki3d.vectorProduct( mki3d.matrixColumn( m, 1),  mki3d.matrixColumn( m, 2) ),
            mki3d.vectorProduct( mki3d.matrixColumn( m, 2),  mki3d.matrixColumn( m, 0) ),
            mki3d.vectorProduct( mki3d.matrixColumn( m, 0),  mki3d.matrixColumn( m, 1) ) 
    ];
 

    mki3d.vectorScale( r[0],  s, s, s );
    mki3d.vectorScale( r[1],  s, s,s );
    mki3d.vectorScale( r[2],  s, s, s );

    // console.log( mki3d.matrixProduct( m, r) ); // for tests
    return r;
}


mki3d.matrixColumn = function ( matrix, i ){
    return [ matrix[0][i], matrix[1][i], matrix[2][i] ];
};

mki3d.matrixTransposed = function ( matrix ){
    return [ mki3d.matrixColumn(matrix, 0),
	     mki3d.matrixColumn(matrix, 1),
	     mki3d.matrixColumn(matrix, 2) ];
};

mki3d.matrixVectorProduct = function ( m, v ) {
    var sp = mki3d.scalarProduct;
    return [ sp(m[0],v), sp(m[1],v), sp(m[2],v)];
};

mki3d.matrixProduct = function( m1, m2){ 
    var sp = mki3d.scalarProduct;
    var col = mki3d.matrixColumn;
    return [ [ sp(m1[0], col(m2, 0)) , sp(m1[0], col(m2, 1)),  sp(m1[0], col(m2, 2)) ], 
	     [ sp(m1[1], col(m2, 0)) , sp(m1[1], col(m2, 1)),  sp(m1[1], col(m2, 2)) ], 
	     [ sp(m1[2], col(m2, 0)) , sp(m1[2], col(m2, 1)),  sp(m1[2], col(m2, 2)) ] ];
};

mki3d.matrixRotatedXY= function(matrix, alpha ){
    var c = Math.cos( alpha );
    var s = Math.sin( alpha ); 
    var rot = [ [ c, -s, 0 ],
		[ s,  c, 0 ],
		[ 0,  0, 1 ] ];

    return mki3d.matrixProduct( rot, matrix );
};

mki3d.matrixRotatedXZ= function(matrix, alpha ){
    var c = Math.cos( alpha );
    var s = Math.sin( alpha ); 
    var rot = [ [ c,  0, -s ],
		[ 0,  1,  0 ],
		[ s,  0,  c ] ];

    return mki3d.matrixProduct( rot, matrix );
};

mki3d.matrixRotatedYZ= function(matrix, alpha ){
    var c = Math.cos( alpha );
    var s = Math.sin( alpha ); 
    var rot = [ [ 1,  0,  0 ],
		[ 0,  c, -s ],
		[ 0,  s,  c ] ];

    return mki3d.matrixProduct( rot, matrix );
};


/** 4-dimensional vectors and matrices **/

mki3d.scalarProduct4= function( v, w ) {
    return v[0]*w[0]+v[1]*w[1]+v[2]*w[2]+v[3]*w[3];
};


/* extend 3d matrix to 4d matrix */
mki3d.matrix3to4= function( m ) {
    return [ 
	[ m[0][0], m[0][1], m[0][2], 0 ],
	[ m[1][0], m[1][1], m[1][2], 0 ],
	[ m[2][0], m[2][1], m[2][2], 0 ],
	[       0,       0,       0, 1 ]
    ];
};



mki3d.matrix4Column = function ( matrix, i ){
    return [ matrix[0][i], matrix[1][i], matrix[2][i], matrix[3][i] ];
};

mki3d.matrix4Product = function( m1, m2){ 
    var sp = mki3d.scalarProduct4;
    var col = mki3d.matrix4Column;
    return [ 
	[ sp(m1[0], col(m2, 0)) , sp(m1[0], col(m2, 1)),  sp(m1[0], col(m2, 2)),  sp(m1[0], col(m2, 3)) ], 
	[ sp(m1[1], col(m2, 0)) , sp(m1[1], col(m2, 1)),  sp(m1[1], col(m2, 2)),  sp(m1[1], col(m2, 3)) ], 
	[ sp(m1[2], col(m2, 0)) , sp(m1[2], col(m2, 1)),  sp(m1[2], col(m2, 2)),  sp(m1[2], col(m2, 3)) ], 
	[ sp(m1[3], col(m2, 0)) , sp(m1[3], col(m2, 1)),  sp(m1[3], col(m2, 2)),  sp(m1[3], col(m2, 3)) ] 
    ];
};


// returns transformation that rotates  vector v to align it with Z-plus axis
mki3d.redirectionToZ = function( v ){

    sqLen=mki3d.scalarProduct(v, v); // square of the length of v
    if( sqLen == 0 ){ // no unique solution - return identity
	return [
	    [1,0,0],
	    [0,1,0],
	    [0,0,1]
	];
    }

    let M1; // the rotation XZ around Y
    let sqLenXZ= v[0]*v[0] + v[2]*v[2]; // square of the length of projection on XZ
    let lenXZ= Math.sqrt(sqLenXZ); // length of XZ projection

    // compute the first transformation M1
    if(  sqLenXZ == 0 ) { // no need to rotate around Y
	M1= [
	    [1,0,0],
	    [0,1,0],
	    [0,0,1]
	];
    } else {
	let s1= v[0] / lenXZ; // sin of the XZ rotation angle
	let c1= v[2] / lenXZ; // cos of the XZ rotation angle
	M1= [
	    [ c1,  0,-s1],
	    [  0,  1,  0],
	    [ s1,  0, c1]
	];
    }

    // compute the second transformation M2
    let s2= v[1]/Math.sqrt( sqLen ); // sin of YZ rotation angle
    let c2= Math.sqrt( sqLenXZ / sqLen ); // cos of YZ rotation angle ( should be more precise than lenXZ / Math.sqrt( sqLen ) )

    let M2= [
	[  1,  0,  0],
	[  0, c2,-s2],
	[  0, s2, c2]
    ];

    return mki3d.matrixProduct( M2, M1 );
}

// returns one of v or -v vectors that has positive (in decreasing order of preference) Z or Y or X coordinate
mki3d.orientedToZYX= function( v ){
    let pv=[v[0], v[1], v[2]]; // copy of v
    let nv=[-v[0], -v[1], -v[2]]; // vector -v
    if( v[2] > 0 ) return pv;
    if( v[2] < 0 ) return nv;
    if( v[1] > 0 ) return pv;
    if( v[1] < 0 ) return nv;
    if( v[0] > 0 ) return pv;
    if( v[0] < 0 ) return nv;
    return pv; // here: should be v=pv=nv=[0,0,0]
}


// returns an array of tree UV pairs of texture coordinates for the triangle
mki3d.createTriangleUV= function( triangle ){
    // A,B,C - endpoints of the triangle
    let A= triangle[0].position;
    let B= triangle[1].position;
    let C= triangle[2].position;

    let AB= [ B[0]-A[0], B[1]-A[1], B[2]-A[2] ];
    let AC= [ C[0]-A[0], C[1]-A[1], C[2]-A[2] ];

    let v= mki3d.vectorProduct( AB, AC );

    if( mki3d.scalarProduct(v,v) == 0 ) { // degenerate triangle with area zero
	return [ [0,0],[0,0],[0,0] ]; // return just something ...
    }


    let dir= mki3d.orientedToZYX( v ); // all parallel triangles are considered to have the same orientation

    let M= mki3d.redirectionToZ( dir ); // alignment transformation

    let A1= mki3d.matrixVectorProduct( M , A );
    let B1= mki3d.matrixVectorProduct( M , B );
    let C1= mki3d.matrixVectorProduct( M , C );

    return [
	[ A1[0],A1[1] ],
	[ B1[0],B1[1] ],
	[ C1[0],C1[1] ]
    ];

}
