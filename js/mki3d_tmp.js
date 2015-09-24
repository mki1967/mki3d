/* mki3d.tmp -- temporary data created when needed */
mki3d.tmp = {};



/* (re)creation of tmp data */

mki3d.tmp.makeVersorsMatrix = function() {

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

mki3d.tmp.invalidVersorsMatrix= function(){
    if(!mki3d.tmp.versorsMatrix) return true;
    return mki3d.tmp.versorsMatrix.input !== mki3d.data.view.rotationMatrix;
}; 

mki3d.tmp.refreshVersorsMatrix= function(){
    if( mki3d.tmp.invalidVersorsMatrix() ) mki3d.tmp.makeVersorsMatrix();
};

