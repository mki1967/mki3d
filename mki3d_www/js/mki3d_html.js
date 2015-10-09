/*
  mki3d.html -- the references to the relevant objects form html page DOM
*/

mki3d.html = {};
mki3d.html.divsArray= []; /* array of <div> objects */

mki3d.html.registerDiv = function( selectorString ) {
    divObject = document.querySelector(selectorString);
    mki3d.html.divsArray.push(divObject);
    return divObject;
}

mki3d.html.hideAllDivs = function() {
    var i=0;
    for(i=0; i<mki3d.html.divsArray.length; i++) 
	mki3d.html.divsArray[i].style.display="none";
}

mki3d.html.showDiv = function(divObject) {
    divObject.style.display="block";
}



mki3d.html.initObjects= function() {
    mki3d.html.divHelp= mki3d.html.registerDiv('#divHelp');
    mki3d.html.divMainMenu= mki3d.html.registerDiv('#divMainMenu');
    mki3d.html.divColorMenu= mki3d.html.registerDiv('#divColorMenu');
    mki3d.html.divCursorMenu= mki3d.html.registerDiv('#divCursorMenu');
    mki3d.html.divFileMenu= mki3d.html.registerDiv('#divFileMenu');
    mki3d.html.divDataMenu= mki3d.html.registerDiv('#divDataMenu');
    mki3d.html.divClipMenu= mki3d.html.registerDiv('#divClipMenu');
    mki3d.html.divSelectionMenu= mki3d.html.registerDiv('#divSelectionMenu');
    mki3d.html.divViewMenu= mki3d.html.registerDiv('#divViewMenu');
    mki3d.html.divCanvas= mki3d.html.registerDiv('#divCanvas');

    mki3d.html.divUpperMessage= document.querySelector('#divUpperMessage');
    mki3d.html.hideAllDivs();
    mki3d.html.showDiv(mki3d.html.divCanvas);

    mki3d.html.canvas= document.querySelector("#canvasId");
}
