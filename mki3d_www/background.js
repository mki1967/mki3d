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


});


