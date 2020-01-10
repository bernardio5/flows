
///////////////////////////////////////
// This is the more-or-less well-commented version of the Proportion Library. 
// (c)2013 Neal McDonald, released under MIT License
// Use it however you like; have a nice day.

// There are two classes defined below: base and page. 
// prBase objects can be points, lines, or circles, which are used to build figures, 
//   or segments and arcs, which mark parts of lines or circles for drawing, 
//   or lofts, which allow you fill areas of the drawing with color. 

// The points, lines, and circles can interact. You can use points to define lines and circles, 
// and intersect lines and circles to define points.

// prPage provides the interface for the whole system, and contains all the prBase. 

// coords: the page takes normalized coords; 0,0 is top-left, and 1,1 is bottom-right. 
// canvas aspect ratio might impact construction success; caveat aedicicator. 

// Normal usage, if you're animating, is to clear the canvas every time you redraw, 
// and rebuild from scratch.  Doing otherwise is generally not a time-saver, computationally,
// and if the canvas size changes, ... 


//////////////////////////////////// 
// constant definitions / enum ts
// allowed values for "t"

// allowed values for prBase.t
const PR_N = 0;  // null
const PR_P = 1;  // point
const PR_L = 2;  // line
const PR_C = 3;  // circle
const PR_S = 5;  // segment -- part of a line
const PR_A = 6;  // arc -- part of a circle
const PR_F = 7;  // loft

const PR_E = 0.000000025; // the number that is basically zero
const PR_2P = 6.28318530272959; // Math.PI * 2

////////////////////////////////////////////////////////////

// prBase: prPages (below) have an array of points, lines and circles
// I could make one object that represents all three, or have a base parent class...

function prBase() { 
	this.t = PR_N; 			// type: null, pt, line, circle, parameter, segment, arc, or loft  
	this.x = 0.0;			// position of points, p1 of lines, centers of circles
	this.y = 0.0;
    this.x2 = 0.0;			// unused for points. lines and circles are set by two points, A and B.
    this.y2 = 0.0;			// x2,y2 = A-B
    this.r = 0.0;			// length of segments and lines, radius of arcs and circles
    this.g = 0;				// render group
	this.p0 = 0.0; 			// arc scan start parameter 
	this.dp = 0.01; 		// arc scanning parameter 
}
// t, r, and g are always used the same way
// PR_N: nothing else is used
// PR_P: (x,y) are coords
// PR_L: (x,y) is one end, (x+x2,y+y2) is the other. r is distance between them
// PR_C: (x,y) is the center, (x+x2,y+y2) is on the circle  
// PR_S: a mark! copies a line, xy, x2y2 give the endpoints, and the parameter is 0-1
// PR_A: a mark! as circles, but "dp" gives the parameter going around the arc
//    scan with t going 0-1, points of arc given by x,y+(rcos(p0+t*dp),rsin(p1+t*dp))
//    for lofting, vary t by 1/r?
// PR_F: x=one mark's index into a page, y=other mark. 


prBase.prototype.cp = function (it) {  // "copy" function
	this.t = it.t;
	this.x = it.x;
	this.y = it.y;
	this.x2 = it.x2;
	this.y2 = it.y2;
	this.r = it.r;
	this.g = it.g;
	this.p0 = it.p0; 
	this.dp = it.dp; 
}
    
	
prBase.prototype.cl = function ()  { // "clear" function
	this.t = PR_N; 
	this.x = 0.0;			
	this.y = 0.0;
    this.x2 = 0.0;
    this.y2 = 0.0;
    this.r = 0.0;			
    this.g = 0;
	this.p0 = 0.0;
	this.dp = 0.01;
}



prBase.prototype.ec = function(label) { // "echo"
	var displayStr = label + "t:" + this.t + " x:" + this.x + " y:"; 
	displayStr += this.y + "  x2:" + this.x2 + " y2:" + this.y2 + "    r:" + this.r;
	displayStr += "  g:" + this.g + " p0:" + this.p0+ " dp:" + this.dp;
	console.log(displayStr); 
}

///////////// Mark-rendering helper functions
 prBase.prototype.sX = function(u) { // segment X coord for parameter u
	return this.x + (this.x2*u);  
}

prBase.prototype.sY = function(u) { // segment y coord
	return this.y + (this.y2*u);  
}

// note that 2pi is scaled in; u is expected 0<u<1
prBase.prototype.aX = function(u) { // arc X coord for parameter u
	return this.x + (this.r*Math.cos(PR_2P *(this.p0 + (this.dp * u))));  
}

prBase.prototype.aY = function(u) { // arc Y
	return this.y + (this.r*Math.sin(PR_2P *(this.p0 + (this.dp * u))));  
}



//"trace": draw to screen in default manner
prBase.prototype.tr = function(context) { 
	var n, p, plim, pct, p1x, p1y; 
	switch (this.t) {
        case PR_P:
		    context.moveTo(this.x+3.0 , this.y); 
            context.arc(this.x, this.y, 3.0,0.0, PR_2P);
            break;
        case PR_L:
			context.moveTo(this.x-(200.0*this.x2), this.y-(200.0*this.y2)); 
			context.lineTo(this.x+(200.0*this.x2), this.y+(200.0*this.y2));
            break;
        case PR_C:
			context.moveTo(this.x+this.r , this.y); 
            context.arc(this.x, this.y, this.r, 0.0, PR_2P);
            break;
        case PR_S:
			context.moveTo(this.x, this.y); 
			context.lineTo(this.x+this.x2, this.y+this.y2);
            break;
        case PR_A: // the JS "arc" command does not suit me for lofting
			p1x = this.aX(0.0); 
			p1y = this.aY(0.0);
			context.moveTo(p1x, p1y);
			if (this.dp>0.0) { plim = 1.0; } // FIXME; no need to swap, do better pct
			else { plim = -1.0; }
			pct = (plim / 50.0);
			p = 0.0;
			for (n=0.0; (n*n)<=1.0; n=n+pct) { 
				p1x = this.aX(n); 
				p1y = this.aY(n)
				context.lineTo(p1x, p1y);
			}
			break;
		// PR_F is not drawn here; it needs the page's list of prBase
	}
}
    
    
    
/////////////////// utilities-- private
    
// returns 1 if "this" is a point
prBase.prototype.isaP = function () {
	var res = 0;
	if (this.t == PR_P) {
		res = 1;
	}
	return res;
}
    

// returns 1 if points it and this are very close
// note: doesn't check type. 
prBase.prototype.eqP = function (it) {
	var dx, dy, len; 
	var res = 0;
	dx = this.x-it.x;
	dy = this.y-it.y;
	len = dx*dx+dy*dy;
	if (len<PR_E) {
		res=1;
	}
	return res;
}


// returns 0 unless p1 and p2 are in the same place
prBase.prototype.eqs = function(x1,y1,x2,y2) {
	var res = 0; 
	if (Math.sqrt(((x2-x1)*(x2-x1))+((y2-y1)*(y2-y1)))<PR_E) { res = 1; }
	return res; 
}


// return angle in radians that p2-p1 makes with the x-axis 
//  can't work if points are the same!
// returns 0<=ang<=2pi, or -1 for error
prBase.prototype.ang = function(x1,y1,x2,y2) {
	var dx = x2-x1; 
	var dy = y2-y1; 
	var len = Math.sqrt(dx*dx+dy*dy); 
	if (len<PR_E) { return -1.0; } // error: coincident points.
	var res = Math.acos(dx/len); 
	if (dy<0.0) { res = PR_2P - res; }
	return res; 
}

// take a maximum facet length, maxd. 
// return a dt for the parameters that deliver that  
prBase.prototype.scanLength = function(maxd) {
	var dp; 
	var res = (maxd / this.r); 
	if (this.t == PR_A) { 
		res /= PR_2P; 
	}
	res *= (this.t2 - this.t1); 
	return res;
}



////////// closest-points!
// this as opposed to calling them "point on"-- numerical
// self is line or circle; returns parameter of point on object closest to

// "closest point on line"
// return the parameter of the point on the object closest to p
prBase.prototype.cpoL = function (pt) {
	var dx, dy; 
	var res = 0.0;
	if (this.r>PR_E) {
		dx = pt.x - this.x;
		dy = pt.y - this.y;
		res = ((dx*this.x2) + (dy*this.y2))/(this.r*this.r); // a parameter, but an incorrect one
	} // else self is not really a line; problematic! and t should==0
	return res;
}

// "closest point on circle"
prBase.prototype.cpoC = function (pt) {
    var ang = this.ang(this.x, this.y, pt.x, pt.y);
    var res = -1.0;
    if (ang>-0.5) {
    	res = (ang/PR_2P) - this.p0;
    	if (res<0.0) { res +=1.0; }
	}
	return res;
}


// "closest parametric point"
prBase.prototype.cPP = function (pt) {
	var res = 0.0;
	if (this.t!=PR_P) {
		switch (this.t) {
			// case PR_P: res = 0.0; break;
			case PR_L:
				res = this.cpoL(pt);
				break;
			case PR_C:
				res = this.cpoC(pt);
				break;
		}
	}
	return res;
}





///////////////////////////////////////////////////
// "Set As" functions
// there are many functions that "set (this) as X"

// set as Point
prBase.prototype.saP = function (xin, yin) {  // set as point
	this.t = PR_P;
	this.x = xin;
	this.y = yin;
	// the other members are set by the constructor
}


// set as point from another point -- maybe never used?
prBase.prototype.saPP = function ( pt, tin) {
	this.t = PR_P;
	this.x = pt.x;
	this.y = pt.y;  
}


// given line, line parameters, set this as a point on that line
prBase.prototype.saPL = function ( ln,  tin) {
	this.t = PR_P;
	this.x = ln.sX(tin);
	this.y = ln.sY(tin);
}


// set as point on circle
prBase.prototype.saPC = function ( ck,  tin) {
	this.t = PR_P;
	this.x = ck.aX(tin);  // implies that both circles and arcs need p0 dp's set
	this.y = ck.aY(tin);
}


// set as parametric --
prBase.prototype.saPm = function ( ob,  tin) {
	switch (ob.t) {
		case PR_P:
			this.saPP(ob, tin); 
			break;
		case PR_L:
			this.saPL(ob, tin);
			break;
		case PR_C:
			this.saPC(ob, tin);
			break;
		case PR_S: 
			this.saPL(ob, tin);
			break;
		case PR_A:
			this.saPC(ob, tin);
			break;
	}
}

// taking a prBase of type PR_T-- never used; PR_T's are gone? 
prBase.prototype.saPmO = function(ob, tob) { 
	this.saPm(ob, tob.t1); 
}





// set as line
prBase.prototype.saL = function (xin, yin, x2in, y2in) {
	this.t = PR_L;
	this.x = xin;
	this.y = yin;
	this.x2 = x2in-this.x;
	this.y2 = y2in-this.y;
	this.r = Math.sqrt(this.x2*this.x2+this.y2*this.y2);
	if (this.r<PR_E) { // if the two points are the same, it's really a point
		this.t = PR_P;
	}
}


// set as circle
prBase.prototype.saC = function (xin, yin, x2in, y2in) {
	this.t = PR_C;
	this.x = xin;
	this.y = yin;
	this.x2 = x2in-this.x;
	this.y2 = y2in-this.y;
	this.r = Math.sqrt(this.x2*this.x2+this.y2*this.y2);
	if (this.r<PR_E) { // points same? return a point.
		this.t = PR_P;
	} else { 
		this.p0 = this.ang(xin, yin, x2in, y2in);
		this.p0 /= PR_2P;
		this.dp = 1.0;
	}
}


// set as parametric segment, define endpoints using parameters
prBase.prototype.sapS = function (lineIn, t1in, t2in) {
	var nx1, ny1, nx2, ny2; 
	if (((t1in-t2in)*(t1in-t2in))>PR_E) {
		this.cp(lineIn); 	// copy the input line
		nx1 = this.sX(t1in); // but the parameters give the new endpoints
		ny1 = this.sY(t1in); 
		nx2 = this.sX(t2in); 
		ny2 = this.sY(t2in); 
		this.t = PR_S; 		// then tweak. 
		this.x = nx1; 
		this.y = ny1; 
		this.x2 = nx2-nx1; 
		this.y2 = ny2-ny1; 
	} else {
		this.t = PR_N; // if the points coincide, no mark.
	}
}


// set as segment using points; project the points onto the line, 
// then define the segment using them. 
prBase.prototype.saS = function (lineIn, p1, p2) {
	var t1 = lineIn.cpoL(p1); // t1,t2= parameters of p1,p2 
	var t2 = lineIn.cpoL(p2); 
	this.sapS(lineIn, t1, t2);  
}




// set as parametric arc, using 3 parametric points on a circle
// t1 and t3 give arc ends, but that gives 2 arcs! 
// we want the arc that sweeps through t2/p2 
prBase.prototype.sapA = function (circleIn, t1in, t2in, t3in) {
	this.t=PR_A; 
	// normalize t1t2t3 to be 0<t<1
	var t1 = t1in - Math.floor(t1in); 
	if (t1<0.0) { t1 += 1.0; }
	var t2 = t2in - Math.floor(t2in); 
	if (t2<0.0) { t2 += 1.0; }
	var t3 = t3in - Math.floor(t3in);
	if (t3<0.0) { t3 += 1.0; }
	// fail if there are not 2 different points
	var s1 = t3-t1; 
	var s2 = t3-t2;
	if ((s1*s1<PR_E)&&(s2*s2<PR_E)) { this.t = PR_N; }
	if (this.t!=PR_N) {
		this.cp(circleIn);  // start out as a a circle
		this.t=PR_A; 
		// preserve radius & set 0-angle to be through t1
		this.x2 = this.r * Math.cos(t1 * PR_2P);
		this.y2 = this.r * Math.sin(t1 * PR_2P);
	
		if (((t1<t2)&&(t2<t3)) || ((t1>t2)&&(t2>t3))) { // no 0 crossing
			this.p0 = t1; this.dp = t3-t1;
		} else {
			if (t1<t3) { // cross 0 going down
				this.p0 = t1; this.dp = (t3-1.0) - t1;
			} else { // cross 0 going up
				this.p0 = t1-1.0; this.dp = t3 - (t1-1.0); 
				// could add 1 to dp, but that makes a second test for aX() aY()
			}
		}	
		/* recast t2 and t3 st t1==0 
		t2 = t2 - t1; 
		if (t2<0.0) { t2 += 1.0; }
		t3 = t3 - t1;
		if (t3<0.0) { t3 += 1.0; }

		if (this.t==PR_A) {
			this.p0 = t1; 
			if (t2<t3) {
				this.dp = t3;
			} else {
				this.dp = t3-1.0; 
			}
		}*/
	}
}


// set as arc, using points to define the arc. the norm; how Euclid would do it!
prBase.prototype.saA = function (circleIn, p1,p2,p3) {
	var t1 = this.ang(circleIn.x, circleIn.y, p1.x, p1.y);
	var t2 = this.ang(circleIn.x, circleIn.y, p2.x, p2.y);
	var t3 = this.ang(circleIn.x, circleIn.y, p3.x, p3.y);	
	// failure cause: any of p1,p2,p3, being coincident with circle center
	this.t = PR_A; 
	if (t1<0.0) { this.t = PR_N; }
	if (t2<0.0) { this.t = PR_N; }
	if (t3<0.0) { this.t = PR_N; }
	if (this.t!=PR_N) {
		this.sapA(circleIn, t1/PR_2P, t2/PR_2P, t3/PR_2P); // note 2pi factored out
	}
}





// set as loft: 
// inputs are the indices into the prPage of the marks that bound
// the loft. So, most of the code for lofting lives in prPage. 
// NOTE GIVE INDICES, NOT OBJECTS
prBase.prototype.saF = function (mark1, mark2) {
	this.t = PR_F; 
	this.x = mark1; 
	this.y = mark2;
}






///////////////////////////////////////////////////
// helpers for intersection

// there are 0, 1, or 2 intersections of points, lines, and circles.
// points don't intersect things; use "closestPointOn" and "pointAlong"
// (I thought about adding paraboloids... many many more cases).

// "closer" takes three points, and picks one, which is the basis for designating
// a point as "first" or "second"

// the intersect routines take two lines or circles and returns the number of
// intersections, returning both points in a prBase.

///// "closer"
// returns 0 if only self is a point, or not even
// returns 1 if only self and 1 are points
// returns 2 if only self and 2 are points
// returns 1 if all are points, and 1 is closer to self than 2
// returns 2 if 2 is closer
// returns 1 is they are equidistant and 1 is on top
// returns 2 is they are equidistant and 2 is on top
// returns 1 is they are equidistant and level and 1 is leftmost
// returns 2 is they are equidistant and level and 2 is leftmost
// otherwise, return 1

prBase.prototype.closer = function ( ob1,  ob2,  ob3) {
	var a, b, c, dx, dy, ac, bc; 
	var res = 1;
	
	a = ob1.isaP();
	b = ob2.isaP();
	c = ob3.isaP();
	
	if ((c==0)||((a==0)&&(b==0))) {
		res = 0;
	}
	else {
		if ((a==1)&&(b==0)) {
			res = 1;
		}
		else if ((a==0)&&(b==1)) {
			res = 2;
		}
		else {
			// a, b, and c are points
			dx = ob1.x - ob3.x;
			dy = ob1.y - ob3.y;
			ac = Math.sqrt(dx*dx+dy*dy);
			
			dx = ob2.x - ob3.x;
			dy = ob2.y - ob3.y;
			bc = Math.sqrt(dx*dx+dy*dy);
			dx = (ac-bc)*(ac-bc);
			if (dx>PR_E) { // the distances are different
				if (ac<bc) {
					res =1;
				}
				else {
					res = 2;
				}
			}
			else { // the distances are the same
				dy = ob1.y - ob2.y;
				if (dy*dy>PR_E) {
					if (ob1.y < ob2.y) {
						res = 1;
					}
					else {
						res = 2;
					}
				}
				else { // the heights are the same
					dx = ob1.x - ob2.x;
					if (dx*dx>PR_E) {
						if (ob1.x < ob2.x) {
							res = 1;
						}
						else {
							res = 2;
						}
					}
					else {
						// ob2=ob3
						res = 1;
					}
				}
			}
		}
	}
	
	return res;
}



/// iLL, iLC, and iCC intersect this and an input prBase with each other. 
// they return an integer (the number of intersections), and a special, 
// abused prBase that has the first intersection in x,y and the second in x2, y2

// intersect self, as a line, with the input line; set pt if there is one
// the algorithm is from Mathematica notebook, included as linelineA.jpg
prBase.prototype.iLL = function ( line,  pt) {
	var xa, xb, xc, xd, ya, yb, yc, yd, res; 
	var det = [ 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]; 
	res = 0;
	xa = this.x;
	xb = this.x + this.x2;
	ya = this.y;
	yb = this.y + this.y2;
	xc = line.x;
	xd = line.x + line.x2;
	yc = line.y;
	yd = line.y + line.y2;
	
	det[0] = xa*yb - xb*ya;
	det[1] = xc*yd - xd*yc;
	det[2] = (xa-xb);
	det[3] = xa - xb;
	det[4] = xc - xd;
	det[5] = ya-yb;
	det[6] = yc-yd;
	
	det[7] = (det[3]*det[6]) - (det[4]*det[5]);
	if ((det[7]*det[7])>PR_E) {
		det[8] = (det[0]*det[4]) - (det[1]*det[3]);
		det[9] = (det[0]*det[6]) - (det[1]*det[5]);
		
		pt.t = PR_P;
		pt.x = det[8] / det[7];
		pt.y = det[9] / det[7];
		res = 1;
	}
	else { // || or colinear
		res = 0;
	}
	
	return res;
}


// intersect self, as circle, with line
// from Mathematica Notebook, lineCircle.jpg
prBase.prototype.iLC = function ( line,  pt) {
	var dx, dy, dr2, r2, lx1, lx2, ly1, ly2, D, disc, sgndy, absdy;
    var res = 0;
	
	lx1 = line.x - this.x;
	ly1 = line.y - this.y;
	lx2 = (line.x+line.x2) - this.x;
	ly2 = (line.y+line.y2) - this.y;
	
	res = 1;
	dx = lx2-lx1;
	dy = ly2-ly1;
	dr2 = dx*dx+dy*dy;
	r2 = this.r * this.r;
	D = (lx1*ly2)-(lx2*ly1);
	
	disc = (r2 * dr2) - (D*D);
	sgndy = 1;
	if (dy<0) {
		sgndy = -1;
	}
	absdy = dy;
	if (absdy<0.0) {
		absdy *= -1.0;
	}
	
	if (disc<0.0) { // no intersection
		res = 0;
	}
	else {
		if (disc*disc<PR_E) { // line is tangent
			pt.x = (D * dy) / dr2;
			pt.y = (-1.0 * D * dx) / dr2;
			res = 1;
		}
		else { // disc is well-greater than 0; two intersections
			pt.x = ((D * dy) + (sgndy * dx * Math.sqrt(disc))) / dr2;
			pt.y = ((-1.0 * D * dx) + (absdy * Math.sqrt(disc))) / dr2;
			pt.x2 = ((D * dy) - (sgndy * dx * Math.sqrt(disc))) / dr2;
			pt.y2 = ((-1.0 * D * dx) - (absdy * Math.sqrt(disc))) / dr2;
			pt.x += this.x;
			pt.y += this.y;
			pt.x2 += this.x;
			pt.y2 += this.y;
			res = 2;
		}
	}
	return res;
}


// intersect self, as circle, with circle
// circcirc.jpg, Mathematica Notebook
prBase.prototype.iCC = function (cr,  pt) {
	var dx, dy, rsum, sep, crx, cry, a, b, c;
    var res = 0;
	
	rsum = this.r + cr.r;
	dx = this.x - cr.x; // dxy= connection c1 to c2
	dy = this.y - cr.y;
	sep = Math.sqrt(dx*dx+dy*dy);
	if (sep>PR_E) { // the centers are not the same
		if (rsum<sep) {
			// can't touch; return null
			res = 0;
		}
		else {
			if ( ((rsum-sep)*(rsum-sep)) < PR_E) {
				// touch at one spot, which is self.r away from self.center
				// along dxy
				pt.x = this.x + (dx*this.r/sep);
				pt.y = this.y + (dy*this.r/sep);
				res = 1;
			}
			else {
				// there are two points of contact.
				res = 2;
				// two triangles, r1sq=csq+asq and r2sq=bsq+asq
				// also, b+c=seperation,
				c = (0.5*sep) - ((this.r*this.r*0.5)/sep) + ((cr.r*cr.r*0.5)/sep);
				b = sep - c;
				a = Math.sqrt(this.r*this.r - b*b);
				
				
				dx /= sep;
				dy /= sep;
				crx = -dy;
				cry = dx;
				
				pt.x = this.x - (dx*b) + (crx*a);
				pt.y = this.y - (dy*b) + (cry*a);
				pt.x2 = this.x - (dx*b) - (crx*a);
				pt.y2 = this.y - (dy*b) - (cry*a);
			}
		}
	}
	return res;
}



// returns 0 if there is no (new) point, ow= the number of intersection points: 1 or 2.
// calling fns use "closer" to choose which is first and which second.
prBase.prototype.intersect = function (it,  pt) {
	var res = 0;
	var tcases = this.t*10 + it.t; 
	
	switch (tcases) {
		case PR_L*10 + PR_L:
			res = this.iLL(it, pt);
			break;
		case PR_L*10 + PR_C:
			res = it.iLC(this, pt);
			break;
		case PR_C*10 + PR_L:
			res = this.iLC(it, pt);
			break;
		case PR_C*10 + PR_C:
			res = this.iCC(it, pt);
			break;
		default: 
			// intersections with points, parameters, marks, 
			//and lofts return nothing. 
			break; 
	}
	if (res!=0) {
		pt.t = PR_P;
	}
	return res;
}



// set as first intersection
prBase.prototype.saFI = function (obj1,  obj2,  target) {
	var count, which; 
	
	var pt1 = new prBase();
	var pt2 = new prBase();
	
	count = obj1.intersect(obj2, pt1);
	switch (count) {
		case 0:
			this.t = PR_N;
			break;
		case 1:
			this.saP(pt1.x, pt1.y);
			break;
		case 2:
			pt2.saP(pt1.x2, pt1.y2);
			which = this.closer(pt1, pt2, target);
			if (which==2) {
				this.saP(pt2.x, pt2.y);
			}
			else {
				this.saP(pt1.x, pt1.y);
			}
			break;
	}
}

// set as second intersection
prBase.prototype.saSI = function (obj1,  obj2,  target) {
	var count, which; 
	var pt1 = new prBase();
	var pt2 = new prBase();
	
	count = obj1.intersect(obj2, pt1);
	switch (count) {
		case 0:
		case 1:
			this.t = PR_N;
			break;
		case 2:
			pt2.saP(pt1.x2, pt1.y2);
			which = this.closer(pt1, pt2, target);
			if (which==2) {
				this.saP(pt1.x, pt1.y);
			}
			else {
				this.saP(pt2.x, pt2.y);
			}
			break;
	}
}






// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
 



function prPage(context) { 
	this.cx = context;
	this.cxw = context.canvas.width;
	this.cxh = context.canvas.height;
	
	this.objs = new Array();
	
	this.objs[0] = new prBase; // default is 0== null point; useful! I think.
	this.objCount = 1; 

	// iteration through grouped objs
	this.itC = 0; // index of last returned thing in objs[]
	this.itG = 0; // group being iterated over

	// all prBase have a group number. the group number should 
	// for pt, line, circle, segment & arc, it's the line color
	this.groupColors = [];
	this.groupColors[0] = "#fff"; // 0 is the background group
	this.groupColors[1] = "#000";
	this.currentGroup = 1; // new prBase are given this group number.
	// use -1 as a group if you don't want something drawn. 
}



prPage.prototype.setGroupColor = function(group, color) {
	this.groupColors[group] = color;
}

prPage.prototype.setPageColor = function(group, color) {
	this.groupColors[0] = color;
}

prPage.prototype.setCurrentGroup = function(group) {
	this.currentGroup = group; 
}

prPage.prototype.setGroup = function(obj, group) {
	this.objs[obj].g = group; 
}

prPage.prototype.redraw = function() {
	var i, j, gc, objCt, ob, m1, m2; 
	gc = this.groupColors.length; // group count
	objCt = this.objCount;  

	// erase
	this.cx.fillStyle = this.groupColors[0];
	this.cx.beginPath();
	this.cx.rect(0,0, this.cxw, this.cxh);
	this.cx.fill();

	for (i=1; i<gc; i=i+1) { // for each group; group 0=not drawn
		this.cx.strokeStyle = this.groupColors[i];
		this.cx.beginPath();
		for (j=1; j<objCt; j=j+1) { 
			ob = this.objs[j]; 
			if ((ob.g===i)&&(ob.t!=PR_N)&&(ob.t!=PR_F)) { 
				this.objs[j].tr(this.cx);
			}
			if ((ob.g===i)&&(ob.t==PR_F)) {
				m1 = this.objs[j].x; 
				m2 = this.objs[j].y;
			}
		}
		this.cx.stroke(); 
	}
}


/////////////////////// convenience
prPage.prototype.copy = function(it) {
	var i;
	this.cx = it.cx; 
	this.bg = it.bg; 
	this.cxw = it.cx.canvas.width; 
	
	for (i=0; i<it.objCount; ++i) {
		this.objs[i] = new prBase(); 
		this.objs[i].cp(it.objs[i]);
	}
	this.objCount = it.objCount;
	this.iteratorCounter = it.iteratorCounter; 
	this.iteratorTag = it.iteratorTag; 
}


prPage.prototype.clear = function() {
	this.objCount = 1;
	this.iteratorCounter = 0;
}


prPage.prototype.merge = function(it) {
	var i, mx;
	mx = this.objCount; 
	for (i=0; i<it.objCount; ++i) {
		this.objs[mx+i] = new prBase; 
		this.objs[mx+i].copy(it.objs[i]);
	}
	this.objCount += it.objCount;
}


/////////////////////// debugging and tracing
prPage.prototype.echo = function() {
	var i=0;
	for (i=0; i<this.objCount; ++i) {
		// print(i);
		this.objs[i].ec(i+":");
	}
}


prPage.prototype.echoOne =  function(which) {
	var i=0;
	if ((which>0)&&(which<this.objCount)) {
		this.objs[which].ec(which + ":") ;
	}
}






///////////////////// adding prBase
/// error checks
prPage.prototype.isAPoint = function(ob) { 
	var res = 0;
	if ((0<ob)&&(ob<this.objCount)) {  // 0<ob<objCount
		if (this.objs[ob]) {  // there is an obj at objs[ob]    
			if (this.objs[ob].t==PR_P) { // is a point
				res = 1;
			}
		}
	}
	return res;
}
prPage.prototype.isALine = function(ob) { 
	var res = 0;
	if ((0<ob)&&(ob<this.objCount)) {  // 0<ob<objCount
		if (this.objs[ob]) {  // there is an obj at objs[ob]  
			if (this.objs[ob].t==PR_L) { // is a line
				res = 1;
			}
		}
	}
	return res;
}
prPage.prototype.isACircle = function(ob) { 
	var res = 0;
	if ((0<ob)&&(ob<this.objCount)) {  // 0<ob<objCount
		if (this.objs[ob]) {  // there is an obj at objs[ob]  
			if (this.objs[ob].t==PR_C) { // is a circle
				res = 1;
			}
		}
	}
	return res;
}
prPage.prototype.isASegment= function(ob) { 
	var res = 0;
	if ((0<ob)&&(ob<this.objCount)) {  // 0<ob<objCount
		if (this.objs[ob]) {  // there is an obj at objs[ob]   
			if (this.objs[ob].t==PR_S) { // is a segment
				res = 1;
			}
		}
	}
	return res;
}
prPage.prototype.isAnArc= function(ob) { 
	var res = 0;
	if ((0<ob)&&(ob<this.objCount)) {  // 0<ob<objCount
		if (this.objs[ob]) {  // there is an obj at objs[ob]  
			if (this.objs[ob].t==PR_A) { // is an arc
				res = 1;
			}
		}
	}
	return res;
}
prPage.prototype.isAMark= function(ob) { 
	var res = 0;
	if ((0<ob)&&(ob<this.objCount)) {  // 0<ob<objCount
		if (this.objs[ob]) {  // there is an obj at objs[ob]  
			if (this.objs[ob].t==PR_S) { // is a segment
				res = 1;
			}
			if (this.objs[ob].t==PR_A) { // is an arc
				res = 1;
			}
		}
	}
	return res;
}
prPage.prototype.isALoft= function(ob) { 
	var res = 0;
	if ((0<ob)&&(ob<this.objCount)) {  // 0<ob<objCount
		if (this.objs[ob]) {  // there is an obj at objs[ob]  
			if (this.objs[ob].t==PR_S) { // is a segment
				res = 1;
			}
			if (this.objs[ob].t==PR_A) { // is an arc
				res = 1;
			}
		}
	}
	return res;
}
prPage.prototype.isAnObject= function(ob) { 
	var res = 0;
	if ((0<ob)&&(ob<this.objCount)) {  // 0<ob<objCount
		if (this.objs[ob]) {  // there is an obj at objs[ob]   
			res = 1;
		}
	}
	return res;
}



// you won't need to add NULL; it's always objs[0]
// to add given lines, add given points, and then draw lines through them
prPage.prototype.given = function(x, y) {
    var res = this.objCount; // Rudy: can't fail!
    this.objs[res] = new prBase(); 
	this.objs[res].saP(x* this.cxw, y*this.cxh); 
	this.objs[res].g = this.currentGroup;
	++this.objCount; 
	return res;
}
prPage.prototype.addGivenPoint = prPage.prototype.given; 
prPage.prototype.point = prPage.prototype.given; 
//?? prpt point 0 2 prPage.point(N) FL_V FL_R N N 0


// two points only.
prPage.prototype.line = function(ob1, ob2) {
	var res = this.objCount;
	if (this.isAPoint(ob1)==0) { console.log("addLine: argument 1 is not a point"); res=0; }
	if (this.isAPoint(ob2)==0) { console.log("addLine: argument 2 is not a point"); res=0; }
	if (res===this.objCount) {
		this.objs[res] = new prBase;
		this.objs[res].saL(this.objs[ob1].x, this.objs[ob1].y, this.objs[ob2].x, this.objs[ob2].y);
		this.objs[res].g = this.currentGroup;
		++this.objCount;
	}
	return res;
}
prPage.prototype.addLine = prPage.prototype.line; 
//?? prLn line 0 2 prPage.line(N) FL_V FL_R N N 0


// two points only.
prPage.prototype.circle = function(ob1, ob2) {
	var res = this.objCount;
	if (this.isAPoint(ob1)==0) { console.log("addCircle: argument 1 is not a point"); res=0; }
	if (this.isAPoint(ob2)==0) { console.log("addCircle: argument 2 is not a point"); res=0; }
	// can't make a circle out of coincident points, but sAC checks that.
	if (res===this.objCount) {
		this.objs[this.objCount] = new prBase;
		this.objs[this.objCount].saC(this.objs[ob1].x, this.objs[ob1].y, this.objs[ob2].x, this.objs[ob2].y);
		this.objs[res].g = this.currentGroup;
		++this.objCount;
	}
	return res;
}
prPage.prototype.addCircle = prPage.prototype.circle; 
//?? prC circle 0 2 prPage.circle(N) FL_V FL_R N N 0


// line plus p1p2
prPage.prototype.pSegment = function(ob, t1in, t2in) {
	var res = this.objCount; 
	if (this.isALine(ob)==0) { console.log("addSegment: argument 1 is not a line"); res=0; }
	if (res===this.objCount) {  // 0<ob<objCount
		this.objs[res] = new prBase;
		this.objs[res].sapS(this.objs[ob], t1in, t2in);
		this.objs[res].g = this.currentGroup;
		++this.objCount;
	}
	return res;
}
prPage.prototype.addParametricSegment = prPage.prototype.segment;


// segment from a line and 2 points
prPage.prototype.segment = function(ob, p1, p2) {
	var res = this.objCount; 
	if (this.isALine(ob)==0) { console.log("addSegment: argument 1 is not a line"); res=0; }
	if (this.isAPoint(p1)==0) { console.log("addSegment: argument 2 is not a point"); res=0; }
	if (this.isAPoint(p2)==0) { console.log("addSegment: argument 3 is not a point"); res=0; }
	if (res===this.objCount) {  // 0<ob<objCount
		this.objs[res] = new prBase;
		this.objs[res].saS(this.objs[ob], this.objs[p1], this.objs[p2]);
		this.objs[res].g = this.currentGroup;
		++this.objCount;
	}
	return res;
}
prPage.prototype.addSegment = prPage.prototype.segment;
//?? prSg segment 0 2 prPage.segment(N) FL_V FL_R N N 0


// circle plus p1p2--- and p3 to identify which side
prPage.prototype.pArc = function(ob, t1in, t2in, t3in) {
	var res = this.objCount; 
	if (this.isACircle(ob)==0) { console.log("addArc: argument 1 is not a circle"); res=0; }
	if (res===this.objCount) {  // 0<ob<objCount
		this.objs[res] = new prBase;
		this.objs[res].sapA(this.objs[ob], t1in, t2in, t3in);
		this.objs[res].g = this.currentGroup;
		++this.objCount;
	}
	return res;
}
prPage.prototype.addParametricArc = prPage.prototype.pArc;


prPage.prototype.arc = function(ob, p1, p2, p3) {
	var res = this.objCount; 
	if (this.isACircle(ob)==0) { console.log("addArc: argument 1 is not a circle"); res=0; }
	if (this.isAPoint(p1)==0) { console.log("addArc: argument 2 is not a point"); res=0; }
	if (this.isAPoint(p2)==0) { console.log("addArc: argument 3 is not a point"); res=0; }
	if (this.isAPoint(p3)==0) { console.log("addArc: argument 4 is not a point"); res=0; }
	if (res===this.objCount) {  // 0<ob<objCount
		this.objs[res] = new prBase;
		this.objs[res].saA(this.objs[ob], this.objs[p1], this.objs[p2], this.objs[p3]);
		this.objs[res].g = this.currentGroup;
		++this.objCount;
	}
	return res;
}
prPage.prototype.addArc = prPage.prototype.arc;
//?? prAr arc 0 2 prPage.arc(N) FL_V FL_R N N 0

// circle plus p1p2
prPage.prototype.loft = function(ob1, ob2) {
	var res = this.objCount; 
	if (this.isAMark(ob1)==0) { console.log("addLoft: argument 1 is not a mark"); res=0; }
	if (this.isAMark(ob2)==0) { console.log("addLoft: argument 1 is not a mark"); res=0; }
	if (res===this.objCount) {  // 0<ob<objCount
		this.objs[res] = new prBase;
		this.objs[res].saF(ob1, ob2);
		this.objs[res].g = this.currentGroup;
		++this.objCount;
	}
	return res;
}
//?? prAr loft 0 2 prPage.loft(N) FL_V FL_R N N 0


// intersection returns 0, 1, or 2 points.
// the "first" one is the one "closest" to target.
// returns the point of intersection not returned by cI.
// can also return NULL.
prPage.prototype.first = function( ob1,  ob2,  target) {
	var res = this.objCount; 
	if (this.isAnObject(ob1)==0) { console.log("addFirstIntersection: argument 1 is not intersectable"); res=0; }
	if (this.isAnObject(ob2)==0) { console.log("addFirstIntersection: argument 2 is not intersectable"); res=0; }
	if (this.isAPoint(target)==0) { console.log("addFirstIntersection: argument 3 is not a point"); res=0; }
	if (res===this.objCount) { 
		this.objs[res] = new prBase;
		this.objs[res].saFI(this.objs[ob1], this.objs[ob2], this.objs[target]);
		this.objs[res].g = this.currentGroup;
		if (this.objs[res].t===PR_N) {
			res = 0; 
		} else { 
			++this.objCount;
		}
	}
	// whichever is closer, add that to the figure.
	return res;
}
prPage.prototype.addFirstIntersection = prPage.prototype.first;
//?? pri1 first 0 2 prPage.first(N) FL_V FL_R N N 0


prPage.prototype.second = function( ob1,  ob2,  target) {
	var res = this.objCount; 
	if (this.isAnObject(ob1)==0) { console.log("addSecondIntersection: argument 1 is not intersectable"); res=0; }
	if (this.isAnObject(ob2)==0) { console.log("addSecondIntersection: argument 2 is not intersectable"); res=0; }
	if (this.isAPoint(target)==0) { console.log("addSecondIntersection: argument 3 is not a point"); res=0; }
	if (res===this.objCount) { 
		this.objs[res] = new prBase;
		this.objs[res].saSI(this.objs[ob1], this.objs[ob2], this.objs[target]);
		this.objs[res].g = this.currentGroup;
		if (this.objs[res].t===PR_N) {
			res = 0; 
		} else { 
			++this.objCount;
		}
	}
	// whichever is closer, add that to the figure.
	return res;
}
prPage.prototype.addSecondIntersection = prPage.prototype.second;
//?? pri2 first 0 2 prPage.second(N) FL_V FL_R N N 0


// points on lines, circles, segments, or arcs-- an abuse? Euclid did not have this.
prPage.prototype.parametric = function(obj, t) {
	var res = this.objCount; 
	if (this.isAnObject(obj)==0) { console.log("addParametricPoint: argument 1 is not intersectable"); res=0; }
	if (res===this.objCount) { 
		this.objs[res] = new prBase;
		this.objs[res].saPm(this.objs[obj], t);
		this.objs[res].g = this.currentGroup;
		if (this.objs[res].t===PR_N) {
			res = 0; 
		} else { 
			++this.objCount;
		}
	}
	return res;
}
prPage.prototype.addParametricPoint = prPage.prototype.parametric;
//?? ptLf parametric 0 2 prPage.parametric(N) FL_V FL_R N N 0


prPage.prototype.closest = function(obj, pt) {
	return this.objs[obj].cPP(this.objs[pt]); 
}
prPage.prototype.getClosestPointParameter = prPage.prototype.closest; 
//?? prCl closest 0 2 prPage.closest(N) FL_V FL_R N N 0



// something for adding a mark that is between two points...




// given two marks, loft between them
// the other fucntions modify the page; this one just draws.
prPage.prototype.loft = function(m1in, m2in, color) {	 
	var flag = this.objCount;
	if (this.isAnObject(m1in)==0) { console.log("loft: argument 1 is not a object"); flag=0; }
	if (this.isAnObject(m2in)==0) { console.log("loft: argument 2 is not a object"); flag=0; }
	// can't make a circle out of coincident points, but sAC checks that.
	if (flag===this.objCount) {
		var m1 = this.objs[m1in];
		var m2 = this.objs[m2in];
		
		if (m1.t==PR_P && m2.t==PR_S) {
			this.cx.fillStyle = color;	
			this.cx.beginPath();
			this.cx.moveTo(m1.x, m1.y);
			this.cx.lineTo(m2.x, m2.y);
			this.cx.lineTo(m2.x2+m2.x, m2.y2+m2.y);
			this.cx.closePath();
			this.cx.fill();
		} 
//prBase.prototype.aX = function(u) { // arc X coord for parameter u
	//return this.x + (this.r*Math.cos(PR_2P * (this.p0 + (this.dp*u))));  
		if (m1.t==PR_P && m2.t==PR_A) {
			this.cx.fillStyle = color;	
			this.cx.beginPath();
			this.cx.moveTo(m1.x, m1.y);
			var dt = 1.0 / m1.r;
			if (dt>0.125) dt = 0.125;
			for (var t=0.0; t<1.0; t=t+dt) { 
				var px = m2.aX(t); 
				var py = m2.aX(t); 
				this.cx.lineTo(px,py);
			}
			this.cx.closePath();
			this.cx.fill();
		} 
		if (m1.t==PR_S && m2.t==PR_P) {
			this.cx.fillStyle = color;	
			this.cx.beginPath();
			this.cx.moveTo(m2.x, m2.y);
			this.cx.lineTo(m1.x, m1.y);
			this.cx.lineTo(m1.x2+m1.x, m1.y2+m1.y);
			this.cx.closePath();
			this.cx.fill();
		} 
		if (m1.t==PR_A && m2.t==PR_P) {
			this.cx.fillStyle = color;	
			this.cx.beginPath();
			this.cx.moveTo(m2.x, m2.y);
			var dt = 1.0 / m1.r;
			if (dt>0.125) dt = 0.125;
			for (var t=0.0; t<1.0; t=t+dt) { 
				var px = m1.aX(t); 
				var py = m1.aX(t); 
				this.cx.lineTo(px,py);
			}
			this.cx.closePath();
			this.cx.fill();
		}
		if (m1.t==PR_S && m2.t==PR_S) {
			this.cx.fillStyle = color;	
			this.cx.beginPath();
			this.cx.moveTo(m1.x, m1.y);
			this.cx.lineTo(m2.x, m2.y);
			this.cx.lineTo(m2.x2+m2.x, m2.y2+m2.y);
			this.cx.lineTo(m1.x2+m1.x, m1.y2+m1.y);
			this.cx.closePath();
			this.cx.fill();
		} 
		if (m1.t==PR_S && m2.t==PR_A) {
			this.cx.fillStyle = color;	
			this.cx.beginPath();
			this.cx.moveTo(m1.x, m1.y);
			var dt = 1.0 / m1.r;
			if (dt>0.125) dt = 0.125;
			for (var t=0.0; t<1.0; t=t+dt) { 
				var px = m2.aX(t); 
				var py = m2.aY(t); 
				this.cx.lineTo(px,py);
			}
			this.cx.moveTo(m1.x2, m1.y2);
			this.cx.closePath();
			this.cx.fill();
		} 
		if (m1.t==PR_A && m2.t==PR_S) {
			this.cx.fillStyle = color;	
			this.cx.beginPath();
			this.cx.moveTo(m2.x, m2.y);
			var dt = 1.0 / m1.r;
			if (dt>0.125) dt = 0.125;
			for (var t=0.0; t<1.0; t=t+dt) { 
				var px = m1.aX(t); 
				var py = m1.aY(t); 
				this.cx.lineTo(px,py);
			}
			this.cx.moveTo(m2.x2+m2.x, m2.y2+m2.y);
			this.cx.closePath();
			this.cx.fill();
		} 
		if (m1.t==PR_A && m2.t==PR_A) {
			this.cx.fillStyle = color;	
			var dt = 1.0 / m1.r;
			if (dt>0.125) dt = 0.125;
			for (var t=0.0; t<1.0-dt; t=t+dt) { 
				this.cx.beginPath();
				var px11 = m1.aX(t); 
				var py11 = m1.aY(t); 
				var px12 = m1.aX(t+dt+0.01); 
				var py12 = m1.aY(t+dt+0.01); 
				var px21 = m2.aX(t); 
				var py21 = m2.aY(t); 
				var px22 = m2.aX(t+dt+0.01); 
				var py22 = m2.aY(t+dt+0.01); 
				this.cx.moveTo(px11,py11);
				this.cx.lineTo(px21,py21);
				this.cx.lineTo(px22,py22);
				this.cx.lineTo(px12,py12);
				this.cx.closePath();
				this.cx.fill();
			}
		} 

	}	
}















