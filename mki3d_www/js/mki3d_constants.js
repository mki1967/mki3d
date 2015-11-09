/* Constants used by mki3d */

/* sizes of elementary components */

const MKI3D_VERTEX_POSITION_SIZE = 3; // 3 floats: x,y,z
const MKI3D_VERTEX_COLOR_SIZE = 3; // 3 floats: r,g,b

/* State of the program */

const MKI3D_STATE_WORKING = "WORKING";
const MKI3D_STATE_SAVING = "SAVING";
const MKI3D_STATE_LOADING = "LOADING";

/* constants used to decide whether the element is degenerate */
const MKI3D_MIN_SEGMENT = 1e-20;
const MKI3D_MIN_TRIANGLE = 1e-20;


/* upper limit for absoloute value of clipping coordinate */
const MKI3D_MAX_CLIP_ABS = 1e+20;

/* upper and lower bounds on the scale */
const MKI3D_MAX_SCALE = 1024.0; 
const MKI3D_MIN_SCALE = 1/ MKI3D_MAX_SCALE;

/* Initial view parameters */

const MKI3D_SCREEN_Z = 60;

/* Initial projection parameters */

const MKI3D_PROJECTION_Z_NEAR = 0.25;
const MKI3D_PROJECTION_Z_FAR = 300;
const MKI3D_PROJECTION_ZOOM_Y = 4.0;

/* Shape of the cursor */

/* cursor shape is a set of line segments in 3D */
const MKI3D_CURSOR_SHAPE = [
    [[-1,0,0],[1,0,0]], // X line
    [[0,-1,0],[0,1,0]], // Y line
    [[0,0,-1],[0,0,1]], // Z line

    [[1,0,0], [0.8,0.2, 0]], // X marker on XY plane
    [[1,0,0], [0.8,0, 0.2]], // X marker on XZ plane

    [[0,1,0], [0.2, 1,   0]], // Y marker on XY plane
    [[0,1,0], [0,   1, 0.2]] // Y marker on YZ plane

];

/* marks dimmensions corresponding to arrow keys */
const MKI3D_PLANE_MARKER = [
    [[0.5, 0, 0], [-0.1, 0.6, 0]]
];

const MKI3D_CURSOR_MAX_SEGMENTS  = MKI3D_CURSOR_SHAPE.length + MKI3D_PLANE_MARKER.length + 10;
const MKI3D_CURSOR_MAX_TRIANGLES = 10;

const MKI3D_MODEL_MAX_SEGMENTS  = 10000;
const MKI3D_MODEL_MAX_TRIANGLES = 10000;

const MKI3D_SELECTED_POINT = [
    [[-0.2, -0.2, 0.0], [ 0.2, 0.2, 0.0]],
    [[ 0.2, -0.2, 0.0], [-0.2, 0.2, 0.0]],
];
