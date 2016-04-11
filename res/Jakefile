var exec = require('child_process').execSync;
var packageJSON = require('./package.json');
var fs = require("fs");

String.prototype.replaceAll = String.prototype.replaceAll || function(needle, replacement) {
    return this.split(needle).join(replacement);
};

task('default', function (params) {
  console.log('Please, select a task.');
});

task('build', function (params) {
  var projectName = packageJSON.name;

  var originalProjectName = projectName;

  // Sanitizes the name
  while (projectName.indexOf("_") != -1) {
    projectName = projectName.replace("_", "-");
  }

  var author = packageJSON.author;

  console.log('Started build of ' + projectName);

  // Runs checks

  try {
    fs.statSync('.paquet-maker/control')
  } catch (e) {
    console.log("Missing files (control) ... Aborting!");
    console.log("Tip: Running paquet-maker might solve it!");
    return;
  }

  try {
    fs.statSync('.paquet-maker/init.d')
  } catch (e) {
    console.log("Missing files (init.d)... Aborting!");
    console.log("Tip: Running paquet-maker might solve it!");
    return;
  }


  // Sets the user that'll run the application
  var user = "root";
  var userDir;
  if (process.env.user != null && process.env.user != undefined && process.env.user != 'root') {
    user = process.env.user;
    userDir = 'home/' + user;
  } else {
    userDir = user;
  }

  var addInitd = false;
  if (process.env.initd == 'true') {
    addInitd = true;
  }

  // Set variables that are common
  var workingDirectory = "./pkg/" + projectName + "/" + userDir + "/" + projectName;
  var controlDirectory = "./pkg/" + projectName + "/DEBIAN"
  var initdDirectory = "./pkg/" + projectName + "/etc/init.d/"
  var initdFile = initdDirectory + originalProjectName
  var latestTag;

  // Gets project version or defaults to 0.0.1
  try {
    latestTag = "" + exec("git describe");
    latestTag = latestTag.replace("\r\n", "").replace("\n", "");
  } catch (ex) {
    console.log("Error getting git tag. Defaulting to 0.0.1");
    latestTag = "0.0.1"
  }

  // Cleanup if needed
  console.log("Deleting old ./pkg folder");
  jake.rmRf('pkg');

  if (addInitd == true) {
    // Generates the control file and populates it.
    console.log("Adding init.d script");
    exec("mkdir -p " + initdDirectory);
    exec("cp .paquet-maker/init.d " + initdFile);
    exec("sed -i 's/app_name/" + projectName + "/g' " + initdFile);

    // Tiny hack to escape working directory
    var absoluteWorkingDirectory =  workingDirectory.replace("./pkg/" + projectName, "");

    while (absoluteWorkingDirectory.indexOf("/") != -1) {
      absoluteWorkingDirectory = absoluteWorkingDirectory.replace("/", "|");
    }

    while (absoluteWorkingDirectory.indexOf("|") != -1) {
      absoluteWorkingDirectory = absoluteWorkingDirectory.replace("|", "\\/");
    }

    exec("sed -i 's/runtime_user/" + user + "/g' " + initdFile);
    exec("sed -i 's/working_directory/" + absoluteWorkingDirectory + "/g' " + initdFile);
    exec("chmod a+x " + initdFile);
  }

  // Copies all contents of this directory to the working directory
  console.log("Copying application directory to working directory");
  exec("mkdir -p " + workingDirectory);
  exec("ls | grep -vw 'pkg' | grep -v \".sample$\" | xargs -n 1 -iITER cp -R ITER " + workingDirectory);

  // Generates the control file and populates it.
  console.log("Generating DEBIAN/control");
  exec("mkdir -p " + controlDirectory);
  exec("cp .paquet-maker/control " + controlDirectory + "/control");
  exec("sed -i 's/app_name/" + projectName + "/g' " + controlDirectory + "/control");
  exec("sed -i 's/app_tag/" + latestTag + "/g' " + controlDirectory + "/control");
  exec("sed -i 's/app_author/" + author + "/g' " + controlDirectory + "/control");

  // Installs package.json dependencies
  console.log("Installing dependencies...");
  exec("(cd " + workingDirectory + " && npm install --production)");

  // Generates the actual .deb
  console.log("Generating .deb package");
  exec("(cd ./pkg/ && dpkg-deb --build " + projectName + ")");

  // Copies to build folder
  console.log("Copying to build directory");
  exec("mkdir -p ./build");
  exec("mv ./pkg/" + projectName + ".deb ./build/" + projectName + "_" + latestTag + ".deb");

  // Clean up. We don't leave our shit behind
  console.log("Cleaning up");
  jake.rmRf('pkg');

  // GREAT SUCCESS
  console.log("Built successfully.");
});
