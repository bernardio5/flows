
/* /////////////////////////////////////
 This is the more-or-less well-commented version of the Flows Library. 
 (c)2016 Neal McDonald, released under MIT License
 Use it however you like; have a nice day.

Three objects defined here: IO's, Nodes, and Graphs. They're named with an "fl" prefix.
The goal is to use a graph editor to do visual programming, like in the Maya materials 
 editor, or Houdini, or Scratch (sorta!) etc. 

flIO's are attached to nodes & can be either inputs or outputs. 
They are the connections between nodes-- there's no cnnectivity matrix etc.

flNodes are commands; the nodes exist to be a visual aid to command sequence construction. 
each node owns its inputs and outputs. ATM they all have two outputs; more below.

flGraphs hold an array of nodes and carry out evaluations. The graph is the editor's
 interface; I frown upon the editor mucking with IOs or Nodes directly.

The editor has an array of "template" nodes; each defines a type of node that can be 
* used/made/manipulated by the editor. Template nodes are flNodes, and nodes in the 
* graph being edited are also flNodes, just treated slightly differently.
* 
Node types, as defined by a template, have a set number of inputs and outputs;
* each node of that type copies input and output flIO's from the template.

To define a node type is easy: you set the number and types of inputs and outputs, 
* and then set a "command" string that determines what code the node generates. 
The Editor has a function that defines most of the node types, using about 60 lines of code. 

Not all inputs and outputs need be connected; default values are given as part of the 
 flIO init. The Editor's "attribute editor" lets you change these. 

To connect nodes A and B, set an input of A to point at an output of B. 
* B is not modified. None of B's flIO's are modified. All outputs can be used by 
* many inputs; each input can get its value from only one output. 

Each node makes a line of code. Each node has a command string. The string includes
* symbols showing where inputs go; they values of the correcponding flIO's are substituted 
* in when the code is generated.
* 
Usually, each node makes a line of code of the form "var ax=f(A,B)".
* The variable ax can then be referred to by downstream nodes; a node that is connected
* to the output of the node that makes the "var ax=f(A,B)" line would substitute 
* "ax" into its command. 



*/

//// utils: is the crappiness of JS boring? yes. 
function strEq(a,b) { // string compare
	var a1 = new String(a).valueOf(); 
	var b1 = new String(b).valueOf(); 
	return (a1===b1);
}


/////////////////////////////////////////////////////////////
// flIO objects are the connections between nodes.

// constants: flIO data types; this.tp is one of these
const FL_N = "FL_N"; 	// null
const FL_R = "FL_R"; 	// number-- int or float? js can't tell.
const FL_S = "FL_S"; 	// str -- can be code! is, often
const FL_V = "FL_V"; 	// vMath.vec3
const FL_M = "FL_M"; 	// vMath.mx4
const FL_P = "FL_P"; 	// parts.particle
const FL_F = "FL_F"; 	// parts.force
const FL_C = "FL_C"; 	// color "xrrggbb"
const FL_A = "FL_A"; 	// array! note, no typechecking
const FL_X = "FL_X";	// not given; don't check and let the user beware, like in javascript
const FL_PT = "FL_PT"; 	// proportion  prPoint -- can make lines circles, or be on them
const FL_PL = "FL_PL"; 	// proportion  line or circle -- can gen parametric pts or be cut into segments
const FL_PS = "FL_PS"; 	// proportion  arc or segment -- can be lofted
const FL_PF = "FL_PF"; 	// proportion  loft
// tbd mx4, quaternions, colors, v4 lists, notes, beats, keys, tunings, signatures! rings lights?

function flIO() { 
	this.tp = FL_N; 		// value type (FL_P, etc)
	this.vn = "uninit"; 	// label for attr editor entry
	this.sm = "-";			// for inputs: str to be replaced in expr string
							// for outputs, the code's varname or "cd"X
					// !!also used to label the ioBoxes in the node drawing.
	this.vl = 0.0;			// for inputs, the literal; used if not connected. not used if connected.
							// for reference outputs, the node's varname. 
							// for code outputs, code
	this.isIn = true;   	// whether it's an input
	var chs = Math.floor(Math.random()*10); 
	var col = "";// connections are drawn with two parallel lines
	switch (chs) { // the left line's color is determined by this.tp,
		case 0: col="#666666"; break;
		case 1: col="#bb6666"; break;
		case 2: col="#66bb66"; break;
		case 3: col="#6666bb"; break;
		case 4: col="#bbbb66"; break;
		case 5: col="#bb66bb"; break;
		case 6: col="#66bbbb"; break;
		case 7: col="#4444dd"; break;
		case 8: col="#44dd44"; break;
		case 9: col="#dd4444"; break;
	}
	this.secondColor = col; // the color of the right line is set randomly.
	this.iNode = null; // ptr to owner node  
	this.iInd = -1; // index of self in owner's inputs
	this.con = false;   // whether connected; 
	// if con==t, these will be set
	this.oNode = null; // ptr to other node-- a
	this.oInd = -1; // index of other's output
}

// sets left line color and in-node connection box color.
flIO.prototype.typeColor = function() {
	res = "#888888"; 
	switch (this.tp) { 
		case FL_N: res = "#000000";  break; 
		case FL_R: res = "#ff8888";  break;
		case FL_S: res = "#88ff88";  break;
		case FL_V: res = "#8888ff";  break; 
		case FL_M: res = "#ff88ff";  break;
		case FL_P: res = "#88ffff";  break;
		case FL_F: res = "#ffff88";  break;
		case FL_C: res = "#ff5555";  break;
		case FL_A: res = "#55ff55";  break;
		case FL_X: res = "#aaaaaa";  break;
		case FL_PT:res = "#5555ff";  break; 
		case FL_PL:res = "#55ffff";  break; 
		case FL_PS:res = "#ff55ff";  break; 
		case FL_PF:res = "#ffff55";  break; 
	}
	return res;
}

// used to create IO's in template nodes
flIO.prototype.init = function(tp, varName, symbol, vlue, ioro, nodePtr, indInNode) { 
	this.tp = tp; 		
	this.vn = varName;
	this.sm = symbol; 
	this.vl = vlue; 	
	this.isIn = ioro;   
	this.iNode = nodePtr;  
	this.iInd = indInNode; 
}

//?? ex exponent 0 Math.pow(A,B); FL_R  FL_R mantissa M 1.0   FL_R expn O 1.0 "); 
flNode.prototype.giveTemplateString = function() { // as above, so below
	var res = " " + this.tp + " "+ this.vn + " " + this.sm + " " + this.vl;
}

// a little more info for IOs in nodes in the graph.
flIO.prototype.initFromTemplate = function(tmpl, nodePtr, ctr) {
	this.tp = tmpl.tp; 		
	this.vn = tmpl.vn; 	
	if (tmpl.isIn) { this.sm = tmpl.sm; }
	else { this.sm = tmpl.sm + ctr; this.vn = this.sm; } 
	this.vl = tmpl.vl; 	
	this.isIn = tmpl.isIn;   
	this.iNode = nodePtr; 
	this.iInd = tmpl.iInd; 
	this.con = false;   
}


flIO.prototype.copy = function(tmpl, nodePtr) {
	this.tp = tmpl.tp; 		
	this.vn = tmpl.vn; 	
	this.sm = tmpl.sm;
	this.vl = tmpl.vl; 	
	this.isIn = tmpl.isIn;  
	this.secondColor = tmpl.secondColor; 
	this.iNode = nodePtr;  
	this.iInd = tmpl.iInd;
	this.con = tmpl.con;  
	this.oNode = tmpl.oNode; 
	this.oInd = tmpl.oInd;
}


flIO.prototype.giveSaveString = function() {
	var res = " io " + this.tp + " " + this.vn + " " + this.sm + " " + this.vl;
	if (this.isIn) { res = res + " T " } else { res = res + " F "; }
	if (this.con) { res = res + " T " } else { res = res + " F "; }
	res = res + this.secondColor + " " + this.iInd + " " + this.oNode.nodeID + " " + this.oInd;
	return res;
}

flIO.prototype.setFromString = function(wdAr, ind) {
	if (!strEq(wdAr[ind], "io")) return;
	this.tp = wdAr[ind+1];
	this.vn = wdAr[ind+2];
	this.sm = wdAr[ind+3];
	this.vl = wdAr[ind+4];
	if (strEq(wdAr[ind+5], "F")) { this.isIn=false; }
	if (strEq(wdAr[ind+6], "T")) { this.con=true; }
	this.secondColor = wdAr[ind+7];
	this.iInd = wdAr[ind+8];
	this.con = wdAr[ind+9];
	this.tempNodeId = wdAr[ind+10];
	this.oInd = wdAr[ind+11];
}



// connect an input IO to an output IO of another node. 
// outputs can never know whether they're connected.
flIO.prototype.connect = function(throwNode, throwOutletIndex) {
	this.oNode = throwNode;
	this.oInd = throwOutletIndex;
	this.con = true; 
}

// disconnect IO from an IO of another node. 
flIO.prototype.disconnect = function() {
	this.oNode = null;
	this.oInd = -1;
	this.con = false; 
}


// node size and spacing
const FLIO_SZX = 25.0; // body size x
const FLIO_SZY = 12.0; // body size y
const FLIO_VSP = 28.0; // y spacing between rows of Is and Os



// returns [x,y], given node position and place in i or o arrays
// if "selfOther"=t, use owner node's position
flIO.prototype.center = function(selfOther) {
	var cx, cy;
	if (selfOther) { 
		cx = this.iNode.posX + (this.iInd*(FLIO_SZX+2));
		cy = this.iNode.posY;
		if (!this.isIn) { 
			cy += FLIO_VSP; // show outputs below inputs
		}
	} else {  // center of another node's output flIO
		cx = this.oNode.posX + (this.oInd*FLIO_SZX);; 
		cy = this.oNode.posY + FLIO_VSP; // show outputs below inputs
	}
	return [cx, cy];
}// actually this should be called "topleftcorner"


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


flIO.prototype.drawLink = function(theCx) { 
	var c1x, c2x, c2y, c1y, p1, p2, col; // I miss C.
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
	  		res += '<button onclick="theE.disconnect(' + this.iNode.nodeID + ',' + this.iInd + ');" ';
  			res += 'class="conAttributeDisconnectButton"> disconnect '+this.oNode.vn + '</button></div></div>';		
  		} else {
			// not connected: [       label:][inpt val    ][ update ]
			res += '<div class="conAttributeNameSide">'+this.vn+':</div>';
			res += '<div class="conAttributeValueSide">';
			res += '<input class="conAttributeInputBox" id="ioIn' +this.iNode.nodeID+this.iInd+ '" value="' + this.vl; 
	  		res += '" onkeyup="atrKeyIn(' + this.iNode.nodeID+','+this.iInd+')"></div>';
		}
		res += '<div class="clear"></div></div>'; 
	}
	return res; 
}

flIO.prototype.getTextBlock = function() { 
	var res = ""; 
	if (this.isIn) { 
		res = '<div class="conTextBlockItem">'; 
  		if (this.con) { 
			// is con => how to save changes? probably need to disconnect... or just lock?
			res = '<div class="conTextBlock">';
			res += '<textarea id="ioInBlock" change="blockKeyIn(' + this.iNode.nodeID+','+this.iInd+')"';
	  		res += '" rows="15" cols="31">' + this.oNode.outputs[this.oInd].vl + '</textarea></div>';
  		} else {
			// not con=> edit self val like regular string flIO
			res = '<div class="conTextBlock">';
			res += '<textarea id="ioInBlock" change="blockKeyIn(' + this.iNode.nodeID+','+this.iInd+')"';
	  		res += '" rows="15" cols="31">'+this.vl+'</textarea></div>';
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

// graphs contain nodes. 
// nodes are initialized either from text descriptions or other nodes. 

// nodes contain a command string that is used to generate a line of code. 
// the code is then put in some context and becomes part of a program.
// node ID and type name are used to generate a unique variable name
// I expect that the code generated is generally "varX = expr(inputa, inputb);"

// the editor has a collection of example nodes that are copied to create nodes in the graph. 
// the example nodes can be created from files or hardcoded. 

// nodes are organized into "gp" groups, to avoid having the UI limit the max type ct. 



function flNode() { 
	this.tp = "uninit";    	// short type name used to name variables & for io labels -- unique!
	this.lb = "uninit";  	// longer template name; label for buttons
	this.vn = "-"; 			// tp+nodeID = variable name
	this.gp = -1;		   	// group number 0math 4gl etc.
	this.cm = 'console.log("uninitialized node type");'  // string for code gen
	this.rs = 'uninitialized';// result of subbing inputs into 'cm'
	this.id = -1;			// index into node array. used for hit tests
	// code block is stored in the second output, called "code"
	this.posX = 100;		// postion on screen
	this.posY = 100;
	this.isSelected = false;// whether selected
	this.nodeID = -1;		// index in graph's node array
	this.spc = 0; 			// specialness- basically, node type, switch for special-case behaviors
	this.inputs = []; 		// flIO's
	this.outputs = []; 
	this.wdt = 80.0;		// width, set by #flIOs
	var io = new flIO();	// everyone gets a ref output and a code output-- and that's all? 
	//flIO.prototype.init = function(tp, varName, symbol, vlue, iisInput, nodePtr, indInNode) { 
	io.init(FL_S, "uninit", "rf", "-", false, this, 0);
	this.outputs.push(io);
	io = new flIO();
	io.init(FL_S, "code", "cd", ";", false, this, 1);// I htink this sets code good to go!
	this.outputs.push(io);
}


/////////////////////////////////// template nodes are type exemplars; no nodeID, position, connections
// standard nodes have 0 or more inputs, 2 outputs (ref and code), and a command that sets a variable.
// line format is 
//?? pt point 0 2 this.pg.point(X,Y); FL_P FL_R X X 0.5 FL_R Y Y 0.5 ...
//?? symbol buttonLabel spc group command outputtype (inType1 sym1 attrlabel1 defaultval) 
flNode.prototype.initTypeFromLine = function(line) {
	var wds = line.split(' '); 
	var ct = wds.length; 
	if (ct<6) return -1; // not enough arguments
	if (!strEq(wds[0], "//??")) return -1; // no leading //??
	if ((ct-7)%4!=0) return -2; // odd number of input args
	var inpct = (ct-7)/4; 
	this.tp= wds[1];
	this.lb = wds[2];
	this.vn = "-";
	this.gp = parseInt(wds[4]); // to int! 
	this.cm = wds[5];	
	this.rs = "-";  // result of subbing inputs into the cm string
	this.posX = -1;
	this.posY = -1;
	this.isSelected = false; 
	this.nodeID = -1;
	this.spc = parseInt(wds[3]); 
	// find the entry that contains 'out'-> outInd => #args= (outInd / 3)-1
	for (var i=0; i<inpct; ++i) { 
		var tp = wds[(i*4)+7]; 
		var nm = wds[(i*4)+8]; 
		var lb = wds[(i*4)+9]; 
		var defVal = wds[(i*4)+10];
		var io = new flIO();
		io.init(tp, nm, lb, defVal, true, this, i);
		this.inputs.push(io);
	}
	this.wdt = (inpct * FLIO_SZX) +10;
	if (this.wdt<80.0) { this.wdt = 80.0; }
	// no default output value. 
	var tp = wds[6];
	var nm = this.tp;
	var lb = this.tp;
	//flIO.prototype.init = function(tp, varName, symbol, vlue, iisInput, nodePtr, indInNode) { 
	
	switch (this.spc) { // some nodes get treated differently
		//case 0: default; 
		case 1: break; // some guys don't make var refs 
		// case 2: // for loops output a counter
		// case 3: txt block: as default
		// case 4: // custom block: input 0 is a string that is the command. 
		//case 5: // importer-- this.rs = file.read(input[0].vl); 
		// case 6: // exporter-- write a file, no output into graph! 
		default: this.outputs[0].init(tp, nm, lb, 0.0, false, this, 0);	break;//
	}
}


flNode.prototype.giveTemplateString = function() { // make a string that round-trips with initTypeFromLine
	var res = "";
	res = res + "//?? " + this.tp + " "+ this.lb + " " + this.spc + " " + this.gp;
	res = res + " " + this.cm + " "+  this.outputs[0].tp;
	for (var i=0; i<this.inputs.length; ++i) { 
		res = res + this.inputs[i].giveTemplateString();
	}
}


////////////////////////////// graph nodes are made and manipulated by the user; can be connected.
flNode.prototype.initFromTemplate = function(tpl, idnumber, x, y) {
	this.tp = tpl.tp;
	this.vn = tpl.tp + idnumber;
	this.gp = tpl.gp;
	this.cm = tpl.cm;
	this.posX = x;
	this.posY = y;
	this.isSelected = false; 
	this.nodeID = idnumber;
	this.spc = tpl.spc;
	for (var i=0; i<tpl.inputs.length; ++i) {
		var io = new flIO(); 
		io.initFromTemplate(tpl.inputs[i], this, idnumber); 
		this.inputs.push(io);
	}
	this.outputs[0].initFromTemplate(tpl.outputs[0], this, idnumber); 
	this.outputs[1].sm = "cd"+idnumber;
	this.wdt = tpl.wdt;
	this.evaluate();
}


flNode.prototype.copy = function(it, idnumber) { // that is, make this a copy of it
	this.tp = it.tp;// hey, is this allocated? cause it needs to be. 
	this.lb = it.lb;
	this.vn = it.tp + idnumber;
	this.gp = it.gp;
	this.cm = it.cm;
	this.rs = it.rs;
	this.posX = it.x+100; 
	this.posY = it.y+100;
	this.isSelected = false; 
	this.nodeID = idnumber;
	this.spc = it.spc;
	for (var i=0; i<it.inputs.length; ++i) {
		var io = new flIO(); 
		io.copy(it.inputs[i], this); 
		this.inputs.push(io);
	}
	for (var i=0; i<it.outputs.length; ++i) {
		var io = new flIO(); 
		io.copy(it.outputs[i], this); 
		this.outputs.push(io);
	}
	this.wdt = it.wdt;
	this.evaluate();
}


flNode.prototype.giveSaveNodeString = function() {
	var res = "node ";
	res = this.vn + " " + this.tp + " " + this.lb + " " + this.gp + " ";
	res = res + this.cm + " " + this.posX + " " + this.posY + " " + this.nodeID + " ";
	res = res + this.spc + " " + this.wdt + " " + this.inputs.length + " " + this.outputs.length;
	for (var i=0; i<this.inputs.length; i=i+1) {
		res = res + this.inputs[i].giveSaveString();
	}
	for (var i=0; i<this.outputs.length; i=i+1) {
		res = res + this.outputs[i].giveSaveString();
	}
	return res; 
}


flNode.prototype.setWithSaveString = function(str) {
	var wds = line.split(' '); 
	var ct = wds.length; 
	if (ct<12) return -1; // not enough arguments
	if (!strEq(wds[0], "node")) return -1; // no leading "node"! not a node, then
	
	this.tp = wds[2];
	this.lb = wds[3];
	this.gp = parseInt(wds[4]);
	this.cm = wds[5];
	this.posX = parseFloat(wds[6]);
	this.posY = parseFloat(wds[7]);
	this.spc = parseInt(wds[8]);
	this.wdt = parseInt(wds[9]);
	this.inputs = [];
	this.outputs = [];
	var ict = parseInt(wds[10]);
	var oct = parseInt(wds[11]);
	var i; 
	for(i=0; i<ict; ++i) { 
		var io = new flIO();
		io.setWithSaveString(wds, (12+(i*12)));
		this.inputs[i].push(io);
	}
	for(i=0; i<oct; ++i) { 
		var io = new flIO();
		io.setWithSaveString(wds, (12+(i*12)));
		this.outputs[i].push(io);
	}
}


// draw the node's input connections
flNode.prototype.drawInputCons = function(theCx) { 
	var i, len; 
	theCx.strokeStyle = "#000"; 
	theCx.fillStyle = "#000"; 
	// connection lines-- draw from inputs to outputs
	len = this.inputs.length;  
	for (i=0; i<len; i=i+1) { 
		this.inputs[i].drawLink(theCx); 
	}	// and if you're not an input, you don't need to get drawn.
}


// draw a node's body
const FLND_SZY = 40.0; // node body ht
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
	if ((t1===t2) || (t1===FL_X)) { 
		this.inputs[inA].connect(nodeB, outB); 
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


// substitute IO values into the command string.
// should be called only by "evaluate"? 
flNode.prototype.genCommand = function(cmd) { 
	var res = cmd; // unaltered, original command string
	var ct = this.inputs.length; 
	for (var i=0; i<ct; ++i) {
		var sm = this.inputs[i].sm; // thing to replace in expression
		var sub = this.inputs[i].vl; // unconnected? use con's def val/literal
		if (this.inputs[i].con) { 
			sub = this.inputs[i].oNode.vn; // variable name from throw node
		}
		res = res.replace(sm,sub); 
	}
	return res;
}


// evaluation: do what the node does
flNode.prototype.evaluate = function() {
	var code = "";
	var ninps = this.inputs.length; 
	for (var i=0; i<ninps; ++i) {
		if (this.inputs[i].con===true){
			this.inputs[i].oNode.evaluate();
			code = code + this.inputs[i].oNode.outputs[1].vl;
		}
	}
	switch (this.spc) { // some nodes get treated differently
		//case 0: default; 
		case 1: this.rs =  this.genCommand(this.cm) + "\n"; break; // some guys don't make var refs 
		case 2: // for loops ugh, and who cares?
		// case 3: txt block: as default
		case 4: // custom block: input 0 is a string that is the command. 
			var cm = this.inputs[0].iNode.vl; 
			this.rs = "var " + this.vn + " = " + this.genCommand(cm) + "\n"; 
			break;
		case 5: // importer-- this.rs = file.read(input[0].vl); 
		case 6: // exporter-- write a file, no output into graph! 
		default: this.rs = "var " + this.vn + " = " + this.genCommand(this.cm) + "\n"; break;
	} 
	code = code + this.rs;
	//this.outputs[0].vl = this.vn; 
	this.outputs[1].vl = code; 
}





// given mouse position, inside it, or its inputs? 

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
	res = (this.nodeID+1)*10000; // assume a body hit, then check bboxes
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
	if (this.spc===3) { //==>is text block; wants the big ol' textarea examiner
		str = this.inputs[0].getTextBlock(); 
	} else {
		len = this.inputs.length;  
		for (i=0; i<len; i=i+1) { 
			str += this.inputs[i].getHTML(); 
		}
	}
	return str; 
}


flNode.prototype.getOutputsHTML = function() {
	this.evaluate();
	var res = '<div class="conAttributeOutput">' + this.rs + '</div>';
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
	this.cx.lineWidth =2;
	this.edNew(); 
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
	var ind = this.nodes.length; 
	var nn = new flNode();
	nn.initFromTemplate(otherNode, ind, this.nextX, this.nextY); 
	this.nodes.push(nn); 

	// update position to make next node
	this.setMakeSite(this.nextX +5.0, this.nextY+60.0);
	this.selectedNode = ind; 
	this.redraw(); 
	return "made '"+ otherNode.tp + "' node";
}

flGraph.prototype.deleteNode = function(which) {
	// foreach node, foreach input, 
	//    if oNode.nodeID===which disconnect
	// then slice out nodes[which]
}

flGraph.prototype.duplicateNode = function() {
	var ind = this.nodes.length; 
	var nn = new flNode();
	nn.copy(this.nodes[this.selectedNode], ind); 
	this.nodes.push(nn);
	this.selectedNode = ind; 
	this.redraw(); 
}


flGraph.prototype.edNew = function() { 
	this.nodes = []; 
	this.selectedNode = -1; 
	this.nextX = 120.0; // where the next node will be made
	this.nextY = 120.0;
	this.redraw(); 
	return "edNew"; 
}




flGraph.prototype.loadNodes = function() {
	// get file name
	// provide callback
	// start load. 
}

flGraph.prototype.loadNodesCallback= function() {
	// cut file into lines
	// first line is #type space #nodes
	// for each type, give line to create node type
	// for each node, give line to create node
}




flGraph.prototype.edSave = function() { return "edSave"; }
flGraph.prototype.edLoad = function() { return "edLoad"; }

flGraph.prototype.edEvaluate = function() { 
	if (this.selectedNode!=-1) { 
		if (this.nodes[this.selectedNode]) {// well ya better!
			return this.nodes[this.selectedNode].evaluate();
		}
	}
}

///////// using hit tests and their results
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
	return res; // = (ni*10000)+(oi*100)+ii
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
	if (this.selectedNode>-1) {
		return this.nodes[this.selectedNode].getInputsHTML(); 
	} else return "";
}

flGraph.prototype.getOutputsHTML = function() { 
	if (this.selectedNode>-1) {
		return this.nodes[this.selectedNode].getOutputsHTML(); 
	} else return "";
}


// need inputNode, input ind, outut node, out ind
flGraph.prototype.connect = function(iID, iInd, oID, oInd) {
	var msg = this.nodes[iID].connect(iInd, this.nodes[oID], oInd); 
	this.nodes[iID].evaluate();
	return msg; 
}

flGraph.prototype.disconnect = function(nodeID, inputID) {
	this.nodes[nodeID].inputs[inputID].disconnect(); 
	this.nodes[nodeID].evaluate();
}

flGraph.prototype.atrKeyIn = function(nID, inp, val) { 
	this.nodes[nID].inputs[inp].vl = val; 
	this.nodes[nID].evaluate(); 
}

flGraph.prototype.blockKeyIn = function(nID, inp, val) { 
	this.nodes[nID].inputs[inp].vl = val; 
	this.nodes[nID].evaluate(); 
}

flGraph.prototype.atrSelect = function(nID, inp) { 
	var res = " "+this.nodes[nID].inputs[inp].vl; 
}

////// interaction
flGraph.prototype.moveNode = function(hit, nx, ny) {
	var nd = this.nodeOfHit(hit); 
	this.nodes[nd].moveTo(this.cx, nx, ny); 
}
