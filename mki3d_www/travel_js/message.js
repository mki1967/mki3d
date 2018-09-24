
var MESSAGE_DELAY=3000;
var hideTimeout=null;

var showMessage = function( textHTML ){
    var message =document.querySelector('#messageDiv');
    if( message ) {
	// ...
	clearTimeout(hideTimeout);
	message.innerHTML= textHTML;
	message.style.display="block"; // show
    }
}

var hideMessage = function(){
    var message =document.querySelector('#messageDiv');
    if( message ) {
	message.style.display="none"; // hide
    }
}

var showAndHideMessage =  function( textHTML, milliseconds ){
    var message =document.querySelector('#messageDiv');
    if( message ) {
	showMessage(textHTML);
	hideTimeout=setTimeout(hideMessage, milliseconds); // hide afer milliseconds
    }
}


var helpMessage = `
<div  style="font-size:20px;">
    <h2>HELP SCREEN:</h2>
    <h3>Key bindings:</h3>
    <dl>
    <dt>'H':</dt>
    <dd>Display this help message</dd>
    <dt>Enter,'F' / Backspace, 'B', 'V':</dt>
    <dd>Move forward / backward.</dd>
    <dt>Arrow keys:</dt>
    <dd>Rotate up/down/left/right.</dd>
    <dt>'I'/'J'/'K'/'L':</dt>
    <dd>Move up/down/left/right.</dd>
    <dt>'T'</dt>
    <dd>Toggle mouse-click inertia on/off.</dd>
    <dt>Escape:</dt>
    <dd>Hide the message box</dd>
    </dl>
 </div>  
 `

var messageCanceledByAction=true;

var globalGotoURL=""; // where to go after pressing 'GO TO' button
var gotoMessageButton = `
<div align="center">
    <button onclick="window.open( globalGotoURL, '_self')"  style="font-size:50px;">GO TO</button>
</div>
`
