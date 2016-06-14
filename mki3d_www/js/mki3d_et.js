/* importing fro et format of et-edit: https://github.com/mki1967/et-edit.git */

mki3d.et = {}; /* place for imported data */

mki3d_et_getDataFromString= function( string ){
var arr=string.split("\n");
console.log(arr);
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
