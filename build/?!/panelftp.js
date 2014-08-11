// YellowLeaf FTP by Michiel Dral 
var Ftpd, crypto, db, fs, mongojs, p, polyfill, server, standardReplies,
  __hasProp = {}.hasOwnProperty,
  __slice = [].slice;

Ftpd = require('ftpd');

polyfill = require("polyfill");

fs = require('fs');

crypto = require('crypto');

p = {
  explorer: require('./plugins/explorer'),
  modify: require('./plugins/modify'),
  download: require('./plugins/download'),
  dataSocket: Ftpd.defaults.dataSocket,
  unknownCommand: Ftpd.defaults.unknownCommand
};

polyfill.extend(String, 'startsWith', function(searchString, position) {
  if (position == null) {
    position = 0;
  }
  return this.indexOf(searchString, position) === position;
});

polyfill.extend(Object, 'forEach', function(fn, scope) {
  var key, value, _results;
  _results = [];
  for (key in this) {
    if (!__hasProp.call(this, key)) continue;
    value = this[key];
    _results.push(fn.call(scope, value, key, this));
  }
  return _results;
});

mongojs = require('mongojs');

db = mongojs('secretary', ['clients']);

standardReplies = {
  feat: '500 Go away',
  syst: '215 UNIX Type: L8',
  quit: '221 See ya.',
  noop: '200 OK.',
  site: '500 Go away'
};

server = new Ftpd(function() {
  this.mode = "ascii";
  this.user = void 0;

  /*
  Authentication
   */
  this.on('command.user', function(user) {
    this.user = user.toLowerCase();
    return this.write('331 OK');
  });
  this.on('command.pass', function() {
    var args, password;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    password = args.join(' ');
    console.log("Authenticating '" + this.user + "'");
    if (this.user !== 'plancke' || password !== 'eff60fc8') {
      this.write('530 The gates shall not open for you!');
      return;
    }
    this.write('230 OK.');
    p.explorer.call(this, __dirname + "/../../");
    return [p.modify, p.download, p.dataSocket, p.unknownCommand].forEach((function(_this) {
      return function(pl) {
        return pl.call(_this);
      };
    })(this));
  });

  /* 
  Type and opts.. and maybe more like it later
   */
  this.on('command.type', function(modechar) {
    if (modechar === 'I') {
      this.mode = null;
    } else if (modechar === 'A') {
      this.mode = "ascii";
    }
    return this.write('200 Custom mode activated');
  });
  this.on('command.opts', function(opt) {
    if (opt.toUpperCase() === 'UTF8 ON') {
      this.write('200 Yo, cool with that!');
      return;
    }
    this.write('504 Sorry, I don\'t know how to handle this.');
    return console.log('Unknown OPTS:', opt);
  });
  standardReplies.forEach((function(_this) {
    return function(value, key) {
      return _this.on("command." + key, function() {
        return this.write(value);
      });
    };
  })(this));
  return this.on('error', function(e) {
    console.log('OOOPS', e.message);
    return this.write('500 Something went wrong, no idea what though.');
  });
}).listen(23).on('error', function(e) {
  console.log(e.message);
  return process.exit(0);
});
