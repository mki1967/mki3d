/* backup operations (undo) for mki3d */

mki3d.backup={};

/* make string representing clean data for backups */
mki3d.dataModelString= function(){
    mki3d.tmpRebuildSelected(); 
    var selected= mki3d.tmp.selected;
    mki3d.action.cancelSelection(); // remove the field "selected" from all endpoints
    mki3d.cancelShades(); // shades will be rebuilt by redraw
    var outString = JSON.stringify(mki3d.data.model); // make clean data model string
    /* restore selections */
    var i;
    for(i=0; i<selected.length; i++) {
	selected[i].selected=true;
    }
    mki3d.tmpRebuildSelected(); 

    return outString; // returns clean data model string
}


/* check and set initial autosave and backup */
mki3d.backupCheck= function(){
    if (!mki3d.backup.currentModelString) 
	mki3d.backup.currentModelString = mki3d.dataModelString();
    if(!mki3d.backup.oldModelString)
	mki3d.backup.oldModelString=mki3d.backup.currentModelString;

}

mki3d.backup.forbidden=false; // use to forbid backup ...

mki3d.backup= function(){
    if(mki3d.backup.forbidden) return "";
    mki3d.backupCheck();
    /* test for a change */
    var tmp= mki3d.dataModelString();
    if( tmp.localeCompare(mki3d.backup.currentModelString) == 0 ) return ""; // no change in the model
    /* here: the model has changed */
    mki3d.backup.oldModelString=mki3d.backup.currentModelString;
    mki3d.backup.currentModelString=tmp;
    return "<br> MODEL HAS CHANGED";
}

mki3d.restoreCurrentModel= function(){
    mki3d.data.model=JSON.parse(mki3d.backup.currentModelString);
    mki3d.tmpResetDisplayModel();
    mki3d.cancelShades();
    mki3d.action.cancelVisibilityRestrictions();
    mki3d.action.cancelSelection();
    mki3d.tmp.bookmarked=null;
    mki3d.redraw();
}

/* swap backup and autosave and restore from autosave */
mki3d.undo= function(){
    mki3d.backupCheck();

    var tmp= mki3d.backup.currentModelString;
    mki3d.backup.currentModelString=mki3d.backup.oldModelString;
    mki3d.backup.oldModelString=tmp;
    mki3d.restoreCurrentModel();
    mki3d.message("UNDO");
}

