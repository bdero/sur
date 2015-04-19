QUnit.module('basic construction', {
  beforeEach: function() {
    this.canvas = $('<canvas>')[0];
  }
});

QUnit.test('environment checks', function(assert) {
  assert.strictEqual(S.name, Sur.name, 'Sur and S have the same name');
});

QUnit.test('construct Sur object with initShaders=false', function(assert) {
  var sur = new Sur(this.canvas, initShaders=false);

  assert.ok(_.isObject(sur), 'object returned from Sur');
  assert.ok(sur.hasOwnProperty('shaderSets'), 'has shaderSets property');
  assert.propEqual(sur.shaderSets, {}, 'sur.shaderSets is empty');
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
