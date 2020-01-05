/* 
 * As proportion page, 
 * containing an array of parts and forces
 * make and return indices
 * 	*/


function phPart() {
    this.p = vMath.zeroV(); 
    this.v = vMath.zeroV(); 
    this.f = vMath.zeroV(); 
    this.d = vMath.zeroV(); 
    this.u = vMath.zeroV(); 
    this.op = vMath.zeroV(); 
    this.ov = vMath.zeroV(); 
    this.of = vMath.zeroV(); 
    this.od = vMath.zeroV(); 
    this.ou = vMath.zeroV(); 
    this.intProps = [0,0,0, 0,0,0, 0,0,0, 0];
    this.realProps = [0.0,0.0,0.0, 0.0,0.0,0.0, 0.0,0.0,0.0, 0.0];
    this.active = false;
};


phPart.prototype.copy = function(it) {
	this.p.copy(it.p); 
	this.v.copy(it.v); 
	this.f.copy(it.f); 
	this.d.copy(it.d); 
	this.u.copy(it.u); 
	this.op.copy(it.op); 
	this.ov.copy(it.ov); 
	this.of.copy(it.of); 
	this.od.copy(it.od); 
	this.ou.copy(it.ou); 
	// etc..
	this.active = it.active;
}


// force styles; control how applied
const PHS_ERR = 0;  // null
const PHS_WIDE = 1; // gravity, friction: no args, applied to all, O(n)
const PHS_SQR  = 2; // charges: all to all, O(n**2)
const PHS_SING = 3; // springs: few to few, O(1)
const PHS_CONST= 4; // rivets: few to few, after main integ, O(1)
const PHS_WIDE = 5; // rods: few to few, but O(f**2)




function physForce() {
	// args? um? 

	// init(); -- variable arguments list

	// switchboard functions that call the fns above

	// for PHS_WIDE force styles
	virtual void doIt(physElement *a, const real b) {}

	// for PHS_SQR force styles
	virtual void doIt(const int p1, const int p2, physElement *ps, 
		const real distance, const real dt) {}

	// for PHS_SING force styles
	virtual void doIt(physElement *a, const real t, const real dt) {}

	// to route input from evnMgr to forces
	virtual void takeIt(mVec3 *p) {} 
};

// init as rivet, spring, piston, gravity, friction, ? 



void physManager::addCheater(int *result, const int p1) { 
void physManager::addAttractor(int *result, const int part, mVec3 *target, real strength)
void physManager::addFloater(int *result, const int p1, const int p2, mVec3 *dir) { 
void physManager::addFriction(int *result)
void physManager::addGravity(int *result, const real g)	{
void physManager::addHelium(int *result, const int p1, const real rate)
void physManager::addPoser(int *result, const int p, mVec3 *pos, mVec3 *vel) {
void physManager::addRivet(int *result, const int p) {
void physManager::addSpring(int *result, const int p1, const int p2, const real str, const real restLen) {


function parts()  {
	this.ps = []; // parts
	this.fs = []; // forces
	this.t = 0.0;
	this.dt = 0.033;
	
	// template part; set it, then call addPart()
	this.part = new phPart(); 
//	var			*m_iMaps[PHYS_FSTYLE_LAST];	 // maps indices to entries in force arrays,
	//??												 // so force arrays can be compacted

	void doForces();
	void doConstraints();
	void doMove();	
	void getIndex(int *result, const physForceStyle type); 
	void addForce(int *result, const physForceStyle s, physForce *f); 

	var		m_iSimTicks;
	var	m_bActive; // whether each entMgr doTick should operate


	// take a max part count and use m_cPart to 
	//		init the current psys. 
	void initElements(const int mP);

	// uses m_cPart, adds a copy, returns
	// the part's index or -1.
	void addElement(int *res, physElement *p);
	void addElement(int *res);

	void getElementPos(const int which, mVec3 *p);
	void setElementPos(const int which, mVec3 *p);
	
	void getElementVel(const int which, mVec3 *v);

	void getElementDir(const int which, mVec3 *d);
	void setElementDir(const int which, mVec3 *d);

	void getElementUp(const int which, mVec3 *u);
	void setElementUp(const int which, mVec3 *u);

	void getElementMass(const int which, real *m);
	void setElementMass(const int which, real m);

	void getElementRadius(const int which, real *r);
	void setElementRadius(const int which, real r);

	void deleteElement(const int which);

	// operations on forces
	void deleteForce(const int which); 

	// route input to force. 
	void doInput(const int which, mVec3 *p); 

	// making forces. the new and easy way. 
	// documentation for force types is in physFoces.h
	void addAttractor(int *result, const int part, mVec3 *target, real strength);
	void addCheater(int *result, const int p1); 
	void addFloater(int *result, const int p1, const int p2, mVec3 *dir); 
	void addFriction(int *result);
	void addGravity(int *result, const real g);
	void addHelium(int *result, const int p1, const real rate);
	void addPoser(int *result, const int p1, mVec3 *p, mVec3 *v);
	void addRivet(int *result, const int p1); 
	void addSpring(int *result, const int p1, const int p2, const real str, const real restLen);

	void doTick(const real t, const real dt); 

};


// returns a part id? a part? ugh.
parts.prototype.addPart = function() {
}

parts.prototype.getPart = function(which) {
}


// returns a part id? a part? ugh.
parts.prototype.addForce = function(type, a1, a2, a3, a4) {
}












void physManager::doForces() {
	int i, j, k, cnt;
	real d;
	mVec3 vec; 
	physForce	**fList;

	// apply all the "reactionary" forces to each Element in turn
	// this is for things like gravity, friction. 
	fList = m_pForces[PHYS_FSTYLE_WIDE];
	cnt = m_iCounts[PHYS_FSTYLE_WIDE];
	for (k=0; k<cnt; ++k) {
		for (i=0; i<m_iPCount; ++i) {
			if (m_cElements[i].active) { 
				fList[k]->doIt(&(m_cElements[i]), m_dT, m_dDT);
			}
		}
	}
	
	cnt = m_iCounts[PHYS_FSTYLE_NSQUARED];
	if (cnt>0) {
		fList = m_pForces[PHYS_FSTYLE_NSQUARED];
		for (i=0; i<m_iPCount; ++i) {
			if (m_cElements[i].active) { 
				for (j=i+1; j<m_iPCount; j++) {
					// d = vector from j to which
					if (m_cElements[j].active) {
						vec.eqSub(&(m_cElements[i].p), &(m_cElements[j].p));
						vec.length3sq(&d);
						
						for (k=0; k<cnt; ++k) {
							fList[k]->doIt(i, j, m_cElements, d, m_dDT);
						}
					}
				}
			}
		}
	}
	
	// these forces know which Elements thay are to affect; 
	// pass the list of all parts to them. 
	fList = m_pForces[PHYS_FSTYLE_SINGULAR];
	cnt = m_iCounts[PHYS_FSTYLE_SINGULAR];
	for (k=0; k<cnt; ++k) {
		fList[k]->doIt(m_cElements, m_dT, m_dDT);
	}
}



void physManager::doConstraints() {
	int i, k, cnt;
	physForce **fList;

	// constraints, after integration, called once per part
	fList = m_pForces[PHYS_FSTYLE_CONST_WIDE];
	cnt = m_iCounts[PHYS_FSTYLE_CONST_WIDE];
	for (k=0; k<cnt; ++k) {
		for (i=0; i<m_iPCount; ++i) {
			if (m_cElements[i].active) { 
				fList[k]->doIt(&(m_cElements[i]), m_dT, m_dDT);
			}
		}
	}
	// constraints that affect single parts
	fList = m_pForces[PHYS_FSTYLE_CONST_SING];
	cnt = m_iCounts[PHYS_FSTYLE_CONST_SING];
	for (k=0; k<cnt; ++k) {
		fList[k]->doIt(m_cElements, m_dT, m_dDT);
	}
}




void physManager::doMove()
{
	int i;
	mVec3 v, a, x;
	physElement *p; 

	for (i=0; i<m_iPCount; ++i)
	{
		if (m_cElements[i].active)
		{
			p = &(m_cElements[i]); 
			(p->op).copy(&(p->p));
			(p->ov).copy(&(p->v));
			(p->od).copy(&(p->d));
			p->f.zero();
		}
	}

	doForces();
	
	// integration
	for (i=0; i<m_iPCount; ++i)
	{
		if (m_cElements[i].active)
		{
			p = &(m_cElements[i]);

			//Calculate the acceleration (A = F / M)
			a.eqScale(&(p->f), (real)1.0 / p->mass);

			//V' = V + A * dt
			v.eqScale(&a, m_dDT);
			v.addEq(&(p->v));

			//X' = X + V' * dt
			x.eqScale(&v, m_dDT);
			x.addEq(&(p->p));

			p->v.copy(&v);
			p->p.copy(&x);
/*
			p = &(m_cElements[i]);

			a.copy(&(p->f));
			invM = m_dDT/p->mass;
			a.scale(invM);
			(p->v).addEq(&a);

			v.copy(&(p->v));
			v.scale(m_dDT);

			(p->p).addEq(&v);
*/
		}
	}
	
	doConstraints();

	m_dT += m_dDT;
	++m_iSimTicks;
}











// we're going to put the force at m_cForces[s][m_iCounts[s]]. 
// but what entry of m_iMaps[s] can we use? r.
void physManager::getIndex(int *r, const physForceStyle s) {
	int i, max;
	short int *m;
	*r = -1; 

	if ((s<=PHYS_FSTYLE_ERROR) || (s>=PHYS_FSTYLE_LAST)) { return; }

	max = m_iLimits[s]; 
	m = m_iMaps[s]; 

	if (m_iCounts[s] >= m_iLimits[s]) { 
		printf("physMgr::no available forces"); 
	} else {
		// ya jolly well better find one
		i = 0; 
		while ((i<max) && (*r==-1)) {
			if (m[i]==-1) {
				*r = i;
			}	
			++i;
		}
	}
}


// take a style and an index into maps, and make the number to return.
// do lots of error checking in case you're handed crap. 
void physManager::spinIndex(const int index, const physForceStyle st, int *result) {
	int i; 

	i=-1; 
	if ((st>PHYS_FSTYLE_ERROR) && (st<PHYS_FSTYLE_LAST)) { 
		if ((index>-1) && (index < m_iCounts[st])) { 
			i = ( PHYS_MAX_OF_MAX * ((int)st) ) + index; 
		}
	}
	*result = i; 

}

// take a spun index and return which element of maps to use. 
// do lots of error checking in case you're handed crap. 
void physManager::unspinIndex(const int index, physForceStyle *st, int *result) {
	int i;
	physForceStyle j; 

	i = -1; 
	j = PHYS_FSTYLE_ERROR;

	if (index>=0) { 
		i = index % PHYS_MAX_OF_MAX;
		j = (physForceStyle)((index-i) /  PHYS_MAX_OF_MAX);
		// how many ways could you screw this up? 
		if ((j<PHYS_FSTYLE_ERROR) || (j>=PHYS_FSTYLE_LAST)) { 
			j = PHYS_FSTYLE_ERROR; 
		}
	}
	*result = i; 
	*st = j; 
}




//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////







void physManager::initElements(const int mP) {
	int i, lmp;
	
	lmp = mP; 
	if (lmp>=PHYS_MAX_PARTS) {
		lmp = PHYS_MAX_PARTS; 
	}

	if (m_iPCount!=0) { 
		delete [] m_cElements; 
	}

	m_cElements = new physElement[lmp];
	m_dT= (real)0.0;
	m_dDT= (real)0.1;
	m_iSimTicks= 0;
	m_iPCount = lmp; 
	
	for (i=0; i<lmp; ++i) {
		m_cElements[i].copy(&m_cPart);
		m_cElements[i].active = false; 
	}
}





void physManager::addElement(int *res, physElement *p) {
	int i; 

	*res = -1; 
	i=0; 
	while ((*res==-1)&&(i<m_iPCount)) {
		if (!(m_cElements[i].active)) {
			*res = i; 
		}
		++i;
	}

	if (*res!=-1) {
		m_cElements[*res].copy(p);
	} else {
		printf("failed addElement");
	}
}


void physManager::addElement(int *res) {
	int i; 

	*res = -1; 
	i=0; 
	while ((*res==-1)&&(i<m_iPCount)) {
		if (!(m_cElements[i].active)) {
			*res = i; 
		}
		++i;
	}

	if (*res!=-1) {
		m_cElements[*res].copy(&m_cPart);
	} else {
		printf("failed addElement");
	}
}




void physManager::deleteElement(const int which) {
	if ((which>=0) && (which<m_iPCount)) {
		m_cElements[which].active = false;
	}
}



/////////////////////////////////////////////// force-handling


void physManager::deleteForce(const int which) {
	physForceStyle st; 
	int i, unspun, unmapped; 

	unspinIndex(which, &st, &unspun); 
	if (st==PHYS_FSTYLE_ERROR) { return; }

	unmapped = m_iMaps[st][unspun];
	if ((unmapped<0) || (unmapped>m_iCounts[st])) {
		printf("physmgr:: unmap error"); 
	}
	delete m_pForces[st][unmapped];

	// compact force list
	for (i=unmapped; i<(m_iCounts[st]-1); ++i) {
		m_pForces[st][i] = m_pForces[st][i+1]; 
	}
	m_pForces[st][(m_iCounts[st])] = NULL; 
	--(m_iCounts[st]); 

	// reset map entries
	for (i=0; i<m_iLimits[st]; ++i) {
		if (m_iMaps[st][i]>unmapped) {
			--(m_iMaps[st][i]);
		}
	}
	m_iMaps[st][unspun] = -1; 
}





void physManager::doInput(const int which, mVec3 *p) {
	physForceStyle st; 
	int unspun, i; 

	unspinIndex(which, &st, &unspun); 
	if (st==PHYS_FSTYLE_ERROR) { return; }

	i = m_iMaps[st][unspun]; 

	if ((i>-1) && (i<m_iCounts[st])) {
		 m_pForces[st][i]->takeIt(p); 
	}
}




void physManager::doTick(const real t, const real dt) {
	// don't run backwards, and don't run a step 
	// so tiny you can't even tell it happened. 
	m_dDT = dt;
	m_dT = t;
	doMove();
}




