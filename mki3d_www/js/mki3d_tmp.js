/* mki3d.tmp -- temporary data created when needed */
mki3d.tmp = {};


/** Functions for manipulations on mki3d.tmp **/

/* cancel all mki3d.tmp data */
mki3d.tmpCancel = function() {
    mki3d.tmp = {}; 
}


/* (re)creation of tmp data */

mki3d.tmpMakeVersorsMatrix = function() {

    // console.log("TEST : makeVersorsMatrix "); 

    var rot = mki3d.data.view.rotationMatrix;

    var imageXYZRows = [ { img : mki3d.matrixColumn(rot, 0), idx : 0 , row: [1,0,0] },
			 { img : mki3d.matrixColumn(rot, 1), idx : 1 , row: [0,1,0] },
			 { img : mki3d.matrixColumn(rot, 2), idx : 2 , row: [0,0,1] }];

    var spMaxAbs, spNext, tmp; 

    /* Move best image for Right key to imageXYZRows[0]  */

    spMaxAbs = mki3d.scalarProduct( imageXYZRows[0].img, [1,0,0] );
    spNext   = mki3d.scalarProduct( imageXYZRows[1].img, [1,0,0] );
    if( Math.abs(spMaxAbs) < Math.abs(spNext) ) { // swap 
	tmp = imageXYZRows[0];
	imageXYZRows[0] = imageXYZRows[1];
        imageXYZRows[1] = tmp;
        spMaxAbs=spNext; // new record
    } 
    spNext   = mki3d.scalarProduct( imageXYZRows[2].img, [1,0,0] );
    if( Math.abs(spMaxAbs) < Math.abs(spNext) ) { // swap 
	tmp = imageXYZRows[0];
	imageXYZRows[0] = imageXYZRows[2];
        imageXYZRows[2] = tmp;
        spMaxAbs=spNext; // new record
    } 
    /* set direction */
    if(spMaxAbs < 0 ) mki3d.vectorScale( imageXYZRows[0].row, -1, -1, -1); 

    /* Move best image for Up key to  imageXYZRows[1] */

    spMaxAbs = mki3d.scalarProduct( imageXYZRows[1].img, [0,1,0] );
    spNext   = mki3d.scalarProduct( imageXYZRows[2].img, [0,1,0] );
    if( Math.abs(spMaxAbs) < Math.abs(spNext) ) { // swap 
	tmp = imageXYZRows[1];
	imageXYZRows[1] = imageXYZRows[2];
        imageXYZRows[2] = tmp;
        spMaxAbs=spNext; // new record
    } 
    /* set direction */
    if(spMaxAbs < 0 ) mki3d.vectorScale( imageXYZRows[1].row, -1, -1, -1); 

    /* set direction of the last versor */
    if(mki3d.scalarProduct( imageXYZRows[2].img, [0,0,1] )<0) mki3d.vectorScale( imageXYZRows[2].row, -1, -1, -1); 

    /* set the versorsMatrix */

    var alignedMatrix = [ imageXYZRows[0].row,
			  imageXYZRows[1].row,
			  imageXYZRows[2].row ];
    mki3d.tmp.versorsMatrix = mki3d.matrixTransposed(alignedMatrix); // reverse of the alignedMatrix
    mki3d.tmp.versorsMatrix.input = rot;
};

mki3d.tmpInvalidVersorsMatrix= function(){
    if(!mki3d.tmp.versorsMatrix) return true;
    return mki3d.tmp.versorsMatrix.input !== mki3d.data.view.rotationMatrix;
}; 

mki3d.tmpRefreshVersorsMatrix= function(){
    if( mki3d.tmpInvalidVersorsMatrix() ) mki3d.tmpMakeVersorsMatrix();
};

/* Cheks for existence of mki3d.display.model. 
If it does not exist then it is created from original mki3d.data.model */
mki3d.tmpRefreshDisplayModel= function(){
    if( !mki3d.tmp.display ) mki3d.tmp.display = {};
    if( !mki3d.tmp.display.model ) mki3d.tmp.display.model = mki3d.data.model;
}

/* refsets mki3d.display.model to original mki3d.data.model */
mki3d.tmpResetDisplayModel= function(){
    mki3d.tmpRefreshDisplayModel();
    if( mki3d.tmp.display.model !== mki3d.data.model ) mki3d.tmp.display.model = mki3d.data.model;
}


/* rebuilds tmp.selected table */

mki3d.tmpAddSelectedFromElements= function(elements){
    var points = mki3d.getElementsEndpoints( elements );
    var i;
    for( i=0; i<points.length; i++ ) {
	if(points[i].selected) mki3d.tmp.selected.push(points[i]);
    }
} 

mki3d.tmpRebuildSelected = function(){
    mki3d.tmp.selected =[];
    mki3d.tmpAddSelectedFromElements( mki3d.data.model.segments );
    mki3d.tmpAddSelectedFromElements( mki3d.data.model.triangles );
    mki3d.tmpAddSelectedFromElements( mki3d_texture.triangles( mki3d.data ) );
}
