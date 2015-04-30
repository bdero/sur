QUnit.module('construction and utilities', {
  beforeEach: function() {
    this.canvas = $('<canvas>')[0];
  }
});

QUnit.test('environment checks', function(assert) {
  assert.ok(_.isFunction(Sur), 'Sur is a function');
});

QUnit.test('construct Sur object with initShaders=false', function(assert) {
  var sur = new Sur(this.canvas, initShaders=false);

  assert.ok(_.isObject(sur), 'object returned from Sur');
  assert.ok(sur.hasOwnProperty('shaderSets'), 'has shaderSets property');
  assert.propEqual(sur.shaderSets, {}, 'sur.shaderSets is empty');
});

QUnit.test('run a Sur.update loop', function(assert) {
  var done = assert.async();

  var frame = 0;
  Sur.update(function(delta) {
    assert.ok(
      delta >= 0 && delta < 1,
      'delta time multiplier is reasonable (>= 0 and < 1): ' + delta
    );
    assert.ok(
      frame <= 10,
      'the frame multipler is less than 10, as expected: ' + frame
    );

    if (frame === 10) {
      done();
    }

    // When the loop exceeds 10, it will return false, which should break
    // the callback loop
    return ++frame <= 10;
  });
});


QUnit.module('Sur.Program', {
  beforeEach: function() {
    var canvas = $('<canvas>')[0];

    this.gl = canvas.getContext('webgl') ||
              canvas.getContext('experimental-webgl');

    this.vertexText = "\
      attribute vec4 aPosition;\
      \
      void main() {\
        gl_Position = aPosition;\
        gl_PointSize = 10.0;\
      }\
    ";
    this.fragmentText = "\
      precision mediump float;\
      uniform vec4 uFragColor;\
      \
      void main() {\
        gl_FragColor = uFragColor;\
      }\
    ";
  }
});

QUnit.test('construct a Program without compiling shaders', function(assert) {
  var program = new Sur.Program(this.gl, 'vertex', 'fragment', false);

  assert.equal(
    program.vertexText,
    'vertex',
    'vertex shader text assigned properly'
  );
  assert.equal(
    program.fragmentText,
    'fragment',
    'fragment shader text assigned properly'
  );
});

QUnit.test('compile shader without errors', function(assert) {
  var program = new Sur.Program(
    this.gl, this.vertexText, this.fragmentText, false
  );

  program.compileShader(true);
  assert.ok(
    _.isObject(program.vertex),
    'vertex shader compiled and stored'
  );

  program.compileShader(false);
  assert.ok(
    _.isObject(program.fragment),
    'fragment shader compiled and stored'
  );
});

QUnit.test('compile shader with errors', function(assert) {
  var program = new Sur.Program(
    this.gl, 'invalid shader', 'not a chance', false
  );

  _.each([true, false], function(isVertexShader) {
    assert.throws(
      _.bind(program.compileShader, program, isVertexShader),
      /Shader compilation error/,
      'raised a shader compilation error'
    );
  });
});


QUnit.module('shader pipeline', {
  beforeEach: function() {
    this.canvas = $('<canvas>')[0];

    this.vertexText = "\
      attribute vec4 aPosition;\
      \
      void main() {\
        gl_Position = aPosition;\
        gl_PointSize = 10.0;\
      }\
    ";
    this.fragmentText = "\
      precision mediump float;\
      uniform vec4 uFragColor;\
      \
      void main() {\
        gl_FragColor = uFragColor;\
      }\
    ";

    this.vertexScript = $($('<script>')[0]).
      attr('data-name', 'test').
      attr('type', 'vertex-shader').
      attr('id', 'testVertexShader').
      text(this.vertexText);
    this.fragmentScript = $($('<script>')[0]).
      attr('data-name', 'test').
      attr('type', 'fragment-shader').
      attr('id', 'testFragmentShader').
      text(this.fragmentText);

    // These need to be in the DOM so we can have Sur find and categorize them
    $(document.body).append(this.vertexScript, this.fragmentScript);
  },
  afterEach: function() {
    this.vertexScript.remove();
    this.fragmentScript.remove();
  }
});

QUnit.test('construct Sur object with initShaders', function(assert) {
  window.sur = new Sur(this.canvas);

  assert.ok(_.isObject(sur), 'Sur returned an object');

  // Test if reflection worked
  assert.propEqual(sur.shaderSets, {
    'test': {
      'attributes': {
        'aPosition': 0
      },
      'fragment-shader': {
        'shader': {},
        'text': this.fragmentText
      },
      'program': {},
      'uniforms': {
        'uFragColor': {}
      },
      'vertex-shader': {
        'shader': {},
        'text': this.vertexText
      }
    }
  }, 'shader program reflection worked');
});
