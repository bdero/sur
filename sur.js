(function() {

  // SurJS - Simple Unobtrusive Rasterization
  // Author: Brandon DeRosier 2015

  function Sur(canvas, initShaders) {
    initShaders = initShaders || true;

    if (!
      ((typeof _) === 'function') &&
      ((typeof $) === 'function')
    ) {
      throw new Error('Sur requires Lodash/UnderscoreJS and jQuery');
    }

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

  Sur.VERTEX_SHADER_TYPE = 'vertex-shader';
  Sur.FRAGMENT_SHADER_TYPE = 'fragment-shader';

  Sur.SCRIPT_TYPES = [Sur.VERTEX_SHADER_TYPE, Sur.FRAGMENT_SHADER_TYPE];

  /**
   * Fetch shaders from the document, grouping them into sets by program name
   */
  Sur.fetchShaders = function() {
    return _.chain($('script')).
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
        "Shader compilation error. " + gl.getShaderInfoLog(result)
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
      throw new Error("Program link error. " + gl.getProgramInfoLog(program));
    }

    shaderSet.program = program;
  };

  /**
   * Compiles a set of related shaders and links a program
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
  };

  Sur.compileShaderSets = function(gl, shaderSets) {
    if (!_.isObject(shaderSets)) {
      throw new Error('Expected `shaderSets` to be an object');
    }

    _.each(shaderSets, function(shaderSet) {
      return Sur.compileShaderSet(gl, shaderSet);
    });
  };

  window.Sur = Sur;
  if (!window.hasOwnProperty('S')) {
    window.S = Sur;
  }

})();
