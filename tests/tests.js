QUnit.module('basic construction', {
  beforeEach: function() {
    this.canvas = $('<canvas>')[0];
  }
});

QUnit.test('environment checks', function(assert) {
  assert.strictEqual(S.name, Sur.name, 'Sur and S have the same name');
});

QUnit.test('construct Sur object with initShaders=false', function(assert) {
  this.sur = new Sur(this.canvas, initShaders=false);

  assert.ok(_.isObject(this.sur), 'object returned from Sur');
  assert.ok(this.sur.hasOwnProperty('shaderSets'), 'has shaderSets property');
  assert.propEqual(this.sur.shaderSets, {}, 'sur.shaderSets is empty');
});
