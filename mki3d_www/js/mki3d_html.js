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


mki3d.saveInfo=function(string) {
    document.querySelector("#saveInfo").innerHTML=string;
}

mki3d.loadInfo=function(string) {
    document.querySelector("#loadInfo").innerHTML=string;
}

mki3d.html.initObjects= function() {
    // register divs
    mki3d.html.html=document.querySelector('#htmlId');
    mki3d.html.divHelp= mki3d.html.registerDiv('#divHelp');
    mki3d.html.divInputs= mki3d.html.registerDiv('#divInputs');
    mki3d.html.divTextLoad= mki3d.html.registerDiv('#divTextLoad');
    mki3d.html.divTextSave= mki3d.html.registerDiv('#divTextSave');
    mki3d.html.divMainMenu= mki3d.html.registerDiv('#divMainMenu');
    mki3d.html.divColorMenu= mki3d.html.registerDiv('#divColorMenu');
    mki3d.html.divCursorMenu= mki3d.html.registerDiv('#divCursorMenu');
    mki3d.html.divFileMenu= mki3d.html.registerDiv('#divFileMenu');
    mki3d.html.divDataMenu= mki3d.html.registerDiv('#divDataMenu');
    mki3d.html.divDataCopyMenu= mki3d.html.registerDiv('#divDataCopyMenu');
    mki3d.html.divClipMenu= mki3d.html.registerDiv('#divClipMenu');
    mki3d.html.divSelectionMenu= mki3d.html.registerDiv('#divSelectionMenu');
    mki3d.html.divViewMenu= mki3d.html.registerDiv('#divViewMenu');
    mki3d.html.divPointsMenu= mki3d.html.registerDiv('#divPointsMenu');
    mki3d.html.divPointsSelectMenu= mki3d.html.registerDiv('#divPointsSelectMenu');
    mki3d.html.divConstructiveMenu= mki3d.html.registerDiv('#divConstructiveMenu');
    mki3d.html.divConstructiveMovingMenu= mki3d.html.registerDiv('#divConstructiveMovingMenu');
    mki3d.html.divConstructiveScalingMenu= mki3d.html.registerDiv('#divConstructiveScalingMenu');
    mki3d.html.divConstructiveCursorMenu= mki3d.html.registerDiv('#divConstructiveCursorMenu');
    mki3d.html.divConstructiveInsertingMenu= mki3d.html.registerDiv('#divConstructiveInsertingMenu');
    mki3d.html.divActionMenu= mki3d.html.registerDiv('#divActionMenu');
    mki3d.html.divSetMenu= mki3d.html.registerDiv('#divSetMenu');
    mki3d.html.divCanvas= mki3d.html.registerDiv('#divCanvas');
    mki3d.html.divdivFileSelector= mki3d.html.registerDiv('#divFileSelector');


    mki3d.html.divUpperMessage= document.querySelector('#divUpperMessage');
    mki3d.html.hideAllDivs();
    mki3d.html.showDiv(mki3d.html.divCanvas);

    mki3d.html.canvas= document.querySelector("#canvasId");

    mki3d.html.spanSetMaxIdx= document.querySelector("#spanSetMaxIdx");
    mki3d.html.spanSetCurrentIdx= document.querySelector("#spanSetCurrentIdx");

    mki3d.html.spanScalingFactor= document.querySelector("#spanScalingFactor");
    mki3d.html.spanPolygonNumberOfVertices= document.querySelector("#spanPolygonNumberOfVertices");

    /* Inputs page */
    mki3d.html.inputCursorX= document.querySelector("#inputCursorX");
    mki3d.html.inputCursorY= document.querySelector("#inputCursorY");
    mki3d.html.inputCursorZ= document.querySelector("#inputCursorZ");
    mki3d.html.inputCursorStep= document.querySelector("#inputCursorStep");

    mki3d.html.inputScalingFactor= document.querySelector("#inputScalingFactor");
    mki3d.html.inputPolygonNumberOfVertices= document.querySelector("#inputPolygonNumberOfVertices");

    /* Text Load Page */
    mki3d.html.textareaInput=document.querySelector("#textareaInput");

    /* Text Save Page */
    mki3d.html.textareaOutput=document.querySelector("#textareaOutput");
    mki3d.html.aDownload=document.querySelector("#aDownload");
 

}
