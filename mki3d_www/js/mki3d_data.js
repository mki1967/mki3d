/* 
   mki3d.data -- object representing state of work. 
   This is to be saved and loaded 
*/


/* create new initialised data object */
mki3d_newData=function() {
    var data = {};

    /* model is something that can be displayed */
    data.model = {};
    data.model.segments = [];
    data.model.triangles = [];

    /* view describes transformation of the model before its projection. 
       The model undergoes the following transformations:               
       - move by -focusPoint
       - rotate by rotationMatrix
       - scale by the scale
       - move by screenShift
    */


    data.view = {};
    data.view.focusPoint = [0,0,0];
    data.view.rotationMatrix = mki3d.newIdMatrix();
    data.view.scale = 1;
    data.view.screenShift = [0,0, MKI3D_SCREEN_Z];

    data.projection = {}; 
    data.projection.zNear = MKI3D_PROJECTION_Z_NEAR;
    data.projection.zFar  = MKI3D_PROJECTION_Z_FAR;
    data.projection.zoomY = MKI3D_PROJECTION_ZOOM_Y;

    data.backgroundColor = [0,0,0]; // black

    data.cursor = {};
    data.cursor.position = [0,0,0]; // position in the model space 
    data.cursor.marker1 = null;
    data.cursor.marker2 = null;
    data.cursor.color = [1,1,1]; // white
    data.cursor.step = 1; // initial value 


    data.clipMaxVector = [MKI3D_MAX_CLIP_ABS, MKI3D_MAX_CLIP_ABS, MKI3D_MAX_CLIP_ABS];
    data.clipMinVector = [-MKI3D_MAX_CLIP_ABS, -MKI3D_MAX_CLIP_ABS, -MKI3D_MAX_CLIP_ABS];

    data.light = {};
    data.light.vector = [0,0,1]; 
    // data.light.serialNumber = 0;
    data.light.ambientFraction = 0.2; // the rest is diffuse fraction

    data.set = {};
    data.set.current = 0; // current set index

    return data;
}

mki3d.data = mki3d_newData();

