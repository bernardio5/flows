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
	this.basePath = "scratch/";   
	this.loadFileNameSpot = aDoc.getElementById("ldFile");    
	this.tileFileNameSpot = aDoc.getElementById("txNm");    
	this.theText = aDoc.getElementById("messages");
	this.mode = 0; 
	this.snap = 4; 
	this.tiles = new Image(); 
	this.tiles.src = "scratch/exTiles.png"; 
	var that = this;
	this.tiles.onload= function() {
		that.theD.edTileSet(that.tiles); 
		that.theText.innerHTML = that.theD.edNew(); 
		that.redraw(0);
	}
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

vcEditor.prototype.edLoad = function() {
	var fn = this.loadFileNameSpot.files[0]; 
	if (fn) { 
		var pth = this.basePath + fn.name;
		var hrq = new XMLHttpRequest();
		hrq.open("GET", pth);
		var that = this
		hrq.onload=function(){ 
			that.theD.edLoad(xhr.responseText);
			that.redraw(0);
			this.theText.innerHTML = "loaded "+ pth;
		}
		xhr.send();
	}
	this.theText.innerHTML = "loading "+ pth;
}

vcEditor.prototype.edTileSet = function() { 
	var fn = this.tileFileNameSpot.files[0]; 
	if (fn) { 
		this.tiles = new Image(); 
		this.tiles.src = this.basePath + fn.name; 
		var that = this;
		this.tiles.onload= function() {
			that.theD.edTileSet(that.tiles); 
			that.theText.innerHTML = "tiles:" + fn.name; 
			that.redraw(0);
		}
	}
	this.theText.innerHTML = "loading "+ pth;
}

vcEditor.prototype.edReport = function() {
	var txt = this.theD.edReport(); 
	console.log(txt);
	this.theText.innerHTML = "check console"; 
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
		
		case 3: this.theText.innerHTML = "texture"; break;
		case 2: this.theText.innerHTML = "drag bg"; break;
		case 4: this.theText.innerHTML = "zoom"; break;
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
		case 3: this.theD.textureClick(mx,my);	break;
	}
	this.mouseIsDown = true;
	this.redraw(); 
}
vcEditor.prototype.mouseMove = function(evt) {
	if (this.mouseIsDown) {
		var mx = evt.clientX; 
		var my = evt.clientY;
		var gx = mx; 
		var gy = my;  
		if (this.snap>1.0) { 
			gx = mx - (mx%this.snap); 
			gy = my - (my%this.snap); 
		}  
		switch (this.mode) { 
			case 0: this.theD.move(gx,gy); break;  
			case 1: this.theD.addDrag(gx,gy); break;  
		}
	}
	this.redraw(); 
}
vcEditor.prototype.mouseUp = function(evt) {
	this.mouseIsDown = false;
}


vcEditor.prototype.keyDown = function(evt) {
	console.log(evt); 
	switch (evt.code) { 
		case "KeyA": this.setMode(1); break;// add
		case "KeyS": this.setMode(0); break;// select
		case "KeyD": this.setMode(5); break;// drag! 
		case "KeyT": this.setMode(3); break;
		case "KeyZ": this.setMode(2); break;// drag bg
		case "KeyW": this.setMode(4); break;// drag zoom

		case "KeyX": this.theD.command(0); break; // delete
		case "KeyC": this.theD.command(1); break; // copy
		case "KeyV": this.theD.command(2); break; // paste

		case "Digit1": this.theD.select(1); break; // like, a palette!
		case "Digit2": this.theD.select(2); break;
		case "Digit3": this.theD.select(3); break;
		case "Digit4": this.theD.select(4); break;
		case "Digit5": this.theD.select(5); break;
		case "Digit6": this.theD.select(6); break;
		case "Digit7": this.theD.select(7); break;
		case "Digit8": this.theD.select(8); break;
		case "Digit9": this.theD.select(9); break;
		
	}
	this.redraw(); 
}



