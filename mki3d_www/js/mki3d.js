
/* 
   mki3d -- the main object 
*/
var mki3d = {}; 






/** setting callbacks **/

window.onload= function(){
/*
    if(localStorage.mki3dDataAutosave) {
	mki3d.data = JSON.parse(localStorage.mki3dDataAutosave);
        console.log("reloaded autosave");
    }
*/
	chrome.storage.local.set({'mki3dData': JSON.stringify(mki3d.data)}, function() {
	    console.log("mki3d: autosaved.");
	});

    chrome.storage.local.get('mki3dData', function (obj) {
        console.log("TEST2");
	console.log(obj);
    });

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


