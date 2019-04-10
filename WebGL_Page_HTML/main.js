// Thankyou very much to Amanda Ghassaei's very readable code. www.amandaghassaei.com

/*

-> I'll start by defining some boilerplate functions, whilst I really should do it in a
-> separate file, I'll do it in this same file so that you can see where the functions came from below.

-> Have a look at these functions, as they are standard procedures for creating WebGL programs, they are
-> 'boilerplate' code because they are always the same pieces of code in every program.

*/

var width, height;
var actualWidth, actualHeight;
var body;
var scale = 1;

var lastMouseCoordinates =  [0,0];
var mouseCoordinates =  [0,0];
var mouseEnable = false;
var mouseout = false;

var paused = false;//while window is resizing

var dt = 1;
var dx = 1;
var nu = 1;//viscosity
var rho = 1;//density

var GPU;

var threeView;

var numParticles = 160000;//perfect sq +++ usually 160000
var particlesTextureDim = 400;//sqrt(numParticles)
var particleData = new Float32Array(numParticles*4);//[position.x, position.y, velocity.x, velocity.y]
var particles;
var particlesVertices;
var vectorLength = 2;//num floats to parse

var settings = {
  scale_quality: 0.8

}

//====================

// function programConstructors(){
//   programs = {};
//   textures = {};
//   frameBuffers = {};
//   index = 0;
//
//   function programConstructors(programName, vertexShader, fragmentShader){
//     var programs = this.programs;
//     var program = programs[programName];
//     if (program) {
//         console.warn("already a program with the name " + programName);
//         return;
//     }
//     program = glBoilerplate.createProgramFromScripts(gl, vertexShader, fragmentShader);
//     gl.useProgram(program); // useProgram, loadVertexData have to use for each program
//     glBoilerplate.loadVertexData(gl, program);
//     programs[programName] = {
//         program: program,
//         uniforms: {}
//     };
//   };
//
//   GPUMath.prototype.initTextureFromData = function(name, width, height, typeName, data, shouldReplace){
//     var texture = this.textures[name];
//     if (!shouldReplace && texture) {
//         console.warn("already a texture with the name " + name);
//         return;
//     }
//     texture = glBoilerplate.makeTexture(gl, width, height, gl[typeName], data);
//     this.textures[name] = texture;
//   };
//
//   GPUMath.prototype.initFrameBufferForTexture = function(textureName, shouldReplace){
//     if (!shouldReplace) {
//         var framebuffer = this.frameBuffers[textureName];
//         if (framebuffer) {
//             console.warn("framebuffer already exists for texture " + textureName);
//             return;
//         }
//     }
//     var texture = this.textures[textureName];
//     if (!texture){
//         console.warn("texture " + textureName + " does not exist");
//         return;
//     }
//
//     framebuffer = gl.createFramebuffer();
//     gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
//     gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
//
//     var check = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
//     if(check != gl.FRAMEBUFFER_COMPLETE){
//         notSupported();
//     }
//
//     this.frameBuffers[textureName] = framebuffer;
//   };
//
//   GPUMath.prototype.setUniformForProgram = function(programName, name, val, type){
//     if (!this.programs[programName]){
//         console.warn("no program with name " + programName);
//         return;
//     }
//     var uniforms = this.programs[programName].uniforms;
//     var location = uniforms[name];
//     if (!location) {
//         location = gl.getUniformLocation(this.programs[programName].program, name);
//         uniforms[name] = location;
//     }
//     if (type == "1f") gl.uniform1f(location, val);
//     else if (type == "2f") gl.uniform2f(location, val[0], val[1]);
//     else if (type == "3f") gl.uniform3f(location, val[0], val[1], val[2]);
//     else if (type == "1i") gl.uniform1i(location, val);
//     else {
//         console.warn("no uniform for type " + type);
//     }
//   };
//
//   GPUMath.prototype.setSize = function(width, height){
//     gl.viewport(0, 0, width, height);
//     // canvas.clientWidth = width;
//     // canvas.clientHeight = height;
//   };
//
//   GPUMath.prototype.setProgram = function(programName){
//     gl.useProgram(this.programs[programName].program);
//   };
//
//   GPUMath.prototype.step = function(programName, inputTextures, outputTexture){
//
//     gl.useProgram(this.programs[programName].program);
//     gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffers[outputTexture]);
//     for (var i=0;i<inputTextures.length;i++){
//         gl.activeTexture(gl.TEXTURE0 + i);
//         gl.bindTexture(gl.TEXTURE_2D, this.textures[inputTextures[i]]);
//     }
//     gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);//draw to framebuffer
//   };
//
//   GPUMath.prototype.stepBoundary = function(programName, inputTextures, outputTexture){
//
//     gl.useProgram(this.programs[programName].program);
//     gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffers[outputTexture]);
//     for (var i=0;i<inputTextures.length;i++){
//         gl.activeTexture(gl.TEXTURE0 + i);
//         gl.bindTexture(gl.TEXTURE_2D, this.textures[inputTextures[i]]);
//     }
//     gl.drawArrays(gl.LINES, 0, 8);//draw to framebuffer
//   };
//
//   GPUMath.prototype.swapTextures = function(texture1Name, texture2Name){
//     var temp = this.textures[texture1Name];
//     this.textures[texture1Name] = this.textures[texture2Name];
//     this.textures[texture2Name] = temp;
//     temp = this.frameBuffers[texture1Name];
//     this.frameBuffers[texture1Name] = this.frameBuffers[texture2Name];
//     this.frameBuffers[texture2Name] = temp;
//   };
//
//   GPUMath.prototype.swap3Textures = function(texture1Name, texture2Name, texture3Name){
//     var temp = this.textures[texture3Name];
//     this.textures[texture3Name] = this.textures[texture2Name];
//     this.textures[texture2Name] = this.textures[texture1Name];
//     this.textures[texture1Name] = temp;
//     temp = this.frameBuffers[texture3Name];
//     this.frameBuffers[texture3Name] = this.frameBuffers[texture2Name];
//     this.frameBuffers[texture2Name] = this.frameBuffers[texture1Name];
//     this.frameBuffers[texture1Name] = temp;
//   };
//
//   GPUMath.prototype.readyToRead = function(){
//     return gl.checkFramebufferStatus(gl.FRAMEBUFFER) == gl.FRAMEBUFFER_COMPLETE;
//   };
//
//   GPUMath.prototype.readPixels = function(xMin, yMin, width, height, array){
//     gl.readPixels(xMin, yMin, width, height, gl.RGBA, gl.UNSIGNED_BYTE, array);
//   };
//
//   GPUMath.prototype.reset = function(){
//     this.programs = {};
//     this.frameBuffers = {};
//     this.textures = {};
//     this.index = 0;
//   };
//
//   /*
//   She's got 4 arrays atm: programs; frameBuffers; textures; index
//
//   programs is an array: programs[program name]
//   textures is an array: textures[name of texture]
//   frameBuffers is an array: frameBuffers[name of frame buffer]
//
//
//   */
//
// }


/*
        =============================
        Init function for the program:
        =============================
-> We'll define the initial conditions and initialize some of the values for the GPU here.
-> We will bind the values from each of the fragment and vertex shaders and set-up the program.

*/

window.onload = init();

function init(){

  // var canvas = document.getElementById("glcanvas");
  // var gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl"); // experimental-webgl runs on some older browsers, it is best to include jic.
  // body = document.getElementsByTagName("body")[0];
  // var floatTextures = gl.getExtension("OES_texture_float");
  //
  // if (!floatTextures) {
  //
  //   }
  //   gl.disable(gl.DEPTH_TEST);
  //
  // if(!gl){
  //   throw new Error ('WebGL not Supported') // let user know if it is not running.
  // }

  canvas = document.getElementById("glcanvas");
  body = document.getElementsByTagName("body")[0];

  window.onmousemove = onMouseMove; // define variable onMouseMove (line 332)
  window.onmousedown = onMouseDown; // define variable onMouseDown (line 344)
  window.onmouseup = onMouseUp;     // define variable onMouseUp (line 348)
  canvas.onmouseout = function (){
      mouseout = true;
  };
  canvas.onmouseenter = function (){
      mouseout = false;
  };

  window.onresize = onResize; // resize function defined at line 300

  GPU = initGPUMath();

  // create program - advect
  // set uniform for program - "u-dt"
  // set uniform for program - "u-velocity"
  // set uniform for program - "u-material"
  GPU.createProgram("advect", "2d-vertex-shader", "advectionShader"); // (line 39) // GPUMath
  GPU.setUniformForProgram("advect", "u_dt", dt, "1f");            // (line 91) // GPUMath
  GPU.setUniformForProgram("advect", "u_velocity", 0, "1i");
  GPU.setUniformForProgram("advect", "u_material", 1, "1i");

  // create program - gradient subtraction
  // set uniform for program - "u-const"
  // set uniform for program - "u-velocity"
  // set uniform for program - "u-pressure"
  GPU.createProgram("gradientSubtraction", "2d-vertex-shader", "gSubtractionShader");
  GPU.setUniformForProgram("gradientSubtraction", "u_const", 0.5/dx, "1f"); // dt/(2*rho*dx)
  GPU.setUniformForProgram("gradientSubtraction", "u_velocity", 0, "1i");
  GPU.setUniformForProgram("gradientSubtraction", "u_pressure", 1, "1i");

  // create program - divergence
  // set uniform for program - "u-const"
  // set uniform for program - "u-velocity"
  GPU.createProgram("diverge", "2d-vertex-shader", "divergenceShader");
  GPU.setUniformForProgram("diverge", "u_const", 0.5/dx, "1f"); // -2*dx*rho/dt
  GPU.setUniformForProgram("diverge", "u_velocity", 0, "1i");

  // create program - force application
  // set uniform for program - "u-dt"
  // set uniform for program - "u-velocity"
  GPU.createProgram("force", "2d-vertex-shader", "fApplicationShader");
  GPU.setUniformForProgram("force", "u_dt", dt, "1f");
  GPU.setUniformForProgram("force", "u_velocity", 0, "1i");

  // create program - add material
  // set uniform for program - "u-material"
  GPU.createProgram("addMaterial", "2d-vertex-shader", "addMaterialShader");
  GPU.setUniformForProgram("force", "u_material", 0, "1i");

  // create program - jacobi
  // set uniform for program - "u-b"
  // set uniform for program - "u-x"
  GPU.createProgram("jacobi", "2d-vertex-shader", "jacobiShader");
  GPU.setUniformForProgram("jacobi", "u_b", 0, "1i");
  GPU.setUniformForProgram("jacobi", "u_x", 1, "1i");

  // create program - render
  // set uniform for program - "u-material"
  GPU.createProgram("render", "2d-vertex-shader", "renderShader");
  GPU.setUniformForProgram("render", "u_material", 0, "1i");

  // create program - boundary
  // set uniform for program - "u-texture"
  GPU.createProgram("boundary", "2d-vertex-shader", "boundaryShader");
  GPU.setUniformForProgram("boundary", "u_texture", 0, "1i");

  // create program - pack to bytes
  // set uniform for program - "u-dt
  // set uniform for program - "u-floatTextureDim"
  // GPU.createProgram("packToBytes", "2d-vertex-shader", "packToBytesShader");
  // GPU.setUniformForProgram("packToBytes", "u_floatTextureDim", [particlesTextureDim, particlesTextureDim], "2f");

  // * create program - move particles            *
  // * set uniform for program - "u-particles"    *
  // * set uniform for program - "u-velocity"     * DONT NEED THESE
  // * set uniform for program - "u-textureSize"  *
  // * set uniform for program - "u-dt"           *

  // initialise 3 view, only main property is that viewport is expanded to window size

  resetWindow();

  render();

}

function render(){

  if (!paused) {
    // advect velocity
    GPU.setSize(width, height);
    GPU.setProgram("advect");
    GPU.setUniformForProgram("advect" ,"u_textureSize", [width, height], "2f");
    GPU.setUniformForProgram("advect" ,"u_scale", 1, "1f");
    GPU.step("advect", ["velocity", "velocity"], "nextVelocity");

    // enforce boundary conditions
    GPU.setProgram("boundary");
    GPU.setUniformForProgram("boundary", "u_scale", -1, "1f"); // set to -1 for velocity
    GPU.step("boundary", ["nextVelocity"], "velocity");
    // GPU.swapTextures("velocity", "nextVelocity");

    //diffuse velocity
    GPU.setProgram("jacobi");
    var alpha = dx*dx/(nu*dt);
    GPU.setUniformForProgram("jacobi", "u_alpha", alpha, "1f");
    GPU.setUniformForProgram("jacobi", "u_reciprocalBeta", 1/(4+alpha), "1f");
    for (var i=0;i<1;i++){
        GPU.step("jacobi", ["velocity", "velocity"], "nextVelocity");
        GPU.step("jacobi", ["nextVelocity", "nextVelocity"], "velocity");
    }

    //apply force
    GPU.setProgram("force");
    if (!mouseout && mouseEnable){
        GPU.setUniformForProgram("force", "u_mouseEnable", 1.0, "1f");
        GPU.setUniformForProgram("force", "u_mouseCoord", [mouseCoordinates[0]*scale, mouseCoordinates[1]*scale], "2f");
        GPU.setUniformForProgram("force", "u_mouseDir", [3*(mouseCoordinates[0]-lastMouseCoordinates[0])*scale,
            3*(mouseCoordinates[1]-lastMouseCoordinates[1])*scale], "2f");
    } else {
        GPU.setUniformForProgram("force", "u_mouseEnable", 0.0, "1f");
    }
    GPU.step("force", ["velocity"], "nextVelocity");

    // GPU.swapTextures("velocity", "nextVelocity");
    GPU.step("boundary", ["nextVelocity"], "velocity");

    // compute pressure
    GPU.step("diverge", ["velocity"], "velocityDivergence");//calc velocity divergence
    GPU.setProgram("jacobi");
    GPU.setUniformForProgram("jacobi", "u_alpha", -dx*dx, "1f");
    GPU.setUniformForProgram("jacobi", "u_reciprocalBeta", 1/4, "1f");
    for (var i=0;i<10;i++){
        GPU.step("jacobi", ["velocityDivergence", "pressure"], "nextPressure");
        GPU.step("jacobi", ["velocityDivergence", "nextPressure"], "pressure");
    }
    GPU.setProgram("boundary");
    GPU.setUniformForProgram("boundary", "u_scale", 1, "1f"); // set to +1 for pressure
    GPU.step("boundary", ["pressure"], "nextPressure");
    GPU.swapTextures("pressure", "nextPressure");

    // subtract pressure gradient
    GPU.step("gradientSubtraction", ["velocity", "pressure"], "nextVelocity");
    GPU.setProgram("boundary");
    GPU.setUniformForProgram("boundary", "u_scale", -1, "1f");
    GPU.step("boundary", ["nextVelocity"], "velocity");

    // move material
    GPU.setSize(actualWidth, actualHeight);

    //add material
    GPU.setProgram("addMaterial");
    if (!mouseout && mouseEnable){
        GPU.setUniformForProgram("addMaterial", "u_mouseEnable", 1.0, "1f");
        GPU.setUniformForProgram("addMaterial", "u_mouseCoord", mouseCoordinates, "2f");
        GPU.setUniformForProgram("addMaterial", "u_mouseLength", Math.sqrt(Math.pow(3*(mouseCoordinates[0]-lastMouseCoordinates[0]),2)
            +Math.pow(3*(mouseCoordinates[1]-lastMouseCoordinates[1]),2)), "1f");
    } else {
        GPU.setUniformForProgram("addMaterial", "u_mouseEnable", 0.0, "1f");
    }
    GPU.step("addMaterial", ["material"], "nextMaterial");

    GPU.setProgram("advect");
    GPU.setUniformForProgram("advect" ,"u_textureSize", [actualWidth, actualHeight], "2f");
    GPU.setUniformForProgram("advect" ,"u_scale", scale, "1f");
    GPU.step("advect", ["velocity", "nextMaterial"], "material");
    GPU.step("render", ["material"]);

  } else resetWindow();

  //move particles
  //http://voxelent.com/html/beginners-guide/chapter_10/ch10_PointSprites.html
  // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
  //http://stackoverflow.com/questions/5497722/how-can-i-animate-an-object-in-webgl-modify-specific-vertices-not-full-transfor

  // GPU.setProgram("packToBytes");
  // GPU.setUniformForProgram("packToBytes", "u_vectorLength", vectorLength, "1f");
  // GPU.step("packToBytes", ["particles"], "outputParticleBytes");
  // var pixels = new Uint8Array(numParticles*4*vectorLength);
  // if (GPU.readyToRead()) {
  //   GPU.readPixels(0, 0, particlesTextureDim * vectorLength, particlesTextureDim, pixels);
  //   var parsedPixels = new Float32Array(pixels.buffer);
  //   for (var i=0;i<numParticles;i++){
  //       particlesVertices[3*i] = parsedPixels[vectorLength*i];
  //       particlesVertices[3*i+1] = parsedPixels[vectorLength*i+1];
  //   }
  //   particles.geometry.attributes.position.needsUpdate = true;
  //   threeView.render();
  // }

  window.requestAnimationFrame(render);
}

function onResize(){
    paused = true;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.left = -window.innerWidth / 2;
    camera.right = window.innerWidth / 2;
    camera.top = window.innerHeight / 2;
    camera.bottom = -window.innerHeight / 2;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

    render();
}

function resetWindow(){

  actualWidth = Math.round(body.clientWidth);
  actualHeight = Math.round(body.clientHeight);

  var maxDim = Math.max(actualHeight, actualWidth); // even the resolution, taking the max of height or width for the scale
  var _scale = Math.ceil(maxDim/(settings.scale_quality*250)); // dunno why its 150
  if (_scale < 1) _scale = 1;

  width = Math.floor(actualWidth/_scale); //
  height = Math.floor(actualHeight/_scale);

  scale = 1/_scale;

  canvas.width = actualWidth; // reset the canvas so that it is full screen.
  canvas.height = actualHeight;
  canvas.clientWidth = body.clientWidth;
  canvas.clientHeight = body.clientHeight;

  // GPU.setSize(width, height);

  GPU.setProgram("gradientSubtraction");
  GPU.setUniformForProgram("gradientSubtraction" ,"u_textureSize", [width, height], "2f");

  GPU.setProgram("diverge");
  GPU.setUniformForProgram("diverge" ,"u_textureSize", [width, height], "2f");

  GPU.setProgram("force");
  GPU.setUniformForProgram("force", "u_reciprocalRadius", 0.03/scale, "1f");
  GPU.setUniformForProgram("force" ,"u_textureSize", [width, height], "2f");

  GPU.setProgram("addMaterial");
  GPU.setUniformForProgram("addMaterial", "u_reciprocalRadius", 0.03, "1f");
  GPU.setUniformForProgram("addMaterial" ,"u_textureSize", [actualWidth, actualHeight], "2f");

  GPU.setProgram("jacobi");
  GPU.setUniformForProgram("jacobi" ,"u_textureSize", [width, height], "2f");

  GPU.setProgram("render");
  GPU.setUniformForProgram("render" ,"u_textureSize", [actualWidth, actualHeight], "2f");

  GPU.setProgram("boundary");
  GPU.setUniformForProgram("boundary" ,"u_textureSize", [width, height], "2f");

  var velocity = new Float32Array(width*height*4); // the mythical velocity array
  for (var i=0;i<height;i++){
      for (var j=0;j<width;j++){
          var index = 4*(i*width+j);
          velocity[index] = Math.sin(2*Math.PI*i/200)/10;
          velocity[index+1] = Math.sin(2*Math.PI*j/200)/10;
      }
  }

  GPU.initTextureFromData("velocity", width, height, "FLOAT", velocity, true); // initialize texture
  GPU.initFrameBufferForTexture("velocity", true); // frame buffer for texture

  GPU.initTextureFromData("nextVelocity", width, height, "FLOAT", new Float32Array(width*height*4), true);
  GPU.initFrameBufferForTexture("nextVelocity", true);

  GPU.initTextureFromData("velocityDivergence", width, height, "FLOAT", new Float32Array(width*height*4), true);
  GPU.initFrameBufferForTexture("velocityDivergence", true);

  GPU.initTextureFromData("pressure", width, height, "FLOAT", new Float32Array(width*height*4), true);
  GPU.initFrameBufferForTexture("pressure", true);

  GPU.initTextureFromData("nextPressure", width, height, "FLOAT", new Float32Array(width*height*4), true);
  GPU.initFrameBufferForTexture("nextPressure", true);

  var material = new Float32Array(actualWidth*actualHeight*4);
  // for (var i=0;i<actualHeight;i++){
  //     for (var j=0;j<actualWidth;j++){
  //         var index = 4*(i*actualWidth+j);
  //         if (((Math.floor(i/50))%2 && (Math.floor(j/50))%2)
  //             || ((Math.floor(i/50))%2 == 0 && (Math.floor(j/50))%2 == 0)) material[index] = 1.0;
  //     }
  // }
  GPU.initTextureFromData("material", actualWidth, actualHeight, "FLOAT", material, true);
  GPU.initFrameBufferForTexture("material", true);

  GPU.initTextureFromData("nextMaterial", actualWidth, actualHeight, "FLOAT", material, true);
  GPU.initFrameBufferForTexture("nextMaterial", true);

  paused = false;
}

function onMouseMove(e){
    lastMouseCoordinates = mouseCoordinates;
    var x = e.clientX;
    var padding = 10;
    if (x<padding) x = padding;
    if (x>actualWidth-padding) x = actualWidth-padding;
    var y = e.clientY;
    if (y<padding) y = padding;
    if (y>actualHeight-padding) y = actualHeight-padding;
    mouseCoordinates = [x, actualHeight-y];
}

function onMouseDown(){
    mouseEnable = true;
}

function onMouseUp(){
    mouseEnable = false;
}
