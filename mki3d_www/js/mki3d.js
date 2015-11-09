
/* 
   mki3d -- the main object 
*/
var mki3d = {}; 


/** setting callbacks **/

window.onload= function(){
    /*
    chrome.app.window.current().onClosed.addListener(function() {
	// localStorage.setItem("mki3dDataAutosave", JSON.stringify(mki3d.data));
	chrome.storage.local.set({'mki3dData2': JSON.stringify(mki3d.data)}, function() {
	    consloge.log("mki3d: autosaved.");
	});

    });
*/
    /*
      if(localStorage.mki3dDataAutosave) {
      mki3d.data = JSON.parse(localStorage.mki3dDataAutosave);
      console.log("reloaded autosave");
      }

      chrome.storage.local.set({'mki3dData2': JSON.stringify(mki3d.data)}, function() {
      console.log("mki3d: autosaved.");
      });
    */
/*
    chrome.storage.local.get('mki3dData2', function (obj) {
        console.log("TEST2");
	console.log(obj);
        if(obj.mki3dDataAutosave) {
	    mki3d.data = JSON.parse(obj.mki3dDataAutosave); // dangerous !
            console.log("data set");
	}
    });
*/


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


