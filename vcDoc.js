

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
	this.isSelected = false;
	this.tp = VC_N;
	this.rem = "note";
	this.x = 100.0;
	this.y = 100.0;
	this.z = 0.0;
	this.szx = 16.0;  // size of thing onscreen 
	this.szy = 16.0;  // set at redraw by tile params
	this.tx = 0;  //-- /// sprites top-left tile
	this.ty = 0;  // top-left tile
	this.tsx = 1.0; // tile spans 
	this.tsy = 1.0;
	this.tmag = 1.0; // scr pix per tx pix
	this.target = 0;
	this.mass = 0.0; //-- /// particles(?)
	this.k = 0.0; 
	this.amp = 0.0;
	this.offset = 0.0; 
	this.freq = 1.0;
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
	this.isSelected = tmpl.isSelected;
	this.tp = tmpl.tp; 		
	this.rem = tmpl.rem;
	this.x = tmpl.x;
	this.y = tmpl.y;
	this.z = tmpl.z; 	
	this.szx = tmpl.szx; 
	this.szy = tmpl.szy;  
	this.tx = tmpl.tx;  
	this.ty = tmpl.ty;  
	this.tsx = tmpl.tsx; 
	this.tsy = tmpl.tsy;  
	this.tmag = tmpl.tmag;
	this.target = tmpl.target;  
	this.mass = tmpl.mass;  
	this.k = tmpl.k;  
	this.amp = tmpl.amp;  
	this.offset = tmpl.offset;  
	this.freq = tmpl.freq;  
}
vcObj.prototype.draw = function(theCx, theTiles) { // except, use the texture
    var is = 32.0; 
    var itx = this.tx * is;
    var ity = this.ty * is;
    this.szx = this.tsx * is * this.tmag; 
    this.szy = this.tsy * is * this.tmag; 
	if (this.isSelected) {
		theCx.fillStyle = "#ffff0088";
		theCx.fillRect(this.x-2, this.y-2, this.szx+4, this.szy+4); 
	}
	theCx.fillStyle = "#ffff00";
    theCx.drawImage(theTiles, itx, ity, this.tsx*is, this.tsy*is, this.x, this.y, this.szx, this.szy); 
}
vcObj.prototype.getAttribsHtml = function() { 
	var res = ""; 
	for (var prop in this) {
		if (Object.prototype.hasOwnProperty.call(this, prop)) {
			if (strEq(prop,'ia') || strEq(prop,'fa')) {
				var ar = this[prop]; 
				var lng = ar.length; 
				for (var i=0; i<lng; ++i) { 
					res += '<div class="conAttributeItem">';
					res += '<div class="conAttributeNameSide">'+prop+'['+i+']:</div>';
					res += '<div class="conAttributeValueSide">';
					res += '<input class="conAttributeInputBox" id="atr' +this.id+prop+i+ '" value="' + ar[i]; 
					var qprop = "'" + prop + "'";
					res += '" onchange="atrKeyIn(' + this.id+','+qprop+i+')" /></div>';
					res += '<div class="clear"></div></div>'; 
				}
			} else {
				res += '<div class="conAttributeItem">';
				res += '<div class="conAttributeNameSide">'+prop+':</div>';
				res += '<div class="conAttributeValueSide">';
				res += '<input class="conAttributeInputBox" id="atr' +this.id+prop+ '" value="' + this[prop]; 
				var qprop = "'" + prop + "'";
				res += '" onchange="atrKeyIn(' + this.id+','+qprop+')" /></div>';
				res += '<div class="clear"></div></div>'; 
			}
		}
	}
	return res; 
}
vcObj.prototype.setAttr = function(which,toWhat) { 
	switch (which) {
		case "tp": this[which] = toWhat; break;
		case "rem": this[which] = toWhat; break;
		case "isSelected": this[which] = toWhat!=falsy; break;
		case "tmag": this[which] = parseFloat(toWhat); break;
		case "mass": this[which] = parseFloat(toWhat); break;
		case "k": this[which] = parseFloat(toWhat); break;
		case "amp": this[which] = parseFloat(toWhat); break;
		case "offset": this[which] = parseFloat(toWhat); break;
		case "freq": this[which] = parseFloat(toWhat); break;
		default: this[which]=parseInt(toWhat);
	}
}
vcObj.prototype.hitTest = function(cx,cy) {
	var res = true; 
	if (cx<this.x) { res = false; }
	if (cy<this.y) { res = false; }
	if (cx>this.x+this.szx) { res = false; }
	if (cy>this.y+this.szy) { res = false; }
	return res;
}
vcObj.prototype.move = function(cx,cy) { this.x=cx; this.y=cy; }
vcObj.prototype.selectBox = function(xlo,ylo,xhi,yhi) {
	var res = true; 
	if (xhi<this.x) { res = false; }
	if (yhi<this.y) { res = false; }
	if (xlo>this.x+this.szx) { res = false; }
	if (xlo>this.y+this.szy) { res = false; }
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
	this.loaded = 0; 
    this.tiles = new Image(); 
    this.tiles.src = "exTiles.png"; 
    that = this;
    this.tiles.onload= function(that) { 
		
	}
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
vcDoc.prototype.redraw = function(mode) { 
    this.cx.fillStyle = "#888888";
    this.cx.fillRect(0,0, this.cxw, this.cxh);
	var len = this.nodes.length; 
	for (var i=0;i<len; ++i) { 
		var ot = this.findById(this.nodes[i].target); 
		if (ot!=-1) { 	
			var x1 = this.nodes[i].x; 
			var x2 = this.nodes[ot].x; 
			var y1 = this.nodes[i].y; 
			var y2 = this.nodes[ot].y; 
			var dx = x2-x1;
			var dy = y2-y1;
			var ax = x1+(0.3*dx); 
			var ay = y1+(0.3*dy); 
			this.cx.strokeStyle = "xffffffff"; 
			this.cx.beginPath();
			this.cx.moveTo(x1,y1); 
			this.cx.lineTo(ax,ay); 
			this.cx.lineTo(ax+1,ay); 
			this.cx.lineTo(ax,ay+1); 
			this.cx.lineTo(ax,ay); 
			this.cx.lineTo(x2,y2); 
			this.cx.stroke();
		}
	}
	for (var i=0;i<len; ++i) { 
		this.nodes[i].draw(this.cx, this.tiles); 
	}
	if (mode ===3) {		
		this.cx.drawImage(this.tiles, 0,0, 512,512, 128,128, 512,512); 
		for (var i=0; i<17; ++i) { 
			this.cx.strokeStyle = "x000000aa"; 
			this.cx.beginPath();
			this.cx.moveTo(128+(i*32), 128); 
			this.cx.lineTo(128+(i*32), 640); 
			this.cx.moveTo(128, 128+(i*32)); 
			this.cx.lineTo(640, 128+(i*32)); 
			this.cx.stroke();
		}
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
vcDoc.prototype.edSave = function(pth) { 
	var blobStuff = "";
	var len=this.nodes.length; 
	for (var i=0; i<len; ++i) { 
		blob += this.nodes[i].textBlob();
	} 
	var a = document.createElement("a");
    a.href = URL.createObjectURL(pth);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function() {
		document.body.removeChild(a);
        window.URL.revokeObjectURL(url);  
    }, 0); 
    return "save "+pth;
}
vcDoc.prototype.loadCallback = function(blob) { 
	var lines = fileBlob.split('\n'); 
	var nob = new vcObj();  
	var isFirst = true; 
	for (var i=0; i<lines.length; ++i) { 
		var wds = lines[i].split('~'); 
		var ct = wds.length; 
		if (ct>1) { 
			if (strEq(wds[0],"id")) { 
				if (isFirst) { isFirst = false; }
				else {
					this.nodes.push(nob); 
					nob = new vcObj(); 
				}
			}
			nob.setAttr(wds[0],wds[1]); 
		}
	}
	this.nodes.push(nob); 
}
vcDoc.prototype.edLoad = function(pth) { 
	this.nodes = [];  
	var xhr=new XMLHttpRequest();
	xhr.open("GET", pth);
	xhr.onload=function(){ 
		this.loadCallback(xhr.responseText);
		redraw();
	}
	xhr.send();
	return "loading "+ pth;
}
// 	this.theText.innerHTML = this.theD.viewIO(nodeId, inpInd); 
vcDoc.prototype.viewIO = function(nodeId, inpInd) { } // ??
//	this.theD.atrKeyIn(nodeID, inpInd, theVal); 
vcDoc.prototype.setAttr = function(nID, atr, val) { 
	var s = this.findById(nID);
	if (s>-1) {  	
		this.nodes[s].setAttr(atr, val); 
	}
}

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

vcDoc.prototype.textureClick = function(cx,cy) {
	var h = this.firstSelected(cx,cy); 
	if (h>-1) { 
		var gx = cx - (cx%32.0); 
		var gy = cy - (cy%32.0); 
		this.nodes[h].tx = (gx-128)/32.0;
		this.nodes[h].ty = (gy-128)/32.0;
	}
}

vcDoc.prototype.move = function(cx,cy) {
	var h = this.firstSelected(cx,cy); 
	if (h>-1) { 
		this.nodes[h].move(cx,cy); 
	}
}

