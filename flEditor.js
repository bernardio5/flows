
///////////////////////////////////////
// This is the more-or-less well-commented version of the Flows Editor
// (c)2016 Neal McDonald, released under MIT License
// Use it however you like; have a nice day.



// there is only one editor. it has a list of ndoes
// is has the nodemaker. it redraws the canvas. 
// it also does DOM stuff to its HTML page. 

function flEditor(aDoc, aCanvas) {
	this.theDoc = aDoc; 
	this.theCv = aCanvas;
	this.theCx = aCanvas.getContext("2d");

	// THE GRAPH!! 
	this.theG = new flGraph(this.theCx);

	// template nodes
	this.templs = [];
	this.theDrop = aDoc.getElementById("nodeSet"); // dropdown
    this.makersDiv = aDoc.getElementById("makerButtonHolder"); // for the buttons
	this.initStandardNodes(); 

	// user input
	this.keysDown = []; 
	this.mouseStartX =-100.0;
	this.mouseStartY =-100.0;
	this.mouseLastX =-100.0;
	this.mouseLastY =-100.0;
	this.mouseIsDown = false; 
	this.mouseAction = 0; //0:nil 1:bg 2:drag 3:connect
	this.startHit = -1; 

	var i; // can you even make any? huh? 
	for (i=0; i<3; i=i+1) { 
		this.theG.makeNode(this.templs[i])
	}

	this.theText = aDoc.getElementById("messages");
    this.theText.innerHTML = "Editor loads ok!";

    // where to put flIO's for selected node
    this.inputsDiv = aDoc.getElementById("inputsControls");
    this.outputsDiv = aDoc.getElementById("outputsControls");
    
    this.xmlPlace = aDoc.getElementById("XMLpool"); 
    this.ready = true; 
}

/* constants: flIO data types; this.tp is one of these
const FL_N = "FL_N"; // null/error/uninit
const FL_R = "FL_R"; // number
const FL_P = "FL_P"; // proportion  prBase
const FL_S = "FL_S"; // str
const FL_V = "FL_V"; // vector4
const FL_C = "FL_C"; // color "xrrggbb"
const FL_B = "FL_B"; // a beat loop?
const FL_L = "FL_RL";// list of R's
*/
flEditor.prototype.initStandardNodes = function() { 
	//?? sm gp command otype inputType1 iName1 iSymbol defVal1 ... 
	// sure great lets change them all again! 
	// type 0's math
	nd = new flNode(); 
	nd.initTypeFromLine("//?? rdm random 0 Math.random(); FL_R"); 
	this.templs.push(nd); 
	
	nd = new flNode(); 
	nd.initTypeFromLine("//?? t seconds 0 mainDate.getTime(); FL_R"); // requires presence of var mainDate=new Date(); 
	this.templs.push(nd); 
	
	nd = new flNode(); 
	nd.initTypeFromLine("//?? fr frame 0 frameNumber; FL_R"); 
	this.templs.push(nd); 

	nd = new flNode(); 
	nd.initTypeFromLine("//?? li linear 0 ((A*B)+C); FL_R FL_R A A 1.0 FL_R B B 1.0 FL_R C C 1.0"); 
	this.templs.push(nd); 

	nd = new flNode(); 
	nd.initTypeFromLine("//?? sn sine 0 A*Math.sin(T); FL_R FL_R amplitude A 1.0 FL_R T T 0.0"); 
	this.templs.push(nd); 

	nd = new flNode(); 
	nd.initTypeFromLine("//?? cs cosine 0 A*Math.cos(T); FL_R FL_R amplitude A 1.0 FL_R T T 0.0");  
	this.templs.push(nd); 

	nd = new flNode(); 
	nd.initTypeFromLine("//?? tn tangent 0 A*Math.tan(T); FL_R FL_R amplitude A 1.0 FL_R T T 0.0"); 
	this.templs.push(nd); 

	nd = new flNode(); 
	nd.initTypeFromLine("//?? pi pi 0 A*pi+B; FL_R FL_R A A 1.0 FL_R B B 0.0"); 
	this.templs.push(nd); 

	nd = new flNode(); 
	nd.initTypeFromLine("//?? ex exponent 0 Math.pow(A,B); FL_R FL_R mantissa M 1.0 FL_R expn O 1.0 out FL_R ex 0"); 
	this.templs.push(nd);

	// 1 control- buuut what's the output type? bah.
	nd = new flNode(); 
	nd.initTypeFromLine("//?? if if 1 (C!=0)?A:B; FL_R FL_R condition C 1 FL_R main_A A 0 FL_R alternate_B B 0"); 
	this.templs.push(nd); 

	nd = new flNode(); // iterator. requires thought
	nd.initTypeFromLine("//?? itr iterator 1 for(i=A;i<B;i=i+C) FL_R FL_R condition C 1.0 FL_D action A ; out FL_D wh 1"); 
	this.templs.push(nd); 

	// 2 proportion
	nd = new flNode(); 
	nd.initTypeFromLine("//?? ppt prPoint 2 this.pg.point(X,Y); FL_P FL_R X X 0.5 FL_R Y Y 0.5"); 
	this.templs.push(nd); 
	
	nd = new flNode(); 
	nd.initTypeFromLine("//?? pln prLine 2 this.pg.line(P1,P2); FL_P FL_P P1 P1 0 FL_P P2 P2 0"); 
	this.templs.push(nd); 
	
	nd = new flNode(); 
	nd.initTypeFromLine("//?? pci prCircle 2 this.pg.circle(C,R); FL_P FL_P C C 0 FL_P R R 0"); 
	this.templs.push(nd); 

	nd = new flNode(); 
	nd.initTypeFromLine("//?? psg prSegment 2 this.pg.segment(L,P1,P2); FL_P FL_P L L 0 FL_P P1 P1 0 FL_P P2 P2 0"); 
	this.templs.push(nd); 

	nd = new flNode(); 
	nd.initTypeFromLine("//?? par prArc 2 this.pg.arc(C,P1,P2,PN); FL_P FL_P C C 0 FL_P P1 P1 0 FL_P P2 P2 0 FL_P PN PN 0"); 
	this.templs.push(nd); 

	nd = new flNode(); 
	nd.initTypeFromLine("//?? plf prLoft 2 this.pg.loft(S1,S2,C); FL_P FL_P C C 0 FL_P P2 P2 0 FL_C C C xfff"); 
	this.templs.push(nd); 

	// 3 music  
	
	// 4 linear algebra  
	nd = new flNode(); 
	nd.initTypeFromLine("//?? v4 3 vec4(X,Y,Z,W); FL_V FL_R X X 0 FL_R Y Y 0 FL_R Z Z 0 FL_R W W 0"); 
	this.templs.push(nd); 

	nd = new flNode(); 
	nd.initTypeFromLine("//?? m4 3 mx4(R1,R2,R3,R4); FL_M FL_V R1 R1 0 FL_V R2 R2 0 FL_V R3 R3 0 FL_V R4 R4 0"); 
	this.templs.push(nd); 

	nd = new flNode(); 
	nd.initTypeFromLine("//?? lk 3 looking(P,L,U); FL_M FL_R P P 0 FL_R L L 0 FL_R U U 0"); 
	this.templs.push(nd); 

	// 5 webgl  
	
	// 6 colors
	nd = new flNode(); 
	nd.initTypeFromLine("//?? cl 6 color(R,G,B,A); FL_C FL_R R R 0 FL_R G G 0 FL_R B B 0 FL_R A A 0"); 
	this.templs.push(nd); 

	nd = new flNode(); 
	nd.initTypeFromLine("//?? cl 6 color(H,S,B,A); FL_C FL_R H H 0 FL_R S S 0 FL_R B B 0 FL_R A A 0"); 
	this.templs.push(nd); 


	var sels = "<option value='0'>math nodes</option>";
	sels += "<option value='1'>control</option><option value='2'>proportion</option>"
    sels += "<option value='3'>music</option><option value='4'>lin alg</option>";
	sels += "<option value='5'>WebGL</option><option value='6'>color</option>";
	this.theDrop.innerHTML = sels;
	this.setMakerButtons("0"); 
}

flEditor.prototype.getTemplate = function(type) { 
	for (var i=0; i<this.templs.length; ++i) { 
		var nt = this.templs[i]; 
		if (strEq(nt.tp, type)) return nt;
	}
	return false;
}


flEditor.prototype.redraw = function() {
	this.theG.redraw(); 
}

// node buttons column
flEditor.prototype.makeNode = function(type) { 
	var ex = this.getTemplate(type);
	if (!ex) this.theText.innerHTML = "makenode unknown type " + type; 
	this.theText.innerHTML = this.theG.makeNode(ex); 
}


flEditor.prototype.callbackmaker = function(className) {
	return function() { theE.makeNode(className); }
}

flEditor.prototype.setMakerButtons = function(setNumber) {
   	var res = "";
   	var v = parseInt(setNumber); 
	var len = this.templs.length; 
	this.makersDiv.innerHTML = "";
	for (var i=0; i<len; ++i) {
		if (this.templs[i].gp===v) {
			var bd = document.createElement("DIV"); 
			bd.className = "scrNodeButtonHolder";
			var but = document.createElement("BUTTON");
			but.innerText = this.templs[i].lb;
			but.className = "scrNodeButton";
			but.onclick = this.callbackmaker(this.templs[i].tp); 
			bd.appendChild(but);
			this.makersDiv.appendChild(bd);
		}
	}   
}

/*
flNode.prototype.getTypeButton = function() {
	var res = '';
	if (this.tp.length>0) { 
		res = '<div class="scrNodeButtonHolder">' ;
		res += '<button onclick="theE.makeNode("'+this.tp+'");" class="scrNodeButton">';
		res += this.name + '</button></div>';
	}
	return res; 
}
*/

flEditor.prototype.duplicateNode = function() { 
	ex = this.getTemplate(type);
	this.theG.initFromTemplate(ex); 
}

flEditor.prototype.deleteNode = function() { 
	this.theG.deleteNode(); 
}

// main editor button set callbacks
flEditor.prototype.edNew = function() { 
	this.theText.innerHTML = this.theG.edNew(); 
}

flEditor.prototype.edSave = function() {
	this.theText.innerHTML = this.theG.edSave(); 
}

flEditor.prototype.edLoad = function() {
	var txt = "";
	this.theText.innerHTML = this.theG.edLoad(txt); 
}


flEditor.prototype.edContext = function() {
	// but mostly just set divs hidden or not
	this.theText.innerHTML = this.theG.edContext(); 
}

flEditor.prototype.edImport = function() {
	this.theText.innerHTML = this.theG.edImport(); 
}

flEditor.prototype.edEvaluate = function() {
	this.xmlPlace.innerHTML = this.theG.edEvaluate(); 
}


// called from attribute set
flEditor.prototype.disconnect = function(nodeID, inputID) {
	this.theG.disconnect(nodeID, inputID); 
	this.inputsDiv.innerHTML = this.theG.getInputsHTML(); 
	this.outputsDiv.innerHTML = this.theG.getOutputsHTML();
	this.theG.redraw(); 
}

flEditor.prototype.viewIO = function(nodeID, inputID) {
	this.theText.innerHTML = "viewIO: " + nodeID + " " + inputID;
}

flEditor.prototype.atrKeyIn = function(nodeID, inpInd) { 
	var theInpName = "ioIn" + nodeID + inpInd; 
	var theVal = this.theDoc.getElementById(theInpName).value;
	this.theG.atrKeyIn(nodeID, inpInd, theVal); 
	this.outputsDiv.innerHTML = this.theG.getOutputsHTML();
}

flEditor.prototype.atrSelect = function(nodeID, inpInd) { 
	this.theText.innerHTML = this.theG.viewIO(nodeId, inpInd); 
}



// three things to do with the mouse: 
// select, connect, and move nodes
// 
flEditor.prototype.mouseDown = function(evt) {
	var mx, my, i, len, hit; 
	mx = evt.clientX; 
	my = evt.clientY; 
	this.mouseStartX = mx 
	this.mouseStartY = my;
	this.mouseLastX = mx 
	this.mouseLastY = my;

	hit = this.theG.hitTest(mx, my);
	this.startHit = hit; 

	if (hit<0) {
		// clicked on bg, hit no node => bg drag
		this.mouseAction = 1; 
	} else {
		// clicked on a node
		hn = this.theG.nodeOfHit(hit); 
		hi = this.theG.inputOfHit(hit); 
		ho = this.theG.outputOfHit(hit); 
		if ((hi<0) &&(ho<0)) { //body hit; select or start drag
			this.mouseAction=2; 
		}
		if (hi>-1) { // drag from input?
			this.mouseAction=3; 
		}
		if (ho>-1) { // drag from output?
			this.mouseAction=4; 
		}
	}
	//console.log("mouseDown hit:"+this.startHit+" node:"+hn+" hi:"+hi+" ho:"+ho+"action="+this.mouseAction);
}




flEditor.prototype.mouseMove = function(evt) {
	var mx, my, dx, dy, ind; 
	if (this.mouseAction>0) { 
		mx = evt.clientX; 
		my = evt.clientY;
		this.theG.redraw(); 
		switch (this.mouseAction) { 
			case 1: 	
				// move all? drag a select box? selection of many? 
				break; // drag bg 
			case 2:
				ind = this.startHit[0];  	
				this.theG.moveNode(this.startHit, mx, my); 
				break; // drag node
			case 3: 	
			case 4: 	
				this.theCx.strokeStyle = "#888888"; 
				this.theCx.beginPath(); 
				this.theCx.moveTo(this.mouseStartX, this.mouseStartY); 
				this.theCx.lineTo(this.mouseLastX, this.mouseLastY);
				this.theCx.stroke(); 				
				this.theCx.strokeStyle = "#000"; 
				this.theCx.beginPath(); 
				this.theCx.moveTo(this.mouseStartX, this.mouseStartY); 
				this.theCx.lineTo(mx,my);
				this.theCx.stroke(); 
				break; // connect
		}
		this.mouseLastX = evt.clientX; 
		this.mouseLastY = evt.clientY; 
		//console.log("move action:"+this.mouseAction+" m:"+mx+","+my);
	}
}



flEditor.prototype.inputConnect = function(h1, h2) { 
	// h1 known input
	var h1n, h1i, h2n, h2i, h2o; 
	h1n = this.theG.nodeOfHit(h1); 
	h1i = this.theG.inputOfHit(h1); 

	h2n = this.theG.nodeOfHit(h2); 
	h2i = this.theG.inputOfHit(h2); 
	h2o = this.theG.outputOfHit(h2); 

	if (h2n<0) { 
		 this.theText.innerHTML = "no second node";
		 return; 
	} // no second node
	if (h2i>0) { 	 
		this.theText.innerHTML = "can't connect 2 inputs";
		return; 
	} 
	if (h2o<0) { 
		this.theText.innerHTML = "no output";
		return; 
	} // no ouput 
	if (h1n===h2n) {  	 
		this.theText.innerHTML = "can't connect to yourself";
		return; 
	} // can't connect to yourself (for now?)

	this.theText.innerHTML = this.theG.connect(h1n, h1i, h2n, h2o);
	this.inputsDiv.innerHTML = this.theG.getInputsHTML(); 
	this.outputsDiv.innerHTML = this.theG.getOutputsHTML();
	this.theG.redraw(); 
}


flEditor.prototype.outputConnect = function(h1, h2) { 
	// h2 known output; need an input
	var h1n, h1i, h1o, h2n, h2o; 

	h1n = this.theG.nodeOfHit(h1); 
	h1i = this.theG.inputOfHit(h1); 
	h1o = this.theG.outputOfHit(h1); 

	h2n = this.theG.nodeOfHit(h2); 
	h2o = this.theG.outputOfHit(h2); 

	if (h1n<0) { 
		 this.theText.innerHTML = "no second node";
		 return; 
	} // no second node
	if (h1o>0) {  	 
		this.theText.innerHTML = "con't connect 2 outputs";
		return; 
	} // can't connect 2 outputs
	if (h1i<0) {  	 
		this.theText.innerHTML = "no inputs";
		return; 
	 } // no input
	if (h1n===h2n) {  	 
		this.theText.innerHTML = "can't connect 2 yourself";
		return; 
	} // can't connect to yourself (for now?)

	this.theG.connect(h1n, h1i, h2n, h2o);
	this.inputsDiv.innerHTML = this.theG.getInputsHTML(); 
	this.outputsDiv.innerHTML = this.theG.getOutputsHTML();
	this.theG.redraw(); 
}



flEditor.prototype.mouseUp = function(evt) {
	var mx, my, i, len, hit; 
	mx = evt.clientX;// - rect.left; 
	my = evt.clientY;// - rect.top; 
	hit = this.theG.hitTest(mx, my); 
	dx = this.mouseStartX - mx; 
	dy = this.mouseStartY - my; 

	if (hit>-1) { 
		this.theG.select(hit);
		this.inputsDiv.innerHTML = this.theG.getInputsHTML(); 
		this.outputsDiv.innerHTML = this.theG.getOutputsHTML();
	}

	if (this.mouseAction===3) { // start in input
		this.inputConnect(this.startHit, hit);
	}

	if (this.mouseAction===4) { // start in output 
		this.outputConnect(hit, this.startHit);
		// if it's up in anything but an output, of the right type, ..
	}

	this.startHit = -1;
	this.mouseAction = 0; 
	this.redraw(); 
}




