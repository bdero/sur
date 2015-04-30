/**
 * @license
 * sur 0.1.0 <https://github.com/bdero/sur/>
 * Copyright (C) 2015  Brandon DeRosier
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * [GNU General Public License](LICENSE.md) for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
;(function() {

  /**
   * Creates a `Program` object which represents and stores the state of a WebGL
   * shader program.
   *
   * @static
   * @memberOf Sur
   * @constructor
   * @param {WebGLRenderingContext} gl - The WebGL rendering context with which
   *  to compile the shaders and link the program.
   * @param {string} vertexText - The vertex shader text to use.
   * @param {string} fragmentText - The fragment shader text to use.
   * @param {boolean} [initialize=true] - Whether or not to compile the shaders,
   *  link the program, and obtain metadata about the program.
   * @example
   *
   * var program = new Sur.Program(vertexText, fragmentText);
   */
  function Program(gl, vertexText, fragmentText, initialize) {
    initialize = initialize || true;

    /**
     * The WebGL rendering context with which to compile shaders and link the
     * program.
     *
     * @readonly
     * @name Sur.Program#gl
     * @type WebGLRenderingContext
     */
    this.gl = gl;

    /**
     * The text of the vertex shader.
     *
     * @readonly
     * @name Sur.Program#vertexText
     * @type string
     */

    /**
     * The text of the fragment shader.
     *
     * @readonly
     * @name Sur.Program#fragmentText
     * @type string
     */

    // vertexText and fragmentText are initialized by the call to setShaders
    // below.

    /**
     * The compiled WebGL vertex shader.
     *
     * @readonly
     * @name Sur.Program#vertex
     * @default null
     * @type WebGLShader
     */
    this.vertex = null;

    /**
     * The compiled WebGL fragment shader.
     *
     * @readonly
     * @name Sur.Program#fragment
     * @default null
     * @type WebGLShader
     */
    this.fragment = null;

    /**
     * The linked WebGL program.
     *
     * @readonly
     * @name Sur.Program#program
     * @default null
     * @type WebGLProgram
     */
    this.program = null;

    /**
     * Object mapping of program attribute parameter names to their respective
     * parameter indexes. This can effectively be used as an enum to increase
     * readability of code when dealing with shader parameters.
     *
     * @readonly
     * @name Sur.Program#attributes
     * @default {}
     * @type Object
     */
    this.attributes = {};

    /**
     * Object mapping of program uniform parameter names to their respective
     * WebGLUniformLocations. This can effectively be used as an enum to
     * increase readability of code when dealing with shader parameters.
     *
     * @readonly
     * @name Sur.Program#uniforms
     * @default {}
     * @type Object
     */
    this.uniforms = {};

    this.setShaders(vertexText, fragmentText, initialize);
  }

  /**
   * Sets the vertex and fragment shader of the program.
   *
   * @param {string} vertexText - The vertex shader text to use.
   * @param {string} fragmentText - The fragment shader text to use.
   * @param {boolean} [initialize=true] - Whether or not to compile the shaders,
   *  link the program, and obtain metadata about the program.
   * @example
   *
   * var program = new Sur.Program(vertexText, fragmentText);
   *
   * program.setShaders(otherVertexText, otherFragmentText);
   */
  Program.prototype.setShaders = function(
    vertexText, fragmentText, initialize
  ) {
    initialize = initialize || true;

    this.vertexText = vertexText;
    this.fragmentText = fragmentText;

    if (initialize) {
      this.compile();
      this.link();
      this.reflect();
    }
  };

  /**
   * Compile one of the shaders, storing the result into the shader's respective
   * `Program` property.
   *
   * @param {boolean} isVertexShader - Whether to compile the vertex shader or,
   *  if not, compile the fragment shader.
   * @throws Throws an error if the shader couldn't be compiled. The WebGL
   *  shader info log is included as part of the error message.
   * @see Sur.Program#vertex
   * @see Sur.Program#fragment
   */
  Program.prototype.compileShader = function(isVertexShader) {
    var result = this.gl.createShader(
      isVertexShader ? this.gl.VERTEX_SHADER : this.gl.FRAGMENT_SHADER
    );

    this.gl.shaderSource(
      result,
      isVertexShader ? this.vertexText : this.fragmentText
    );
    this.gl.compileShader(result);

    if (!this.gl.getShaderParameter(result, this.gl.COMPILE_STATUS)) {
      throw new Error(
        "Shader compilation error; " + this.gl.getShaderInfoLog(result)
      );
    }

    this[isVertexShader ? 'vertex' : 'fragment'] = result;
  };

  /**
   * Compile both the vertex and fragment shader, which will result in the
   * shaders being saved into the `vertex` and `fragment` properties
   * respectively.
   *
   * @throws Throws an error if either of the shaders couldn't be compiled.
   *  The WebGL shader info log is included as part of the error message.
   * @see Sur.Program#compileShader
   * @see Sur.Program#vertex
   * @see Sur.Program#fragment
   */
  Program.prototype.compile = function() {
    this.compileShader(true);
    this.compileShader(false);
  };

  /**
   * Link the vertex and fragment shaders into a program, which will be saved
   * into the `program` property.
   *
   * @throws Throws an error if the program couldn't be linked. The WebGL
   *  program info log is included as part of the error message.
   * @see Sur.Program#program
   */
  Program.prototype.link = function() {
    var result = this.gl.createProgram();

    this.gl.attachShader(result, this.vertex);
    this.gl.attachShader(result, this.fragment);
    this.gl.linkProgram(result);

    if (!this.gl.getProgramParameter(result, this.gl.LINK_STATUS)) {
      throw new Error(
        "Program link error; " + this.gl.getProgramInfoLog(result)
      );
    }

    this.program = result;
  };

  Program.prototype.reflect = function() {

  };


  /**
   * Creates a `Sur` object which initializes a WebGL context and keeps track
   * of WebGL state for a given canvas object.
   *
   * @name Sur
   * @global
   * @constructor
   * @param {Object} canvas - The canvas element from which to initialize a
   *  WebGL context.
   * @param {boolean} [initShaders=true] - Whether or not to fetch, compile,
   *  link, and gather metadata about shader programs.
   * @returns {Object} Returns the new `Sur` instance.
   * @example
   *
   * var canvas = document.getElementById('#canvas');
   * var sur = new Sur(canvas);
   *
   * _.keys(sur.shaderSets);
   * // => ['myFirstShaderProgram', 'mySecondShaderProgram']
   */
  function Sur(canvas, initShaders) {
    initShaders = initShaders || true;

    this.canvas = canvas;
    this.gl = canvas.getContext('webgl') ||
              canvas.getContext('experimental-webgl');

    if (!this.gl) {
      throw new Error('The browser isn\'t WebGL enabled');
    }

    if (initShaders) {
      this.shaderSets = Sur.fetchShaders();
      Sur.compileShaderSets(this.gl, this.shaderSets);
    }
  }

  /** The name used to identify vertex shaders. */
  Sur.VERTEX_SHADER_TYPE = 'vertex-shader';

  /** The name used to identify fragment shaders. */
  Sur.FRAGMENT_SHADER_TYPE = 'fragment-shader';

  /**
   * Array containing the script type identifiers of vertex and fragment
   * shaders.
   */
  Sur.SCRIPT_TYPES = [Sur.VERTEX_SHADER_TYPE, Sur.FRAGMENT_SHADER_TYPE];

  /**
   * Fetch shaders from the document, grouping them into sets by program name
   */
  Sur.fetchShaders = function() {
    return _.chain(document.getElementsByTagName('script')).
      filter(function(script) {
        // Filter out any non-shader scripts
        return _.contains(Sur.SCRIPT_TYPES, script.type);
      }).
      reduce(function(result, script) {
        var name = script.dataset.name;

        if (name) {
          // If this shader has a program name that doesn't exist yet, add it
          if (!_.contains(_.keys(result), name)) {
            result[name] = {};
          }
          // Add this shader to it's program, accessible by it's type
          // (i.e. vertex or fragment shader)
          result[name][script.type] = {};
          result[name][script.type].text = script.text;
        }
        return result;
      }, {}).
      value();
  };

  Sur.compileShader = function(gl, shader, type) {
    var result = gl.createShader(type);

    gl.shaderSource(result, shader);
    gl.compileShader(result);

    if (!gl.getShaderParameter(result, gl.COMPILE_STATUS)) {
      throw new Error(
        "Shader compilation error; " + gl.getShaderInfoLog(result)
      );
    }

    return result;
  };

  Sur.linkProgram = function(gl, shaderSet) {
    var program = gl.createProgram();

    gl.attachShader(program, shaderSet[Sur.VERTEX_SHADER_TYPE].shader);
    gl.attachShader(program, shaderSet[Sur.FRAGMENT_SHADER_TYPE].shader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error("Program link error; " + gl.getProgramInfoLog(program));
    }

    shaderSet.program = program;
  };

  Sur.bakeProgramParameters = function(gl, shaderSet) {
    var parameters = [
      ['attributes', gl.ACTIVE_ATTRIBUTES, 'Attrib'],
      ['uniforms', gl.ACTIVE_UNIFORMS, 'Uniform'],
    ];
    var program = shaderSet.program;

    _.each(parameters, function(parameter) {
      var parameterCount = gl.getProgramParameter(program, parameter[1]);

      shaderSet[parameter[0]] = _.zipObject(
        _.times(parameterCount, function(count) {
          var parameterName = gl['getActive' + parameter[2]](
            program, count
          ).name;
          var parameterValue = gl['get' + parameter[2] + 'Location'](
            program, parameterName
          );

          return [parameterName, parameterValue];
        })
      );
    });
  };

  /**
   * Compiles a set of related shaders, links a program, and extracts it's
   * parameters
   */
  Sur.compileShaderSet = function(gl, shaderSet) {
    if (!_.isMatch(_.keys(shaderSet), Sur.SCRIPT_TYPES)) {
      throw new Error(
        'Missing shader! Shader sets require both a vertex and a fragment ' +
        'shader'
      );
    }

    var shaderTypes = [gl.VERTEX_SHADER, gl.FRAGMENT_SHADER];

    _.each(_.zip(Sur.SCRIPT_TYPES, shaderTypes), function(type) {
      var shaderId = Sur.compileShader(gl, shaderSet[type[0]].text, type[1]);
      shaderSet[type[0]].shader = shaderId;
    });

    Sur.linkProgram(gl, shaderSet);
    Sur.bakeProgramParameters(gl, shaderSet);
  };

  Sur.compileShaderSets = function(gl, shaderSets) {
    if (!_.isObject(shaderSets)) {
      throw new Error('Expected `shaderSets` to be an object');
    }

    _.each(shaderSets, function(shaderSet) {
      return Sur.compileShaderSet(gl, shaderSet);
    });
  };

  /**
   * Starts an update loop using requestAnimationFrame, passing the callback a
   * delta time multiplier.
   *
   * @static
   * @memberOf Sur
   * @param {updateCallback} callback - Callback called for every update.
   * @example
   *
   * // Calculate velocity and position on a units/second basis
   * Sur.update(function(delta) {
   *   velocity += acceleration*delta;
   *   position += velocity*delta;
   *
   *   // ... render scene ...
   * });
   *
   * // Stop the loop after 20 frames
   * var frame = 0;
   * Sur.update(function() {
   *   console.debug(++frame);
   *   return frame < 20;
   * });
   */
  Sur.update = function(callback) {
    var currentTime = Date.now();
    var previousTime;

    var loop = function() {
      previousTime = currentTime;
      currentTime = Date.now();
      var delta = (currentTime - previousTime)/1000;

      // If the callback returns anything except false, continue running
      if (callback(delta) !== false) {
        requestAnimationFrame(loop);
      }
    };

    loop();
  };

  /**
   * Called on every requestAnimationFrame tick.
   *
   * @callback updateCallback
   * @param {number} delta - The amount of time, in seconds, elapsed since the
   *  last update call.
   * @returns {boolean} Returns whether or not to continue executing the
   *  callback loop. Any return value other than `false` will result in the
   *  loop continuing execution (including no return value or `undefined`).
   * @see Sur.update
   */

  Sur.Program = Program;
  // Place Sur into the global scope
  window.Sur = Sur;

})();
