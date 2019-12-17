
///////////////////////////////////////
// This is the more-or-less well-commented version of the Flows Library. 
// (c)2016 Neal McDonald, released under MIT License
// Use it however you like; have a nice day.



/*
flIO's are attached to nodes can be either inputs or outputs. 
they hold connection data

flNodes generate code; the nodes exist to be a visual aid to command sequence construction. 
each node owns its inputs and one output?

flGraphs hold an array of nodes and carry out evaluations.

to evaluate a node network:
	sort the nodes into an execution order
	* nodes with no inputs, add first
	* then any node st all of its inputs are already in the sorted list
	* repeat till no more are added
	* if any can't get added, you have a loop and can't eval the graph

	generate a line of code for each node.  
	maintain the sort at edit time? eh, have a button..

to draw a node network
	for each node
		draw all of its input connections
		draw the node	

to create a node
	In the editor, there is a list of template nodes.
	Those are created by scanning files or hard-coded.
	The graph creates nodes by making a copy of an indicated node. 
	

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

//// utils
function strEq(a,b) {
	var a1 = new String(a).valueOf(); 
	var b1 = new String(b).valueOf(); 
	return (a1===b1);
}


/////////////////////////////////////////////////////////////
// flIO: inputs, constants, and outputs
// inputs connect to outputs. outputs are oblivious to connections
// inputs SPY on outputs!

// constants: flIO data types; this.tp is one of these
const FL_N = "FL_N"; // null
const FL_R = "FL_R"; // number
const FL_P = "FL_P"; // proportion  prBase
const FL_S = "FL_S"; // str
const FL_V = "FL_V"; // vector4
const FL_C = "FL_C"; // color "xrrggbb"
const FL_B = "FL_B"; // a beat loop?
const FL_L = "FL_RL";// list of R's

// tbd mx4, quaternions, colors, v4 lists, notes, beats, keys, tunings, signatures! rings lights

// flIO describes an input/output connection 
function flIO() { 
	this.tp = FL_N; 		// value type (FL_P, etc)
	this.vn = "uninit"; 	// label for attr editor entry
	this.sm = "-";			// symbol = symbol to be replaced in expr string = label in node for inputs
							// for outputs, sm=input node's var name & you can't use it in the expr.
	this.vl = 0.0; 			// value held by io if not connected
	this.co = "-"			// for connected inputs only: varname of other node. 
	this.isIn = true;   	// whether it's an input
	var chs = Math.floor(Math.random()*10); 
	var col = "";
	switch (chs) {
		case 0: col="#000000"; break;
		case 1: col="#333333"; break;
		case 2: col="#666666"; break;
		case 3: col="#999999"; break;
		case 4: col="#bb5555"; break;
		case 5: col="#55bb55"; break;
		case 6: col="#5555bb"; break;
		case 7: col="#bbbb55"; break;
		case 8: col="#5588bb"; break;
		case 9: col="#bb55bb"; break;
	}
	this.secondColor = col; 
	this.nID = -1;  // this's index into owner node's array of inputs or outputs.
	this.nInd = -1; 
	this.nx = 100; 
	this.ny = 200; 
	this.con = false;   // whether connected; 
	// if con==t, these will be set
	this.cID = -1; 	// ID of node at other end of the connection
	this.cInd = -1; 
	this.cnx = 200.0;
	this.cny = 200.0;
	this.isReady = false; 
}


flIO.prototype.typeColor = function() {
	res = "#888888"; 
	switch (this.tp) { 
		case FL_R: res = "#ff8888";  break; 
		case FL_P: res = "#88ff88";  break; 
		case FL_S: res = "#8888ff";  break;
		case FL_V: res = "#ffff88";  break;
		case FL_C: res = "#ff88ff";  break;
		case FL_B: res = "#88ffff";  break;
		case FL_L: res = "#aa8888";  break;
	}
	return res;
}


// at init, nothing is connected
flIO.prototype.init = function(tp, varName, symbol, vlue, ioro, nodeID, indInNode, nx, ny) { 
	this.tp = tp; 		
	this.vn = varName;
	this.sm=symbol;
	this.sm = symbol; 
	this.vl = vlue; 	
	this.isIn = ioro;   
	this.nID = nodeID;  
	this.nInd = indInNode; 
	this.nx = nx; 
	this.ny = ny; 
}


flIO.prototype.initFromTemplate = function(tmpl, nodeID, nx, ny) {
	this.tp = tmpl.tp; 		
	this.vn = tmpl.vn; 	
	if (tmpl.isIn) { this.sm = tmpl.sm; }
	else { this.sm = tmpl.sm + nodeID; this.vn = this.sm; } 
	this.vl = tmpl.vl; 	
	this.isIn = tmpl.isIn;   
	this.nID = nodeID; 
	this.nInd = tmpl.nInd; 
	this.nx = nx; 
	this.ny = ny; 
	this.con = false;   
}


flIO.prototype.copy = function(tmpl, nodeID, nx, ny) {
	this.tp = tmpl.tp; 		
	this.vn = tmpl.vn; 	
	this.sm = tmpl.sm;
	this.vl = tmpl.vl; 	
	this.co = tmpl.co;
	this.isIn = tmpl.isIn;  
	this.nID = nodeID;  
	this.nInd = tmpl.nInd; 
	this.nx = nx; 
	this.ny = ny; 
	this.secondColor = tmpl.secondColor; 
	this.con = tmpl.con;  
	this.cID = tmpl.cID; 	
	this.cInd = tmpl.cInd; 
	this.cnx = tmpl.cnx;
	this.cny = tmpl.cny;
	this.isReady = false; 
}


flIO.prototype.outToString = function() {
	var res = ""; // ugh use JSON ya dink. or just have graph do it all..
	return res;
}

flIO.prototype.setFromString = function(str) {
}



// connect an input IO to an output IO of another node. 
// outputs can never know whether they're connected, 
// unless they track all their connections; why should they? 
flIO.prototype.connect = function(oID, oInd, ox, oy, vname) {
	this.cID = oID; 
	this.cInd = oInd; 
	this.cnx = ox; 
	this.cny = oy;
	if (this.isIn) this.co = vname; // inputs need varnames
	// set vl to varname of source node
	this.con = true; 
}

// disconnect IO from an IO of another node. 
flIO.prototype.disconnect = function() {
	this.cID = -1; 
	this.cInd = -1; 
	this.cnx = -100.0; 
	this.cny = -100.0; 
	this.co = "-";
	// set val to default
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
const FLIO_VSP = 28.0; // y spacing between rows of Is and Os



// returns [x,y], given node position and place in i or o arrays
// if "selfOther"=t, use owner node's position
flIO.prototype.center = function(selfOther) {
	var cx, cy;
	if (selfOther) { 
		cx = this.nx + (this.nInd*(FLIO_SZX+2)); 
		cy = this.ny;
		if (!this.isIn) { 
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

// ASSUMING that cnxy is getting updated properly
flIO.prototype.drawLink = function(theCx) { 
	var c1x, c2x, c2y, c1y, p1, p2, col;

	if (!(this.isIn)) { return; } // draw only inputs
	if (!(this.con)) { return; } // no connection to draw
	var col = this.typeColor(); 
	theCx.fillStyle = col; 
		
	p1 = this.center(true);
	c1x = p1[0] + FLIO_CNX;
	c1y = p1[1];
	theCx.fillRect(c1x-4, c1y-4, 9,3);
	
	p2 = this.center(false);
	c2x = p2[0] + FLIO_CNX;
	c2y = p2[1] + FLIO_SZY;
	theCx.fillRect(c2x-4, c2y, 9,3);

	// connection lines
	theCx.strokeStyle = this.secondColor; 
	theCx.beginPath();
	theCx.moveTo(c1x+1, c1y); 
	theCx.lineTo(c2x+1, c2y); 
	theCx.stroke();
	theCx.strokeStyle = col; 
	theCx.beginPath();
	theCx.moveTo(c1x-2, c1y); 
	theCx.lineTo(c2x-2, c2y); 
	theCx.stroke();
}


const FLIO_TDX = 3.0; // text displacement  
const FLIO_TDY = 10.0; 


flIO.prototype.drawBody = function(theCx) { 
	var cx, cy, pt;
	pt = this.center(true); 
	cx = pt[0]; 
	cy = pt[1];
	var col = this.typeColor(); 
	theCx.fillStyle = col;
	theCx.fillRect(cx, cy, FLIO_SZX, FLIO_SZY);
	// label
	theCx.font = "10px Arial";
	theCx.fillStyle = "#000000";
	theCx.fillText(this.sm, cx+FLIO_TDX, cy+FLIO_TDY);
	theCx.stroke();
}


/*		res = '<div class="scrNodeButtonHolder">' ;
		res += '<button onclick="theE.makeNode("'+this.tp+'");" class="scrNodeButton">';
		res += this.name + '</button></div>';
 */
// attribute is an array: [name, value as string, nodeID, inputID ]
flIO.prototype.getHTML = function() { 
	var res = ""; 
	if (this.isIn) { 
		res = '<div class="conAttributeItem">';
  		// if it's connected, value not editable, and there is a disconnect button
  		if (this.con) { 
			// connected:     [      label:][node var name][disconnect]
			res +='<div class="conAttributeNameSide">'+this.vn+':</div>';
			res += '<div class="conAttributeValueSide">';
  			res += '<div class="conAttributeDisconnectButton">';
	  		res += '<button onclick="theE.disconnect(' + this.nID + ':' + this.nInd + ');" ';
  			res += 'class="conAttributeDisconnectButton">'+this.co + ' -- (disc)</button></div></div>';		
  		} else {
			// not connected: [       label:][inpt val    ][ update ]
			res += '<div class="conAttributeNameSide">'+this.vn+':</div>';
			res += '<div class="conAttributeValueSide">';
			res += '<input class="conAttributeInputBox" id="ioIn' +this.nID+this.nInd+ '" value="' + this.vl; 
	  		res += '" onkeyup="atrKeyIn(' + this.nID+','+this.nInd+')"></div>';
		}
		res += '<div class="clear"></div></div>'; 
	}
	return res; 
}


/////////////////////////////////////////////////// nodes own io and do stuff
/////////////////////////////////////////////////// nodes own io and do stuff
/////////////////////////////////////////////////// nodes own io and do stuff
/////////////////////////////////////////////////// nodes own io and do stuff
/////////////////////////////////////////////////// nodes own io and do stuff
/////////////////////////////////////////////////// nodes own io and do stuff

// graphs contain nodes. there is only one node type. 
// nodes are initialized either from text descriptions or other nodes. 

// nodes contain a command string that is used to generate a line of code. 
// the code is then put in some context and becomes part of a program.
// node ID and type name are used to generate a unique variable name
// I expect that the code generated is generally "varX = expr(inputa, inputb);"
// All the generation step has to do is sub in the variable names for the inputs placeholders. 

// the editor has a collection of example nodes that are copied to create nodes in the graph. 
// the example nodes can be created from files or hardcoded. 

// nodes are organized into "gp" groups, to avoid having the UI limit the max type ct. 



function flNode() { 
	this.tp = "uninit";    	// short type name used to name variables & for io labels -- unique!
	this.lb = "uninit";  	// longer template name for buttons
	this.vn = "-"; 			// tp+nodeID = variable name
	this.gp = -1;		   	// group number 0math 4gl etc.
	this.cm = 'console.log("uninitialized node type");'  // string for code gen
	this.rs = 'uninitialized';// result of subbing inputs into 'cm'
	this.posX = 100;		// postion on screen
	this.posY = 100;
	this.isSelected = false;// whether selected
	this.nodeID = -1;		// how other objs think of you 
	this.inputs = []; 		// flIO's
	this.outputs = []; 
	this.wdt = 200.0;		// width, set by #flIOs
	this.ord = -1; 			// execution order in graph; -1 is error
}

// this fn inits a node as a template node, so no node ID or position
// line format is 
//?? pt point 2 this.pg.point(X,Y); FL_P FL_R X X 0.5 FL_R Y Y 0.5 ...
//?? symbol buttonLabel group command outputtype (inType1 sym1 attrlabel1 defaultval) 
flNode.prototype.initTypeFromLine = function(line) {
	var wds = line.split(' '); 
	var ct = wds.length; 
	if (ct<6) return -1; // not enough arguments
	if (!strEq(wds[0], "//??")) return -1; // no leading //??
	if ((ct-6)%4!=0) return -2; // odd number of input args
	var inpct = (ct-6)/4; 
	this.tp= wds[1];
	this.lb = wds[2];
	this.vn = "-";
	this.gp = parseInt(wds[3]); // to int! 
	this.cm = wds[4];	
	this.rs = "-";
	this.posX = -1;
	this.posY = -1;
	this.isSelected = false; 
	this.nodeID = -1;
	// find the entry that contains 'out'-> outInd => #args= (outInd / 3)-1
	for (var i=0; i<inpct; ++i) { 
		var tp = wds[(i*4)+6]; 
		var nm = wds[(i*4)+7]; 
		var lb = wds[(i*4)+8]; 
		var defVal = wds[(i*4)+9];
		var io = new flIO();
		io.init(tp, nm, lb, defVal, true, -1, i, -1,-1);
		this.inputs.push(io);
	}
	this.wdt = (inpct * FLIO_SZX) +10;
	if (this.wdt<80.0) { this.wdt = 80.0; }
	// no default output value. 
	var tp = wds[5];
	var nm = this.tp;
	var lb = this.tp;
	var io = new flIO();
	io.init(tp, nm, lb, 0.0, false, -1, 0, -1,-1);	
	this.outputs.push(io);
}


flNode.prototype.initFromTemplate = function(tpl, idnumber, x, y) {
	this.tp = tpl.tp;
	this.vn = tpl.tp + idnumber;
	this.gp = tpl.gp;
	this.cm = tpl.cm;
	this.posX = x;
	this.posY = y;
	this.isSelected = false; 
	this.nodeID = idnumber;
	for (var i=0; i<tpl.inputs.length; ++i) {
		var io = new flIO(); 
		io.initFromTemplate(tpl.inputs[i], idnumber, x, y); 
		this.inputs.push(io);
	}
	for (var i=0; i<tpl.outputs.length; ++i) {
		var io = new flIO(); 
		io.initFromTemplate(tpl.outputs[i], idnumber, x, y); 
		this.outputs.push(io);
	}
	this.wdt = tpl.wdt;
	this.setCommand();
}


flNode.prototype.copy = function(it, idnumber) {
	this.tp = it.tp;
	this.lb = it.lb;
	this.vn = tpl.tp + idnumber;
	this.gp = it.gp;
	this.cm = it.cm;
	this.rs = it.rs;
	this.posX = it.x+100; 
	this.posY = it.y+100;
	this.isSelected = false; 
	this.nodeID = idnumber;
	for (var i=0; i<it.inputs.length; ++i) {
		var io = new flIO(); 
		io.copy(it.inputs[i], idnumber, it.x+100, it.y+100); 
		this.inputs.push(io);
	}
	for (var i=0; i<it.outputs.length; ++i) {
		var io = new flIO(); 
		io.copy(it.outputs[i], idnumber, it.x+100, it.y+100); 
		this.outputs.push(io);
	}
	this.wdt = tpl.wdt;
	this.setCommand();
}



flNode.prototype.setFromString = function(str) {
	// return this?
}


const FLND_SZY = 40.0; // node body ht

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
	theCx.font = "10px Arial";
	theCx.fillStyle = "#000000";
	theCx.fillText(this.cm, x+2, y+23);
	theCx.fillText(this.ord, x+this.wdt-12, y+38);

	// drawing flIOs
	len = this.inputs.length;  
	for (i=0; i<len; i=i+1) { 
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

	var t1 = this.inputs[inA].tp; 
	var t2 = nodeB.outputs[outB].tp; 
	if (t1===t2) { 
		//	flIO.prototype.connect = function(oID, oInd, oVarName, ox, oy) {
		this.inputs[inA].connect(nodeB.nodeID, outB, nodeB.posX, nodeB.posY, nodeB.vn); 
		// outputs are not changed here; they could host many connections
		// they are not changed by connections. 
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


flNode.prototype.allInputsAreOrdered= function() { 
	var res = true; 
	var ct = this.inputs.length; 
	for (var i=0; i<ct; ++i) { 
		if (this.inputs[i].con) {
			var con = this.inputs[i].cID; 
			if (this.inputs[con].ord<0) {
				res = false
			}
		}
	}
	return res; 
}


flNode.prototype.setCommand = function() { 
	var res = "";
	var res = this.cm; // unaltered, original command string
	var ct = this.inputs.length; 
	for (var i=0; i<ct; ++i) {
		var sm = this.inputs[i].sm; // thing to replace in expression
		var sub = this.inputs[i].vl;
		if (this.inputs[i].con) { 
			sub = this.inputs[i].co; // thing to replace them with
		}
		res = res.replace(sm,sub); 
	}
	this.rs = " var " + this.vn + " = " + res; 
}




// given mouse position, inside it or inputs? 

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
		for (i=0; i<len; i=i+1) { //i=1! no labels box
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
	this.setCommand();
	var res = '<div class="conAttributeOutput">' + this.rs + '</div>';
	return res; 
}



flNode.prototype.getSaveString = function() { // json? ok
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
	this.cx.lineWidth =2;
	this.nodes = []; 
	this.execOrder = []; 
	this.selectedNode = -1; 
	this.nextX = 120.0; // where the next node will be made
	this.nextY = 120.0;
	// the graph returns a program
	this.header = ""; // this part comes before that program
	this.footer = ""; // after
	this.prefix = ""; // between the = and body of each command
	this.targetFile = ""; // file to save to
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


flGraph.prototype.makeNode = function(otherNode) {
	var ind; 

	ind = this.nodes.length; 
	var nn = new flNode();
	nn.initFromTemplate(otherNode, ind, this.nextX, this.nextY); 
	this.nodes.push(nn); 

	// update position to make next node
	this.setMakeSite(this.nextX +5.0, this.nextY+60.0);
	this.selectedNode = ind; 
	this.redraw(); 
	this.updateEvalOrder();
	return "made '"+ otherNode.tp + "' node";
}

flGraph.prototype.deleteNode = function() {
	// ugh. all my precious indices. 
	// so, selectedNode is the one to kill.
	// for all connections, if the cID>selectedNode, --
	// for all node ID's, if etc. 
	// alternative is checking checking whether a node is marked "deleted"
	
	
}

flGraph.prototype.duplicateNode = function(node) {
	ind = this.nodes.length; 
	var nn = new flNode();
	nn.copy(otherNode, ind); 
	this.nodes.push(nn);
	this.selectedNode = ind; 
	this.updateEvalOrder();
	this.redraw(); 
}



flGraph.prototype.edNew = function() { return "edNew"; }
flGraph.prototype.edSave = function() { return "edSave"; }
flGraph.prototype.edLoad = function() {return "edLoad"; }

flGraph.prototype.edContext = function() { return "edContext";}
flGraph.prototype.edImport = function() { return "edImport"; }
flGraph.prototype.edEvaluate = function() { return this.evaluate(); }

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


flGraph.prototype.updateEvalOrder = function() {
	var res = false; 
	var nextCmd = 0;
	var ct = this.nodes.length;  
	var i; 
	// init all eval-order vals to -1 
	for (i=0; i<ct; ++i) { 
		this.nodes[i].ord = -1; 
	}
	// nodes w/ no inputs
	for (i=0; i<ct; ++i) { 
		if (this.nodes[i].inputs.length<1) { 
			this.nodes[i].ord = nextCmd;
			++nextCmd;
		} 
	}
	var notDone = true; 
	var sanityCtr = 0; 
	while (notDone) {
		var hadProgress = false; 
		for (i=0; i<ct; ++i) { 
			var n = this.nodes[i];
			
			if (n.ord<0) { // not already ordered
				var isOrdered = true;
				var inpCt = n.inputs.length; 
				for (var j=0; j<inpCt; ++j) { 
					if (n.inputs[j].con) {
						var inNd = n.inputs[j].cID;
						if (this.nodes[inNd].ord<0) {
							isOrdered = false; 
							// has input not already ordered; skip
						}
					}
				}
				if (isOrdered) { 
					this.nodes[i].ord = nextCmd; 
					++nextCmd;
					hadProgress = true; 
				}
			}
		}
		sanityCtr = sanityCtr+1;
		if ((hadProgress===false) || (nextCmd>=ct) || (sanityCtr>=ct)) { 
			notDone = false;
		}
	}
	if (nextCmd<ct) 
		return false; 
	for (i=0; i<ct; ++i) {
		var ord = this.nodes[i].ord; 
		this.execOrder[ord] = i; 
	}
}



// need inputNode, input ind, outut node, out ind
flGraph.prototype.connect = function(iID, iInd, oID, oInd) {
	var msg = this.nodes[iID].connect(iInd, this.nodes[oID], oInd); 
	this.updateEvalOrder();
	return msg; 
}


flGraph.prototype.disconnect = function(nodeID, inputID) {
	this.nodes[nodeID].inputs[inputID].disconnect(); 
	this.updateEvalOrder();
}


flGraph.prototype.atrKeyIn = function(nID, inp, val) { 
	this.nodes[nID].inputs[inp].vl = val; 
	this.nodes[nID].setCommand(); 
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

// node command has inputs pasted in as connections are made... 
flGraph.prototype.evaluate = function() {
	var res = "";
	var ln = this.nodes.length;
	var cmdOrd = 0; 
	var i=0; 
	var loopCt = 0; 
	var notDone = true; 
	while (notDone) { 
		var ord = this.nodes[i].ord;
		if (ord===-1) { notDone=false;}
		if (cmdOrd>=ln) { notDone=false;}
		if (loopCt>=ln) { notDone = false; }
		if (ord === cmdOrd) { 
			res += this.nodes[i].rs; // keep exec complexities in the node defn, ?
			++cmdOrd; 
		}
		++i; 
		if (i>=ln) { i=0; ++loopCt; }
	}
	return res; 
}


