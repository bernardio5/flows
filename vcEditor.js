// the "vc" editor is for making vx lists & level maps

// to do: 
// sprites
//   a tile file attr at doc-level that loads & is saved.
// fix attr change for arrays
// targeting: draw links, mode to backwards-link
// save and load and clear, natch. 
// drag to select many, setting attrs on many
// drag to draw many, but while watching gridsnap
// drag to connect? another edit mode? 
// draw to delete many
// hotkeys for modes
// something faster for tile selection

function vcEditor(aDoc, aCanvas) {
	this.theDoc = aDoc; 
	this.theCv = aCanvas;
	this.theCx = aCanvas.getContext("2d");
	this.theD = new vcDoc(this.theCx);
	this.mouseIsDown = false;
    this.inputsDiv = aDoc.getElementById("inputsControls");    
    this.theText = aDoc.getElementById("messages");
    this.theText.innerHTML = "loaded ok";
	this.mode = 0; 
	this.snap = 0; 
    this.redraw();
}

vcEditor.prototype.redraw = function() {
	this.inputsDiv.innerHTML = this.theD.getInputsHTML(); 
	this.theD.redraw(this.mode); 
}

vcEditor.prototype.duplicateNode = function() { 
	this.theD.duplicateNode(); 
} 
vcEditor.prototype.deleteNode = function() { 
	this.theD.deleteNode(); 
}

// main editor button set callbacks
vcEditor.prototype.edNew = function() { 
	this.theText.innerHTML = this.theD.edNew(); 
}
vcEditor.prototype.edSave = function() {
	this.theText.innerHTML = this.theD.edSave(); 
}
vcEditor.prototype.edLoad = function() {
	var txt = "";
	this.theText.innerHTML = this.theD.edLoad(txt); 
}

vcEditor.prototype.atrKeyIn = function(nodeID, attr) { 
	var theInpName = "atr" + nodeID + attr; // make attr's HTML's input tag's id
	var theEl = this.theDoc.getElementById(theInpName);
	var theVal = theEl.value; // get what's in it-- it changed already
	this.theD.setAttr(nodeID, attr, theVal); // change the attr in the obj
	this.inputsDiv.innerHTML = this.theD.getInputsHTML(); // reload the HTML for all attrs
	this.redraw();
}

vcEditor.prototype.setMode = function(newMode) { 
	this.mode = newMode;
	switch (newMode) { 
		case 0: this.theText.innerHTML = "select"; break;
		case 1: this.theText.innerHTML = "add"; break;
		case 2: this.theText.innerHTML = "delete"; break;
		case 3: this.theText.innerHTML = "texture"; break;
	}
}

vcEditor.prototype.setSnap = function(newMode) { 
	this.snap = newMode;
	this.theText.innerHTML = "snap="+this.snap; 
}

vcEditor.prototype.mouseDown = function(evt) {
	var mx = evt.clientX; 
	var my = evt.clientY;
	var gx = mx; 
	var gy = my;  
	if (this.snap>1.0) { 
		gx = mx - (mx%this.snap); 
		gy = my - (my%this.snap); 
	}  
	switch (this.mode) { 
		case 0: this.theD.selectClick(mx,my); break;
		case 1: this.theD.addClick(gx,gy);	break;
		case 2: this.theD.deleteClick(mx,my);	break;
		case 3: this.theD.textureClick(mx,my);	break;
	}
	this.mouseIsDown = true;
	this.redraw(); 
}
vcEditor.prototype.mouseMove = function(evt) {
	if (this.mouseIsDown && this.mode===0) {
		var mx = evt.clientX; 
		var my = evt.clientY;
		var gx = mx; 
		var gy = my;  
		if (this.snap>1.0) { 
			gx = mx - (mx%this.snap); 
			gy = my - (my%this.snap); 
		}  
		this.theD.move(gx,gy); 
	}
	this.redraw(); 
}
vcEditor.prototype.mouseUp = function(evt) {
	this.mouseIsDown = false;
}


vcEditor.prototype.keyDown = function(evt) {
	console.log(evt); 
	switch (evt.code) { 
		case "KeyA": this.setMode(1); break;
		case "KeyS": this.setMode(0); break;
		case "KeyD": this.setMode(2); break;
		case "KeyT": this.setMode(3); break;
	}
}



