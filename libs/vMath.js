// The eternal math lib, for JS and nodes and WebGL

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
//?? vnw newVec 0 0 vMath.newVec(X,Y,Z) FL_V FL_R X X 0.0 FL_R Y Y 0.0 FL_R Z Z 0.0 
	static newVec(a,b,c) { 
		var res = new mVec3(); 
		res.set(a,b,c);
		return res; 
	}
//?? vcp newVCopy 0 0 vMath.newVCopy(A) FL_V FL_V A A 0.0 FL_R Y Y vMath.zerov();
	static newVCopy(it) { 
		var res = new mVec3(); 
		res.copy(it.x, it.y, it.z); 
		return res; 
	}
	// constants to use as default values
	static zeroV() { return new mVec3(); }
	static xAxis() { return newVec(1.0,0.0,0.0); } 
	static yAxis() { return newVec(0.0,1.0,0.0); } 
	static zAxis() { return newVec(0.0,0.0,1.0); } 
//?? vcp length2 0 0 vMath.length2(A) FL_V FL_V A A 0.0
	static length2(it) { return Math.sqrt( (it.x*it.x)+(it.y*it.y) ); }
//?? vcp length3 0 0 vMath.length3(A) FL_V FL_V A A 0.0
	static length3(it) { return Math.sqrt( (it.x*it.x)+(it.y*it.y)+(it.z*it.z) ); }
//?? vcp length2sq 0 0 vMath.length2sq(A) FL_V FL_V A A 0.0 FL_R Y Y 0.0 
	static length2sq(it) { return (it.x*it.x)+(it.y*it.y); }
//?? vcp length3sq 0 0 vMath.length3sq(A) FL_V FL_V A A 0.0 FL_R Y Y 0.0 
	static length3sq(it) { return (it.x*it.x)+(it.y*it.y)+(it.z*it.z); }
//?? vcp vecCopy 0 0 vMath.newVCopy(A) FL_V FL_V A A 0.0 FL_R Y Y 0.0 
	static scale = function(it,s) {	return newVec(it.x*s, it.y*s, it.z*s); }
//?? vcp vecCopy 0 0 vMath.newVCopy(A) FL_V FL_V A A 0.0 FL_R Y Y 0.0 
	static normalize3 = function(it) {
		var ln = length3sq(it); 
		if (ln>0.0) { 
			ln = 1.0 / Math.sqrt(ln);
			return newVec(it.x*ln, it.y*ln, it.z*ln); 
		} else {
			return it;
		}
	}
//?? vcp vecCopy 0 0 vMath.newVCopy(A) FL_V FL_V A A 0.0 FL_R Y Y 0.0 
	static normalize2 = function(it) {
		var ln = length2sq(it); 
		if (ln>0.0) { 
			ln = 1.0 / Math.sqrt(ln);
			return newVec(it.x*ln, it.y*ln, it.z*ln); 
		} else {
			return it;
		}
	}
//?? vcp vAdd 0 0 vMath.vAdd(A) FL_V FL_V A A 0.0 FL_R Y Y 0.0 
	static vAdd(a,b) { return newVec(a.x+b.x,a.y+b.y,a.z+b.z); }
//?? vcp vSub 0 0 vMath.vSub(A) FL_V FL_V A A 0.0 FL_R Y Y 0.0 
	static vSub(a,b) { return newVec(a.x-b.x,a.y-b.y,a.z-b.z); }
//?? vcp vConv 0 0 vMath.vConv(A) FL_V FL_V A A 0.0 FL_R Y Y 0.0 
	static vConv(a,b) { return newVec(a.x*b.x,a.y*b.y,a.z*b.z); }
//?? vcp cross 0 0 vMath.cross(A) FL_V FL_V A A 0.0 FL_R Y Y 0.0 
	static cross(a,b) {
		var x = ((a.y)*(b.z)) - ((a.z)*(b.y));
		var y = 0.0 - ( ((a.x)*(b.z)) - ((a.z)*(b.x)) );
		var z = ((a.x)*(b.y)) - ((a.y)*(b.x));
		return newVec(x, y, z); 
	}
//?? vcp vecCopy 0 0 vMath.newVCopy(A) FL_V FL_V A A 0.0 FL_R Y Y 0.0 
	static dot(a,b) { return a.x*b.x + a.y*b.y + a.z*b.z; }
//?? vcp vecCopy 0 0 vMath.newVCopy(A) FL_V FL_V A A 0.0 FL_R Y Y 0.0 
	static vRandom(r) { return newVec((Math.random()-0.5)*r, (Math.random()-0.5)*r, (Math.random()-0.5)*r); }
//?? vcp vecCopy 0 0 vMath.newVCopy(A) FL_V FL_V A A 0.0 FL_R Y Y 0.0 
	static distance2sq(a,b) { var sep = sub(a,b); return length2sq(sep); }
//?? vcp vecCopy 0 0 vMath.newVCopy(A) FL_V FL_V A A 0.0 FL_R Y Y 0.0 
	static distance3sq(a,b) { var sep = sub(a,b); return length3sq(sep); }
//?? vcp vecCopy 0 0 vMath.newVCopy(A) FL_V FL_V A A 0.0 FL_R Y Y 0.0 
	static distance2(a,b) { var sep = sub(a,b); return length2(sep); }
//?? vcp vecCopy 0 0 vMath.newVCopy(A) FL_V FL_V A A 0.0 FL_R Y Y 0.0 
	static distance3(a,b) { var sep = sub(a,b); return length3(sep); }
	
	//////////////////////////////////////////////////////////////////// mx4
//?? vcp vecCopy 0 0 vMath.newVCopy(A) FL_V FL_V A A 0.0 FL_R Y Y 0.0 
	static newMx(ar) {  
		var res = new mx4(); 		
		for (var i=0; i<16; ++i) { res.M[i] = ar[i]; }
		return res; 
	}
//?? vcp vecCopy 0 0 vMath.newVCopy(A) FL_V FL_V A A 0.0 FL_R Y Y 0.0 
	static newCopy(it) { return newMx(it.M); }
//?? vcp vecCopy 0 0 vMath.newVCopy(A) FL_V FL_V A A 0.0 FL_R Y Y 0.0 
	static identity() { return newMx([1.0,0.0,0.0,0.0, 0.0,1.0,0.0,0.0, 0.0,0.0,1.0,0.0, 0.0,0.0,0.0,1.0]); }
//?? vcp vecCopy 0 0 vMath.newVCopy(A) FL_V FL_V A A 0.0 FL_R Y Y 0.0 
	static transpose(it) {	return newMx([it.M[00],it.M[04],it.M[08],it.M[12], 
									   	  it.M[01],it.M[05],it.M[09],it.M[13], 
										  it.M[02],it.M[06],it.M[10],it.M[14], 
										  it.M[03],it.M[07],it.M[11],it.M[15]]); }				
//?? vcp vecCopy 0 0 vMath.newVCopy(A) FL_V FL_V A A 0.0 FL_R Y Y 0.0 
	static mxAdd(a,b) { 
		var res = new mx4(); 		
		for (var i=0; i<16; ++i) { res.M[i] = a.M[i] + b.M[i]; }
		return res; 
	}
//?? vcp vecCopy 0 0 vMath.newVCopy(A) FL_V FL_V A A 0.0 FL_R Y Y 0.0 
	static mxSub(a,b) { 
		var res = new mx4(); 		
		for (var i=0; i<16; ++i) { res.M[i] = a.M[i] - b.M[i]; }
		return res; 
	}
//?? vcp vecCopy 0 0 vMath.newVCopy(A) FL_V FL_V A A 0.0 FL_R Y Y 0.0 
	static mxScale(it,s) { 
		var res = new mx4(); 		
		for (var i=0; i<16; ++i) { res.M[i] = it.M[i] *s; }
		return res; 
	}
//?? vcp vecCopy 0 0 vMath.newVCopy(A) FL_V FL_V A A 0.0 FL_R Y Y 0.0 
	static mxIndex(i,j) { return i*4+j; }
//?? vcp vecCopy 0 0 vMath.newVCopy(A) FL_V FL_V A A 0.0 FL_R Y Y 0.0 
	static mxMult(a,b) { 
		var res = new mx4(); 		
		for (var i=0; i<4; ++i) { 
			for (var j=0; j<4; ++j) {
				for (var j=0; j<4; ++j) {
					res.M[mxIndex(i,j)] += a.M[mxIndex(i,k)] * b.M[mxIndex(k,j)]; 
		}}}
		return res; 
	}
//?? vcp vecCopy 0 0 vMath.newVCopy(A) FL_V FL_V A A 0.0 FL_R Y Y 0.0 
	static vMxMult(v,m) {
		var res = new mVec3(); 
		res.x = (v.x * m.M[0]) + (v.y * m.M[1]) + (v.z * m.M[2]) + m.M[3];
		res.y = (v.x * m.M[4]) + (v.y * m.M[5]) + (v.z * m.M[6]) + m.M[7];
		res.z = (v.x * m.M[8]) + (v.y * m.M[9]) + (v.z * m.M[10]) + m.M[11];
		return res; 
	}
//?? vcp vecCopy 0 0 vMath.newVCopy(A) FL_V FL_V A A 0.0 FL_R Y Y 0.0 
	static mxVMult(v,m) {
		var res = new mVec3(); 
		res.x = (v.x * m.M[0]) + (v.y * m.M[4]) + (v.z * m.M[8]) + m.M[12];
		res.y = (v.x * m.M[1]) + (v.y * m.M[5]) + (v.z * m.M[9]) + m.M[13];
		res.z = (v.x * m.M[2]) + (v.y * m.M[6]) + (v.z * m.M[10]) + m.M[14];
		return res; 
	}
//?? vcp vecCopy 0 0 vMath.newVCopy(A) FL_V FL_V A A 0.0 FL_R Y Y 0.0 
	static translation(v) {
		res = identity(); 		res.M[3] = v.x; 
		res.M[7] = v.y; 		res.M[11] = v.z; 
		return res; 
	}
//?? vcp vecCopy 0 0 vMath.newVCopy(A) FL_V FL_V A A 0.0 FL_R Y Y 0.0 
	static scale(v) {
		res = identity(); 		res.M[0] = v.x; 
		res.M[5] = v.y; 		res.M[10] = v.z; 
		return res; 
	}
//?? vcp vecCopy 0 0 vMath.newVCopy(A) FL_V FL_V A A 0.0 FL_R Y Y 0.0 
	static translation(v) {
		res = identity(); 		res.M[3] = v.x; 
		res.M[7] = v.y; 		res.M[11] = v.z; 
		return res; 
	}
//?? vcp vecCopy 0 0 vMath.newVCopy(A) FL_V FL_V A A 0.0 FL_R Y Y 0.0 
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
//?? vcp vecCopy 0 0 vMath.newVCopy(A) FL_V FL_V A A 0.0 FL_R Y Y 0.0 
	static lookAt(eye, coi, up) { 
		var z = normalize(vSub(eye,coi)); 
		var x = normalize(cross(up,z)); 
		var y = cross(z,x);  
		var dx = 0.0 - dot(x, eye); 
		var dy = 0.0 - dot(y, eye); 
		var dz = 0.0 - dot(z, eye); 
		return newMx([x.x,x.y,x.z,dx, y.x,y.y,y.z,dy, z.x,z.y,z.z,dz, 0.0,0.0,0.0,1.0]);
	}
//?? vcp vecCopy 0 0 vMath.newVCopy(A) FL_V FL_V A A 0.0 FL_R Y Y 0.0 
	static looker(eye, dir, up) { 
		var z = normalize(dir); 
		var x = normalize(cross(up,z)); 
		var y = cross(z,x);  
		var dx = 0.0 - dot(x, eye); 
		var dy = 0.0 - dot(y, eye); 
		var dz = 0.0 - dot(z, eye); 
		return newMx([x.x,x.y,x.z,dx, y.x,y.y,y.z,dy, z.x,z.y,z.z,dz, 0.0,0.0,0.0,1.0]);
	}
//?? vcp vecCopy 0 0 vMath.newVCopy(A) FL_V FL_V A A 0.0 FL_R Y Y 0.0 
	static perspective(fov, aspect, znear, zfar) { // y fov, 
		var a = fov*0.5;
		var h = Math.sin(a)/Math.cos(a);
		var w = aspect / h;
		return newMx([(2.0*znear*w),0.0,0.0,0.0, 
					  0.0,(2.0*znear*h),0.0,0.0,
					  0.0,0.0,(zfar/(znear-zfar)),-1.0,
					  0.0,0.0,0.0,(znear*zfar/(znear-zfar)),0.0]);
	}
//?? vcp vecCopy 0 0 vMath.newVCopy(A) FL_V FL_V A A 0.0 FL_R Y Y 0.0 
	static position(pos, pointing, up) { 
		var z = normalize(pointing); 
		var x = normalize(cross(up,z)); 
		var y = cross(z,x);  
		return newMx([  x.x,x.y,x.z,pos.x, 
						y.x,y.y,y.z,pos.y, 
						z.x,z.y,z.z,pos.z, 
						0.0,0.0,0.0,1.0]);
	}
//?? vcp determinant 0 0 vMath.determinant(A) FL_V FL_V A A 0.0 FL_R Y Y 0.0 
	static determinant(m) { // 3x3 det
		return 
		m.M[0]*m.M[5]*m.M[10]-m.M[0]*m.M[6]*m.M[9] +
		m.M[1]*m.M[6]*m.M[8] -m.M[1]*m.M[4]*m.M[10]+
		m.M[2]*m.M[4]*m.M[9] -m.M[2]*m.M[5]*m.M[8];
	}
//?? vcp invert 0 0 vMath.invert(A) FL_M FL_M A A vMath.identity();
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






