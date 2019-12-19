var assert = require("assert")
  , consistent = require("../index.js")
  , crypto = require('crypto');

describe('consistent', function () {
  it('should create a member', function () {
    var c = consistent({
      members: ['test1', 'test2']
    });

    assert.ok(c);
    assert.ok(c.members['test1']);
    assert.ok(c.members['test2']);
  });

  it('should add new member', function() {
    var c = consistent();
    c.add('test');
    assert.ok(c.members['test']);
  });

  it('should return correct length', function() {
    var c = consistent();
    assert.ok(c.length == 0);
    c.add('test');
    assert.ok(c.length == 1);
    c.add('test2');
    assert.ok(c.length == 2);
    c.remove('test');
    assert.ok(c.length == 1);
  });

  it('should check membership', function() {
    var c = consistent();
    assert.ok(c.exists('test') === false);
    c.add('test');
    assert.ok(c.exists('test'));
  });

  it('should remove member', function() {
    var c = consistent();
    c.add('test');
    c.remove('test');
    assert.ok(!c.members['test']);
  });

  it('should get hash keys', function() {
    var c = consistent({ members: ['test1', 'test2'] });
    assert.ok(c.get('testkey'));
  });

  it('should switch member', function() {
    var c = consistent({ members: ['test1', 'test2'] });
    var key = c.get('testkey');
    c.replace(key, 'test3')
    assert.equal(c.get('testkey'), 'test3');
  });

  it('should distribute keys if member removed', function (done) {
    var members = ['test1', 'test2', 'test3'];
    var c = consistent({ members: members });
    var keys = [];

    for(var i = 0; i < 10; i++) {
      var x = crypto.randomBytes(1000000).toString('hex');
      assert.ok(members.indexOf(c.get(x)) > -1);
      keys.push(x);
    }

    c.remove('test3');
    members.pop();

    keys.forEach(function (i) {
      assert.ok(members.indexOf(c.get(i)) > -1);
    });

    c.remove('test2');
    members.pop();

    keys.forEach(function (i) {
      assert.ok(members.indexOf(c.get(i)) > -1);
    });

    done();

  });

  it('should refresh hash key if members are changed', function (done) {
    var c = consistent({ members: ['test1', 'test2', 'test3', 'test4', 'test5'] });
    var h = c.getCached('111');

    c.remove('test5')
    var h2 = c.getCached('111');

    c.replace('test2', 'newAdded');
    var h3 = c.getCached('111');

    assert.notEqual(h, h2, 'should refresh key');
    assert.notEqual(h2, h3, 'should refresh key');

    done()
  });
});
