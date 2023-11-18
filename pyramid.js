// javascript strict mode
"use strict";

// canvas setting
var canvas;
var gl;

// object render
var points = [];
var colors = [];
var theta = [0, 0, 0];
var thetaLoc;

// object control
var speed = 3;
var direction = true;
var axis = 0;

window.onload = function init() {
    // canvas setting
    canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    // pyramid setting
    colorPyramid();

    // configure webgl
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    // load shaders and initialize attribute buffers
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // load the color data into the gpu
    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    // load the vertex data into the gpu
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    // associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    // load the uniform data into the gpu
    thetaLoc = gl.getUniformLocation(program, "theta");

    // event listeners for buttons
    document.getElementById("Faster").onclick = function () { speed = speed + 1; }
    document.getElementById("Slower").onclick = function () { speed = speed - 1; }
    document.getElementById("Direction").onclick = function () { direction = !direction; };
    document.getElementById("xButton").onclick = function () { axis = 0; }
    document.getElementById("yButton").onclick = function () { axis = 1; }
    document.getElementById("zButton").onclick = function () { axis = 2; }

    // render
    render();
}

function colorPyramid() {
    // triangle, square setting
    rectangle(1, 2, 4, 3, 0);
    rectangle(0, 1, 2, -1, 1);
    rectangle(0, 2, 4, -1, 2);
    rectangle(0, 4, 3, -1, 4);
    rectangle(0, 3, 1, -1, 5);
}

function rectangle(x1, x2, x3, x4, color) {
    // pyramid vertices
    var vertices = [
        vec4(0, 0.5, 0, 1.0),
        vec4(0.5, -0.5, 0.5, 1.0),
        vec4(0.5, -0.5, -0.5, 1.0),
        vec4(-0.5, -0.5, 0.5, 1.0),
        vec4(-0.5, -0.5, -0.5, 1.0)
    ];

    var vertexColors = [
        [1.0, 0.0, 0.0, 1.0],  // red
        [0.0, 1.0, 0.0, 1.0],  // green
        [0.0, 0.0, 1.0, 1.0],  // blue
        [1.0, 1.0, 1.0, 1.0]   // white
        [0.0, 1.0, 1.0, 1.0],  // cyan
        [1.0, 0.0, 1.0, 1.0],  // magenta
        [1.0, 1.0, 0.0, 1.0],  // yellow
        [0.0, 0.0, 0.0, 1.0],  // black
    ];

    // triangle&square vertex&color add
    var indices = []
    if (x4 >= 0) { indices = [x1, x2, x3, x1, x3, x4]; }
    else { indices = [x1, x2, x3]; }

    for (var i = 0; i < indices.length; i++) {
        points.push(vertices[indices[i]]);
        colors.push(vertexColors[color]);
    }
}

function render() {
    // canvas clear
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // uniform setting
    theta[axis] += (direction ? speed : -speed);
    gl.uniform3fv(thetaLoc, theta);

    // draw rectangle
    gl.drawArrays(gl.TRIANGLES, 0, 18);

    // render rectangle
    requestAnimFrame(render);
}
