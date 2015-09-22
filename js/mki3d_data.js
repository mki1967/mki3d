/* 
   mki3d.data -- object representing state of work. 
   This is to be saved and loaded 
*/

mki3d.data = {};

/* model is something that can be displayed */
mki3d.data.model = {};
mki3d.data.model.segments = [];
mki3d.data.model.triangles = [];

/* view describes transformation of the model before its projection. 
   The model undergoes the following transformations:               
      - move by -focusPoint
      - rotate by rotationMatrix
      - scale by the scale
      - move by screenShift
*/


mki3d.data.view = {};
mki3d.data.view.focusPoint = [0,0,0];
mki3d.data.view.rotationMatrix = mki3d.newIdMatrix();
mki3d.data.view.scale = 1;
mki3d.data.view.screenShift = [0,0, MKI3D_SCREEN_Z];

mki3d.data.projection = {}; 
mki3d.data.projection.zNear = MKI3D_PROJECTION_Z_NEAR;
mki3d.data.projection.zFar  = MKI3D_PROJECTION_Z_FAR;
mki3d.data.projection.zoomY = MKI3D_PROJECTION_ZOOM_Y;



mki3d.data.backgroundColor = [0,0,0]; // black

mki3d.data.cursor = {};
mki3d.data.cursor.position = [0,0,0]; // position in the model space 
mki3d.data.cursor.marker1 = null;
mki3d.data.cursor.marker2 = null;
mki3d.data.cursor.color = [0.8,0.8,0.8]; // white


mki3d.data.clipMaxVector = [MKI3D_MAX_CLIP_ABS, MKI3D_MAX_CLIP_ABS, MKI3D_MAX_CLIP_ABS];
mki3d.data.clipMinVector = [-MKI3D_MAX_CLIP_ABS, -MKI3D_MAX_CLIP_ABS, -MKI3D_MAX_CLIP_ABS];

mki3d.data.light = {};
mki3d.data.light.vector = [0,0,1]; 
// mki3d.data.light.serialNumber = 0;
mki3d.data.light.ambientFraction = 0.3; // the rest is diffuse fraction
