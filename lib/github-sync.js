//Node
var fs = require('fs');
var https = require('https');

var gs = {};//Github Sync

gs.app = {};//Specific info
gs.export = {};//Public functions
gs.github = {};//Github data
gs.http = {};//HTTP helpers

//Atom
gs.export.activate = function(state){
  //Gets saved data
  if(!!state.auth){
    //TODO
  } else{
    //TODO
  }

  //Set values
  gs.app.settingsView = "" +
  "<div class=\"editor-container\" style=\"width: 100%; height: 50px; background: #1d1f21; color: #aaaaaa; border-top: 1px solid rgba(0, 0, 0, 0.5); box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.07);\">" +
    "<input class=\"hidden-input\" style=\"width: 200px; margin-left: 20px; background: #2D3033; border: 1px solid #17181A; color: #aaaaaa;\">" +
    "<button style=\"margin-left: 10px; border: 1px solid #aaaaaa; background: #2D3033; color: #aaaaaa;\">Enter</button>" +
  "</div>";

  //Settings commands
  atom.workspaceView.command('github-sync:sync', gs.export.sync);
  atom.workspaceView.command('github-sync:login', gs.export.login);
  atom.workspaceView.command('github-sync:logout', gs.export.logout);

  //Loading Settings
  gs.loadSettings();
};

gs.export.serialize = function(){
  //Stores saved data
  var saveObject = {};
  saveObject.auth = gs.data;

  return saveObject;
};

gs.export.deactivate = function(){
  //Called on deactivate
};


//Commands
gs.export.sync = function(){
  console.log('Sync called');
  var headers = {};
  gs.addObjects(headers, gs.github.headers, true);

  gs.http.request(gs.http.formatOptions("api.github.com/users/Noah-Huppert", headers), function(data, statusCode){
    console.log("Github Sync: - Sync", data);
  });
};

gs.export.login = function(){
  console.log('Login called');
};

gs.export.logout = function(){
  console.log('Logout called');
};


//Helpers
gs.loadSettings = function(){
  atom.config.setDefaults("github-sync.autoShowConfig", true);

  if(!!atom.config.get("github-sync.AccessToken")){
    gs.github.accessToken = atom.config.get("github-sync.AccessToken");
  } else if(atom.config.get("github-sync.autoShowConfig")){
    atom.workspaceView.appendToBottom(gs.app.settingsView);
  }
};

gs.addObjects = function(parentObject, childObject, set){
  var newObject = parentObject;

  if(!!parentObject && typeof parentObject == 'object'){
    if(!!childObject && typeof childObject == 'object'){
      doAdd();
    } else{
      throw 'Github Sync - addObjects: childObject must be an object';
    }
  } else{
    throw 'Github Sync - addObjects: parentObject must be an object';
  }

  function doAdd(){
    for(var attrname in childObject){
      newObject[attrname] = childObject[attrname];
    }

    if(!!set && typeof set == 'boolean' && set){
      parentObject = newObject;
    }
  }

  return newObject;
};

gs.http.formatOptions = function(host, method, extras){
  var formattedOptions = {
    "host": "Not provided",
    "path": "Not provided",
    "method": "GET",
    "headers": {}
  };

  if(!!host){
    var splitHost = host.split('/');

    var realHost = "";
    var realPath = "";

    if(splitHost[0].indexOf('http:/') != -1){//Host contains HTTP://www.foo.com
      realHost = splitHost[3];
      realPath = splitHost.splice(0, 3).join('');
    } else{
      realHost = splitHost[0];
      splitHost.splice(0, 1);//.join('/');
      realPath = "/" + splitHost.join('/');
    }

    formattedOptions.host = realHost;
    formattedOptions.path = realPath;
  } else{
    throw 'Github Sync - Format Options: must provide url';
  }

  if(!!method && typeof method == 'string'){//Method is actual method
    formattedOptions.method = method;
  } else if(!!method && typeof method == 'object'){//Method is actualy extras
    gs.addObjects(formattedOptions.headers, method, true);
  }

  if(!!extras){
    gs.addObjects(formattedOptions.headers, extras, true);
  }

  return formattedOptions;
};

gs.http.request = function(options, callback){

  function internalCallback(response){
    var data = "";

    response.on("data", function(chunk){
      data += chunk;
    });

    response.on("error", function(error){
      throw "Github Sync - gs.http.request: An error occured" + error;
    });

    response.on("end", function(){
      if(!!callback, response.stausCode){
        callback(data);
      }
    });
  }

  var req = https.request(options, internalCallback).end();
};


//Github
gs.github.headers = {
  "Accept": "application/vnd.github.v3+json",
  "User-Agent": "Github Atom - Github Sync Package"
};


module.exports = gs.export;
