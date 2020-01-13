// the "vc" editor is for making vx lists & level maps

// how do I want this thing ti ct? normally!
// click and drag to select and deseelct
// click to draw. drag to draw.
// shift-click-drag to add to selection

function vcEditor(aDoc, aCanvas) {
	this.theDoc = aDoc; 
	this.theCv = aCanvas;
	this.theCx = aCanvas.getContext("2d");
	this.theD = new vcDoc(this.theCx);
	this.mouseStartX =-100.0;
	this.mouseStartY =-100.0;
	this.mouseAction = 0; //0:nil 1:bg 2:drag 3:connect
	this.startHit = -1; 
    this.inputsDiv = aDoc.getElementById("inputsControls");    
    this.theText = aDoc.getElementById("messages");
    this.theText.innerHTML = "Editor loads ok!";
	this.texture = "vcDefTexture.png";
	this.ready = true;
	this.mode = 0; 
	this.snap = 0; 
	
    this.redraw();
}

vcEditor.prototype.redraw = function() {
	this.inputsDiv.innerHTML = this.theD.getInputsHTML(); 
	this.theD.redraw(); 
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

vcEditor.prototype.atrSelect = function(nodeID, inpInd) { 
	this.theText.innerHTML = this.theD.viewIO(nodeId, inpInd); 
}
vcEditor.prototype.atrKeyIn = function(nodeID, inpInd) { 
	var theInpName = "ioIn" + nodeID + inpInd; 
	var theVal = this.theD.getElementById(theInpName).value;
	this.theD.atrKeyIn(nodeID, inpInd, theVal); 
	this.inputsDiv.innerHTML = this.theD.getInputsHTML();
}
vcEditor.prototype.setMode = function(newMode) { 
	this.mode = newMode;
	switch (newMode) { 
		case 0: this.theText.innerHTML = "select"; break;
		case 1: this.theText.innerHTML = "add"; break;
		case 2: this.theText.innerHTML = "delete"; break;
	}
}

vcEditor.prototype.setSnap = function(newMode) { 
	this.snap = newMode * 8.0;
	switch (newMode) { 
		case 0: this.theText.innerHTML = "snap=0"; break;
		case 1: this.theText.innerHTML = "snap=8"; break;
		case 2: this.theText.innerHTML = "snap=16"; break;
	}
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
	}
	this.redraw(); 
	/*
	this.mouseStartX = mx 
	this.mouseStartY = my;
	var hit = this.theD.downClick(mx,my); // doc tracks selections
	switch (this.mode) { 
		case 0: 
			break; 
		case 1: 
			break; 
		case 2: 
			break; 
	}
	if (hit<0) {
		this.mouseAction = 1; // bg
	} else {
		this.mouseAction=2; 
	}
	* */
}

// click on bg-> clone selected to make new
// click on node-> select it
// drag on bg -> selection box
// drag on node -> move it
//   right click? making connections? rotations?

// oo remember target points? those were handy
// spline handles? hmm

// grid alignment? optional? later

vcEditor.prototype.mouseMove = function(evt) {
	/*
	if (this.mouseAction>0) { 
		var mx = evt.clientX; 
		var my = evt.clientY; 
		switch (this.mouseAction) { 
			case 1: 	
				this.mouseAction = 3; // bg drag
				break; // drag bg 
			case 2:
				this.mouseAction = 4; // drag on node
				this.theD.doDrag(mx-this.mouseStartX,my-this.mouseStartY); 
				break; 
		}
		this.theD.redraw(); 
		console.log("move action:"+this.mouseAction);
	}*/
}
vcEditor.prototype.mouseUp = function(evt) {
	/*
	var mx = evt.clientX;// - rect.left; 
	var my = evt.clientY;// - rect.top; 
	switch (this.mouseAction) {
		case 1: // bg click - clone selected
			this.theD.addNew(mx,my); 
			break;
		case 2: // click on obj - select obj - did at mousedown
			break;
		case 3: // bg drag - select box
			this.theD.selectBox(this.mouseStartX, this.mouseStartY, mx, my); 
			break;
		case 4: // drag obj - move it
			this.theD.doDrag(mx-this.mouseStartX,my-this.mouseStartY); 
			break;
	}
	console.log("up action:"+this.mouseAction);
	this.mouseAction = 0; 
	this.redraw(); */
}



