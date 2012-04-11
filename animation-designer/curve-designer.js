var canvas, ctx, pointers, animationElement;
var init = function () {
	canvas = document.getElementById('curve-designer');

	pointers = document.getElementsByClassName('curve-pointer');
	pointers[0].addEventListener('mousedown', startDragging, false);
	pointers[0].addEventListener('mouseup', endDragging, false);
	pointers[1].addEventListener('mousedown', startDragging, false);
	pointers[1].addEventListener('mouseup', endDragging, false);
	document.addEventListener('mousemove', doDragging, false);

	pointers[0].style.top = canvas.offsetTop -15 + 'px';
	pointers[0].style.left = canvas.offsetLeft - 15 + 'px';
	pointers[1].style.top = canvas.offsetTop - 15 + 300 + 'px';
	pointers[1].style.left = canvas.offsetLeft - 15 + 300 + 'px';

	ctx = canvas.getContext('2d');
	ctx.strokeStyle = 'rgb(200,0,0)';

	drawLine();

	animationElement = document.getElementById('animation-element');
	generateTransition();

	animationButton = document.getElementById('animation-trigger');
	animationButton.addEventListener('click', function () { toggleAnimation(); }, false);
};

var draggedElement = null;
var startDragging = function (e) {
	draggedElement = this;
	e.preventDefault();
};
var doDragging = function (e) {
	if (!draggedElement) return;

	draggedElement.style.top = e.y - 15 + 'px';
	draggedElement.style.left = e.x - 15 + 'px';
	drawLine();
	e.preventDefault();
};
var endDragging = function (e) {
	draggedElement = null;
	generateTransition();

	e.preventDefault();
};

var drawLine = function () {
	ctx.clearRect(0, 0, 300, 300);
	ctx.beginPath();
	ctx.moveTo(0, 300);
	ctx.bezierCurveTo(
		pointers[0].offsetLeft - canvas.offsetLeft + 15, 
		pointers[0].offsetTop - canvas.offsetTop + 15, 
		pointers[1].offsetLeft - canvas.offsetLeft + 15, 
		pointers[1].offsetTop - canvas.offsetTop + 15, 
		300, 0);
	ctx.stroke();

	ctx.beginPath();
	ctx.moveTo(0, 300);
	ctx.lineTo(
		pointers[0].offsetLeft - canvas.offsetLeft + 15, 
		pointers[0].offsetTop - canvas.offsetTop + 15 
	);
	ctx.stroke();

	ctx.beginPath();
	ctx.moveTo(300, 0);
	ctx.lineTo(
		pointers[1].offsetLeft - canvas.offsetLeft + 15, 
		pointers[1].offsetTop - canvas.offsetTop + 15 
	);
	ctx.stroke();
};

var toggleAnimation = (function () {
	var isRun = false;
		
	return function () {
		if (!isRun) animationElement.setAttribute('class', 'animation-run');
		else animationElement.setAttribute('class', '');

		isRun = !isRun;
	};
})();

var generateTransition = function () {
	// cubic-bezier(0.25, 0.1, 0.25, 1.0)
	// 
	var ax = (pointers[0].offsetLeft - canvas.offsetLeft + 15), 
			ay = 300 - (pointers[0].offsetTop - canvas.offsetTop + 15), 
			bx = (pointers[1].offsetLeft - canvas.offsetLeft + 15), 
			by = 300 - (pointers[1].offsetTop - canvas.offsetTop + 15);

	ax = ax / 300;
	ay = ay / 300;
	bx = bx / 300;
	by = by / 300;

	var fun = 'cubic-bezier(+' + ax + ',' + ay + ',' + bx + ',' + by + ')';
	animationElement.style['-webkit-transition-timing-function'] = fun; 
};

window.addEventListener('load', init, false);
