
/* 
   mki3d -- the main object 
*/
var mki3d = {}; 





/** setting callbacks **/

window.onload= function(){
    mki3d.html.initObjects();
    mki3d.gl.initGL( mki3d.html.canvas );
    window.onresize= mki3d.callback.onWindowResize;
    mki3d.callback.onWindowResize();
    mki3d.setProjectionMatrix();
    mki3d.setModelViewMatrix();
    mki3d.action.init(); // mki3d.action requires initialization
    mki3d.html.divUpperMessage.innerHTML += "  (Press 'H' for help.)";
    mki3d.redraw();
    window.onkeydown=mki3d.callback.canvasOnKeyDown;
}


