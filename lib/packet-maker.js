"use strict";
var path = require('path');
var fs = require('fs');
var exec = require('child_process').execSync;

module.exports.generateFiles = function () {
  console.log("Generating Jakefile and copying templates to .packet-maker...");
  var res = path.join(path.dirname(fs.realpathSync(__filename)), '../res');
  var packet_maker_dir = process.env.PWD + '/.packet-maker';
  exec('mkdir -p ' + packet_maker_dir);
  exec('cp ' + res + "/control.sample " + packet_maker_dir + "/control");
  exec('cp ' + res + "/init.d.sample " + packet_maker_dir + "/init.d");
  exec('cp ' + res + "/Jakefile " + process.env.PWD);
  console.log("Done.");
}
