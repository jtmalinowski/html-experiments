var canvas, ctx, pointers;
var init = function () {
	canvas = document.getElementById('curve-designer');

	pointers = document.getElementsByClassName('curve-pointer');
	pointers[0].addEventListener('mousedown', startDragging, false);
	pointers[0].addEventListener('mouseup', endDragging, false);
	pointers[1].addEventListener('mousedown', startDragging, false);
	pointers[1].addEventListener('mouseup', endDragging, false);
	document.addEventListener('mousemove', doDragging, false);

	pointers[0].style.top = canvas.offsetTop -15 + 'px';
	pointers[0].style.left = canvas.offsetLeft - 15 + 300 + 'px';
	pointers[1].style.top = canvas.offsetTop - 15 + 300 + 'px';
	pointers[1].style.left = canvas.offsetLeft - 15 + 'px';

	ctx = canvas.getContext('2d');
	ctx.strokeStyle = 'rgb(200,0,0)';

	drawLine();
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
	e.preventDefault();
};

var drawLine = function () {
	ctx.clearRect(0, 0, 300, 300);
	ctx.beginPath();
	ctx.moveTo(0, 0);
	ctx.bezierCurveTo(
		pointers[0].offsetLeft - canvas.offsetLeft + 15, 
		pointers[0].offsetTop - canvas.offsetTop + 15, 
		pointers[1].offsetLeft - canvas.offsetLeft + 15, 
		pointers[1].offsetTop - canvas.offsetTop + 15, 
		300, 300);
	ctx.stroke();

	ctx.beginPath();
	ctx.moveTo(0, 0);
	ctx.lineTo(
		pointers[0].offsetLeft - canvas.offsetLeft + 15, 
		pointers[0].offsetTop - canvas.offsetTop + 15 
	);
	ctx.stroke();

	ctx.beginPath();
	ctx.moveTo(300, 300);
	ctx.lineTo(
		pointers[1].offsetLeft - canvas.offsetLeft + 15, 
		pointers[1].offsetTop - canvas.offsetTop + 15 
	);
	ctx.stroke();
};

var generateTransition = function () {
	// cubic-bezier(0.25, 0.1, 0.25, 1.0)
};

window.addEventListener('load', init, false);
