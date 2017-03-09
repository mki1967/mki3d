/*** constructive methods ***/

/** parameters of constructive methods **/

mki3d.constructive={};
/* scaling factor used used for scaling in all directions */
/* must be in [MKI3D_MIN_SCALE, MKI3D_MAX_SCALE] or [-MKI3D_MAX_SCALE, -MKI3D_MIN_SCALE] */ 
mki3d.constructive.scalingFactor=1.0; 

/* parameters of regular polygon */

mki3d.constructive.polygonNumberOfVertices=3;





/** inserting regular polygons **/

mki3d.polygonMakeVertex= function( vIdx ){
    var n=mki3d.constructive.polygonNumberOfVertices;
    var r=2*mki3d.data.cursor.step;
    var dx= r*Math.cos(vIdx*2*Math.PI/n);
    var dy= r*Math.sin(vIdx*2*Math.PI/n);
    
    mki3d.tmpRefreshVersorsMatrix();
    var v = mki3d.matrixVectorProduct( mki3d.tmp.versorsMatrix , [dx,dy,0] );

    var c = mki3d.data.cursor.position;

    return [ v[0]+c[0], v[1]+c[1], v[2]+c[2] ];
}

mki3d.constructivePolygonInsert= function(){
    mki3d.compressSetIndexes(mki3d.data);
    var newIdx = mki3d.getMaxSetIndex( mki3d.data.model )+1; // empty set
    mki3d.data.set.current=newIdx; // insert polygon to a new set

    var c = mki3d.data.cursor.color;
    var n=mki3d.constructive.polygonNumberOfVertices;
    var i;
    for(i=0; i<n; i++) {
	var p=mki3d.polygonMakeVertex( i );
	var pt1 = mki3d.newPoint( p[0], p[1], p[2],  
				  c[0], c[1], c[2] ,  
				  mki3d.data.set.current );
	p=mki3d.polygonMakeVertex( (i+1) % n );
	var pt2 = mki3d.newPoint( p[0], p[1], p[2],  
				  c[0], c[1], c[2] ,  
				  mki3d.data.set.current );
	var seg = mki3d.newSegment( pt1, pt2 );
	mki3d.modelInsertElement( mki3d.data.model.segments, seg);
    }
    mki3d.backup();
    return "<br>INSERTED REGULAR POLYGON SEGMENTS TO A NEW - CURRENT - SET."+
	" (CAN BE SELECTED WITH 'QSS')"+
	"<br> (USE 'U' FOR SINGLE STEP UNDO.)";
}

mki3d.constructivePolygonTriangles= function(){
    mki3d.compressSetIndexes(mki3d.data);
    var newIdx = mki3d.getMaxSetIndex( mki3d.data.model )+1; // empty set
    mki3d.data.set.current=newIdx; // insert polygon to a new set

    var c = mki3d.data.cursor.color;
    var n=mki3d.constructive.polygonNumberOfVertices;
    var i;
    for(i=0; i<n; i++) {
	var p=mki3d.polygonMakeVertex( i );
	var pt1 = mki3d.newPoint( p[0], p[1], p[2],  
				  c[0], c[1], c[2] ,  
				  mki3d.data.set.current );
	p=mki3d.polygonMakeVertex( (i+1) % n );
	var pt2 = mki3d.newPoint( p[0], p[1], p[2],  
				  c[0], c[1], c[2] ,  
				  mki3d.data.set.current );
	var cp = mki3d.vectorClone(mki3d.data.cursor.position);
	var pt3 = mki3d.newPoint( cp[0], cp[1], cp[2],  
				  c[0], c[1], c[2] ,  
				  mki3d.data.set.current );

	var tr = mki3d.newTriangle( pt1, pt2, pt3 );
	mki3d.modelInsertElement( mki3d.data.model.triangles, tr);
    }
    mki3d.backup();
    return "<br>INSERTED REGULAR POLYGON TRIANGLES TO A NEW - CURRENT - SET."+
	" (CAN BE SELECTED WITH 'QSS')"+
	"<br> (USE 'U' FOR SINGLE STEP UNDO.)";
}



/* testing for input constructive points:
   the string neededPoints consists of the names of points that must be displayed */

mki3d.checkConstructivePoints= function( methodName, neededPoints ){
    var missingPoints= mki3d.pointsNotDisplayed( neededPoints );
    if( missingPoints!="" ) {
	return "<br> "+methodName+" NEEDS THE POINTS: '"+neededPoints
	    +"' AND THE POINTS '"+missingPoints +"' ARE UNSET OR HIDDEN."
	    +"<br> (USE 'QPS...' TO SET THE POINTS OR 'QPJ...' TO DISPLAY HIDDEN POINTS)";
    }
    return ""; // empty string means OK

}

/** MOVING SELECTED ENDPOINTS **/

mki3d.constructiveMoveAB= function(){
    var methodName ="MOVE BY AB";
    var neededPoints = "AB";
    var check= mki3d.checkConstructivePoints( methodName, neededPoints );
    if( check != "") return check;
    if( !mki3d.tmp.selected || mki3d.tmp.selected.length==0 ) return "<br>NO SELECTED ENDPOINTS !!!";
    mki3d.backup();
    var selected=mki3d.tmp.selected;
    var pA= mki3d.points.point.A.pos;
    var pB= mki3d.points.point.B.pos;
    var i;
    for( i=0; i< selected.length; i++) {
	var pos= selected[i].position; // reference to position
	pos[0]+=pB[0]-pA[0];
	pos[1]+=pB[1]-pA[1];
	pos[2]+=pB[2]-pA[2];
    }
    mki3d.backup();
    mki3d.redraw();
    return "<br>MOVED SELECTED ENDPOINTS BY THE VECTOR AB.<br> (USE 'U' FOR SINGLE STEP UNDO.)";
}

mki3d.constructiveMoveInDirABLenCD= function(){
    var methodName ="MOVE IN DIRECTION AB BY LENGTH |CD|";
    var neededPoints = "ABCD";
    var check= mki3d.checkConstructivePoints( methodName, neededPoints );
    if( check != "") return check;
    if( !mki3d.tmp.selected || mki3d.tmp.selected.length==0 ) return "<br>NO SELECTED ENDPOINTS !!!";
    var A= mki3d.points.point.A.pos;
    var B= mki3d.points.point.B.pos;
    var AB=[B[0]-A[0], B[1]-A[1], B[2]-A[2]];
    var lenAB=mki3d.vectorLength(AB);
    if( lenAB==0 ) return "LENGTH |AB| IS ZERO - NO DIRECTION !";
    var C= mki3d.points.point.C.pos;
    var D= mki3d.points.point.D.pos;
    var CD=[D[0]-C[0], D[1]-C[1], D[2]-C[2]];
    var lenCD=mki3d.vectorLength(CD);
    if( lenCD==0 ) return "LENGTH |CD| IS ZERO - NO MOVEMENT !";

    var s= lenCD/lenAB;
    var dv= AB;
    mki3d.vectorScale(dv, s,s,s);

    mki3d.backup();
    
    var selected=mki3d.tmp.selected;
    var i;
    for( i=0; i< selected.length; i++) {
	mki3d.vectorMove(selected[i].position, dv[0], dv[1], dv[2]);
    }
    mki3d.backup();
    mki3d.redraw();
    return "<br>MOVED SELECTED ENDPOINTS IN DIRECTION AB BY THE LENGTH |CD|.<br> (USE 'U' FOR SINGLE STEP UNDO.)";
}



/** SCALING SELECTED ENDPOINTS **/


/* scale each coordinate of v by, respectively, sx,sy,sz, where FP is a fixed point */
mki3d.scaleWithFixedPoint= function(v, sx,sy,sz , FP){
    v[0]= FP[0]+sx*(v[0]-FP[0]);
    v[1]= FP[1]+sy*(v[1]-FP[1]);
    v[2]= FP[2]+sz*(v[2]-FP[2]);
}

mki3d.constructiveSetScalingFactorToABOverCD= function(){
    var methodName ="SET SCALING FACTOR TO |AB|/|CD|";
    var neededPoints = "ABCD";
    var check= mki3d.checkConstructivePoints( methodName, neededPoints );
    if( check != "") return check;
    var A= mki3d.points.point.A.pos;
    var B= mki3d.points.point.B.pos;
    var C= mki3d.points.point.C.pos;
    var D= mki3d.points.point.D.pos;
    var AB=[B[0]-A[0], B[1]-A[1], B[2]-A[2]];
    var lenAB=mki3d.vectorLength(AB);
    var CD=[D[0]-C[0], D[1]-C[1], D[2]-C[2]];
    var lenCD=mki3d.vectorLength(CD);
    if( lenCD==0 ) return "LENGTH |'CD'| IS ZERO - CAN NOT SET |'AB'|/|'CD'| !";
    var s=lenAB/lenCD;
    if( s > MKI3D_MAX_SCALE )
	return "|'AB'|/|'CD'| IS "+Math.abs(s)+" > "+MKI3D_MAX_SCALE+" (TOO LARGE !)";
    mki3d.constructive.scalingFactor=s;
    return "<br>SCALING FACTOR SET TO |AB|/|CD|="+s;
}

mki3d.constructiveScaleWithFixedPointO= function(){
    var methodName ="SCALE";
    var neededPoints = "O";
    var check= mki3d.checkConstructivePoints( methodName, neededPoints );
    if( check != "") return check;
    if( !mki3d.tmp.selected || mki3d.tmp.selected.length==0 ) return "<br>NO SELECTED ENDPOINTS !!!";
    mki3d.backup();
    var selected=mki3d.tmp.selected;
    var pO= mki3d.points.point.O.pos;
    var i;
    for( i=0; i< selected.length; i++) {
	var pos= selected[i].position; // reference to position
	var s= mki3d.constructive.scalingFactor
	mki3d.scaleWithFixedPoint(selected[i].position, s,s,s , pO);
    }
    mki3d.backup();
    mki3d.redraw();
    return "<br>SELECTED POINTS SCALED BY SCALING FACTOR WITH FIXED POINT 'O'.<br> (USE 'U' FOR SINGLE STEP UNDO.)";
}

mki3d.constructiveScaleByABOverCD= function(){
    var methodName ="SCALE BY |AB|/|CD|";
    var neededPoints = "OABCD";
    var check= mki3d.checkConstructivePoints( methodName, neededPoints );
    if( check != "") return check;
    if( !mki3d.tmp.selected || mki3d.tmp.selected.length==0 ) return "<br>NO SELECTED ENDPOINTS !!!";
    mki3d.backup();
    var selected=mki3d.tmp.selected;
    var pO= mki3d.points.point.O.pos;
    var A= mki3d.points.point.A.pos;
    var B= mki3d.points.point.B.pos;
    var C= mki3d.points.point.C.pos;
    var D= mki3d.points.point.D.pos;
    var AB=[B[0]-A[0], B[1]-A[1], B[2]-A[2]];
    var lenAB=mki3d.vectorLength(AB);
    var CD=[D[0]-C[0], D[1]-C[1], D[2]-C[2]];
    var lenCD=mki3d.vectorLength(CD);
    if( lenCD==0 ) return "LENGTH |'CD'| IS ZERO - CAN NOT SCALE BY |'AB'|/|'CD'| !";
    var s=lenAB/lenCD;
    if( s > MKI3D_MAX_SCALE )
	return "|'AB'|/|'CD'| IS "+Math.abs(s)+" > "+MKI3D_MAX_SCALE+" (TOO LARGE !)";

    var i;
    for( i=0; i< selected.length; i++) {
	var pos= selected[i].position; // reference to position
	mki3d.scaleWithFixedPoint(selected[i].position, s,s,s , pO);
    }
    mki3d.backup();
    mki3d.redraw();
    var warning="";
    if(s==0) warning="<br> WARNING: |AB|/|CD| WAS ZERO !"
    return "<br>SELECTED POINTS SCALED BY |'AB'|/|'CD'| WITH FIXED POINT 'O'."+warning+"<br> (USE 'U' FOR SINGLE STEP UNDO.)";
}

mki3d.constructiveScaleOrthogonalToEF= function(){
    var methodName ="SCALE ORTHOGONAL TO 'EF'";
    var neededPoints = "OEF";
    var check= mki3d.checkConstructivePoints( methodName, neededPoints );
    if( check != "") return check;
    if( !mki3d.tmp.selected || mki3d.tmp.selected.length==0 ) return "<br>NO SELECTED ENDPOINTS !!!";
    mki3d.backup();
    var s= mki3d.constructive.scalingFactor;
    if(s==0) return "SCALE ORTHOGONAL TO 'EF' WITH SCALING FACTOR ZERO: NOT IMPLEMENTED YET ..."
    mki3d.backup.forbidden=true; // do not do internal backups
    mki3d.constructiveScaleWithFixedPointO();
    mki3d.constructive.scalingFactor=1/s; // temporary ..
    mki3d.constructiveScaleInDirectionEF();
    mki3d.backup.forbidden=false; // restore default
    mki3d.constructive.scalingFactor=s; // restoring ...
    mki3d.backup();
    return "<br>SELECTED POINTS SCALED ORTHOGONAL TO 'EF' BY SCALING FACTOR WITH FIXED POINT 'O'.<br> (USE 'U' FOR SINGLE STEP UNDO.)";
}

mki3d.constructiveScaleInDirectionEF= function(){
    var methodName ="SCALE IN DIRECTION 'EF'";
    var neededPoints = "OEF";
    var check= mki3d.checkConstructivePoints( methodName, neededPoints );
    if( check != "") return check;
    if( !mki3d.tmp.selected || mki3d.tmp.selected.length==0 ) return "<br>NO SELECTED ENDPOINTS !!!";
    mki3d.backup();
    var selected=mki3d.tmp.selected;
    var pO= mki3d.points.point.O.pos;
    var E= mki3d.points.point.E.pos;
    var F= mki3d.points.point.F.pos;

    var EF=[F[0]-E[0], F[1]-E[1], F[2]-E[2]];
    var lenEF=mki3d.vectorLength(EF);

    if( lenEF==0 ) return "LENGTH |'EF'| IS ZERO - CAN NOT SCALE IN DIRECTION 'EF' !";
    var N= mki3d.vectorNormalized(EF);
    var s= mki3d.constructive.scalingFactor;
    var sV=[ N[0]*(s-1)+1, N[1]*(s-1)+1, N[2]*(s-1)+1]; // scaling vector
    var i;
    for( i=0; i< selected.length; i++) {
	var pos=selected[i].position;
	var dV=[pos[0]-pO[0], pos[1]-pO[1], pos[2]-pO[2]]; // position relative to fixed point
	var sp=mki3d.scalarProduct(N,dV); // projection of relative vector on N axis
	var ds=(s-1)*sp; // (scaled projection - projection)
	var dV1=[ds*N[0], ds*N[1], ds*N[2]]; // delta in direction N
	mki3d.vectorMove(selected[i].position, dV1[0], dV1[1], dV1[2]); // add delta to position
    }
    mki3d.backup();
    mki3d.redraw();
    return "<br>SELECTED POINTS SCALED IN DIRECTION 'EF' BY SCALING FACTOR WITH FIXED POINT 'O'.<br> (USE 'U' FOR SINGLE STEP UNDO.)";

    
}



/* returns [u,w] - minimal and maximal corners of bounding box of selected endpoints or null */

mki3d.boundingBoxOfSelected= function(){
    if(!mki3d.tmp.selected || mki3d.tmp.selected.length==0 ) return null;
    var selected= mki3d.tmp.selected;
    var u= mki3d.vectorClone(selected[0].position);
    var w= mki3d.vectorClone(selected[0].position);

    var i,d;
    for(i=0; i<selected.length; i++) {
	for( d=0; d<3; d++) {
	    u[d]= Math.min(u[d], selected[i].position[d]);
	    w[d]= Math.max(w[d], selected[i].position[d]);
	}
    }
    return [u,w];
}


/** SETING OF CONSTRUCTIVE POINTS **/

mki3d.constructiveBBoxOfSelectedUW= function(){
    var corners=mki3d.boundingBoxOfSelected();
    if( corners==null ) return "<br> THERE ARE NO SELECTED ENDPOINTS !";
    mki3d.pointSetAt( "U", corners[0] );
    mki3d.pointSetAt( "W", corners[1] );
    return "<br> POINTS 'U' 'W' SET ON THE MINIMAL AND MAXIMAL CORNERS OF BOUNDING BOX OF SELECTED"; 

}

/** CURSOR JUMPING **/


/* moves the cursor to the center of visible constructive points */
mki3d.moveCursorToPointsCenter = function(){
    var pString=""
    var n=0;
    var pName;
    for(pName in mki3d.points.point) {
	var pObj= mki3d.points.point[pName];
	if( pObj.pos && pObj.visible ) {
	    n++;
	    pString= pString.concat(pName);
	}
    }
    
    if( n==0) {
	return "<br> THERE ARE NO VISIBLE CONSTRUCTIVE POINTS (USE 'QPS...' TO SET THE POINTS)";
    }

    var avg=[0,0,0];

    for(pName in mki3d.points.point) {
	var pObj= mki3d.points.point[pName];
	if( pObj.pos && pObj.visible ) {
	    var v= pObj.pos;
	    mki3d.vectorMove( avg, v[0]/n, v[1]/n, v[2]/n);
	}
    }
    
    mki3d.data.cursor.position = avg;
    mki3d.redraw();

    return "<br> CURSOR MOVED TO THE CENTER OF THE POINTS: '"+pString+"'.";

    ////
}

mki3d.moveCursorToCenteroidOfSelected = function(){

    if(!mki3d.tmp.selected || mki3d.tmp.selected.length==0 ) return "<br> THERE ARE NO SELECTED ENDPOINTS. (USE 'QS...' TO SELECT SOME.)";
    var selected= mki3d.tmp.selected;

    var avg=[0,0,0];
    var n=selected.length;
    
    for(i=0; i<n; i++) {
	var v=selected[i].position;
	mki3d.vectorMove( avg, v[0]/n, v[1]/n, v[2]/n);
    }
    
    mki3d.data.cursor.position = avg;
    mki3d.redraw();

    return "<br> CURSOR MOVED TO THE CENTEROID OF THE "+n+" SELECTED ENDPOINTS.";

    ////
}



mki3d.moveCursorToIntersectionABandCDE = function(){
    var methodName ="MOVE CURSOR TO INTERSECTION OF AB AND CDE";
    var neededPoints = "ABCDE";
    var check= mki3d.checkConstructivePoints( methodName, neededPoints );
    if( check != "") return check;
    var A= mki3d.points.point.A.pos;
    var B= mki3d.points.point.B.pos;
    var C= mki3d.points.point.C.pos;
    var D= mki3d.points.point.D.pos;
    var E= mki3d.points.point.E.pos;

    var result = mki3d.lineABplaneCDEintersection( A,B, C,D,E );
    if(!result) return "<br> INTERSECTION POINT OF AB AND CDE COULD NOT BE FOUND.";
    mki3d.data.cursor.position = result;
    mki3d.redraw();
    return "<br> CURSOR MOVED TO THE INTERSECTION OF LINE AB AND PLANE CDE.";
}




mki3d.lineABplaneCDEintersection= function( A,B, C,D,E ){
    var obj=mki3d.linePlaneSolution( A,B, C,D,E ); 
    if( obj === null ) return null;
    return obj.V;
}

/* returns object {V: [x,y,z], t: t}, where V=A+t*(B-A) is the intersection of line AB with plane CDE,
   or null if such solution does not exist */
mki3d.linePlaneSolution = function( A,B, C,D,E ){
    var CD = [ D[0]-C[0], D[1]-C[1], D[2]-C[2] ];
    var CE = [ E[0]-C[0], E[1]-C[1], E[2]-C[2] ];
    var AB = [ B[0]-A[0], B[1]-A[1], B[2]-A[2] ];

    var d = mki3d.matrixDeterminant( [ CD,
				       CE,
				       AB ] );

    if( d==0 ) return null; // no solution found

    var AC = [ C[0]-A[0], C[1]-A[1], C[2]-A[2] ];

    var d1= mki3d.matrixDeterminant( [ CD,
				       CE,
				       AC ] );

    var X= mki3d.vectorClone(AB);
    t=d1/d;
    mki3d.vectorScale(X, t,t,t );
    
    return { V: [ A[0]+X[0], A[1]+X[1], A[2]+X[2] ], t: t};

}






/** Three-point transformations transcript from https://github.com/mki1967/et-edit **/

mki3d.findThreePointTransformation = function( P1, P2, P3, 
					       Q1, Q2, Q3 ) {
    
    /*  assumption: for each Pi!=Pj and Qi!=Qj */

    var u=[];
    u[0]= [ P2[0]-P1[0], P2[1]-P1[1], P2[2]-P1[2] ]; 
    u[1]= mki3d.vectorProduct( u[0],  [ P3[0]-P1[0], P3[1]-P1[1], P3[2]-P1[2] ] );
    u[0]=mki3d.vectorNormalized( u[0] );
    u[1]=mki3d.vectorNormalized( u[1] );
    u[2]= mki3d.vectorProduct( u[0], u[1]);
    /*  u[0], u[1],  u[2]  should be orthogonal to each other - the base of the first space */
    if(mki3d.vectorLength(u[2])==0) {
	return { error: "three points transformation: the first three points are colinear !!!\n"};
    }

    var w=[];
    w[0]= [ Q2[0]-Q1[0], Q2[1]-Q1[1], Q2[2]-Q1[2] ]; 
    w[1]= mki3d.vectorProduct( w[0],  [ Q3[0]-Q1[0], Q3[1]-Q1[1], Q3[2]-Q1[2] ] );
    w[0]=mki3d.vectorNormalized( w[0] );
    w[1]=mki3d.vectorNormalized( w[1] );
    w[2]= mki3d.vectorProduct( w[0], w[1]);
    /*  w[0], w[1],  w[2]  should be orthogonal to each other - the base of the second space */
    if(mki3d.vectorLength(w[2])==0) {
	return { error: "three points transformation: the last three points are colinear !!!\n"};
    }

    var i,j;
    var R=[[],[],[]];
    for(i=0; i<3; i++)
	for(j=0; j<3; j++) {
	    R[i][j]=0;
	    for(k=0; k<3; k++)
		R[i][j]+=u[k][j]*w[k][i];
	}

    var v= mki3d.matrixVectorProduct(R, P1, mv);
    var mv=[Q1[0]-v[0], Q1[1]-v[1], Q1[2]-v[2] ];  /*  mv = Q1 - R*P1 */
    
    return { mv: mv, R: R };

}


mki3d.matrixVectorTransformed= function( m, v, vIn ) {
    var u= mki3d.matrixVectorProduct(m, vIn );
    mki3d.vectorMove(u, v[0], v[1], v[2] );
    return u;
}


mki3d.constructiveThreePointTransformation= function(){
    /*  assumption: for each Pi!=Pj and Qi!=Qj */
    
    var methodName ="THREE-POINT RANSFORMATION 'ABC' TO 'DEF'";
    var neededPoints = "ABCDEF";
    var check= mki3d.checkConstructivePoints( methodName, neededPoints );
    if( check != "") return check;
    if( !mki3d.tmp.selected || mki3d.tmp.selected.length==0 ) return "<br>NO SELECTED ENDPOINTS !!!";

    var A= mki3d.points.point.A.pos;
    var B= mki3d.points.point.B.pos;
    var C= mki3d.points.point.C.pos;
    var D= mki3d.points.point.D.pos;
    var E= mki3d.points.point.E.pos;
    var F= mki3d.points.point.F.pos;

    var tr=mki3d.findThreePointTransformation( A,B,C, D,E,F );

    if( tr.error ) {
	return "<br>ERROR: "+tr.error;
    }
    
    var selected=mki3d.tmp.selected;
    var i;
    for( i=0; i< selected.length; i++) {
	var pos= selected[i].position; // reference to position
	var v=mki3d.matrixVectorTransformed( tr.R, tr.mv, pos );
	pos[0]=v[0];
	pos[1]=v[1];
	pos[2]=v[2];
    }
    mki3d.backup();
    mki3d.cancelShades(); // some triangles could be rotated
    mki3d.redraw();
    return "<br>THREE-POINT TRANFORMATION 'ABC' TO 'DEF' HAS BEEN DONE. <br> (USE 'U' FOR SINGLE STEP UNDO.)";
}


/** FOLDING **/
/* Folding procedures based on my old algorithms from et-editor (https://github.com/mki1967/et-edit) */

/* mki3d.FindCenteredFolding returns either {error: ... } or {V: [...]}, 
   where V is the meeting point of the points B1 and B2 tranformed by their respective rotations */



mki3d.findCenteredFolding = function( A1, A2, /* normalised vectors: OA1 and OA2 are axes of rotations, where O=[0,0,0] */
				      B1, B2, /* normalised vectors: OB1 and OB2 should meet after respective rotations */
				      K /* position on one side of the plane OA1A2 - indicates the direction of rotations */
				    ){
    var eps= 1e-14;
    var swap=0;  /*  0 - no swap, 1 - swaped xy, 2 - swaped yz  */
    var m,p,q, A2B2, A1B1, a, b, c, delta, x1, y1, z1, d1,d2;
    var matrix=[[0,0,0],[0,0,0],[0,0,0]]; 

    A2B2= mki3d.scalarProduct(A2,B2);
    A1B1= mki3d.scalarProduct(A1,B1);



    m=A2[2]*A1[0]-A1[2]*A2[0];

    if(Math.abs(m)<eps)
    {
	mki3d.vectorSwapCoordinates(A1, 0,1);
	mki3d.vectorSwapCoordinates(A2, 0,1);
	mki3d.vectorSwapCoordinates(B1, 0,1);
	mki3d.vectorSwapCoordinates(B2, 0,1);
	mki3d.vectorSwapCoordinates(K, 0,1);
	m=A2[2]*A1[0]-A1[2]*A2[0];
	swap=1;
    }

    if(Math.abs(m)<eps)
    {
	mki3d.vectorSwapCoordinates(A1, 0,1);
	mki3d.vectorSwapCoordinates(A2, 0,1);
	mki3d.vectorSwapCoordinates(B1, 0,1);
	mki3d.vectorSwapCoordinates(B2, 0,1);
	mki3d.vectorSwapCoordinates(K, 0,1);

	mki3d.vectorSwapCoordinates(A1, 2,1);
	mki3d.vectorSwapCoordinates(A2, 2,1);
	mki3d.vectorSwapCoordinates(B1, 2,1);
	mki3d.vectorSwapCoordinates(B2, 2,1);
	mki3d.vectorSwapCoordinates(K, 2,1);
	m=A2[2]*A1[0]-A1[2]*A2[0];
	swap=2;
    }



    if(Math.abs(m)<eps){
	return {error: "FOLDING REFUSED: the axes are almost colinear !!\n"};
    }

    /*  m!=0  */

    p=(A1[1]*A2[0]-A2[1]*A1[0])/m;
    q=(A2B2*A1[0]-A1B1*A2[0])/m;
    
    a=(1+p*p)*A2[0]*A2[0]+(A2[1]+p*A2[2])*(A2[1]+p*A2[2]);
    b=2*(p*q*A2[0]*A2[0]-(A2B2-q*A2[2])*(A2[1]+p*A2[2]));
    c=(q*q-1)*A2[0]*A2[0]+(A2B2-q*A2[2])*(A2B2-q*A2[2]);

    if(Math.abs(a)<eps){
	a=(1+p*p)*A1[0]*A1[0]+(A1[1]+p*A1[2])*(A1[1]+p*A1[2]);
	b=2*(p*q*A1[0]*A1[0]-(A1B1-q*A1[2])*(A1[1]+p*A1[2]));
	c=(q*q-1)*A1[0]*A1[0]+(A1B1-q*A1[2])*(A1B1-q*A1[2]);
    }

    if(Math.abs(a)<eps){
	return {error: "FOLDING REFUSED: the axes are almost colinear !!\n"};
    }

    /*  a!=0 */

    delta= b*b-4*a*c;

    if(delta<0){
	return {error: "FOLDING FAILED: probably too large angle between rotated lines !!!"};
    }

    y1= (-b-Math.sqrt(delta))/(2*a);
    z1= p*y1+q;
    x1= (Math.abs(A2[0]) > Math.abs(A1[0])) ?
	(A2B2-y1*A2[1]-z1*A2[2])/A2[0]:
	(A1B1-y1*A1[1]-z1*A1[2])/A1[0];
    

    matrix[0]=mki3d.vectorClone(A1);
    matrix[1]=mki3d.vectorClone(A2);
    matrix[2]=mki3d.vectorClone(K);

    d1=mki3d.matrixDeterminant(matrix);

    matrix[2][0]=x1;
    matrix[2][1]=y1;
    matrix[2][2]=z1;

    d2=mki3d.matrixDeterminant(matrix);

    if(d1*d2 < 0){
	y1= (-b+Math.sqrt(delta))/(2*a);
	z1= p*y1+q;
	x1= (Math.abs(A2[0]) > Math.abs(A1[0])) ?
	    (A2B2-y1*A2[1]-z1*A2[2])/A2[0]:
	    (A1B1-y1*A1[1]-z1*A1[2])/A1[0];
    }

    var V=[x1,y1,z1];

    switch(swap){
    case 1:
	mki3d.vectorSwapCoordinates(A1, 0,1);
	mki3d.vectorSwapCoordinates(A2, 0,1);
	mki3d.vectorSwapCoordinates(B1, 0,1);
	mki3d.vectorSwapCoordinates(B2, 0,1);
	mki3d.vectorSwapCoordinates(K, 0,1);
	mki3d.vectorSwapCoordinates(V, 0,1);
	break;

    case 2:
	mki3d.vectorSwapCoordinates(A1, 2,1);
	mki3d.vectorSwapCoordinates(A2, 2,1);
	mki3d.vectorSwapCoordinates(B1, 2,1);
	mki3d.vectorSwapCoordinates(B2, 2,1);
	mki3d.vectorSwapCoordinates(K, 2,1);
	mki3d.vectorSwapCoordinates(V, 2,1);
	break;

    }

    return {V: V};
}


/* 
   mki3d.findFolding returns either {error:"..."} or {V:[...]},
   where V is a position such that AV is the line, where AD meets AE while
   AD and AE are rotarted around AB and AC respectively,
   and F and V are on the same side of the plane ABC.
*/

mki3d.findFolding = function( A, B, C,
			      D, E,
			      F 
			    ){
    var A1, A2, B1, B2, K;

    if(mki3d.vectorCompare(A,B)==0)
    {
	return {error: "FOLDING REFUSED: A=B !!!"};
    };
    A1=mki3d.vectorNormalized( [ B[0]-A[0], B[1]-A[1], B[2]-A[2] ] ); 

    if(mki3d.vectorCompare(A,C)==0)
    {
	return {error: "FOLDING REFUSED: A=C !!!"};
    }
    A2=mki3d.vectorNormalized( [ C[0]-A[0], C[1]-A[1], C[2]-A[2] ] ); 
    
    if(mki3d.vectorCompare(A,D)==0)
    {
	return {error: "FOLDING REFUSED: A=D !!!"};
    }
    B1=mki3d.vectorNormalized( [ D[0]-A[0], D[1]-A[1], D[2]-A[2] ] ); 

    if(mki3d.vectorCompare(A,E)==0)
    {
	return {error: "FOLDING REFUSED: A=E !!!"};
    }
    B2=mki3d.vectorNormalized( [ E[0]-A[0], E[1]-A[1], E[2]-A[2] ] ); 

    K= [ F[0]-A[0], F[1]-A[1], F[2]-A[2] ]
    
    var centered= mki3d.findCenteredFolding(A1,A2, B1,B2, K)

    if( centered.error ) {
	return centered; // propagate error :-(
    }
    
    
    mki3d.vectorMove(centered.V, A[0], A[1], A[2] );
    return centered; // return centered solution moved by A :-)
    
}


mki3d.constructiveFolding= function(){
    
    var methodName ="FOLDING";
    var neededPoints = "ABCDEF";
    var check= mki3d.checkConstructivePoints( methodName, neededPoints );
    if( check != "") return check;
    if( !mki3d.tmp.selected || mki3d.tmp.selected.length==0 ) return "<br>NO SELECTED ENDPOINTS !!!";
    if( !mki3d.tmp.bookmarked || mki3d.tmp.bookmarked.length==0 ) return "<br>NO BOKMARKED ENDPOINTS !!!";

    var A= mki3d.points.point.A.pos;
    var B= mki3d.points.point.B.pos;
    var C= mki3d.points.point.C.pos;
    var D= mki3d.points.point.D.pos;
    var E= mki3d.points.point.E.pos;
    var F= mki3d.points.point.F.pos;

    var fold=mki3d.findFolding( A,B,C, D,E, F );
    if( fold.error ) {
	return "<br>ERROR: "+fold.error;
    }

    var V=fold.V;
    mki3d.pointSetAt("V", V);


    var tr1=mki3d.findThreePointTransformation( A,B,D, A,B,V );

    if( tr1.error ) {
	return "<br> tr1.error (SOME BUG IN THE PROGRAM !!!): "+tr1.error;
    }

    var tr2=mki3d.findThreePointTransformation( A,C,E, A,C,V );

    if( tr2.error ) {
	return "<br> tr2.error (SOME BUG IN THE PROGRAM !!!): "+tr2.error;
    }

    /* tr1 nad tr2 are the correct transfomations */

    var points=mki3d.tmp.selected;
    var i;
    for( i=0; i< points.length; i++) {
	var pos= points[i].position; // reference to position
	var v=mki3d.matrixVectorTransformed( tr1.R, tr1.mv, pos );
	pos[0]=v[0];
	pos[1]=v[1];
	pos[2]=v[2];
    }

    points=mki3d.tmp.bookmarked;
    for( i=0; i< points.length; i++) {
	var pos= points[i].position; // reference to position
	var v=mki3d.matrixVectorTransformed( tr2.R, tr2.mv, pos );
	pos[0]=v[0];
	pos[1]=v[1];
	pos[2]=v[2];
    }

    mki3d.backup();
    mki3d.cancelShades(); // some triangles could be rotated
    mki3d.redraw();
    return "<br>FOLDING OF SELECTED AROUND 'AB' AND OF BOOKARKED AROUND 'AC' HAS BEEN DONE."+
	"<br> LINE 'AV' IS THE COMMON RESULT THE RESPECTIVE ROTATIONS OF THE LINES 'AD' AROUND 'AB' AND 'AE' AROUND 'AC'."+
	"<br> (USE 'U' FOR SINGLE STEP UNDO.)";
}

/** triangle-triangle intersections (based on https://github.com/mki1967/et-edit ) **/

/* returns [E1,E2] - endpoints positions of the segment intersection or null (if no segment is intersection) */
mki3d.TriangleTriangleIntersection= function( A1, A2, A3, /* endpoints positions of the first triangle */
					      B1, B2, B3 /* endpoints positions of the first triangle */
					    ) {
    var E1,E2; /* output positions */
    var M /* matrix [3][3]*/;
    var NA, NB; /* vectors [3] */
    var B_1, B_2, B_3, X1, X2; /*vectors [3] */
    var A_1, A_2, A_3, Y1, Y2; /*vectors [3] */
    var det1,det2, det3, t1, t2; /* real numbers */
    NA=mki3d.normalToPlane( A1, A2, A3 );
    if(mki3d.scalarProduct(NA,NA)==0) {
	return null; /* triangle [A1,A2,A3] is degenarate */
    }

    NB=mki3d.normalToPlane( B1, B2, B3 );
    if(mki3d.scalarProduct(NB,NB)==0) {
	return null; /* triangle [B1,B2,B3] is degenarate */
    }

    M=[];
    M[0]= [ A2[0]-A1[0], A2[1]-A1[1], A2[2]-A1[2] ]; 
    M[1]= [ A3[0]-A1[0], A3[1]-A1[1], A3[2]-A1[2] ]; 

    M[2]= [ B1[0]-A1[0], B1[1]-A1[1], B1[2]-A1[2] ]; 
    det1= mki3d.matrixDeterminant(M);

    M[2]= [ B2[0]-A1[0], B2[1]-A1[1], B2[2]-A1[2] ]; 
    det2= mki3d.matrixDeterminant(M);

    M[2]= [ B3[0]-A1[0], B3[1]-A1[1], B3[2]-A1[2] ]; 
    det3= mki3d.matrixDeterminant(M);


    if( (det1<=0 && det2<=0 && det3<=0) ||
	(det1>=0 && det2>=0 && det3>=0)
      ){
	/*  all vertices of B are on the same side of plane A1,A2,A3 */
	return null;
    }

    if( (det1<0 && det2>=0 && det3>=0) ||
	(det1>0 && det2<=0 && det3<=0) 
      ){
	B_1 = mki3d.vectorClone(B1);
	B_2 = mki3d.vectorClone(B2);
	B_3 = mki3d.vectorClone(B3);
    } else if( (det2<0 && det1>=0 && det3>=0) ||
	       (det2>0 && det1<=0 && det3<=0) 
	     ){
	B_1 = mki3d.vectorClone(B2);
	B_2 = mki3d.vectorClone(B1);
	B_3 = mki3d.vectorClone(B3);
    } else if( (det3<0 && det2>=0 && det1>=0) ||
	       (det3>0 && det2<=0 && det1<=0) 
	     ) {
	B_1 = mki3d.vectorClone(B3);
	B_2 = mki3d.vectorClone(B2);
	B_3 = mki3d.vectorClone(B1);
    }

    /*  B_1 is on the other side of the plane A1, A2, A3 than B_2, B_3. */

    X1= mki3d.lineABplaneCDEintersection( B_1,B_2, A1,A2,A3 );
    X2= mki3d.lineABplaneCDEintersection( B_1,B_3, A1,A2,A3 );

    M=[];

    M[0]=[ B2[0]-B1[0], B2[1]-B1[1], B2[2]-B1[2] ];
    M[1]=[ B3[0]-B1[0], B3[1]-B1[1], B3[2]-B1[2] ];
    
    M[2]=[ A1[0]-B1[0], A1[1]-B1[1], A1[2]-B1[2] ];
    det1= mki3d.matrixDeterminant(M);

    M[2]=[ A2[0]-B1[0], A2[1]-B1[1], A2[2]-B1[2] ];
    det2= mki3d.matrixDeterminant(M);

    M[2]=[ A3[0]-B1[0], A3[1]-B1[1], A3[2]-B1[2] ];
    det3= mki3d.matrixDeterminant(M);

    if( (det1<=0 && det2<=0 && det3<=0) ||
	(det1>=0 && det2>=0 && det3>=0)
      ) {
	/*  all vertices of A are on the same side of plane B1,B2,B3 */
	return null;
    }

    if( (det1<0 && det2>=0 && det3>=0) ||
	(det1>0 && det2<=0 && det3<=0)
      ){
	A_1 = mki3d.vectorClone(A1);
	A_2 = mki3d.vectorClone(A2);
	A_3 = mki3d.vectorClone(A3);
    } else if( (det2<0 && det1>=0 && det3>=0) ||
	       (det2>0 && det1<=0 && det3<=0)
	     ){
	A_1 = mki3d.vectorClone(A2);
	A_2 = mki3d.vectorClone(A1);
	A_3 = mki3d.vectorClone(A3);
    } else if( (det3<0 && det2>=0 && det1>=0) ||
	       (det3>0 && det2<=0 && det1<=0)
	     ) {
	A_1 = mki3d.vectorClone(A3);
	A_2 = mki3d.vectorClone(A2);
	A_3 = mki3d.vectorClone(A1);
    }
    /*  A_1 is on the other side of the plane B1, B2, B3 than A_2, A_3. */

    var A1NA = [ A_1[0]+NA[0], A_1[1]+NA[1], A_1[2]+NA[2] ];  
    var solution1= mki3d.linePlaneSolution( X1,X2, A_1,A_2,A1NA )
    var solution2= mki3d.linePlaneSolution( X1,X2, A_1,A_3,A1NA )
    t1 = solution1.t;
    t2 = solution2.t;
    if(solution1.t<= solution2.t) {
	t1 = solution1.t;
	Y1 = solution1.V;
	t2 = solution2.t;
	Y2 = solution2.V;
    } else {
	t2 = solution1.t;
	Y2 = solution1.V;
	t1 = solution2.t;
	Y1 = solution2.V;
    }

    if( t2<=0  || t1>=1 ) {
	/*  t2<=0  || t1>=1 -- segment [X1,X2] is outside triangle A */
	return null;
    }

    /* [E1,E2] should be the part of [X1,X2] that is inside triangle A */
    if(t1>0) {
	E1=Y1;
    } else {
	E1=X1;
    }
    
    if(t2<1) {
	E2=Y2;
    } else {
	E2=X2;
    }

    return [E1, E2];

}


mki3d.SelectedBookmarkedTriangleIntersection= function() {
    var t1= mki3d.getSelectedElements(mki3d.data.model.triangles);
    if(t1.length==0) return "<br> NO TRIANGLES HAVE ALL ENDPOINTS SELECTED !";

    var t2= mki3d.getBookmarkedElements(mki3d.data.model.triangles);
    if(t2.length==0) return "<br> NO TRIANGLES HAVE ALL ENDPOINTS BOOKMARKED !";


    mki3d.compressSetIndexes(mki3d.data);
    var newIdx = mki3d.getMaxSetIndex( mki3d.data.model )+1; // empty set
    mki3d.data.set.current=newIdx; // insert intersection segments to a new set

    var c = mki3d.data.cursor.color;
    var count=0;
    var i1, i2;
    for(i1=0; i1<t1.length; i1++)
	for(i2=0; i2<t2.length; i2++) {
	    var cut= mki3d.TriangleTriangleIntersection( t1[i1][0].position, t1[i1][1].position, t1[i1][2].position, 
							 t2[i2][0].position, t2[i2][1].position, t2[i2][2].position );

	    if(cut) {
		var p= cut[0];
		var pt1 = mki3d.newPoint( p[0], p[1], p[2],  
					  c[0], c[1], c[2] ,  
					  mki3d.data.set.current );
		var p=cut[1];
		var pt2 = mki3d.newPoint( p[0], p[1], p[2],  
					  c[0], c[1], c[2] ,  
					  mki3d.data.set.current );
		var seg = mki3d.newSegment( pt1, pt2 );
		mki3d.modelInsertElement( mki3d.data.model.segments, seg);
		count++;
	    }
	}
    mki3d.backup();
    mki3d.redraw();
    return "<br> INSERTED "+count+" SEGMENTS OF THE INTERSECTION TO THE NEW CURRENT SET: "+mki3d.data.set.current+
	"<br> (USE 'U' FOR SINGLE STEP UNDO.)";
}



/*** PROJECTIONS OF SELECTED ENDPOINTS ***/

mki3d.parallelProjection_AB_CDE= function(){
    var methodName ="PROJECTION OF SELECTED ENDPOINTS IN DIRECTION 'AB' ON THE PLANE 'CDE'";
    var neededPoints = "ABCDE";
    var check= mki3d.checkConstructivePoints( methodName, neededPoints );
    if( check != "") return check;
    var A= mki3d.points.point.A.pos;
    var B= mki3d.points.point.B.pos;
    var C= mki3d.points.point.C.pos;
    var D= mki3d.points.point.D.pos;
    var E= mki3d.points.point.E.pos;

    var result = mki3d.lineABplaneCDEintersection( A,B, C,D,E );
    if(!result) return "<br> INTERSECTION POINT OF 'AB' AND 'CDE' COULD NOT BE FOUND.";

    if( !mki3d.tmp.selected || mki3d.tmp.selected.length==0 ) return "<br>NO SELECTED ENDPOINTS !!!";

    mki3d.backup();
    var selected=mki3d.tmp.selected;

    var d=[B[0]-A[0], B[1]-A[1], B[2]-D[2]]; // direction

    var i;
    for( i=0; i< selected.length; i++) {
	var PA= selected[i].position; // reference to position
	var PB= [PA[0]+d[0], PA[1]+d[1], PA[2]+d[2]];
	selected[i].position =  mki3d.lineABplaneCDEintersection( PA, PB, C,D,E ); // project on plane CDE
    }
    mki3d.backup();
    mki3d.redraw();
    return "<br>PROJECTED THE SELECTED ENDPOINTS BY THE VECTOR 'AB' ON THE PLANE 'CDE'.<br> (USE 'U' FOR SINGLE STEP UNDO.)";
    
}

mki3d.sphereProjection_O_AB= function(){
    var methodName ="PROJECTION OF SELECTED ENDPOINTS ON THE SPHERE CENTERED AT 'O' WITH RADIUS LENGTH |AB|";
    var neededPoints = "OAB";
    var check= mki3d.checkConstructivePoints( methodName, neededPoints );
    if( check != "") return check;
    if( !mki3d.tmp.selected || mki3d.tmp.selected.length==0 ) return "<br>NO SELECTED ENDPOINTS !!!";
    
    var A= mki3d.points.point.A.pos;
    var B= mki3d.points.point.B.pos;
    var O= mki3d.points.point.O.pos;
    var AB=[B[0]-A[0], B[1]-A[1], B[2]-A[2]];
    var lenAB=mki3d.vectorLength(AB); // radius
    // if( lenAB==0 ) return "LENGTH |AB| IS ZERO!";
    mki3d.backup();
    var selected=mki3d.tmp.selected;
    var i;
    for( i=0; i< selected.length; i++) {
	var P= selected[i].position; // reference to position
	var OP= [P[0]-O[0], P[1]-O[1], P[2]-O[2]];
	var lenOP=mki3d.vectorLength(OP);
	if( lenOP >0 ) {
	    var s= lenAB/lenOP;
	    selected[i].position = [ O[0]+OP[0]*s, O[1]+OP[1]*s, O[2]+OP[2]*s] ; // project on a sphere (O, |AB|)
	}
    }
    mki3d.backup();
    mki3d.redraw();
    return "<br>PROJECTED THE SELECTED ENDPOINTS ON THE SPHERE CENTERED AT 'O' WITH RADIUS LENGTH |AB|.<br> (USE 'U' FOR SINGLE STEP UNDO.)";

}
