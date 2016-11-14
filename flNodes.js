
///////////////////////////////////////
// This is the more-or-less well-commented version of the Flows Library. 
// (c)2016 Neal McDonald, released under MIT License
// Use it however you like; have a nice day.



/*
flIO's are where nodes store their data. they can be either inputs or outputs. 
they hold connection data

flNodes perform calculations. 

flNodeSets hold an array of nodes and carry out evaluations.

to evaluate a node network:
   mark all nodes as not done
   mark all flIOs as not ready
   until all are done
        for each node, 
        	for each input 
        	      if the input is constant, mark it as ready
        	      if the input comes from an output from a done node, it's ready
        	if all inputs are ready, update the node and mark it as ready. 
	to do this, something will have to be tracking all the nodes. 


to draw a node network
	for each node
		draw all of its input connections
		draw the node	

to create a node
	set the node, set all connections to "not"

to move a node, 
	change the node's position
	for all of the connections
		give the updated position with "moveOwnerNode"
	for each node, i
		if i has an input connected to the moved node, call "moveConnectedNode"
		    for that input

to link two nodes
	select the first side (i or o) 
	select the second side
	link is made by telling node A to connect a to b of B
	and vice-versa


*/
/////////////////////////////////////////////////////////////
// flIO: inputs, constants, and outputs
// inputs connect to outputs. outputs are oblivious to connections
// inputs SPY on outputs! 

// constants: flIO data types; this.tp is one of these
const FL_N = 0;  // null
const FL_R = 1;  // number
const FL_P = 2;  // parameter: number, modded to 0-1 range
const FL_S = 3;  // str
const FL_V = 4;  // vector4
const FL_L = 5;  // list


// flIO describes an input/output connection ?
function flIO(tp, varName, symbol, vlue, ioro, nodeID, indInNode, nx, ny) { 
	this.tp = tp; 		// type (FL_P, etc)
	this.vn = varName; 	// label for attr editor
	this.sm = symbol; 	// symbol: 2 letters shown on node
	this.vl = vlue; 	// value held by io
	this.isIn = ioro;   // whether it's an input

	this.nID = nodeID;  // this's index into owner node's array of inputs or outputs.
	this.nInd = indInNode; 
	this.nx = nx; 
	this.ny = ny; 

	this.con = false;   // whether connected; 
	// if con==t, these will be set
	this.cID = -1; 	// ID of node at other end of the connection
	this.cInd = -1; 
	this.cnx = -100.0;
	this.cny = -100.0;

	this.isReady = false; 
}


// connect an input IO to an output IO of another node. 
// outputs can never know whether they're connected, 
// unless they track all their connections; why should they? 
flIO.prototype.connect = function(oID, oInd, ox, oy) {
	this.cID = oID; 
	this.cInd = oInd; 
	this.cnx = ox; 
	this.cny = oy;
	this.con = true; 
}

// disconnect IO from an IO of another node. 
flIO.prototype.disconnect = function() {
	this.cID = -1; 
	this.cInd = -1; 
	this.cnx = -100.0; 
	this.cny = -100.0; 
	this.con = false; 
}


// call for all a node's flIO's when you move a node
// also, for all the nodes that that have inputs pointing to that node--
// all of the others. sorry! 
flIO.prototype.moveUpdate = function(nID, nx,ny) { 
	if (this.nID===nID) { 
		this.nx = nx;
		this.ny = ny; 
	} 
	if ((this.isIn) && (this.con) && (this.cID==nID)) { 
		this.cnx = nx; 
		this.cny = ny; 
	}
}

flIO.prototype.moveUpdate = function(nID, nx,ny) { 
	if (this.nID===nID) { 
		this.nx = nx;
		this.ny = ny; 
	} 
	if ((this.isIn) && (this.con) && (this.cID==nID)) { 
		this.cnx = nx; 
		this.cny = ny; 
	}
}


// node size and spacing
const FLIO_SZX = 22.0; // body size x
const FLIO_SZY = 12.0; // body size y
const FLIO_VSP = 38.0; // y spacing between rows of Is and Os



// returns [x,y], given node position and place in i or o arrays
// if "selfOther"=t, use owner node's position
flIO.prototype.center = function(selfOther) {
	var cx, cy;
	if (selfOther) { 
		cx = this.nx + (this.nInd*(FLIO_SZX+2)); 
		cy = this.ny;
		if (this.isIn) { 
			cx -= FLIO_SZX; // 0th input is "label", not shown 
		} else {
			cy += FLIO_VSP; // show outputs below inputs
		}
	} else {  // center of another node's output flIO
		cx = this.cnx + (this.cInd*FLIO_SZX);; 
		cy = this.cny + FLIO_VSP; // show outputs below inputs
	}
	return [cx, cy];
}


// given nodes position & a mouse click, did it hit? 
// called only after
flIO.prototype.isInside = function(mx, my) {
	var p = this.center(true); 
	var res = true; 
	if (mx<p[0]) { res = false; }
	if (my<p[1]) { res = false; }
	if (mx>p[0]+FLIO_SZX) { res = false; }
	if (my>p[1]+FLIO_SZY) { res = false; }
	// console.log("isInside: m:"+mx+","+my+" p:"+p+" res:"+res);
	return res;
}



const FLIO_CNX = 9.0; // displacement of connector ends  
const FLIO_CNY = 5.0; 

// ASSUMING that cnxy is getting updated properly...
// nope
flIO.prototype.drawLink = function(theCx) { 
	var c1x, c2x, c2y, c1y, p1, p2;

	if (!(this.isIn)) { return; } // draw only inputs
	if (!(this.con)) { return; } // no connection to draw

	p1 = this.center(true);
	c1x = p1[0] + FLIO_CNX;
	c1y = p1[1];
	theCx.fillRect(c1x-3, c1y-4, 7,4);
	
	p2 = this.center(false);
	c2x = p2[0] + FLIO_CNX;
	c2y = p2[1] + FLIO_SZY;
	theCx.fillRect(c2x-3, c2y, 7,3);

	// connection lines
	theCx.beginPath();
	theCx.moveTo(c1x, c1y); 
	theCx.lineTo(c2x, c2y); 
	theCx.stroke();
}


const FLIO_TDX = 3.0; // text displacement  
const FLIO_TDY = 10.0; 

flIO.prototype.drawBody = function(theCx) { 
	var cx, cy, pt;
	pt = this.center(true); 
	cx = pt[0]; 
	cy = pt[1];

	switch (this.tp) { 
		case FL_R: theCx.fillStyle = "88ff88";  break; // number
		case FL_S: theCx.fillStyle = "ff8888";  break; // str
		case FL_V: theCx.fillStyle = "8888ff";  break; // vector4
		case FL_L: theCx.fillStyle = "ff88ff";  break; // list
	}
	theCx.fillRect(cx, cy, FLIO_SZX, FLIO_SZY);
	// label
	theCx.font = "10px Arial";
	theCx.fillStyle = "#000000";
	theCx.fillText(this.sm, cx+FLIO_TDX, cy+FLIO_TDY);
	theCx.stroke();
}



// attribute is an array: [name, value as string, nodeID, inputID ]
flIO.prototype.getHTML = function() { 
	var res = ""; 
	if (this.isIn) { 
		res = '<div class="conAttributeItem" onclick="atrSelect('+this.nID+','+this.nInd+'">';
		res +='<div class="conAttributeNameSide">'+this.vn+':</div>';

  		// if it's connected, value not editable, and there is a disconnect button
  		if (this.con) { 
			res += '<div class="conAttributeValueSide">'+this.vl;
  			res += '--<button onclick="theE.disconnect(' + this.nID + ',' + this.nInd + ');" ';
  			res += 'class="conAttributeDisconnectButton">X</button>';		
  		} else {
			res += '<div class="conAttributeValueSide">';
			res += '<input class="conAttributeInputBox" value="' + this.vl; 
	  		res += '" onkeyup="atrKeyIn(' + this.nID+','+this.nInd+')">';
		}

/*		res += ':</div><div class="conAttributeValueSide"><input class="conAttributeInputBox" value="' + this.vl; 
  		res += '" onkeyup="atrKeyIn(' + this.nID+','+this.nInd+')">';
  		if (this.con) { 
  			res += '<button onclick="theE.disconnect(' + this.nID + ',' + this.nInd;
  			res += ');" class="conAttributeDisconnectButton">X</button>';
		}
*/		res += '</div></div>'; 
	} else {
		res = '<div class="conAttributeItem"><div class="conAttributeNameSide">' + this.vn;
		res += ':</div><div class="conAttributeValueSide"><input class="conAttributeOutputBox" value="' + this.vl; 
	  	res += '"></div><div class="clear"></div></div>';
	}
	return res; 
}


/////////////////////////////////////////////////// nodes own io and do stuff
/////////////////////////////////////////////////// nodes own io and do stuff
/////////////////////////////////////////////////// nodes own io and do stuff
/////////////////////////////////////////////////// nodes own io and do stuff
/////////////////////////////////////////////////// nodes own io and do stuff
/////////////////////////////////////////////////// nodes own io and do stuff

// node types are defined by at least two functions: "initAs" and an "evaluate" 
// nodes that need more interface (seqencer, curve) also define a redraw and
// set a flag. TBD! 

// nodes are organized into sets, for the sake of UX menus not containing many dozens of node types.  
// given a node "setNumber", there are n node types. 

// type numbers! organize types into sets by adding 30
const FLND_TADDER = 0;   
const FLND_TTIME = 1;  
const FLND_TEXPR = 2;  
const FLND_TVEC = 3;  

function flNode(type, x, y, nodeIndex) { 
	this.tp = type;
	this.posX = x;
	this.posY = y;
	this.isSelected = false; 
	this.nodeID = nodeIndex;

	this.inputs = []; 
	this.outputs = []; 
	this.inputs[0] = new flIO(FL_S, "label", "--", "nd"+nodeIndex, true, nodeIndex, 0, x, y);

	switch (type) { 
		case FLND_TADDER: 	this.initAsAdder(); 	break;
		case FLND_TTIME: 	this.initAsTime(); 		break;
		case FLND_TEXPR: 	this.initAsExpression(); break;
		case FLND_TVEC: 	this.initAsVector(); 	break;
	}
	
	this.wdt = ((this.inputs.length) * FLIO_SZX)-13.0;
	if (this.wdt<43.0) { this.wdt = 43.0; }

}


flNode.prototype.getTypeName = function(typeNum) {
	var res = ''; 
	switch (typeNum) { 
		case FLND_TADDER: res = "adder";  break; 
		case FLND_TTIME: res = "time";  break; 
		case FLND_TEXPR: res = "expression";  break; 
		case FLND_TVEC: res = "make vec4";  break; 
	}
	return res; 
}

	

flNode.prototype.initAsAdder = function() {
	this.inputs[1] = new flIO(FL_R, "left-hand side", "Lh", 0, true, this.nodeID, 1, this.posX, this.posY);
	this.inputs[2] = new flIO(FL_R, "right-hand side", "Rh", 0, true, this.nodeID, 2, this.posX, this.posY);
	this.outputs[0] = new flIO(FL_R, "sum", "S", 0, false, this.nodeID, 0, this.posX, this.posY);
}


flNode.prototype.initAsTime = function() {
	this.outputs[0] = new flIO(FL_R, "time", "T", 0, false, this.nodeID, 0, this.posX, this.posY);
}


flNode.prototype.initAsExpression = function() {
	this.inputs[1] = new flIO(FL_R, "A", "A", 0, true, this.nodeID, 1, this.posX, this.posY);
	this.inputs[2] = new flIO(FL_R, "B", "B", 0, true, this.nodeID, 2, this.posX, this.posY);
	this.inputs[3] = new flIO(FL_R, "C", "C", 0, true, this.nodeID, 3, this.posX, this.posY);
	this.inputs[4] = new flIO(FL_S, "expr", "Ex", "A+B+C", true, this.nodeID, 4, this.posX, this.posY);
	this.outputs[0] = new flIO(FL_R, "result", "R", 0, false, this.nodeID, 0, this.posX, this.posY);
}

flNode.prototype.initAsVector = function() {
	this.inputs[1] = new flIO(FL_R, "X", "X", 0, true, this.nodeID, 1, this.posX, this.posY);
	this.inputs[2] = new flIO(FL_R, "Y", "Y", 0, true, this.nodeID, 2, this.posX, this.posY);
	this.inputs[3] = new flIO(FL_R, "Z", "Z", 0, true, this.nodeID, 3, this.posX, this.posY);
	this.inputs[4] = new flIO(FL_S, "W", "W", 0, true, this.nodeID, 4, this.posX, this.posY);
	this.outputs[0] = new flIO(FL_V, "result", "R", 0, false, this.nodeID, 0, this.posX, this.posY);
}



const FLND_SZY = 50.0; // node body ht

// draw the node's input connections
flNode.prototype.drawInputCons = function(theCx) { 
	var i, len; 
	theCx.strokeStyle = "#000"; 
	theCx.fillStyle = "#000"; 
	
	// connection lines-- draw from inputs to outputs
	len = this.inputs.length;  
	for (i=0; i<len; i=i+1) { 
		this.inputs[i].drawLink(theCx); 
	}
}


// draw a node's body
flNode.prototype.drawBody = function(theCx) {
	var x, y, szx, i, len; 
	x = this.posX; 
	y = this.posY; 

	// body
	if (this.isSelected) { theCx.fillStyle = "#fff"; }
	else { theCx.fillStyle = "#ccc"; }
	theCx.fillRect(x, y, this.wdt, FLND_SZY);
	
	// label
	theCx.font = "14px Arial";
	theCx.fillStyle = "#000000";
	theCx.fillText(this.inputs[0].vl, x+2, y+25);
	theCx.font = "10px Arial";
	theCx.fillStyle = "#000000";
	theCx.fillText(this.getTypeName(this.tp), x+2, y+35);

	// drawing flIOs
	len = this.inputs.length;  
	for (i=1; i<len; i=i+1) { 
		this.inputs[i].drawBody(theCx); 
	}
	len = this.outputs.length;  
	for (i=0; i<len; i=i+1) { 
		this.outputs[i].drawBody(theCx); 
	}
}


// erase the node 
flNode.prototype.undraw = function(theCx) {
	theCx.fillStyle = "#888888";
	theCx.fillRect(this.posX, this.posY, this.wdt, FLND_SZY);
}


flNode.prototype.moveTo = function(thecx, newx, newy) {
	this.posX = newx; 
	this.posY = newy; 
	var i, len; 
	len = this.inputs.length; 
	for (i=1; i<len; i=i+1) { 
		this.inputs[i].moveUpdate(this.nodeID, newx, newy);
	}
	len = this.outputs.length; 
	for (i=0; i<len; i=i+1) { 
		this.outputs[i].moveUpdate(this.nodeID, newx, newy);
	}
}


flNode.prototype.inputMoveTo = function(nd, nx, ny) { 
	var i, len;
	len = this.inputs.length; 
	for (i=0; i<len; i=i+1) { 
		this.inputs[i].moveUpdate(nd, nx, ny);
	}
}


// connect input A to output B of node #B
flNode.prototype.connect = function(inA, nodeB, outB) {
	var res = "";

	t1 = this.inputs[inA].tp; 
	t2 = nodeB.outputs[outB].tp; 
	if (t1===t2) { 
		//	flIO.prototype.connect = function(oID, oInd, ox, oy) {
		this.inputs[inA].connect(nodeB.nodeID, outB, nodeB.posX, nodeB.posY); 
		res = "connection added";
	} else { 
		res = "connection failed: type mismatch";
	}
	return res; 
}


// disconnect an input from whatever connection it has. 
flNode.prototype.disconnect = function(inInd) {
	this.inputs[inInd].disconnect(); 
}



// given mose position, inside it or inputs? 

// the idea of the hitTest that returns one integer: 
// there will never be more than 40 inputs and 40 outputs on a node
//   -- really, just for UI reasons. 
// so the "hit number" is computed by taking the node's index, ni, the input index, ii, 
// and the output index, oi. 
// result = ((ni+1)*10000)+((oi+1)*100)+(ii+1)
// if the result is -1, nothing was hit.

flNode.prototype.hitTest = function(mx, my) {
	var res, cx, cy, butRes, i, len, szx; 
	cx = this.posX; 
	cy = this.posY; 
	
	res = (this.nodeID+1)*10000; // assume a body hit, then check bboxe
	if (mx<cx) { res = -1; }
	if (my<cy) { res = -1; }
	if (mx>(cx+this.wdt)) { res = -1; }
	if (my>(cy+FLND_SZY)) { res = -1; }

	// if missed body, missed everything; stop now
	if (res>0) { 
		len = this.inputs.length;  
		for (i=1; i<len; i=i+1) { //i=1! no labels box
			butRes = this.inputs[i].isInside(mx, my);
			//console.log("button i"+i+" res:"+butRes);
			if (butRes>0) {
				res = ((this.nodeID+1) *10000) + (i+1);
			} 
		}
		len = this.outputs.length;  
		for (i=0; i<len; i=i+1) { 
			butRes = this.outputs[i].isInside(mx, my);
			//console.log("button o"+i+" res:"+butRes);
			if (butRes>0) {
				res = ((this.nodeID+1)*10000) + ((i+1)*100); 
			} 
		}
	}
	// console.log("node "+this.nodeID+" hit res:"+res);
	return res; 
} 



flNode.prototype.setSelected = function(izzit) {
	this.isSelected = izzit; 
	//console.log(izzit);
}



flNode.prototype.getInputsHTML = function() {
	var len, str;
	str = '';
	len = this.inputs.length;  
	for (i=0; i<len; i=i+1) { 
		str += this.inputs[i].getHTML(); 
	}
	return str; 
}



flNode.prototype.getOutputsHTML = function() {
	var len, str;
	str = '';
	len = this.outputs.length;  
	for (i=0; i<len; i=i+1) { 
		str += this.outputs[i].getHTML(); 
	}
	return str; 
}



flNode.prototype.getTypeButton = function(setNumber, index) {
	var typeNum = (setNumber*30)+index;
	var typeName = this.getTypeName(typeNum);
	var res = '';
	if (typeName.length>1) { 
		res = '<div class="scrNodeButtonHolder">' ;
		res += '<button onclick="theE.makeNode('+typeNum+');" class="scrNodeButton">';
		res += this.getTypeName(typeNum) + '</button></div>';
	}
	return res; 
}


flNode.prototype.getMakerButHTML = function(setNumber) { 
	var i, n, res;
	res = ""; 
	len = 29;
	for (i=0; i<len; ++i) { 
		res += this.getTypeButton(setNumber, i);
	}
    return res; 
}



//////////////////////////////////////////  separating editor UI from graph
//////////////////////////////////////////  separating editor UI from graph
//////////////////////////////////////////  separating editor UI from graph
//////////////////////////////////////////  separating editor UI from graph
//////////////////////////////////////////  separating editor UI from graph
//////////////////////////////////////////  separating editor UI from graph

// an flGraph owns a node set and provides a nice abstract blah

function flGraph(context) { 
	this.cx = context; 
	this.nodes = []; 
	this.selectedNode = -1; 
	var i, x, y; 
	for (i=0; i<3; i=i+1) { 
		x = 150.0 + 80*i; 
		y = 150.0 + 100*i; 
		this.nodes[i] = new flNode(i, x, y, i); // type, x, y, index
	}
	this.nextX = 400.0; // where the next node will be made
	this.nextY = 150.0;
	this.t = 0.0; 
}


flGraph.prototype.setMakeSite = function(x, y) { 
	this.nextX = x; 
	this.nextY = y; 
	if (this.nextX>700.0) { this.nextX=50.0; }
	if (this.nextY>700.0) { this.nextY=100.0; }
}


flGraph.prototype.redraw = function() { 
	var cxw, cxh, i, len, conCt;
	var c1x, c1y, c2x, c2y, p1, p2, nodeB, outB;  

	// background/erase
    cxw = this.cx.canvas.width;
    cxh = this.cx.canvas.height;
    this.cx.fillStyle = "#888888";
    this.cx.fillRect(0,0, cxw, cxh);

    // connections
	len = this.nodes.length; 
	for (i=0;i<len; ++i) { 
		this.nodes[i].drawInputCons(this.cx); 
	}
	for (i=0;i<len; ++i) { 
		this.nodes[i].drawBody(this.cx); 
	}
}


flGraph.prototype.makeNode = function(type) {
	var ind; 

	ind = this.nodes.length; 
	this.nodes[ind] = new flNode(type, this.nextX, this.nextY,ind);

	// update position to make next node
	this.setMakeSite(this.nextX +5.0, this.nextY+60.0);

	// autolink: to test.	
	if (this.nodes[ind].inputs.length>1) {
		// link this.in.1 to previous.out.0 
		this.nodes[ind].connect(1, this.nodes[ind-1], 0);
	}
	this.selectedNode = ind; 
	this.redraw(); 
}

flGraph.prototype.deleteNode = function() {
}
flGraph.prototype.duplicateNode = function() {
}



flGraph.prototype.spillAll = function() { return "spill all"; }
flGraph.prototype.spillOne = function() { return "spillOne"; }
flGraph.prototype.spillSelected = function() {	return "spillSelected"; }
flGraph.prototype.useDefaults = function() { return "useDefaults";}
flGraph.prototype.slurpAll = function() { return "slurpAll"; }
flGraph.prototype.slurpSelected = function() { return "slurpSelected"; }
flGraph.prototype.setDefaults = function() { return "setDefaults"; }


flGraph.prototype.getInput = function(nodeID, ioID) {
	var res = "error"; 
	res = this.nodes[nodeID].inputs[ioID].vl;
	return res; 
}


flGraph.prototype.getOutput = function(nodeID, ioID) {
	var res = "error"; 
	res = this.nodes[nodeID].outputs[ioID].vl;
	return res; 
}


///////// using hit tests and their results
// result = (ni*10000)+(oi*100)+ii
flGraph.prototype.hitTest = function(mx, my) { 
	var i, len, res, hit;
	res = -1; 
	len = this.nodes.length ;
	for (i=0; i<len; i=i+1) {
		hit = this.nodes[i].hitTest(mx,my);
		if (hit>-1) {
			res = hit;
		}
	}
	//console.log("hit test res:"+res);
	return res;
}


flGraph.prototype.nodeOfHit = function(h) { 
	var res, sub; 
	res = -1; 
	if (h>-1) { 
		sub = h % 10000; 
		res = (h-sub)/10000; // discard data <10,000
	}
	return res-1; 
}


flGraph.prototype.inputOfHit = function(h) { 
	var res, sub; 
	res = -1; 
	if (h>-1) { 
		res = h % 100;  // discard data>99
	}
	return res-1; 
}


flGraph.prototype.outputOfHit = function(h) { 
	var res, sub; 
	res = -1; 
	if (h>-1) { 
		sub = h % 10000; // discard data>10k
		isub = h % 100; 
		osub = (sub-isub)/100;// discard data<100
		res = osub; 
	}
	return res-1; 
}


flGraph.prototype.select = function(h) {
	var i, len, n;
	n = this.nodeOfHit(h);
	len = this.nodes.length;
	for (i=0; i<len; i=i+1) {
		this.nodes[i].isSelected = false; 
	}
	//flNode.prototype.connect = function(inA, nodeB, outB) {
	this.nodes[n].isSelected = true; 
	this.selectedNode = n; 
	this.setMakeSite(this.nodes[n].posX +5, this.nodes[n].posY + 70); 
	
	this.redraw(); 
}


flGraph.prototype.getInputsHTML = function() { 
	return this.nodes[this.selectedNode].getInputsHTML(); 
}


flGraph.prototype.getOutputsHTML = function() { 
	return this.nodes[this.selectedNode].getOutputsHTML(); 
}

flGraph.prototype.getMakerButHTML = function(setNumber) { 
	var res = this.nodes[0].getMakerButHTML(setNumber);
	return res;  
}



// need inputNode, input ind, outut node, out ind
flGraph.prototype.connect = function(iID, iInd, oID, oInd) {
	return this.nodes[iID].connect(iInd, this.nodes[oID], oInd); 
}


flGraph.prototype.disconnect = function(nodeID, inputID) {
	this.nodes[nodeID].inputs[inputID].disconnect(); 
}


flGraph.prototype.atrKeyIn = function(nID, inp, val) { 
	this.nodes[nID].inputs[inp].vl = val; 
}

flGraph.prototype.atrSelect = function(nID, inp) { 
	var res = " "+this.nodes[nID].inputs[inp].vl; 
}


////// interaction
flGraph.prototype.moveNode = function(hit, nx, ny) {
	var nd = this.nodeOfHit(hit); 
	// move this node & update its inputs
	this.nodes[nd].moveTo(this.cx, nx, ny); 
	len = this.nodes.length; 
	for (i=0; i<len; i=i+1) { 
		// for all the other nodes, update inputs that go to this
		this.nodes[i].inputMoveTo(nd, nx, ny); 
	}
}


flGraph.prototype.evaluate = function() {
}


flGraph.prototype.setT = function(nt) { 
	this.t = nt; 
}


flGraph.prototype.update = function() {
	this.t += 0.05;
	this.evaluate(); 
}

