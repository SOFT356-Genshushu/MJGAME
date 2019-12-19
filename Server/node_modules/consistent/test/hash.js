var assert = require("assert");
var crypto = require("crypto");
var consistent = require("../index.js");

describe('hashing', function () {
  describe('should have decent distribution', function () {
    this.timeout(10000);

    function test(hash) {
      var c = consistent({
        hash: hash,
        members: ['hostname:1234', 'hostname:5678', 'hostname:1357', 'hostname:2468', 'hostname:9876', 'hostname:5432']
      });

      var counts = {};

      for (var i = 0; i < 10000; i++) {
        var h = c.get(String(i));
        counts[h] = counts[h] || 0;
        counts[h]++;
      };

      for (var i = 0; i < 10000; i++) {
        var h = c.get(crypto.randomBytes(16).toString('hex'));
        counts[h] = counts[h] || 0;
        counts[h]++;
      };

      for (var i = 0; i < 10000; i++) {
        var h = c.get("key" + i);
        counts[h] = counts[h] || 0;
        counts[h]++;
      };

      var vals = Object.keys(counts).map(function (name) {
        return counts[name];
      });

      var stats = average(vals);

      vals.forEach(function (cnt) {
        assert.ok(withinstd(stats, cnt, 2.5))
      });
    }

    it ('should have low stdev with md5', function () {
      test('md5');
    })

    it ('should have low stdev with murmurhash3', function () {
      test('murmurhash');
    })
  });
})

function average(a) {
  var r = {mean: 0, variance: 0, deviation: 0}, t = a.length;
  for(var m, s = 0, l = t; l--; s += a[l]);
  for(m = r.mean = s / t, l = t, s = 0; l--; s += Math.pow(a[l] - m, 2));
  return r.deviation = Math.sqrt(r.variance = s / t), r;
}

function withinstd(x, val, stdev) {
   var low = x.mean-(stdev*x.deviation);
   var hi = x.mean+(stdev*x.deviation);
   return (val > low) && (val < hi);
}
