function initBoilerPlate(){
  
  /**
   * Creates a shader from the content of a script tag.
   *
   * @param {!WebGLRenderingContext} gl The WebGL Context.
   * @param {string} scriptId The id of the script tag.
   * @param {string} opt_shaderType. The type of shader to create.
   *     If not passed in will use the type attribute from the
   *     script tag.
   * @return {!WebGLShader} A shader.
   */
  function createShaderFromScript(gl, scriptId, opt_shaderType) { //
    // look up the script tag by id.
    var shaderScript = document.getElementById(scriptId);
    if (!shaderScript) {
      throw("*** Error: unknown script element" + scriptId);
    }

    // extract the contents of the script tag.
    var shaderSource = shaderScript.text;

    // If we didn't pass in a type, use the 'type' from
    // the script tag.
    if (!opt_shaderType) {
      if (shaderScript.type == "x-shader/x-vertex") {
        opt_shaderType = gl.VERTEX_SHADER;
      } else if (shaderScript.type == "x-shader/x-fragment") {
        opt_shaderType = gl.FRAGMENT_SHADER;
      } else if (!opt_shaderType) {
        throw("*** Error: shader type not set");
      }
    }

    return compileShader(gl, shaderSource, opt_shaderType);
  }


  /**
   * Creates a program from 2 shaders.
   *
   * @param {!WebGLRenderingContext) gl The WebGL context.
   * @param {!WebGLShader} vertexShader A vertex shader.
   * @param {!WebGLShader} fragmentShader A fragment shader.
   * @return {!WebGLProgram} A program.
   */
  function createProgram(gl, vertexShader, fragmentShader) { //
    // create a program.
    var program = gl.createProgram();

    // attach the shaders.
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    // link the program.
    gl.linkProgram(program);

    // Check if it linked.
    var success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!success) {
        // something went wrong with the link
        throw ("program filed to link:" + gl.getProgramInfoLog (program));
    }

    return program;
  }

  // /**
  //  * Creates a program from 2 script tags.
  //  *
  //  * @param {!WebGLRenderingContext} gl The WebGL Context.
  //  * @param {string[]} shaderScriptIds Array of ids of the script            ORIGINAL
  //  *        tags for the shaders. The first is assumed to be the             FUNCTION
  //  *        vertex shader, the second the fragment shader.
  //  * @return {!WebGLProgram} A program
  //  */
  // function createProgramFromScripts(
  //     gl, shaderScriptIds) {
  //   var vertexShader = createShaderFromScript(gl, shaderScriptIds[0], gl.VERTEX_SHADER); // shaderscriptIds[] array
  //   var fragmentShader = createShaderFromScript(gl, shaderScriptIds[1], gl.FRAGMENT_SHADER); // 0=Vertex, 1=Fragment
  //   return createProgram(gl, vertexShader, fragmentShader);
  // }

  function createProgramFromScripts(gl, vertexShaderId, fragmentShaderId) { //
    var vertexShader = createShaderFromScript(gl, vertexShaderId);
    var fragmentShader = createShaderFromScript(gl, fragmentShaderId);
    return createProgram(gl, vertexShader, fragmentShader);
  } //

  /**
   * Creates a program from 2 script tags.
   *
   * @param {!WebGLRenderingContext} gl The WebGL Context.
   * @param {string} vertexShaderId The id of the vertex shader script tag.
   * @param {string} fragmentShaderId The id of the fragment shader script tag.
   * @return {!WebGLProgram} A program
   */
  function createProgramFromSource(
      gl, vertexShader, fragmentShader) { //
    var vertexShader = createShaderFromSource(gl, vertexShader, gl.VERTEX_SHADER);
    var fragmentShader = createShaderFromSource(gl, fragmentShader, gl.FRAGMENT_SHADER);
    return createProgram(gl, vertexShader, fragmentShader);
  }

  /**
   * Creates a shader from the content of a script tag.
   *
   * @param {!WebGLRenderingContext} gl The WebGL Context.
   * @param {string} scriptId The id of the script tag.
   * @param {string} opt_shaderType. The type of shader to create.
   *     If not passed in will use the type attribute from the
   *     script tag.
   * @return {!WebGLShader} A shader.
   */
  function createShaderFromSource(gl, shaderSource, shaderType) { //
    return compileShader(gl, shaderSource, shaderType);
  }

  /**
   * Creates and compiles a shader.
   *
   * @param {!WebGLRenderingContext} gl The WebGL Context.
   * @param {string} shaderSource The GLSL source code for the shader.
   * @param {number} shaderType The type of shader, VERTEX_SHADER or
   *     FRAGMENT_SHADER.
   * @return {!WebGLShader} The shader.
   */
  function compileShader(gl, shaderSource, shaderType) { //
    // Create the shader object
    var shader = gl.createShader(shaderType);

    // Set the shader source code.
    gl.shaderSource(shader, shaderSource);

    // Compile the shader
    gl.compileShader(shader);

    // Check if it compiled
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!success) {
      // Something went wrong during compilation; get the error
      throw "could not compile shader:" + gl.getShaderInfoLog(shader);
    }

    return shader;
  }

  /**
   * from Amanda Ghassaei,
   * Initializes framebuffer.
   *
   * @param {string} textureName the texture tag.
   * @param {boolean} bool, shouldreplace=false
   *
   *
  */
  function initFrameBufferForTexture(textureName, shouldReplace){
    if (!shouldReplace) {
      var framebuffer = this.frameBuffers[textureName];
      if (framebuffer) {
          console.warn("framebuffer already exists for texture " + textureName);
          return;
      }
    }
    var texture = this.textures[textureName];
    if (!texture){
      console.warn("texture " + textureName + " does not exist");
      return;
    }

    framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

    var check = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if(check != gl.FRAMEBUFFER_COMPLETE){
      notSupported();
    }

    this.frameBuffers[textureName] = framebuffer;
  }

  function loadVertexData(gl, program) { //
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([ -1,-1, 1,-1, -1, 1, 1, 1]), gl.STATIC_DRAW);

      // look up where the vertex data needs to go.
      var positionLocation = gl.getAttribLocation(program, "a_position");
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
  }

  function setUniformForProgram(programName, name, val, type){
      if (!this.programs[programName]){
          console.warn("no program with name " + programName);
          return;
      }
      var uniforms = this.programs[programName].uniforms;
      var location = uniforms[name];
      if (!location) {
          location = gl.getUniformLocation(this.programs[programName].program, name);
          uniforms[name] = location;
      }
      if (type == "1f") gl.uniform1f(location, val);
      else if (type == "2f") gl.uniform2f(location, val[0], val[1]);
      else if (type == "3f") gl.uniform3f(location, val[0], val[1], val[2]);
      else if (type == "1i") gl.uniform1i(location, val);
      else {
          console.warn("no uniform for type " + type);
      }
  }

  function makeTexture(gl, width, height, type, data){ //

      var texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);

      // Set the parameters so we can render any size image.
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, type, data);

      return texture;
  }

  return {
      createProgramFromSource: createProgramFromSource,
      createProgramFromScripts: createProgramFromScripts,
      loadVertexData: loadVertexData,
      makeTexture: makeTexture
  }
};
