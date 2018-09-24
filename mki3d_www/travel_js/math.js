// find the nearest right angle (in dergrees) among the angles {0, 90, 180, 270}
nearestRightAngle= function(angle) {
    angle = angle - Math.floor(angle/360)*360
    var d = Math.abs(angle)
    var out = 0

    var x = Math.abs(angle - 90)
    if (x < d) {
	out = (90)
	d = x
    }

    x = Math.abs(angle - 180)
    if (x < d) {
	out = (180)
	d = x
    }

    x = Math.abs(angle - 270)

    if (x < d) {
	out = (270)
	d = x
    }

    x = Math.abs(angle - 360)

    if (x < d) {
	out = (0)
	d = x
    }

    return out

}


// max dimmensional distance

function maxDistance(v1,v2)
{
    dx=Math.abs(v1[0]-v2[0]);
    dy=Math.abs(v1[1]-v2[1]);
    dz=Math.abs(v1[2]-v2[2]);

    return Math.max(dx,dy,dz); 
}


// from mki3d

vectorClone= function (v){
    return [v[0],v[1],v[2]]; 
};

vectorScale = function(v, sx, sy, sz ) {
    v[0]*= sx;
    v[1]*= sy;
    v[2]*= sz;
};


scalarProduct= function( v, w ) {
    return v[0]*w[0]+v[1]*w[1]+v[2]*w[2];
};

vectorProduct= function( a, b ) { // cross product
    return [ a[1]*b[2]-a[2]*b[1],
             a[2]*b[0]-a[0]*b[2],
             a[0]*b[1]-a[1]*b[0]  ];
};

vectorLength = function (a) {
    return Math.sqrt(scalarProduct(a,a));
};

vectorNormalized = function (v) { 
    var len= vectorLength(v);
    if(len==0) return [0,0,0]; // normalized zero vector :-(
    var vn= vectorClone(v);
    var s =1/len; 
    vectorScale(vn,  s,s,s);
    return vn;
};

normalToPlane = function ( a, b, c ) { // a,b,c are three points of the plane
    var v1 = [ b[0]-a[0], b[1]-a[1], b[2]-a[2] ];
    var v2 = [ c[0]-a[0], c[1]-a[1], c[2]-a[2] ];
    return vectorNormalized( vectorProduct( v1, v2 ) );
};

// gl matrices and vectors


function glVector3( x,y,z ){
    return new Float32Array(x,y,z);
}

function glMatrix4(  xx, yx, zx, wx,
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

function glMatrix3(  xx, yx, zx,
		     xy, yy, zy,
		     xz, yz, zz
		  )
{
    // sequence of concatenated columns
    return new Float32Array( [ xx, xy, xz,
			       yx, yy, yz, 
			       zx, zy, zz
			     ] );
}

var IdMatrix = glMatrix4(1,   0,   0,   0,
			 0,   1,   0,   0,
			 0,   0,   1,   0,
			 0,   0,   0,   1);



function projectionMatrix(projection)
{
    var zoomY =  projection.zoomY;

    if ( projection.screenY > projection.screenX ) {
	zoomY =  projection.zoomY/(projection.screenY/projection.screenX);
    }
    
    var xx=  zoomY*projection.screenY/projection.screenX;
    var yy=  zoomY;
    var zz=  (projection.zFar+projection.zNear)/(projection.zFar-projection.zNear);
    var zw= 1;
    var wz= -2*projection.zFar*projection.zNear/(projection.zFar-projection.zNear);


    return glMatrix4( xx,  0,  0,  0,
		      0, yy,  0,  0,
		      0,  0, zz, wz,
		      0,  0, zw,  0 );
}



function worldRotatedVector( viewer, vector )
{
    var degToRadians= Math.PI/180;
    var c1= Math.cos(viewer.rotXZ*degToRadians);
    var s1= Math.sin(viewer.rotXZ*degToRadians);
    var c2= Math.cos(viewer.rotYZ*degToRadians);
    var s2= Math.sin(viewer.rotYZ*degToRadians);

    return [    c1*vector[0]-s1*s2*vector[1]-s1*c2*vector[2],
                c2*vector[1]   -s2*vector[2],
		s1*vector[0]+c1*s2*vector[1]+c1*c2*vector[2] 
	   ];
}


function viewerRotatedVector( viewer, vector )
{
    var degToRadians= Math.PI/180;
    var c1= Math.cos(-viewer.rotXZ*degToRadians);
    var s1= Math.sin(-viewer.rotXZ*degToRadians);
    var c2= Math.cos(-viewer.rotYZ*degToRadians);
    var s2= Math.sin(-viewer.rotYZ*degToRadians);

    return [                         c1*vector[0]-s1*vector[2],
				     -s2*s1*vector[0] + c2*vector[1] - s2*c1*vector[2],
				     c2*s1*vector[0] + s2*vector[1] + c2*c1*vector[2] 
	   ];
}


function modelViewMatrix(viewer)
{
    var degToRadians= Math.PI/180;

    var c1= Math.cos(-viewer.rotXZ*degToRadians);
    var s1= Math.sin(-viewer.rotXZ*degToRadians);

    var c2= Math.cos(-viewer.rotYZ*degToRadians);
    var s2= Math.sin(-viewer.rotYZ*degToRadians);

    var v=viewerRotatedVector(viewer, [-viewer.x, -viewer.y, -viewer.z]);

    return glMatrix4 (   c1,   0,    -s1,  v[0],
			 -s2*s1,  c2, -s2*c1,  v[1],
			 c2*s1,  s2,  c2*c1,  v[2],
			 0,   0,      0,    1  );
}


function skyboxViewMatrix(viewer)
{
    var degToRadians= Math.PI/180;

    var c1= Math.cos(-viewer.rotXZ*degToRadians);
    var s1= Math.sin(-viewer.rotXZ*degToRadians);

    var c2= Math.cos(-viewer.rotYZ*degToRadians);
    var s2= Math.sin(-viewer.rotYZ*degToRadians);

    var v=viewerRotatedVector(viewer, [-viewer.x, -viewer.y, -viewer.z]);

    return glMatrix4 (   c1,   0,    -s1,       0,
			 -s2*s1,  c2, -s2*c1,  0,
			 c2*s1,  s2,  c2*c1,  0,
			 0,   0,      0,    1  );
}


// travel-algebra

function computeMatrices(viewer)
{
    var degToRadians= Math.PI/180;

    var c1= Math.cos(-viewer.rotXZ*degToRadians);
    var s1= Math.sin(-viewer.rotXZ*degToRadians);

    var c2= Math.cos(-viewer.rotYZ*degToRadians);
    var s2= Math.sin(-viewer.rotYZ*degToRadians);

    var v=viewerRotatedVector(viewer, [-viewer.x, -viewer.y, -viewer.z]);

    return {
	"modelView": glMatrix4 (
	    c1,   0,    -s1,  v[0],
	    -s2*s1,  c2, -s2*c1,  v[1],
	    c2*s1,  s2,  c2*c1,  v[2],
	    0,   0,      0,    1
	),
	"revRot": glMatrix3 (
	     c1, -s1*s2, s1*c2,
	      0,      c2,    s2,
	    -s1, -c1*s2, c1*c2
	)
    };
}


