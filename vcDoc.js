

//// utils: is the crappiness of JS boring? yes. 
function strEq(a,b) { // string compare
	var a1 = new String(a).valueOf(); 
	var b1 = new String(b).valueOf(); 
	return (a1===b1);
}

// object type
const VC_N = "VC_N"; 	// null
const VC_A = "VC_A";
const VC_B = "VC_B";

function vcObj() { 
	this.id = 0;
	this.tp = VC_N;
	this.x = 100.0;
	this.y = 100.0;
	this.xi = 100.0; // for dragging; set to this.x, until mouseup
	this.yi = 100.0;
	this.z = 0.0;
	this.target = 0;
	this.tile = 0; 
	this.szx = 1.0;
	this.szy = 1.0;
	this.isSelected = false;
	this.iArgs = [0,0,0, 0,0,0];
	this.fArgs = [0.0,0.0,0.0, 0.0,0.0,0.0];
}
vcObj.prototype.typeColor = function() {
	res = "#888888"; 
	switch (this.tp) { 
		case VC_N: res = "#000000";  break; 
		case VC_A: res = "#ff8888";  break;
		case VC_B: res = "#88ff88";  break;
	}
	return res;
}
vcObj.prototype.copy = function(tmpl) {
	this.id = tmpl.id;
	this.tp = tmpl.tp; 		
	this.x = tmpl.x;
	this.y = tmpl.y;
	this.z = tmpl.z; 	
	this.target = tmpl.target;  
	this.tile = tmpl.tile;  
	this.szx = tmpl.szx; 
	this.szy = tmpl.szy;  
	this.isSelected = tmpl.isSelected;
	for (var i=0;i<6;++i) { 
		this.iArgs[i] = tmpl.iArgs[i];
		this.fArgs[i] = tmpl.fArgs[i];
	}
}
const ndSz = 16.0;
vcObj.prototype.draw = function(theCx) { // except, use the texture
	if (this.isSelected) {
		theCx.fillStyle = "#ffff00";
		theCx.fillRect(this.x-8, this.y-8, ndSz+16, ndSz+16); 
	}
	var col = this.typeColor(); 
	theCx.fillStyle = col;
	theCx.fillRect(this.x, this.y, ndSz, ndSz); // outline maybe? maybe a label? 
}
vcObj.prototype.getAttribsHtml = function() { 
	var res = ""; 
	for (var prop in this) {
		if (Object.prototype.hasOwnProperty.call(this, prop)) {
			res += '<div class="conAttributeItem">';
			res += '<div class="conAttributeNameSide">'+prop+':</div>';
			res += '<div class="conAttributeValueSide">';
			res += '<input class="conAttributeInputBox" id="ioIn' +this.id+prop+ '" value="' + this[prop]; 
	  		res += '" onkeyup="atrKeyIn(' + this.id+','+prop+')" /></div>';
			res += '<div class="clear"></div></div>'; 
		}
	}
	// note: set id="objIn"+this.id+atrName, set onkeyup="atrKeyIn("+this.id+","+atrName+")"
	//		res += '<input class="conAttributeInputBox" id="ioIn' +this.iNode.nodeID+this.iInd+ '" value="' + this.vl; 
	  //		res += '" onkeyup="atrKeyIn(' + this.iNode.nodeID+','+this.iInd+')"></div>';
	return res; 
}
vcObj.prototype.setVal = function(which,toWhat) { // except, use the texture
}
vcObj.prototype.hitTest = function(cx,cy) {
	var res = true; 
	if (cx<this.x) { res = false; }
	if (cy<this.y) { res = false; }
	if (cx>this.x+ndSz) { res = false; }
	if (cy>this.y+ndSz) { res = false; }
	console.log("hit test:"+cx+","+cy+","+this.x+","+this.y+" res:"+res);
	return res;
}
vcObj.prototype.startDrag = function(cx,cy) { this.xi=this.x; this.yi=this.y; }
vcObj.prototype.doDrag = function(dx,dy) { this.x=this.xi+dx; this.y=this.yi+dy; }
vcObj.prototype.selectBox = function(xlo,ylo,xhi,yhi) {
	var res = true; 
	if (xhi<this.x) { res = false; }
	if (yhi<this.y) { res = false; }
	if (xlo>this.x+ndSz) { res = false; }
	if (xlo>this.y+ndSz) { res = false; }
	return res;
}




//////////////////////////////////////////  the thing made of objs
//////////////////////////////////////////  the thing made of objs
//////////////////////////////////////////  the thing made of objs
//////////////////////////////////////////  the thing made of objs
function vcDoc(context) { 
	this.cx = context; 
	this.cxw = this.cx.canvas.width;
    this.cxh = this.cx.canvas.height;
	this.cx.lineWidth =2;
	this.idCounter = 1;
	this.nodes = [];
	this.newClear(); 
}
vcDoc.prototype.newClear = function() { 
	this.nodes = []; 
	var tm = new vcObj(); 
	tm.x = 100.0; tm.y = 100.0;
	tm.isSelected = true;
	tm.id = 0;
	this.nodes.push(tm); 
	return "newClear"; 
}
vcDoc.prototype.redraw = function() { 
    this.cx.fillStyle = "#888888";
    this.cx.fillRect(0,0, this.cxw, this.cxh);
	var len = this.nodes.length; 
	for (var i=0;i<len; ++i) { 
		this.nodes[i].draw(this.cx); 
	}
}
vcDoc.prototype.firstSelected = function() { 
	var len = this.nodes.length; 
	for (var i=0;i<len; ++i) { 
		if (this.nodes[i].isSelected) {
			return i; 
		}
	}
	return -1;
}
vcDoc.prototype.findById = function(id) { 
	var len = this.nodes.length; 
	for (var i=0;i<len; ++i) { 
		if (this.nodes[i].id === id) {
			return i; 
		}
	}
	return -1;
}
vcDoc.prototype.getInputsHTML = function() { 
	var s = this.firstSelected();
	if (s>-1) {
		return this.nodes[s].getAttribsHtml(); 
	}
	return "";
}
vcDoc.prototype.duplicateNode = function() { 
	var len = this.nodes.length; 
	for (var i=0;i<len; ++i) { 
		if (this.nodes[i].isSelected) { 
			var nn = new vcObj(); 
			nn.copy(this.nodes[i]);
			this.nodes[i].isSelected = false;  
			nn.x += 40.0;
			nn.isSelected = true; 
			this.nodes.push(nn); 
		}
	}
}
vcDoc.prototype.deleteNode = function() {	
	var len = this.nodes.length; 
	var j=0; 
	var newNodes = []; 
	for (var i=0;i<len; ++i) { 
		if (!this.nodes[i].isSelected) {
			newNodes[j] = this.nodes[i];
			++j;
		}
	}
	this.nodes = newNodes;
}
vcDoc.prototype.edNew = function() { this.newClear(); return "like new."; }
vcDoc.prototype.edSave = function() { return "no edSave!"; }
vcDoc.prototype.edLoad = function(txt) { return "no edLoad!"; }
// 	this.theText.innerHTML = this.theD.viewIO(nodeId, inpInd); 
vcDoc.prototype.viewIO = function(nodeId, inpInd) { } // ??
//	this.theD.atrKeyIn(nodeID, inpInd, theVal); 
vcDoc.prototype.atrKeyIn = function(nID, inp, val) { 
	var s = this.findById(nID);
	if (s>-1) {  	
		this.nodes[s].setVal(inp, val); 
	}
}
vcDoc.prototype.atrSelect = function(nID, inp) { }

vcDoc.prototype.whichHit = function(cx,cy) {
	var hitObject = -1;
	var len = this.nodes.length;
	for (var i=0; i<len; i=i+1) {
		if (this.nodes[i].hitTest(cx,cy)) {
			hitObject = i;
		}
	}
	return hitObject; 
}

vcDoc.prototype.clearSelection = function() {
	var len = this.nodes.length;
	for (var i=0; i<len; i=i+1) {
		this.nodes[i].isSelected = false; 
	}
}

vcDoc.prototype.selectClick = function(cx,cy) {
	this.clearSelection(); 
	var h = this.whichHit(cx,cy); 
	if (h>-1) { this.nodes[h].isSelected = true; }
}

vcDoc.prototype.addClick = function(cx,cy) {
	var tm = new vcObj(); 
	var s = this.firstSelected();
	if (s>-1) {	tm.copy(this.nodes[s]); } 
	tm.x = cx; tm.y = cy; 
	tm.id = this.idCounter;
	tm.isSelected = false; 
	this.idCounter = this.idCounter +1;
	this.nodes.push(tm); 
}

vcDoc.prototype.deleteClick = function(cx,cy) {
	var h = this.whichHit(cx,cy); 
	if (h>-1) { 
		this.nodes.splice(h, 1); 
	}
}

