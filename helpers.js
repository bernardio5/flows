/// a library of helper functions for the node editor and its nodes. 
// datetime, fileIO, color, ?

	
function nodeHelpers() { 
	this.dt = new DateTime(); 
	this.content = "";
	this.reader = new FileReader(); 
}

///////////////////////////////// color 
nodeHelpers.prototype.int2ccs = function(num) { // "int to Css Color String"
	 return '#' + n.toString(16).padStart(8, '0'));// pad was 6, ??
}

// take 3 floats 0-1 and return an XRRGGBBAA
nodeHelpers.prototype.rgb2ccs = function(r,g,b,a=1) {
	var temp = r*255;
	temp = (temp*255) + (g*255);
	temp = (temp*255) + (b*255);
	temp = (temp*255) + (a*255);
	return in2css(temp); 
}

nodeHelpers.prototype.hsb2ccs = function(h, s, br, a=1) {
	var r, g, b, i, f, p, q, t; 
	if (s>0.0) { 
		i = (int)(floor(h*6.0)); // which hue zone we're in
		f = h-i; // fraction of hue
		p = br*(1.0-s); // inverse of saturation
		q = br*(1.0-(s*f)); // 
		t = br*(1.0-(s*(1.0-f))); 
		switch (i) {
			case 0: r=br; g=t;  b=p; break; 
			case 1: r=q;  g=br; b=p; break; 
			case 2: r=p;  g=br; b=t; break; 
			case 3: r=p;  g=q;  b=br; break; 
			case 4: r=t;  g=p;  b=br; break; 
			case 5: r=br; g=p;  b=q; break; 
		}
	} else {
		r=br; g=br; b=br; // s==0=>h not used
	}
	return rgb2ccs(r, g, b, a); 
}


///////////////////////////////////// files
nodeHelpers.prototype.dirContents = function() {
	return [];
}

nodeHelpers.prototype.finishWrite = function() { // call back for file-is-written?
	this.content;
}

nodeHelpers.prototype.fileWrite = function(path, content) {
	Reader.readAsText(); 
}

nodeHelpers.prototype.fileRead = function(path, callback) {
	
    this.loaded = 0; 
    this.tiles = new Image(); 
    this.tiles.src = "microTiles.png"; 
    that = this;
    this.tiles.onload= function(that) { that.loaded=1; }
    
	this.reader.onloadend = this.finishRead;
	this.reader.readAsText(); 
}




