var Pointer = function (x, y) {
	this.domElement = document.createElement('div');
	this.domElement.setAttribute('class', 'curve-pointer');

	this.domElement.style.position = 'absolute';
	this.domElement.style.top = y + 'px';
	this.domElement.style.left = x + 'px';

	this.draggingHandler = this.doDragging.bind(this);
	
	document.body.appendChild(this.domElement);
	this.domElement.addEventListener('mousedown', this.startDragging.bind(this), false);
	this.domElement.addEventListener('mouseup', this.endDragging.bind(this), false);

	this.bezierPath = null;

	return this;
};

Pointer.prototype.startDragging = function (e) {
	document.addEventListener('mousemove', this.draggingHandler, false);
	e.preventDefault();
};
Pointer.prototype.doDragging = function (e) {
	this.domElement.style.top = e.y - 15 + 'px';
	this.domElement.style.left = e.x - 15 + 'px';

	this.bezierPath && this.bezierPath.drawLine();
	e.preventDefault();
};
Pointer.prototype.endDragging = function (e) {
	document.removeEventListener('mousemove', this.draggingHandler, false);
	this.bezierPath && this.bezierPath.generateTransition();

	e.preventDefault();
};

Pointer.prototype.getLeft = function() {
	return this.domElement.offsetLeft;
};
Pointer.prototype.getTop = function() {
	return this.domElement.offsetTop;
};

var BezierPath = function () {
	this.pointers = [];
	this.isRun = false;

	this.domElement = document.getElementById('curve-designer');

	animationElement = document.getElementById('animation-element');
	animationButton = document.getElementById('animation-trigger');

	animationElement.addEventListener('webkitTransitionEnd', this.unlockAnimation.bind(this), false);
	animationButton.addEventListener('click', this.toggleAnimation.bind(this), false);

	this.addPointer(new Pointer(this.domElement.offsetLeft - 15, this.domElement.offsetTop - 15));
	this.addPointer(new Pointer(this.domElement.offsetLeft - 15 + 300, this.domElement.offsetTop - 15 + 300));	

	this.canvas = document.getElementById('curve-designer');
	this.designerContext = this.canvas.getContext('2d');
	this.designerContext.strokeStyle = 'rgb(200,0,0)';
	this.designerContext.fillStyle = 'rgb(0,0,0)';

	this.presenterContext = document.getElementById('curve-presenter').getContext('2d');
	this.designerContext.strokeStyle = 'rgb(200,0,0)';
	this.designerContext.fillStyle = 'rgb(0,0,0)';

	this.animationCode = document.getElementById('animation-code');

	return this;
};

BezierPath.prototype.addPointer = function(pointer) {
	pointer.bezierPath = this;
	this.pointers.push(pointer);
};

BezierPath.prototype.drawLine = function () {
	var points = this.getBezierPoints();
	
	this.designerContext.clearRect(0, 0, 300, 300);
	this.designerContext.beginPath();
	this.designerContext.moveTo(0, 300);
	this.designerContext.bezierCurveTo(
		points[0].x * 300, 
		300 - points[0].y * 300, 
		points[1].x * 300, 
		300 - points[1].y * 300, 
		300, 0);
	this.designerContext.stroke();

	this.designerContext.beginPath();
	this.designerContext.moveTo(0, 300);
	this.designerContext.lineTo(
		points[0].x * 300, 
		300 - points[0].y * 300 
	);
	this.designerContext.stroke();

	this.designerContext.beginPath();
	this.designerContext.moveTo(300, 0);
	this.designerContext.lineTo(
		points[1].x * 300, 
		300 - points[1].y * 300 
	);
	this.designerContext.stroke();

	var P1x = 0,
			P1y = 0,
			P2x = points[0].y * 500,
			P2y = points[0].x * 200,
			P3x = points[1].y * 500,
			P3y = points[1].x * 200,
			P4x = 500,
			P4y = 200;

	this.isRun && (P1x = 500 - P1x);
	this.isRun && (P2x = 500 - P2x);
	this.isRun && (P3x = 500 - P3x);
	this.isRun && (P4x = 500 - P4x);

	this.presenterContext.clearRect(0, 0, 500, 200);
	this.presenterContext.beginPath();
	this.presenterContext.moveTo(P1x, P1y);
	this.presenterContext.bezierCurveTo(P2x, P2y, P3x, P3y, P4x, P4y);
	this.presenterContext.stroke();
};

BezierPath.prototype.toggleAnimation = function () {
	if (animationLocked) return;

	this.drawLine();
	this.runAnimationIndicator();

	if (!this.isRun) animationElement.setAttribute('class', 'animation-run');
	else animationElement.setAttribute('class', '');

	this.isRun = !this.isRun;
	animationLocked = true;
};

BezierPath.prototype.unlockAnimation = function () {
	animationLocked = false;
};

BezierPath.prototype.runAnimationIndicator = function () {
	var points = this.getBezierPoints();
	var D1x = 0,
			D1y = 300,
			D2x = points[0].x * 300,
			D2y = 300 - points[0].y * 300,
			D3x = points[1].x * 300,
			D3y = 300 - points[1].y * 300,
			D4x = 300,
			D4y = 0;

	var P1x = 0,
			P1y = 0,
			P2x = points[0].x * 200,
			P2y = points[0].y * 500,
			P3x = points[1].x * 200,
			P3y = points[1].y * 500,
			P4x = 200,
			P4y = 500; 

	this.isRun && (P1y = 500 - P1y);
	this.isRun && (P2y = 500 - P2y);
	this.isRun && (P3y = 500 - P3y);
	this.isRun && (P4y = 500 - P4y);

	var bezier = function (t, p1, p2, p3, p4) {
		var s = (1 - t);
		return s*s*s*p1 + 3*s*s*t*p2 + 3*s*t*t*p3 + t*t*t*p4;
	};

	var designerImageData = this.designerContext.getImageData(0, 0, 300, 300);
	var presenterImageData = this.presenterContext.getImageData(0, 0, 500, 200);

	var t = 1;
	var interval = setInterval((function () {
		var Dx = parseInt(bezier(t / 40, D1x, D2x, D3x, D4x));
		var Dy = parseInt(bezier(t / 40, D1y, D2y, D3y, D4y));

		this.designerContext.clearRect(0, 0, 300, 300);
		this.designerContext.putImageData(designerImageData, 0, 0);
		this.designerContext.beginPath();
		this.designerContext.arc(Dx, Dy, 5, 0, 2 * Math.PI, false);
		this.designerContext.fill();

		var Px = parseInt(bezier(t / 40, P1x, P2x, P3x, P4x));
		var Py = parseInt(bezier(t / 40, P1y, P2y, P3y, P4y));

		this.presenterContext.clearRect(0, 0, 500, 200);
		this.presenterContext.putImageData(presenterImageData, 0, 0);
		this.presenterContext.beginPath();
		this.presenterContext.arc(Py, Px, 5, 0, 2 * Math.PI, false);
		this.presenterContext.fill();

		if (t == 40) clearInterval(interval);
		t++;
	}).bind(this), 25);
};

BezierPath.prototype.getBezierPoints = function() {
	var ax = (this.pointers[0].getLeft() - this.canvas.offsetLeft + 15), 
			ay = 300 - (this.pointers[0].getTop() - this.canvas.offsetTop + 15), 
			bx = (this.pointers[1].getLeft() - this.canvas.offsetLeft + 15), 
			by = 300 - (this.pointers[1].getTop() - this.canvas.offsetTop + 15);

	ax = ax / 300;
	ay = ay / 300;
	bx = bx / 300;
	by = by / 300;

	return [{ x: ax, y: ay }, { x: bx, y: by }];
};

BezierPath.prototype.generateTransition = function () {
	var points = this.getBezierPoints();

	var fun = 'cubic-bezier(+' 
		+ points[0].x.toFixed(3) + ',' 
		+ points[0].y.toFixed(3) + ',' 
		+ points[1].x.toFixed(3) + ',' 
		+ points[1].y.toFixed(3) + ')';

	this.animationCode.innerText = fun;
	animationElement.style['-webkit-transition-timing-function'] = fun; 
};

var animationElement, animationLocked;
var pointers = [];
(function () {

	var init = function () {
		var bezierPath = new BezierPath();
		
		bezierPath.drawLine();
		bezierPath.generateTransition();
	};

	window.addEventListener('load', init, false);
})();