var c = require("../index.js")

suite('basic', function () {
  bench('instantiate', function () {
    c({ members: ["m1", "m2", "m3", "m4"] });
  });

  bench('add', function () {
    c().add('m1')
  });

  bench('remove', function () {
    c({ members: ['m1'] }).remove('m1')
  });

  bench('replace', function () {
    c({ members: ['m1'] }).replace('m1', 'm2')
  });
});

suite('get', function() {
  function genInstance(n) {
    var ins = c();

    for (var i = 0; i < n; i++) {
      ins.add('member' + i);
    };

    bench('get (' + n + ' members)', function () {
      ins.get(Math.floor(Math.random() * 100) + '');
    })

    bench('getCached (' + n + ' members)', function () {
      ins.getCached(Math.floor(Math.random() * 100) + '');
    })
  };

  genInstance(5);
  genInstance(10);
  genInstance(100);
})
