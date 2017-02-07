mki3d.stereo={};

mki3d.stereo.mode= false;
mki3d.stereo.eyeShift=3.0; // 3 * ZOOM_Y/SCREEN_Z   - half of the eyeDistance ;-)

mki3d.stereoProjection= function(eyeShift){
    var d=eyeShift;
    var shift1 = [
	[ 1, 0, 0, -d],
	[ 0, 1, 0,  0],
	[ 0, 0, 1,  0],
	[ 0, 0, 0,  1]
    ];

    
    var screenZ = mki3d.data.view.screenShift[2];
    var projection = mki3d.data.projection;
    var gl = mki3d.gl.context;
    
    var dx = d* projection.zoomY / screenZ * gl.viewportHeight/gl.viewportWidth;

     var shift2 = [
	[ 1, 0, 0, dx],
	[ 0, 1, 0,  0],
	[ 0, 0, 1,  0],
	[ 0, 0, 0,  1]
    ];

    var m= mki3d.matrix4Product( mki3d.projectionMatrix(), shift1 );

    return  mki3d.matrix4Product( shift2, m );
    
}

mki3d.setProjectionGLMatrices= function(){
    mki3d.monoProjectionGL=  mki3d.gl.matrix4toGL(mki3d.projectionMatrix());
    mki3d.stereoLeftProjectionGL=  mki3d.gl.matrix4toGL(mki3d.stereoProjection( -mki3d.stereo.eyeShift ));
    mki3d.stereoRightProjectionGL=  mki3d.gl.matrix4toGL(mki3d.stereoProjection( mki3d.stereo.eyeShift ));
}

/* LEFT AND RIGHT COLORS */

mki3d.stereo.red= 0.6;
mki3d.stereo.blue= 1;

mki3d.stereo.leftColorMask=[true, false, false];
mki3d.stereo.righColorMask=[false, false, true];
