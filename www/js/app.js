//'use strict';
        // DB init
  const DB_NAME = 'ShoppingList';
  const DB_VERSION = 2; // Use a long long for this value (don't use a float)
  const DB_STORE_LISTS = 'lists2';
  const DB_STORE_ITEMS = 'items1';

SL = {
  action: function(target, func, view, listener) {
    var elm = document.getElementById(target);
    if(typeof elm != "undefined" && elm != null) {

      if(typeof listener != "undefined" &&
       typeof view != "undefined" && typeof func != "undefined") {
        elm.style.display = "block";

        elm.addEventListener(listener, function(e) {
          view[func]();
        });  
      } else {
        if(typeof target != "undefined") {

          if(typeof view != "undefined" && typeof func != "undefined") {
            view[func](target);
          } else {
            if(typeof func != "undefined") {
              SL[func](target)
            }
          }
        } else {
          if(typeof view != "undefined" && typeof func != "undefined") {
            view[func]();
          } else {
            if(typeof func != "undefined") {
              SL[func]()
            }
          }
        }
      }
    }
  },
  hide: function(target) {
    document.getElementById(target).style.display = "none";
  },
  show: function(target) {
    document.getElementById(target).style.display = "block";
  },
  settings: function(aView) {
    this.show("settings");

    var button = document.getElementById("settings");
    button.addEventListener("click", function(e) {
      aView.close();
      SL.Settings.init(aView);
    });
  }
};

SL.Settings = {
  init: function(aView) {
    document.getElementById("title").innerHTML = "Settings";
    SL.action("settingsPanel", "show");
    SL.action("back", "show");
    document.getElementById("back").addEventListener("click", function(e) {
      SL.Settings.close();
      aView.init();
    });
    document.getElementById("archiveAll").addEventListener("click", function() {
      SL.Settings.archiveAll();
    });
  },
  close: function() {
    SL.action("settingsPanel", "hide");
    SL.action("back", "hide");
  },
  archiveAll: function () {
    
  }
};

SL.Lists = {
  elm : document.getElementById("lists"),
  store: DB_STORE_LISTS,
  init: function() {
    document.getElementById("title").innerHTML = "Shopping List";
    SL.action("lists", "show");
    SL.action("back", "hide");

    var request = navigator.mozApps.getSelf();
    request.onsuccess = function() {
      if (!request.result) {
        SL.action("install", "show");
        SL.action(null, "install", this, "click");
      }
    };
    
    SL.action("edit", "show");
    SL.action(null, "edit", this, "click");
    SL.action("form-list", "show");
    SL.action("completeall", "show");
    //SL.action(null, "completeall", this, "click");  -> marche pas!
    document.getElementById("completeall").addEventListener("click", function() {
      SL.Lists.completeall();
    });
    //SL.action("settings", "settings", SL, "click");
    //FIXME: don’t hardcode this:
    SL.settings(SL.Lists);
    var install = document.getElementById('install');
    install.addEventListener('click', function(e){
      navigator.mozApps.install("http://theochevalier.fr/app/manifest.webapp");
    })
  },
  close: function() {
    SL.action("lists", "hide");
    SL.action("edit", "hide");
    SL.action("settings", "hide");
    SL.action("install", "hide");
    SL.action("form-list", "hide");
    SL.action("completeall", "hide");
  },
  editMode: function() {
    var nodes = SL.Lists.elm.getElementsByClassName("list")[0].childNodes;
    for(var i=1; i<nodes.length; i++) {
        nodes[i].getElementsByTagName('label')[0].style.display = "none";
        var a = document.createElement('a');
        a.className =  'dnd';
        a.innerHTML = "DND";
        //nodes[i].appendChild(a);
        //FIXME: remove class with a regex
        nodes[i].className = "";
        //nodes[i].className.replace ( /(?:^|\s)done(?!\S)/g , '' );
        nodes[i].insertAdjacentHTML('afterbegin',
        '<a class="dnd">DND</a>');
        var edit = document.getElementById('edit');
        edit.removeEventListener("click", function(e){}, false);
        edit.addEventListener("click", function(e) {
          SL.Lists.clear();
          DB.displayList(null, SL.Lists);
        });
    }
    console.log(SL.Lists.elm.lastChild);
  },
  add: function(aList) {
    DB.store(aList, SL.Lists);
    SL.Lists.display(aList, SL.Lists);
  },
  edit: function (aItem, elm) {
    aList.done = elm.getElementsByTagName("input")[0].checked;
    aList.name = elm.getElementsByTagName("a")[0].innerHTML;

    // Delete the list, add the updated one
    DB.deleteFromDB(aList.guid, SL.Lists);
    DB.store(aList, SL.Lists);
  },
  display: function(aList) {

    var newLi = document.createElement('li');
    newLi.dataset.listkey = aList.guid;

    // Part 1 toggle
    var newToggle = document.createElement('label');
    //newToggle.className +="danger";
    //newToggle.setAttribute('for', aList.guid);
    var mySpan = document.createElement('span');
    var checkbox = document.createElement('input');
    checkbox.setAttribute('type', 'checkbox');
    //checkbox.setAttribute('id', aList.guid);
    if (aList.done) {
      newLi.className += " done";
      checkbox.setAttribute('checked', true);
    } 

    newToggle.appendChild(checkbox);
    newToggle.appendChild(mySpan);

    mySpan.addEventListener("click", function(e) {
      console.log("span ok");

      if (!aList.done) {
        newLi.className += " done";
      } else {
        newLi.className = newLi.className.replace ( /(?:^|\s)done(?!\S)/g , '' );
      }
      console.log(newLi.getElementsByTagName("input")[0].checked);
      aList.done = !aList.done;

      // Delete the item, add the updated one
      DB.deleteFromDB(aList.guid, SL.Lists);
      DB.store(aList, SL.Lists);
    });


    // Part 2 pack-end
    var packEnd  = document.createElement('aside');
    packEnd.className = "pack-end";

    // part 3 title
    var newTitle = document.createElement('a');
    var p1 = document.createElement('p');
    var p2 = document.createElement('p');

    p1.innerHTML = aList.name;
    p2.innerHTML = "x  items";
    newTitle.className = "liTitle";
    newTitle.addEventListener("click", function(e) {
      SL.Items.init(aList);
      console.log(aList);
    });
    newTitle.appendChild(p1);
    newTitle.appendChild(p2);


/*
    var newDelete = document.createElement('a');
    newDelete.className = 'delete';
    newDelete.addEventListener("click", function(e) {
      newLi.style.display = "none";
      DB.deleteFromDB(aList.guid, SL.Lists);
    });
    */
    
    newLi.appendChild(newToggle);
    newLi.appendChild(packEnd);
    newLi.appendChild(newTitle);
    //newLi.appendChild(newDelete);

    SL.Lists.elm.getElementsByClassName("list")[0].appendChild(newLi);
    console.log("added!");
  },
  clear: function() {
    var lists = document.getElementById("lists");
    var list = document.getElementsByClassName("list")[0];
    lists.removeChild(list);
    var ul = document.createElement('ul');
    ul.className =  'list';
    lists.appendChild(ul);
  },
  completeall: function() {
    
    var nodes = SL.Lists.elm.getElementsByClassName("list")[0].childNodes;
    for(var i=1; i<nodes.length; i++) {
        console.log(nodes[i].getElementsByTagName('label')[0].checked);
        nodes[i].getElementsByTagName('input')[0].setAttribute("checked", true);
        nodes[i].className.replace ( /(?:^|\s)done(?!\S)/g , '' );
        nodes[i].className += " done";
    }
  }
};

SL.Items = {
  elm: document.getElementById("items"),
  store: DB_STORE_ITEMS,
  init: function(aList) {
    SL.Lists.close();
    // Set title of the displayed Items list
    document.getElementById("title").innerHTML=aList.name;

    var items = document.getElementById('items');
    items.style.display = "block";
    this.list = aList;

    // Display buttons
    SL.action("back", "back", this, "click");
    SL.action("add-item", "add", this, "click");
    document.getElementById('add-item').style.display = "inline-block";
    SL.Items.clear();
    DB.displayItems(aList);
  },

  // Go back to Lists view
  back: function() {
    // Hide Items list
    SL.action("items", "hide");
    // Display Lists list
    SL.Lists.init();
  },

  // Add an item to the current list
  add: function() {
    var name = document.getElementById('itemName').value;
    var qty = document.getElementById('itemQty').value;
    var date = new Date();

    // Handle empty form
    if (!name || !qty) {
      var msg = "";
      if (!name) {
        msg += "You must enter a name";
        if (!qty)
          msg += "and a quantity"
      }
      if (!qty)
        msg += "You must enter a quantity"

      displayActionFailure(msg);
      return;
    }

    aItem = { guid: guid(),
                   name: name,
                   list: SL.Items.list.guid,
                   nb: qty,
                   date: date.getTime(),
                   done: false
    };
    name = "";
    qty = "1";

    DB.store(aItem, SL.Items);
    SL.Items.display(aItem);
  },

  display: function(aItem) {
    var newLi = document.createElement('li');
    var newToggle = document.createElement('label');
    newToggle.className = "labelItem";
    var span = document.createElement('span');
    var checkbox = document.createElement('input');
    checkbox.setAttribute('type', 'checkbox');
    if (aItem.done) {
      newLi.className += " done";
      checkbox.setAttribute('checked', true);
    } 

    newToggle.addEventListener("click", function(e) {
      if (!aItem.done) {
        newLi.className += " done";
      } else {
        newLi.className = newLi.className.replace ( /(?:^|\s)done(?!\S)/g , '' );
      }
      aItem.done = newLi.getElementsByTagName("input")[0].checked;

      // Delete the item, add the updated one
      DB.deleteFromDB(aItem.guid, SL.Items);
      DB.store(aItem, SL.Items);
    });

    newToggle.appendChild(checkbox);
    newToggle.appendChild(span);


    var newTitle = document.createElement('a');
    newTitle.className = 'listElmTitle';
    newTitle.innerHTML = aItem.name;
    if (aItem.nb > 1) {
      var container = document.createElement('a');
      container.innerHTML = " x";
      var input = document.createElement('input');
      input.setAttribute('type', 'number');
      input.value = aItem.nb;
      container.appendChild(input);
      //container.insertAdjacentHTML('beforeend',
      //  '<input type="number" value="'+aItem.nb+'"/>');
      newTitle.appendChild(container);
    }

    var newDelete = document.createElement('a');
    newDelete.className = 'delete';
    newDelete.addEventListener("click", function(e) {
      newLi.style.display = "none";
      DB.deleteFromDB(aItem.guid, SL.Items);
    });

    
    newLi.dataset.listkey = aItem.guid;

    newLi.appendChild(newToggle);
    newLi.appendChild(newTitle);
    newLi.appendChild(newDelete);

    SL.Items.elm.getElementsByClassName("list")[0].appendChild(newLi);
    console.log("added!");
  },
  clear: function() {
    SL.Items.elm.removeChild(SL.Items.elm.getElementsByClassName("list")[0]);
    var ul = document.createElement('ul');
    ul.setAttribute('class', 'list');
    SL.Items.elm.appendChild(ul);
  }
};

  // Messages handlers
  function displayActionSuccess(msg) {
    msg = typeof msg != 'undefined' ? "Success: " + msg : "Success";
    document.getElementById('msg').innerHTML = '<span class="action-success">' + msg + '</span>';
  }
  function displayActionFailure(msg) {
    msg = typeof msg != 'undefined' ? "Failure: " + msg : "Failure";
    document.getElementById('msg').innerHTML = '<span class="action-failure">' + msg + '</span>';
  }
  function resetActionStatus() {
    document.getElementById('msg').innerHTML = '';
  }

// Generate four random hex digits.
function S4() {
   return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
};

// Generate a pseudo-GUID by concatenating random hexadecimal.
function guid() {
   return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
};

// Add the eventListeners to buttons, etc.
function addEventListeners() {

  console.log("addEventListeners");
  var add = document.getElementById('add-list');
  add.style.display = "block";
  add.addEventListener("click", function(evt) {
    var name = document.getElementById('listName').value;
    var date = new Date();

    if (!name || name === undefined) {
      displayActionFailure("You must enter a name");
      return;
    }
    SL.Lists.add({ guid: guid(),
                   name: name,
                   date: date.getTime(),
                   items:{}
    });
    document.getElementById('listName').value ="";
  });

  document.getElementById('edit').addEventListener("click", function(evt) {
     SL.Lists.editMode();
  });
}
 
// Actions that needs the DB to be ready
function finishInit() {
  // Populate the list
  SL.Lists.init();
  DB.displayList(null, SL.Lists);
    var height = document.body.clientHeight;
  console.log(height);
  document.getElementById("content").style.height = height;
  document.getElementById("header").style.display = "block";
}
var db;
window.addEventListener("load", function() {
  
  DB.openDb();
  addEventListeners();
});