/**
 * Listens for the app launching, then creates the window.
 *
 * @see http://developer.chrome.com/apps/app.runtime.html
 * @see http://developer.chrome.com/apps/app.window.html
 */
chrome.app.runtime.onLaunched.addListener(function(launchData) {

//    console.log(chrome.storage.local);

    chrome.app.window.create(
	'index.html',
	{
	    id: 'mki3dMainWindow',
	    bounds: {width: 1280, height: 800}
	}
    );

//    console.log("TEST");

/*
    if(localStorage.mki3dDataAutosave) {
	mki3d.data = JSON.parse(localStorage.mki3dDataAutosave);
        console.log("reloaded autosave");
    }
*/
/*
    chrome.storage.local.get({'mki3dDataAutosave', function (obj) {
	console.log(obj);
    });
*/
});


chrome.runtime.onSuspend.addListener(function() {
	// localStorage.setItem("mki3dDataAutosave", JSON.stringify(mki3d.data));
	chrome.storage.local.set({'mki3dDataAutosave': JSON.stringify(mki3d.data)}, function() {
	    consloge.log("mki3d: autosaved.");
	});

});
