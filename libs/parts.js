/* As proportion page, 
 * containing an array of parts and forces
 * make and return indices
 * 	*/

function phPart() {
    this.p = vMath.zeroV(); 
    this.v = vMath.zeroV(); 
    this.f = vMath.zeroV(); 
    this.d = vMath.zAxis(); // direction
    this.u = vMath.yAxis(); // up
    this.c = vMath.zeroV(); // const? color? TBD
    this.op = vMath.zeroV(); 
    this.ov = vMath.zeroV(); 
    this.of = vMath.zeroV(); 
    this.od = vMath.zAxis(); 
    this.ou = vMath.yAzis(); 
    this.m = 1.0;
    this.active = false;
}
phPart.prototype.copy = function(it) {
	this.p.copy(it.p); 
	this.v.copy(it.v); 
	this.f.copy(it.f); 
	this.d.copy(it.d); 
	this.u.copy(it.u); 
	this.c.copy(it.c); 
	this.op.copy(it.op); 
	this.ov.copy(it.ov); 
	this.of.copy(it.of); 
	this.od.copy(it.od); 
	this.ou.copy(it.ou); 
	this.m = it.m
	this.active = it.active;
}
phPart.prototype.preStep = function() { 
	this.op.copy(this.p); 
	this.ov.copy(this.v); 
	this.of.copy(this.f); 
	this.od.copy(this.d); 
	this.ou.copy(this.u); 	
	this.f.set(0.0,0.0,0.0); 
}
phPart.prototype.addForce = function(nf) {
	this.f.addTo(nf); 
}
phPart.prototype.doStep = function(dt) { 
	var invM = dt / this.m;
	this.v.addTo(vMath.vScale(this.f, invM));
	this.p.addTo(vMath.vScale(this.v, dt));
	this.d.copy(vMath.sub(this.op, this.p); 
	this.f.set(0.0,0.0,0.0);
}

// the force types
const PHF_RIVET = 0;
const PHF_SPRING = 1;
const PHF_PISTON = 2;
const PHF_FRICTION = 3;// opposes all motion
const PHF_DIRECTIONAL = 4; // uniform force in a direction
const PHF_SWIRL = 5;   // x-prod as attractor
const PHF_COLOR = 6;   // ops on c w/ 1/d^2
const PHF_EMITTER = 7; // adds parts at rate
const PHF_CHEATER = 8; // applies input to part
const PHF_ATTRACTOR = 9;// as e-
const PHF_OFFSETTER = 10;// const, pb.p=pa.p+d
const PHF_TOROIDAL = 11; // const, causes parts to wrap in space

// force styles; control how applied
const PHS_ERR = 0;  // null
const PHS_WIDE = 1; // gravity, friction: no args, applied to all, O(n)
const PHS_SQR  = 2; // charges: all to all, O(n**2)
const PHS_SING = 3; // springs: few to few, O(1)
const PHS_CONST= 4; // rivets: few to few, after main integ, O(1)

function phForce() {
	this.type = -1;			// what it is
	this.style = PHS_ERR;  	// which integrator to call
	this.intArgs = [-1,-1,-1, -1,-1,-1]; 	 // part indices, mostly
	this.flArgs = [0.0,0.0,0.0, 0.0,0.0,0.0];// phys constants
}
phForce.prototype.init = function(type, style, intArg, flArg) {
	this.type = type; 
	this.style = style;
	for (var i=0;i<6;++i) { // why 9? you need more get more
		this.intArgs[i] = intArg[i];
		this.flArgs[i] = flArg[i];
	}
}
phForce.prototype.takeInput(fvec) {
	this.intArgs[1] = 1; // dirty bit says you got input
	this.flArgs[0] += fvec.x;
	this.flArgs[1] += fvec.y;
	this.flArgs[2] += fvec.z;
}
// call these before the integration
phForce.prototype.exertSing = function(pa, pb) {
	switch (this.type) {
		case PHF_SPRING: 
			var d = vMath.sub(pa.p, pb.p);	
			var len = vMath.length3(d);
			var f = vMath.scale(d, this.flArgs[0]*(this.flArgs[1]-len)/len);
			pa.f.addTo(f); 
			pb.f.addTo(vMath.vScale(f, -1.0)); 
			break;
		case PHF_PISTON: 
			var d = vMath.sub(pa.p, pb.p);	
			var len = vMath.length3(d);
			var f = vMath.scale(d, this.flArgs[0]*(this.flArgs[1]-len)/len);
			pa.f.addTo(f); 
			pb.f.addTo(vMath.vScale(f, -1.0); 
			break;
		case PHF_EMITTER: break;
		case PHF_CHEATER: 
			if(this.intArgs[1]!=0) {
				var f = vMath.newVec(this.flArgs[0],this.flArgs[1],this.flArgs[2]);
				pa.f.addTo(f); 
				this.intArgs[0]=0;
			}
			break;
	}
}
phForce.prototype.exertWide = function(pa) {
	switch (this.type) {
		case PHF_FRICTION: 
			var f = vMath.scale(pa.v, this.flArgs[0]); 
			pa.f.addTo(f); 
			break;
		case PHF_DIRECTIONAL: 
			var f = vMath.newVec(this.flArgs[0],this.flArgs[1],this.flArgs[2]); 
			pa.f.addTo(f); 
			break;
		case PHF_COLOR: break; // add color to all?
	}
}
phForce.prototype.exertSqr = function(pa, pb) { //
	switch (this.type) {
		case PHF_SWIRL: break;
		case PHF_ATTRACTOR: break;
	}
}
// after integration
phForce.prototype.exertConst = function(pa,pb) {
	switch (this.type) {
		case PHF_RIVET:
			pa.p.set(this.flArgs[0],this.flArgs[0],this.flArgs[0]); 
			pa.v.set(0.0,0.0,0.0);
			break;
		case PHF_OFFSETTER: 
			pa.p.set(pb.p.x+this.flArgs[0],pb.p.y+this.flArgs[0],pb.p.z+this.flArgs[0]); 
			pa.v.set(0.0,0.0,0.0);
			break;
		case PHF_TOROIDAL: break;
	}
}


function partSys()  {
	this.ps = []; // parts
	this.fs = []; // forces
	this.t = 0.0;
	this.dt = 0.033; 
	this.templp = new phPart(); // template part; set it, then call addPart()
}
partSys.prototype.doForces = function() { 
	var ct = this.fs.length;
	for (var k=0; k<ct; ++k) {
		if (this.fs[k].style === PHS_SING) {
			var p1 = this.fs[k].intArgs[0];
			var p2 = this.fs[k].intArgs[1]; 
			this.fs[k].exertSing(this.ps[p1], this.ps[p2]);
		}
		if (this.fs[k].style === PHS_WIDE) { 
			var ct2 = this.ps.length; 
			for (var i=0; i<ct; ++i) { 
				this.fs[k].exertWide(this.ps[i]);
			}
		}
	}
}
void physManager::doConstraints() {
	for (var k=0; k<ct; ++k) {
		if (this.fs[k].style === PHS_CONST) {
			var p1 = this.fs[k].intArgs[0];
			var p2 = this.fs[k].intArgs[1]; 
			this.fs[k].exertConst(this.ps[p1], this.ps[p2]);
		}
	}
}
void physManager::doMove() {
	var ct = this.ps.length;
	for (var i=0; i<ct; ++i) {
		this.ps[i].preStep(); 
	}
	doForces();// feel free to do better integrator
	doConstraints();
	for (var i=0; i<ct; ++i) {
		this.ps[i].doStep(); 
	}
	this.t += this.dt;
}

partSys.prototype.setTempl = function(which) { 
	if (which>0 && which<this.ps.length) { 
		this.templp.copy(this.ps[which]);
	}
}
partSys.prototype.setPartFromTempl = function(which) { 
	if (which>0 && which<this.ps.length) { 
		this.ps[which].copy(this.templp);
	}
}
partSys.prototype.addTemplCopy = function(which) {
	var newp = new phPart();
	newp.copy(this.templp);
	this.ps.push(newp);
	return this.ps.length-1; 
}
//?? phnp addPart 0 6 partSys.addPart(M,P,V,U) FL_P FL_V A A vMath.zerov();
partSys.prototype.addPart = function(m, p, v, u) { 
	var newp = new phPart();
	newp.copy(this.templp);
	newp.p.copy(p); 
	newp.v.copy(v); 
	newp.u.copy(u); 
	newp.m = m; 
	this.ps.push(newp);
	return this.ps.length-1; 
}
//?? phgp getP 0 6 partSys.getP(N) FL_V FL_R N N 0
partSys.prototype.getP = function(which) { return vMath.newVCopy(this.ps[which].p); }
//?? phgv getV 0 6 partSys.getV(N) FL_V FL_R N N 0
partSys.prototype.getV = function(which) { return vMath.newVCopy(this.ps[which].v); }
//?? phgd getD 0 6 partSys.getD(N) FL_V FL_R N N 0
partSys.prototype.getD = function(which) { return vMath.newVCopy(this.ps[which].d); }
partSys.prototype.addForce = function(type, style, intArg, flArg) { 
	var f = new phForce();
	f.init(type, style, intArg, flArg);
	this.fs.push(f);
	return this.fs.length-1; 
}
//?? phrv addRivet 0 6 partSys.addRivet(P) FL_F FL_P P P 0
partSys.prototype.addRivet = function(pa) { 
	var ins = [pa,0,0, 0,0,0];
	var p1 = vMath.newVCopy(this.ps[pa].p);
	var fs = [p1.x,p1.y,p1.z, 0.0,0.0,0.0];
	return this.addForce(PHF_RIVET, PHS_CONST, ins, fs);
}
//?? phsp addSpring 0 6 partSys.addSpring(A,B,K) FL_F FL_P P P 0 FL_P P P 1 FL_R K K 0.01
partSys.prototype.addSpring = function(pa, pb, k) { 
	var ins = [pa,pb,0, 0,0,0];
	var p1 = vMath.newVCopy(this.ps[pa].p);
	var p2 = vMath.newVCopy(this.ps[pb].p);
	var d = vMath.vSub(p1,p2);
	var fs = [k,vMath.length3(d),0.0, 0.0,0.0,0.0];
	return this.addForce(PHF_SPRING, PHS_SING, ins, fs);
}
//?? phpt addPiston 0 6 partSys.addPiston(A,B,K,M,O,F) FL_F FL_P A A 0 FL_P B B 0 FL_R K K 00.1 FL_R M M 1.0 FL_R O O 0.0 FL_R F F 10.0
partSys.prototype.addPiston = function(pa, pb, k, restLen, amp, offs, freq) { 
	var ins = [pa,pb,0, 0,0,0];
	var p1 = vMath.newVCopy(this.ps[pa].p);
	var p2 = vMath.newVCopy(this.ps[pb].p);
	var d = vMath.vSub(p1,p2);
	var fs = [k,vMath.length3(d),amp, offs,freq,0.0];
	return this.addForce(PHF_PISTON, PHS_SING, ins, fs);
}
//?? phfr addFriction 0 6 partSys.addFriction(K) FL_F FL_R K K 0.01;
partSys.prototype.addFriction = function(vf) { 
	var ins = [0,0,0, 0,0,0];// opposes f = -vf * v
	var fs = [vf,0.0,0.0, 0.0,0.0,0.0];
	return this.addForce(PHF_FRICTION, PHS_WIDE, ins, fs);
}
//?? phdi addDirectional 0 6 partSys.addDirectional(D) FL_PF FL_V D D vMath.yAxis();
partSys.prototype.addDirectional = function(d) { 
	var ins = [0,0,0, 0,0,0]; // uniform f added in direction surface gravity
	var fs = [d.x,d.y,d.z, 0.0,0.0,0.0];
	return this.addForce(PHF_DIRECTIONAL, PHS_WIDE, ins, fs);
}
//?? phsw addSwirl 0 6 partSys.addSwirl(A,M) FL_PF FL_P A A 0 FL_R M M 1.0;
partSys.prototype.addSwirl = function(pa, mag, axis) { 
	var ins = [pa,0,0, 0,0,0]; 
	var fs = [mag,0.0,0.0, 0.0,0.0,0.0]; // given axis, or use d?
	return this.addForce(PHF_SWIRL, PHS_SQR, ins, fs);
}
//?? phnp addColor 0 6 partSys.addColor(M,P,V,U) FL_PF FL_V A A vMath.zerov();
partSys.prototype.addColor = function(pa, mag, r,g,b) { 
	var ins = [pa,0,0, 0,0];  // eh. dunno.
	var fs = [mag,r,g, b,0.0,0.0];
	return this.addForce(PHF_COLOR, PHS_SQR, ins, fs);
}


//?? phnp addEmitter 0 6 partSys.addEmitter(M,P,V,U) FL_PF FL_V A A vMath.zerov();
partSys.prototype.addEmitter = function(pa, r, dr) { 
	var ins = [pa,0,0, 0,0,0];  // adds a part at rate
	var fs = [r,dr,0.0, 0.0,0.0,0.0];
	return this.addForce(PHF_EMITTER, PHS_SING, ins, fs);
}
//?? phnp addCheater 0 6 partSys.addCheater(M,P,V,U) FL_PF FL_
partSys.prototype.addCheater = function(pa) { 
	var ins = [pa,0,0, 0,0,0];  // adds a part at rate
	var fs = [0.0,0.0,0.0, 0.0,0.0,0.0];
	return this.addForce(PHF_CHEATER, PHS_SING, ins, fs);
}
//?? phnp addAttractor 0 6 partSys.addAttractor(P,M) FL_PF FL_P P P 0 FL_R M M 1.0
partSys.prototype.addAttractor = function(pa, mag) { 
	var ins = [pa,0,0, 0,0,0];  // attraction to this part
	var fs = [mag,0.0,0.0, 0.0,0.0,0.0];
	return this.addForce(PHF_ATTRACTOR, PHS_SQR, ins, fs);
}
//?? phnp addPart 0 6 partSys.addPart(M,P,V,U) FL_PF FL_V A A vMath.zerov();
partSys.prototype.addOffsetter = function(pa, pb, dx, dy, dz) { 
	var ins = [pa,pb,0, 0,0,0];  // const; pb.p=pa.p+d
	var fs = [dx,dy,dz, 0.0,0.0,0.0];
	return this.addForce(PHF_OFFSETTER, PHS_CONST, ins, fs);
}
/*
//?? phnp addToroidal 0 0 partSys.addToroidal(M,P,V,U) FL_PT FL_V A A vMath.zerov();
partSys.prototype.addToroidal = function(xlo,ylo,zlo,xhi,yhi,zhi) { 
	var ins = [pa,pb,0, 0,0,0];  // hm, maybe skip this one; energy things.
	var fs = [xlo,ylo,zlo,xhi,yhi,zhi];
	return this.addForce(PHF_OFFSETTER, PHS_CONST, ins, fs);
}*/
// not sure works with nodes...?
//?? phnp takeInput 0 6 partSys.takeInput(F,V) FL_PT FL_V F F 0 FL_V V V vMath.zerov();
partSys.prototype.takeInput = function(whichf, fvec) { 
	this.fs[whichf].takeInput(fvec);
}
