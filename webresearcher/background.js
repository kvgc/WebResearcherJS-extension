function handleClick() {
  browser.runtime.openOptionsPage();
}

browser.browserAction.onClicked.addListener(handleClick);

console.log("inside background.js");
browser.contextMenus.create({
  id: "eat-page",
  title: "Start WebResearcherJS"
});

/////////////////////////////////////
//// Load all modules to webpage ////
/////////////////////////////////////
var jsFiles = [
  "ext_libs/jquery.min.js",
  "ext_libs/jquery-ui.min.js",
  "ext_libs/editorjs@latest.js",
  "ext_libs/mark.min.js",
  "ext_libs/header@latest.js",
  "ext_libs/simple-image@latest.js",
  "ext_libs/list@latest.js",
  "ext_libs/code@latest.js",
  "ext_libs/quote@latest.js",
  "ext_libs/edjsHTML.js",
  "ext_libs/popper.js",
  "ext_libs/notify.min.js",
  "ext_libs/jquery.sidebar.min.js",
  "webresearcher/init.js",
  "webresearcher/handleMouseEvents.js",
  "webresearcher/loadLocalStorage.js",
  "webresearcher/saveLocalStorage.js",
  "webresearcher/export.js",
  "webresearcher/webresearcher.js"
];

var cssFiles = [
  "ext_libs/jquery-ui.min.css",
  "webresearcher/custom.css"
];

// error catching functions
function onExecuted(result) {
  console.log(`Loaded`);
}

function onError(error) {
  // alert(error);
  console.log(`Error: ${error}`);
}

// first wait for jquery, jquery-ui and others to load and then load all the small ones.. very poorly written code...
function loadJQuery(){
  const executing = browser.tabs.executeScript({
    file: jsFiles[0]
  });
  executing.then(loadJQueryUI, onError);
}

function loadJQueryUI(){
  const executing = browser.tabs.executeScript({
    file: jsFiles[1]
  });
  executing.then(loadEditor, onError);
}

function loadEditor(){
  const executing = browser.tabs.executeScript({
    file: jsFiles[2]
  });
  executing.then(loadMark, onError);
}

function loadMark(){
  const executing = browser.tabs.executeScript({
    file: jsFiles[3]
  });
  executing.then(loadTWFilePath, onError);
}

function loadTWFilePath(){
    //Tiddlywiki file path obtained from user
    var gettingItem = browser.storage.sync.get('TWFilepath');
    gettingItem.then((res) => {
      var foo_res = JSON.parse(res.TWFilepath);
      const executing = browser.tabs.executeScript({
          code:`var TWFilepath="`+ foo_res + `";`
      });
      executing.then(loadJoplinToken, onError);
    });
}
function loadJoplinToken(){
  var joplinToken = browser.storage.sync.get('joplinToken');
  joplinToken.then((res) => {
    var foo_res = JSON.parse(res.joplinToken);
    const executing = browser.tabs.executeScript({
        code:`var joplinToken="`+ foo_res + `";`
    });
    executing.then(loadMarkJS, onError);
  });
}

var joplinToken  = browser.storage.sync.get('joplinToken');


function loadMarkJS(){
    var gettingItem = browser.storage.sync.get('MarkJSHighlight');
    console.log(gettingItem);
    gettingItem.then((res) => {
      var foo_res = JSON.parse(res.MarkJSHighlight);
      const executing = browser.tabs.executeScript({
          code:`var MarkJSHighlight="`+ foo_res + `";`
      });
      executing.then(loadOtherModules, onError);
    });
}

// load all other modules
function loadOtherModules(){
  for(var i=0;i<cssFiles.length;i++){
          const executing = browser.tabs.insertCSS({
            file: cssFiles[i]
          });
          executing.then(onExecuted, onError);
  }
  for(var i=4;i<jsFiles.length;i++){
          const executing = browser.tabs.executeScript({
          file: jsFiles[i]
        });
        executing.then(onExecuted, onError);
    }

}

function handleMessage(request, sender, sendResponse) {
  console.log("Message from the content script: " + request.greeting);
  loadJQuery();
  sendResponse({response: "Response from background script"});
}
// Trigger loading of modules //
browser.runtime.onMessage.addListener(handleMessage);

////////////////////////////////////////////////////////////



browser.contextMenus.onClicked.addListener(function(info, tab) {
  if (info.menuItemId == "eat-page") {
      loadJQuery();
  }
});
