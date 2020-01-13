
//// requires vMath.js

// webGL apps are in 4 parts? 
//   vertex shader for assempling the scene
//   fragment shader for lighting and textures
//   vertex lists for objects
//   and then something to change stuff frame-to-frame


// for vert and fragment shaders, you build program strings
//   then compile them and select them
//   that first part seems a good match: use Maya materials editor as model

// for vertex lists, eh. lots of repitition and direct manipulation.
//   lots of concatenations
//   make objects and load them from somewhere else. 
//   declare a couple std vx formats. 

// for scene-building, you're making a scene tree, maybe with a partsys. 
//   level design should happen elsewhere. 
//   otoh, parts and machines. 


// web gl wrappers
// image manipulation: init render buffers, switch them, refer to, load, and save images

// vertex lists: load, combine, references into?
// transforms: via mx4; standards. build, combine, modify
//        be aware of needing to do these things in shader code and not JS. 

// shaders: declare/name inputs, vec3/mx4 op refs


// lights: RTFB

///////////////////////////////// color ?


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
