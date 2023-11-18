// JS Strict Mode
"use strict";

// Canvas Setting Value
var canvas;
var gl;
var program;

// Object Setting Value
var pointsArray = [];
var normalsArray = [];

var vertices = [
    vec4(0.5, -0.5, 0.5, 1.0),
    vec4(0.5, -0.5, -0.5, 1.0),
    vec4(-0.5, -0.5, -0.5, 1.0),
    vec4(-0.5, -0.5, 0.5, 1.0),
    vec4(0, 0.5, 0, 1.0)
];

// Object Control Value
var objectTheta = [0, 0, 0];
var flag = false;
var speed = 3;
var direction = true;
var axis = 0;

// Viewer Control Value
var modelViewMatrix;
var projectionMatrix;

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
var lightPosition = vec4(prompt("Light Position X (Float)", "1.0"), prompt("Light Position Y (Float)", "1.0"), prompt("Light Position Z (Float)", "1.0"), 1.0);
var shininess = prompt("Shininess (Float)", "100.0");

var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);
var materialAmbient = vec4(1.0, 0.0, 1.0, 1.0);
var materialDiffuse = vec4(1.0, 0.8, 0.0, 1.0);
var materialSpecular = vec4(1.0, 0.8, 0.0, 1.0);

// Initial Function
window.onload = function init() {
    // Canvas Setting
    canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    // Configure WebGL
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    // Load Shader and Initialize Attribute Buffer
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Object Setting
    colorPyramid();

    // load the point data into the gpu
    var pBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    // associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    // load the color data into the gpu
    var nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

    // associate out shader variables with our data buffer
    var vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);

    // Color Uniform Value
    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"), flatten(mult(lightAmbient, materialAmbient)));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"), flatten(mult(lightDiffuse, materialDiffuse)));
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), flatten(mult(lightSpecular, materialSpecular)));
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), flatten(lightPosition));
    gl.uniform1f(gl.getUniformLocation(program, "shininess"), shininess);

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

    // Event Listener for Light Control

    // Object Render
    render();
}

// Object Pyramid Setting Function
function colorPyramid() {
    quad(0, 1, 2, 3);
    tri(0, 1, 4);
    tri(1, 2, 4);
    tri(2, 3, 4);
    tri(3, 0, 4);
}

// Object Square Setting Function
function quad(x1, x2, x3, x4) {
    var t1 = subtract(vertices[x2], vertices[x1]);
    var t2 = subtract(vertices[x3], vertices[x2]);
    var normal = cross(t1, t2);
    var normal = vec3(normal);

    pointsArray.push(vertices[x1]);
    normalsArray.push(normal);
    pointsArray.push(vertices[x2]);
    normalsArray.push(normal);
    pointsArray.push(vertices[x3]);
    normalsArray.push(normal);
    pointsArray.push(vertices[x1]);
    normalsArray.push(normal);
    pointsArray.push(vertices[x3]);
    normalsArray.push(normal);
    pointsArray.push(vertices[x4]);
    normalsArray.push(normal);
}

// Object Triangle Setting Function
function tri(x1, x2, x3) {
    var t1 = subtract(vertices[x2], vertices[x1]);
    var t2 = subtract(vertices[x3], vertices[x2]);
    var normal = cross(t1, t2);
    var normal = vec3(normal);

    pointsArray.push(vertices[x1]);
    normalsArray.push(normal);
    pointsArray.push(vertices[x2]);
    normalsArray.push(normal);
    pointsArray.push(vertices[x3]);
    normalsArray.push(normal);
}

// Object Render Function
function render() {
    // Canvas Clean
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Object, Viewer, Light Animation Setting
    if (flag) objectTheta[axis] += (direction ? speed : -speed);

    eye = vec3(radius * Math.sin(phi), radius * Math.sin(theta), radius * Math.cos(phi));
    modelViewMatrix = lookAt(eye, at, up);

    modelViewMatrix = mult(modelViewMatrix, rotate(objectTheta[0], [1, 0, 0]));
    modelViewMatrix = mult(modelViewMatrix, rotate(objectTheta[1], [0, 1, 0]));
    modelViewMatrix = mult(modelViewMatrix, rotate(objectTheta[2], [0, 0, 1]));

    projectionMatrix = ortho(left, right, bottom, ytop, near, far);
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "modelViewMatrix"), false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "projectionMatrix"), false, flatten(projectionMatrix));

    // Object Render
    gl.drawArrays(gl.TRIANGLES, 0, 18);
    requestAnimFrame(render);
}
