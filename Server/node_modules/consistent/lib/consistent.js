var crypto = require("crypto");
var lru = require("lru-cache");

function Consistent(options) {
  if (!(this instanceof Consistent))
    return new Consistent(options);

  options = options || {};

  this.replicas = options.replicas || 120;
  this.members = {};
  this.ring = [];

  if (options.members) {
    options.members.forEach(this.add.bind(this));
  }

  if (options.hash == 'murmurhash') {
    this._hash = require("murmurhash").v3;
  }
}

Object.defineProperty(Consistent.prototype, "length", {
  get: function () {
    return Object.keys(this.members).length;
  }
});

Consistent.prototype.add = function(member) {
  member = this._makeMember(member);
  this.members[member.key] = member;
  this._continuum();
};

Consistent.prototype.remove = function(member) {
  member = this._makeMember(member);
  delete this.members[member.key];
  this._continuum();
};

Consistent.prototype.replace = function(oldmember, newmember) {
  oldmember = this._makeMember(oldmember);
  newmember = this._makeMember(newmember);

  if (!this.members[oldmember.key])
    return;

  newmember.hash = oldmember.hash;
  this.members[newmember.key] = newmember;
  delete this.members[oldmember.key];

  this._continuum();
}

Consistent.prototype.getCached = function(val) {
  if (!this.cache)
    this.cache = lru(500);

  var ret = this.cache.get(val);
  if (ret) return ret;

  ret = this.get(val);
  this.cache.set(val, ret);
  return ret;
}

Consistent.prototype.get = function(val) {
  if (!this.ring.length)
    return null;

  var hash = this._hash(val)
    , ring = this.ring

  var low = 0, high = ring.length, mid;

  while (low <= high) {
    mid = low + ((high - low) >> 1);

    if (mid == 0 || mid == ring.length)
      return ring[0].key;

    if (ring[mid - 1].hash < hash && ring[mid].hash >= hash)
      return ring[mid].key;
    else if (ring[mid].hash < hash)
      low = mid + 1;
    else
      high = mid - 1;
  }

  return this.ring[0].key;
};

Consistent.prototype.exists = function(member) {
  return this.members.hasOwnProperty(member);
};

Consistent.prototype._makeMember = function(member) {
  if (typeof member == 'string')
    member = { key: member };

  member.weight = member.weight || 1;
  member.hash = this._hash(member.key);

  return member;
}

Consistent.prototype._continuum = function() {
  var self = this;

  this.ring = [];

  var members = Object.keys(this.members);
  for (var i = 0; i < members.length; i++) {
    var m = this.members[members[i]];

    for (var j = 0; j < Math.floor(this.replicas * m.weight); j++) {
      var hash = this._hash(m.hash + "-" + j);

      this.ring.push({
        hash: hash,
        key: m.key
      });
    };
  };

  // Sort ring in ascending order
  this.ring.sort(function (a, b) {
    return a.hash - b.hash;
  });

  // Remove duplicate adjacent keys on the ring
  var i = 0;
  while(i < this.ring.length - 1) {
    if (this.ring[i].key == this.ring[i + 1].key) {
      this.ring.splice(i, 1);
    } else {
      i++;
    }
  }

  // Clear cache
  this.cache = null;
};

Consistent.prototype._hash = function(val) {
  return crypto.createHash('md5').update(val).digest().readUInt32LE(0);
}

module.exports = Consistent;
