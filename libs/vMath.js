// The eternal math lib, for JS and nodes and WebGL


// mreal node defns
//?? rdm random 0 1 Math.random(); FL_R
//?? t seconds 0 1 mainDate.getTime(); FL_R"); // requires presence of var mainDate=new Date(); 
//?? fr frame 0 1 frameNumber; FL_R
//?? li linear 0 1 ((A*B)+C); FL_R FL_R A A 1.0 FL_R B B 1.0 FL_R C C 1.0
//?? sn sine 0 1 A*Math.sin(T); FL_R FL_R amplitude A 1.0 FL_R T T 0.0
//?? cs cosine 0 1 A*Math.cos(T); FL_R FL_R amplitude A 1.0 FL_R T T 0.0
//?? tn tangent 0 1 A*Math.tan(T); FL_R FL_R amplitude A 1.0 FL_R T T 0.0
//?? pi pi 0 1 A*pi+B; FL_R FL_R A A 1.0 FL_R B B 0.0
//?? ex exponent 0 1 Math.pow(B,E); FL_R FL_R base B 1.0 FL_R exponent E 1.0
	 




function mVec3() { 
	this.x = 0.0
	this.y = 0.0;
	this.z = 0.0;
}

mVec3.prototype.set = function(a, b, c) {
	this.x=a; this.y=b; this.z=c;
}
mVec3.prototype.copy = function(it) {
	this.x=it.x; this.y=it.y; this.z=it.z;
}
mVec3.prototype.addTo = function(it) {
	this.x+=it.x; this.y+=it.y; this.z+=it.z;
}

/* 		Our matrices are in column-major form, so:
							R,W			R,W			R,W			R,W
							---------------------------------------------
		0  1  2  3		|	0,0 -> 0	1,0 -> 4	2,0 -> 8	3,0 -> 12
		4  5  6  7		|	0,1 -> 1	1,1 -> 5	2,1 -> 9	3,1 -> 13
		8  9  10 11		|	0,2 -> 2	1,2 -> 6	2,2 -> 10	3,2 -> 14
		12 13 14 15		|	0,3 -> 3	1,3 -> 7	2,3 -> 11	3,3 -> 15
	*/

function mx4() { 
	this.M = [0.0,0.0,0.0,0.0, 0.0,0.0,0.0,0.0, 0.0,0.0,0.0,0.0, 0.0,0.0,0.0,0.0];
}

class VMath {
	//////////////////////////////////////////////////////////////////// mVec3 
//?? vnw newVec 0 3 vMath.newVec(X,Y,Z) FL_V FL_R X X 0.0 FL_R Y Y 0.0 FL_R Z Z 0.0 
	static newVec(a,b,c) { 
		var res = new mVec3(); 
		res.set(a,b,c);
		return res; 
	}
//?? vcp newVCopy 0 3 vMath.newVCopy(A) FL_V FL_V A A vMath.zerov()
	static newVCopy(it) { 
		var res = new mVec3(); 
		res.copy(it.x, it.y, it.z); 
		return res; 
	}
	// constants to use as default values
//?? v0 zeroVector 0 3 vMath.zeroV() FL_V
	static zeroV() { return new mVec3(); }
//?? vX xAxis 0 3 vMath.xAxis() FL_V
	static xAxis() { return newVec(1.0,0.0,0.0); } 
//?? vY yAxis 0 3 vMath.yAxis() FL_V
	static yAxis() { return newVec(0.0,1.0,0.0); } 
//?? vZ zAxis 0 3 vMath.zAxis() FL_V
	static zAxis() { return newVec(0.0,0.0,1.0); } 
//?? vl2 length2 0 3 vMath.length2(A) FL_R FL_V A A vMath.zeroV()
	static length2(it) { return Math.sqrt( (it.x*it.x)+(it.y*it.y) ); }
//?? vl3 length2 0 3 vMath.length3(A) FL_R FL_V A A vMath.zeroV()
	static length3(it) { return Math.sqrt( (it.x*it.x)+(it.y*it.y)+(it.z*it.z) ); }
//?? vl2s length2sq 0 3 vMath.length2(A) FL_R FL_V A A vMath.zeroV()
	static length2sq(it) { return (it.x*it.x)+(it.y*it.y); }
//?? vl3s length3sq 0 3 vMath.length2(A) FL_R FL_V A A vMath.zeroV()
	static length3sq(it) { return (it.x*it.x)+(it.y*it.y)+(it.z*it.z); }
//?? vSc vecScale 0 3 vMath.scale(A,S) FL_V FL_V A A vMath.zeroV() FL_R S S 1.0
	static scale = function(it,s) {	return newVec(it.x*s, it.y*s, it.z*s); }
//?? vn3 normalize3 0 3 vMath.normalize3(A) FL_V FL_V A A vMath.zeroV()
	static normalize3 = function(it) {
		var ln = length3sq(it); 
		if (ln>0.0) { 
			ln = 1.0 / Math.sqrt(ln);
			return newVec(it.x*ln, it.y*ln, it.z*ln); 
		} else {
			return it;
		}
	}
//?? vn2 normalize2 0 3 vMath.normalize2(A) FL_V FL_V A A vMath.zeroV()
	static normalize2 = function(it) {
		var ln = length2sq(it); 
		if (ln>0.0) { 
			ln = 1.0 / Math.sqrt(ln);
			return newVec(it.x*ln, it.y*ln, it.z*ln); 
		} else {
			return it;
		}
	}
//?? vadd vAdd 0 3 vMath.vAdd(A,B) FL_V FL_V A A vMath.zeroV() FL_V B B vMath.zeroV()
	static vAdd(a,b) { return newVec(a.x+b.x,a.y+b.y,a.z+b.z); }
//?? vsub vSub 0 3 vMath.vSub(A,B) FL_V FL_V A A vMath.zeroV() FL_V B B vMath.zeroV()
	static vSub(a,b) { return newVec(a.x-b.x,a.y-b.y,a.z-b.z); }
//?? vcv vConv 0 3 vMath.vConv(A,B) FL_V FL_V A A vMath.zeroV() FL_V B B vMath.zeroV()
	static vConv(a,b) { return newVec(a.x*b.x,a.y*b.y,a.z*b.z); }
//?? vcX cross 0 3 vMath.cross(A,B) FL_V FL_V A A vMath.zeroV() FL_V B B vMath.zeroV()
	static cross(a,b) {
		var x = ((a.y)*(b.z)) - ((a.z)*(b.y));
		var y = 0.0 - ( ((a.x)*(b.z)) - ((a.z)*(b.x)) );
		var z = ((a.x)*(b.y)) - ((a.y)*(b.x));
		return newVec(x, y, z); 
	}
//?? vdt vDor 0 3 vMath.dot(A,B) FL_R FL_V A A vMath.zeroV(); FL_V B B vMath.zeroV()
	static dot(a,b) { return a.x*b.x + a.y*b.y + a.z*b.z; }
//?? vrd vRandom 0 3 vMath.vRandom(R) FL_V FL_R R R 2.0 
	static vRandom(r) { return newVec((Math.random()-0.5)*r, (Math.random()-0.5)*r, (Math.random()-0.5)*r); }
//?? vd2s distance2sq 0 3 vMath.distance2sq(A,B) FL_R FL_V A A vMath.zeroV() FL_V B B vMath.zeroV()
	static distance2sq(a,b) { var sep = sub(a,b); return length2sq(sep); }
//?? vd3s distance3sq 0 3 vMath.distance3sq(A,B) FL_R FL_V A A vMath.zeroV() FL_V B B vMath.zeroV()
	static distance3sq(a,b) { var sep = sub(a,b); return length3sq(sep); }
//?? vd2 distance2 0 3 vMath.distance2(A,B) FL_R FL_V A A vMath.zeroV() FL_V B B vMath.zeroV() 
	static distance2(a,b) { var sep = sub(a,b); return length2(sep); }
//?? vd3 distance3 0 3 vMath.distance3(A,B) FL_R FL_V A A vMath.zeroV() FL_V B B vMath.zeroV()
	static distance3(a,b) { var sep = sub(a,b); return length3(sep); }
	
	//////////////////////////////////////////////////////////////////// mx4
//?? mnu newMx 0 4 vMath.newMx(A) FL_M FL_V A A 0.0 FL_R Y Y 0.0 
	static newMx(ar) {  
		var res = new mx4(); 		
		for (var i=0; i<16; ++i) { res.M[i] = ar[i]; }
		return res; 
	}
//?? mcp newMCopy 0 4 vMath.newMCopy(A) FL_M FL_V A A 0.0 FL_R Y Y 0.0 
	static newMCopy(it) { return newMx(it.M); }
//?? mid identity 0 4 vMath.identity() FL_M
	static identity() { return newMx([1.0,0.0,0.0,0.0, 0.0,1.0,0.0,0.0, 0.0,0.0,1.0,0.0, 0.0,0.0,0.0,1.0]); }
//?? mtp transpose 0 4 vMath.transpose(A) FL_M FL_M A A 0.0
	static transpose(it) {	return newMx([it.M[00],it.M[04],it.M[08],it.M[12], 
									   	  it.M[01],it.M[05],it.M[09],it.M[13], 
										  it.M[02],it.M[06],it.M[10],it.M[14], 
										  it.M[03],it.M[07],it.M[11],it.M[15]]); }				
//?? mad mxAdd 0 4 vMath.mxAdd(A,B) FL_M FL_M A A vMath.identity() FL_M B B vMath.identity() 
	static mxAdd(a,b) { 
		var res = new mx4(); 		
		for (var i=0; i<16; ++i) { res.M[i] = a.M[i] + b.M[i]; }
		return res; 
	}
//?? msb mxSub 0 4 vMath.mxSub(A,B) FL_M FL_M A A vMath.identity() FL_M B B vMath.identity()
	static mxSub(a,b) { 
		var res = new mx4(); 		
		for (var i=0; i<16; ++i) { res.M[i] = a.M[i] - b.M[i]; }
		return res; 
	}
//?? msc mxScale 0 4 vMath.mxScale(A,S) FL_M FL_M A A vMath.identity() FL_R S S 1.0
	static mxScale(it,s) { 
		var res = new mx4(); 		
		for (var i=0; i<16; ++i) { res.M[i] = it.M[i] *s; }
		return res; 
	}
	// helper for mxmult
	static mxIndex(i,j) { return i*4+j; }
//?? mmt mxMult 0 4 vMath.mxMult(A,B) FL_M FL_M A A vMath.identity() FL_M B B vMath.identity()
	static mxMult(a,b) { 
		var res = new mx4(); 		
		for (var i=0; i<4; ++i) { 
			for (var j=0; j<4; ++j) {
				for (var j=0; j<4; ++j) {
					res.M[mxIndex(i,j)] += a.M[mxIndex(i,k)] * b.M[mxIndex(k,j)]; 
		}}}
		return res; 
	}
//?? mvm vMxMult 0 4 vMath.vMxMult(A,V) FL_M FL_M A A vMath.identity() FL_V V V vMath.zeroV()
	static vMxMult(v,m) {
		var res = new mVec3(); 
		res.x = (v.x * m.M[0]) + (v.y * m.M[1]) + (v.z * m.M[2]) + m.M[3];
		res.y = (v.x * m.M[4]) + (v.y * m.M[5]) + (v.z * m.M[6]) + m.M[7];
		res.z = (v.x * m.M[8]) + (v.y * m.M[9]) + (v.z * m.M[10]) + m.M[11];
		return res; 
	}
//?? mmv mxVMult 0 4 vMath.mxVMult(A,V) FL_M FL_M A A vMath.identity() FL_V V V vMath.zeroV()
	static mxVMult(v,m) {
		var res = new mVec3(); 
		res.x = (v.x * m.M[0]) + (v.y * m.M[4]) + (v.z * m.M[8]) + m.M[12];
		res.y = (v.x * m.M[1]) + (v.y * m.M[5]) + (v.z * m.M[9]) + m.M[13];
		res.z = (v.x * m.M[2]) + (v.y * m.M[6]) + (v.z * m.M[10]) + m.M[14];
		return res; 
	}
//?? mtr translator 0 4 vMath.translation(T) FL_M FL_V T T vMath.zeroV()
	static translation(v) {
		res = identity(); 		res.M[3] = v.x; 
		res.M[7] = v.y; 		res.M[11] = v.z; 
		return res; 
	}
//?? mscr scaler 0 4 vMath.scale(S) FL_M FL_V S S vMath.zeroV()
	static scale(v) {
		res = identity(); 		res.M[0] = v.x; 
		res.M[5] = v.y; 		res.M[10] = v.z; 
		return res; 
	}
//?? mrtr rotater 0 4 vMath.rotation(A,X) FL_M FL_R A A 0.0 FL_V X X vMath.xAxis()
	static rotation(angle,axis) { 
		var nlen2 = length3sq(axis);
		if (nlen>0.0) {
			var nlen = 1.0/Math.sqrt(nlen2);
			var s = Math.sin(angle);
			var c = Math.cos(angle);
			var ic = 1.0-c;
			var snx = s * axis.x * nlen;
			var sny = s * axis.y * nlen;
			var snz = s * axis.z * nlen;
			var nxy = axis.x * axis.y * nlen2 * ic;
			var nxz = axis.x * axis.z * nlen2 * ic;
			var nyz = axis.y * axis.z * nlen2 * ic;
			var nx2 = (axis.x * axis.x * nlen2 * ic) + c;
			var ny2 = (axis.y * axis.y * nlen2 * ic) + c;
			var nz2 = (axis.z * axis.z * nlen2 * ic) + c;
			return newMx([nx2,       (nxy-snz), (nxz+sny), 0.0, 
						  (nxy+snz), ny2        (nyz-snx), 0.0,
						  (nxz-sny), (nyz+snz), nz2,       0.0,
						  0.0,       0.0,       0.0,       1.0]); 				  
		}
		return identity();
	}
//?? mla lookAt 0 4 vMath.lookAt(E,C,U) FL_M FL_V A A 0.0 FL_R Y Y 0.0 
	static lookAt(eye, coi, up) { 
		var z = normalize(vSub(eye,coi)); 
		var x = normalize(cross(up,z)); 
		var y = cross(z,x);  
		var dx = 0.0 - dot(x, eye); 
		var dy = 0.0 - dot(y, eye); 
		var dz = 0.0 - dot(z, eye); 
		return newMx([x.x,x.y,x.z,dx, y.x,y.y,y.z,dy, z.x,z.y,z.z,dz, 0.0,0.0,0.0,1.0]);
	}
//?? mlr looker 0 4 vMath.looker(E,D,U) FL_M FL_V A A 0.0 FL_R Y Y 0.0 
	static looker(eye, dir, up) { 
		var z = normalize(dir); 
		var x = normalize(cross(up,z)); 
		var y = cross(z,x);  
		var dx = 0.0 - dot(x, eye); 
		var dy = 0.0 - dot(y, eye); 
		var dz = 0.0 - dot(z, eye); 
		return newMx([x.x,x.y,x.z,dx, y.x,y.y,y.z,dy, z.x,z.y,z.z,dz, 0.0,0.0,0.0,1.0]);
	}
//?? mprs perspective 0 4 vMath.perspective(F,A,N,R) FL_M FL_V A A 0.0 FL_R Y Y 0.0 
	static perspective(fov, aspect, znear, zfar) { // y fov, 
		var a = fov*0.5;
		var h = Math.sin(a)/Math.cos(a);
		var w = aspect / h;
		return newMx([(2.0*znear*w),0.0,0.0,0.0, 
					  0.0,(2.0*znear*h),0.0,0.0,
					  0.0,0.0,(zfar/(znear-zfar)),-1.0,
					  0.0,0.0,0.0,(znear*zfar/(znear-zfar)),0.0]);
	}
//?? mpos position 0 4 vMath.position(P,D,U) FL_M FL_V A A 0.0 FL_R Y Y 0.0 
	static position(pos, pointing, up) { 
		var z = normalize(pointing); 
		var x = normalize(cross(up,z)); 
		var y = cross(z,x);  
		return newMx([  x.x,x.y,x.z,pos.x, 
						y.x,y.y,y.z,pos.y, 
						z.x,z.y,z.z,pos.z, 
						0.0,0.0,0.0,1.0]);
	}
	static determinant(m) { // 3x3 det
		return 
		m.M[0]*m.M[5]*m.M[10]-m.M[0]*m.M[6]*m.M[9] +
		m.M[1]*m.M[6]*m.M[8] -m.M[1]*m.M[4]*m.M[10]+
		m.M[2]*m.M[4]*m.M[9] -m.M[2]*m.M[5]*m.M[8];
	}
//?? minv invert 0 4 vMath.invert(A) FL_M FL_M A A vMath.identity();
	static invert(m) {
		det = determinant(m)
		if (det == 0.0) { det = 1.0; }
		var a =  (m.M[5] * m.M[10] - m.M[9] * m.M[6]) / det;
		var b = -(m.M[4] * m.M[10] - m.M[8] * m.M[6]) / det;
		var c =  (m.M[4] * m.M[9]  - m.M[8] * m.M[5]) / det;
		var d = -(m.M[1] * m.M[10] - m.M[9] * m.M[2]) / det;
		var e =  (m.M[0] * m.M[10] - m.M[8] * m.M[2]) / det;
		var f = -(m.M[0] * m.M[9]  - m.M[8] * m.M[1]) / det;
		var g =  (m.M[1] * m.M[6]  - m.M[5] * m.M[2]) / det;
		var h = -(m.M[0] * m.M[6]  - m.M[4] * m.M[2]) / det;
		var i =  (m.M[0] * m.M[5]  - m.M[4] * m.M[1]) / det;
		return newMx([ a,b,c,0.0, d,e,f,0.0, g,h,i,0.0, 0.0,0.0,0.0,1.0 ]);
	}
	
	// ops on mv3s as colors? 
	// vlists? polygons? 3D primitives? splines?
}

// Neal McDonald 1/1/2005






