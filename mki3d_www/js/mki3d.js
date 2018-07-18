
/* 
   mki3d -- the main object 
*/
var mki3d = {}; 


/** setting callbacks **/

window.onload= function(){
    mki3d.html.initObjects();
    mki3d.gl.initGL( mki3d.html.canvas );
    mki3d.text.initTexShaderProgram();
    window.onresize= mki3d.callback.onWindowResize;
    mki3d.callback.onWindowResize();
    mki3d.setProjectionMatrix();
    mki3d.setModelViewMatrix();
    mki3d.action.init(); // mki3d.action requires initialization
    mki3d.html.divUpperMessage.innerHTML += "  (Use keyboard. Press 'H' for help.)";
    if( chromeMessage ) mki3d.html.divUpperMessage.innerHTML += chromeMessage;
    mki3d.backup();// init backups
    mki3d.redraw();
    if(!isChromeApp) window.onbeforeunload= function(){
	return "Do not forget to save your data!\n";
    }
    
    window.onkeydown=mki3d.callback.canvasOnKeyDown;
    
    mki3d.url.base=document.referrer; // Use referrer as the default base
    let params = (new URL(document.location)).searchParams;
    let base = params.get("base")
    if( base ){ // parameter 'base' overrides old value of 'mki3d.url.base'
	// tested by opening: http://localhost:8000/mki3d_www/mki3d.html?input=ex3-expanded.mki3d&base=http://mki1967.github.io/mki3d/docs/examples/mki3d-data/
	mki3d.url.base= base;
    }
    let input=params.get("input")
    console.log(input)
    if(input) {
	// mki3d.url.load("https://raw.githubusercontent.com/mki1967/mki3dgame/master/assets/stages/stage1.mki3d"); /// tests
	mki3d.url.load(input); /// tests
    }
}


