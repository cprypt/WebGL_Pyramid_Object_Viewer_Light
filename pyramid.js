// JS Strict Mode
"use strict";

// Canvas Setting Value
var canvas;
var gl;

// Object Setting Value
var pointsArray = [];
var colorsArray = [];

var vertices = [
    vec4(0.5, -0.5, 0.5, 1.0),
    vec4(0.5, -0.5, -0.5, 1.0),
    vec4(-0.5, -0.5, -0.5, 1.0),
    vec4(-0.5, -0.5, 0.5, 1.0),
    vec4(0, 0.5, 0, 1.0)
];

var vertexColors = [
    vec4(1.0, 0.0, 0.0, 1.0),  // red
    vec4(0.0, 1.0, 0.0, 1.0),  // green
    vec4(0.0, 0.0, 1.0, 1.0),  // blue
    vec4(1.0, 1.0, 1.0, 1.0),  // white
    vec4(0.0, 1.0, 1.0, 1.0),  // cyan
    vec4(1.0, 0.0, 1.0, 1.0),  // magenta
    vec4(1.0, 1.0, 0.0, 1.0),  // yellow
    vec4(0.0, 0.0, 0.0, 1.0),  // black
];

// Object Control Value
var objectTheta = [0, 0, 0];
var objectThetaLoc;

var flag = false;
var speed = 3;
var direction = true;
var axis = 0;

// Viewer Control Value
var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;

var eye;
const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

var near = -1.0;
var far = 1.0;
var radius = 1.0;
var theta = 0.0;
var phi = 0.0;

var ytop = 1.0;
var bottom = -1.0;
var right = 1.0;
var left = -1.0;

// Light Control Value

// Initial Function
window.onload = function init() {
    // Canvas Setting
    canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    // Object Setting
    colorPyramid();

    // Configure WebGL
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    // load shaders and initialize attribute buffers
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // load the point data into the gpu
    var pBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    // associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    // load the color data into the gpu
    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW);

    // associate out shader variables with our data buffer
    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    // load the uniform data into the gpu
    objectThetaLoc = gl.getUniformLocation(program, "objectTheta");
    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");

    // Event Listener for Object Control
    document.getElementById("Toggle").onclick = function () { flag = !flag; }
    document.getElementById("Faster").onclick = function () { speed = speed + 1; }
    document.getElementById("Slower").onclick = function () { speed = speed - 1; }
    document.getElementById("Direction").onclick = function () { direction = !direction; }
    document.getElementById("xButton").onclick = function () { axis = 0; }
    document.getElementById("yButton").onclick = function () { axis = 1; }
    document.getElementById("zButton").onclick = function () { axis = 2; }

    // Event Listener for Viewer Control
    document.getElementById("depth1").onclick = function () { near *= 1.1; far *= 1.1; }
    document.getElementById("depth2").onclick = function () { near *= 0.9; far *= 0.9; }
    document.getElementById("radius1").onclick = function () { radius *= 1.1; }
    document.getElementById("radius2").onclick = function () { radius *= 0.9; }
    document.getElementById("theta1").onclick = function () { theta += 0.1; }
    document.getElementById("theta2").onclick = function () { theta -= 0.1; }
    document.getElementById("phi1").onclick = function () { phi += 0.1; }
    document.getElementById("phi2").onclick = function () { phi -= 0.1; }
    document.getElementById("height1").onclick = function () { ytop *= 1.1; bottom *= 1.1; }
    document.getElementById("height2").onclick = function () { ytop *= 0.9; bottom *= 0.9; }
    document.getElementById("width1").onclick = function () { right *= 1.1; left *= 1.1; }
    document.getElementById("width2").onclick = function () { right *= 0.9; left *= 0.9; }

    // Object Render
    render();
}

// Object Pyramid Setting Function
function colorPyramid() {
    quad(0, 1, 2, 3, 0);
    tri(0, 1, 4, 1);
    tri(1, 2, 4, 2);
    tri(2, 3, 4, 4);
    tri(3, 0, 4, 5);
}

// Object Square Setting Function
function quad(x1, x2, x3, x4, color) {
    var idx = [x1, x2, x3, x1, x3, x4];

    for (var i = 0; i < idx.length; i++) {
        pointsArray.push(vertices[idx[i]]);
        colorsArray.push(vertexColors[color]);
    }
}

// Object Triangle Setting Function
function tri(x1, x2, x3, color) {
    var idx = [x1, x2, x3];

    for (var i = 0; i < idx.length; i++) {
        pointsArray.push(vertices[idx[i]]);
        colorsArray.push(vertexColors[color]);
    }
}

// Object Render Function
function render() {
    // Canvas Clean
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Uniform Value
    if (flag) objectTheta[axis] += (direction ? speed : -speed);
    gl.uniform3fv(objectThetaLoc, objectTheta);

    eye = vec3(radius * Math.sin(phi), radius * Math.sin(theta), radius * Math.cos(phi));
    modelViewMatrix = lookAt(eye, at, up);
    projectionMatrix = ortho(left, right, bottom, ytop, near, far);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

    // Object Render
    gl.drawArrays(gl.TRIANGLES, 0, 18);
    requestAnimFrame(render);
}
