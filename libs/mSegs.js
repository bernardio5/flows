
/* 








void physAttractor::init(const int p, mVec3 *tar, real strength)
{
	m_rStrength = strength;
	p1 = p;
	target.copy(tar);
}

void physAttractor::doIt(physElement *elements, const real t, const real dt)
{
	
	mVec3	delta;
	real	distSq;
	real	speedLimit = 10.0f;

	delta.copy(&target);
	delta.distanceFromsq(&(elements[p1].p), &distSq);
	delta.subEq(&(elements[p1].p));


	delta.normalize();
	if(distSq > 100.0f)
		distSq = 100.0f;

	delta.scale((1.0f/distSq) * m_rStrength * dt);
	elements[p1].v.addEq(&delta);

//Temporary speed limit hack
	if(elements[p1].v.x > speedLimit)
		elements[p1].v.x = speedLimit;
	if(elements[p1].v.x < -speedLimit)
		elements[p1].v.x = -speedLimit;
	if(elements[p1].v.y > speedLimit)
		elements[p1].v.y = speedLimit;
	if(elements[p1].v.y < -speedLimit)
		elements[p1].v.y = -speedLimit;
	if(elements[p1].v.z > speedLimit)
		elements[p1].v.z = speedLimit;
	if(elements[p1].v.z < -speedLimit)
		elements[p1].v.z = -speedLimit;


	//(p->v).y += m_iStrength * dt;
	
}

void physAttractor::takeIt(mVec3 *newTar)
{
	target.copy(newTar);
}









// shadower maker
void physFloater::init(const int pa, const int pb, mVec3 *dir) {
	p1 = pa;
	p2 = pb;
	d.copy(dir); 
}
void physFloater::doIt(physElement *elements, const real t, const real dt) {
	(elements[p1].v).copy(&(elements[p2].v));
	(elements[p1].p).eqAdd(&(elements[p2].p), &d);
}







// velocity-dependent air-drag-like force.
void physFriction::init()
{
	m_rDragCoefficient = (real)0.03;
	m_rRho = (real)1.29; //kg/m^3
}

void physFriction::doIt(physElement *e, const real t, const real dt)
{
	
	mVec3	dragVector;
	real	speed;

	dragVector.copy(&(e->v));
	dragVector.length3sq(&speed);
	dragVector.scale(-(real)0.5f * m_rRho * m_rDragCoefficient * speed * e->r * e->r);
	e->f.addEq(&dragVector);
	
}





// "down"-ward (-y) force. 
void physGravity::init(real s) {
	str = s;
}

void physGravity::doIt(physElement *e, const real t, const real dt)
{
	// e->f.y += (str * e->mass);
}



////////////
// Helium //
////////////
void physHelium::init(const int p1, const real rate)
{
	m_iP1 = p1;
	m_rRate = rate;
}

void physHelium::doIt(physElement *elements, const real t, const real dt)
{
	//elements[m_iP1].f.y += (m_rRate * elements[m_iP1].mass);
}







//////////////
// poser
////////////
void physPoser::init(const int pindx, mVec3 *p, mVec3 *v) {
	p1 = pindx; 
	poser = p; 
	volare = v; 
}



void physPoser::doIt(physElement *e, const real t, const real dt)
{
	//e[p1].p.copy(poser);
	//e[p1].v.copy(volare);
	//e[p1].f.zero();
}












void physRivet::init(const int pindx)
{
	p1 = pindx;
	pos.zero();
	vel.zero();
	ready = 0;
}

void physRivet::doIt(physElement *e, const real t, const real dt)
{
	if (ready==0) { // first execution, copy out position
		pos.copy(&(e[p1].p));
		ready = 1; 
	}
	e[p1].p.copy(&pos);
	e[p1].f.zero();
	e[p1].v.zero();
}





void physSpring::init(const int pa, const int pb, const real ak, const real restLen)
{
	p1 = pa;
	p2 = pb;
	k = ak;
	rlen = restLen;
}


void physSpring::doIt(physElement *elements, const real t, const real dt) {
	static real max = (real)1.0; 
	static real neglim = (real)-99.0; 
	real len;
	mVec3 df;
	
	if (rlen<neglim) {
		df.eqSub(&(elements[p1].op), &(elements[p2].op));
		df.length3(&len); 
		// set rest length = starting length
		rlen = len;
	}

	df.eqSub(&(elements[p1].p), &(elements[p2].p));
	df.length3(&len); 

	len = rlen  - len;
	if (len*len > max) { len = max; } 

	df.scale(k * len);

	elements[p1].f.addEq(&df); 
	elements[p2].f.subEq(&df); 
}
*/
