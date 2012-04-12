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
	this.ctx = this.canvas.getContext('2d');
	this.ctx.strokeStyle = 'rgb(200,0,0)';
	this.ctx.fillStyle = 'rgb(0,0,0)';

	return this;
};

BezierPath.prototype.addPointer = function(pointer) {
	pointer.bezierPath = this;
	this.pointers.push(pointer);
};

BezierPath.prototype.drawLine = function () {
	this.ctx.clearRect(0, 0, 300, 300);
	this.ctx.beginPath();
	this.ctx.moveTo(0, 300);
	this.ctx.bezierCurveTo(
		this.pointers[0].getLeft() - this.canvas.offsetLeft + 15, 
		this.pointers[0].getTop() - this.canvas.offsetTop + 15, 
		this.pointers[1].getLeft() - this.canvas.offsetLeft + 15, 
		this.pointers[1].getTop() - this.canvas.offsetTop + 15, 
		300, 0);
	this.ctx.stroke();

	this.ctx.beginPath();
	this.ctx.moveTo(0, 300);
	this.ctx.lineTo(
		this.pointers[0].getLeft() - this.canvas.offsetLeft + 15, 
		this.pointers[0].getTop() - this.canvas.offsetTop + 15 
	);
	this.ctx.stroke();

	this.ctx.beginPath();
	this.ctx.moveTo(300, 0);
	this.ctx.lineTo(
		this.pointers[1].getLeft() - this.canvas.offsetLeft + 15, 
		this.pointers[1].getTop() - this.canvas.offsetTop + 15 
	);
	this.ctx.stroke();
};

BezierPath.prototype.toggleAnimation = function () {
		if (animationLocked) return;

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
	var P1x = 0,
			P1y = 300,
			P2x = this.pointers[0].getLeft() - this.canvas.offsetLeft + 15,
			P2y = this.pointers[0].getTop() - this.canvas.offsetTop + 15,
			P3x = this.pointers[1].getLeft() - this.canvas.offsetLeft + 15,
			P3y = this.pointers[1].getTop() - this.canvas.offsetTop + 15,
			P4x = 300,
			P4y = 0;

	var bezierX = function (t) {
		var s = (1 - t);
		return s*s*s*P1x + 3*s*s*t*P2x + 3*s*t*t*P3x + t*t*t*P4x;
	};
	var bezierY = function (t) {
		var s = (1 - t);
		return s*s*s*P1y + 3*s*s*t*P2y + 3*s*t*t*P3y + t*t*t*P4y;
	};

	var imageData = this.ctx.getImageData(0, 0, 300, 300);

	var t = 1;
	var interval = setInterval((function () {
			var x = parseInt(bezierX(t / 40));
			var y = parseInt(bezierY(t / 40));
	
			this.ctx.clearRect(0, 0, 300, 300);
			this.ctx.putImageData(imageData, 0, 0);
			this.ctx.beginPath();
			this.ctx.arc(x, y, 5, 0, 2 * Math.PI, false);
			this.ctx.fill();
	
			if (t == 40) clearInterval(interval);
			t++;
		}).bind(this), 25);
};

BezierPath.prototype.generateTransition = function () {
	var ax = (this.pointers[0].getLeft() - this.canvas.offsetLeft + 15), 
			ay = 300 - (this.pointers[0].getTop() - this.canvas.offsetTop + 15), 
			bx = (this.pointers[1].getLeft() - this.canvas.offsetLeft + 15), 
			by = 300 - (this.pointers[1].getTop() - this.canvas.offsetTop + 15);

	ax = ax / 300;
	ay = ay / 300;
	bx = bx / 300;
	by = by / 300;

	var fun = 'cubic-bezier(+' + ax + ',' + ay + ',' + bx + ',' + by + ')';
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