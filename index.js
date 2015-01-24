// ==UserScript==
// @name        Are you on track ?
// @namespace   are-you-on-track
// @description Script forces you to re-type captcha, on time-wasting services
// @include     https://www.facebook.com/*
// @include     https://facebook.com/*
// @include     http://kwejk.pl/*
// @include     http://www.kwejk.pl/*
// @include     http://jbzd.pl/*
// @include     http://www.jbzd.pl/*
// @version     1
// @grant       none

(function() {
  /*
   * ID of element in DOM tree and ID of localStorage field to store data.
   */
  var appId = "ARE_YOU_ON_TRACK";
  /*
   * After this time, you don't need to type captcha.
   */
  var allowBreakAfterMinutes = 45;

  function now() {
    return 1*(new Date());
  }

  function isAccessEnabled() {
    var accessAllowedSince = storage().accessAllowedSince || 0;
    return now() <= accessAllowedSince;
  }

  function enableAccess(overlay, time) {
    storage.set({
      accessAllowedSince: now() + time*60000
    });
    document.body.removeChild(overlay);
  }

  function isBreakTime() {
    var accessAllowedSince = storage().accessAllowedSince || 0;
    var diff = now() - accessAllowedSince;
    return accessAllowedSince && diff/60000 >= allowBreakAfterMinutes;
  }

  function domElement(element, props) {
    if(typeof element === "string") {
      element = document.createElement(element);
    }
    if(props) {
      for(var field in props) {
        if(["innerHTML", "id", "value", "htmlFor", "className"].indexOf(field) !== -1 || field.substr(0, 2) === "on") {
          element[field] = props[field];
        } else {
          element.setAttribute(field, props[field]);
        }
      }
    }
    return element;
  }

  function timeTracker(whatToDo) {
    if(!timeTracker.tracker) {
      if(whatToDo === 'update') {
        return; // we don't want to create element now.
      }
      timeTracker.tracker = domElement("div", {
        style: "width:100vw; position:absolute; top:50%; margin-top:64px; color: #FFF; text-align:center"
      });
    }
    var accessAllowedSince = storage().accessAllowedSince || 0;
    if(accessAllowedSince) {
      var diff = now() - accessAllowedSince;
      timeTracker.tracker.innerHTML = "<br>Last site access: <strong>" + (diff/60000).toFixed(2) + " minutes</strong> ago.";
    } else {
      timeTracker.tracker.innerHTML = "";
    }

    return timeTracker.tracker;
  }

  function getRandomCode() {
    return parseInt(Math.random()*100000000).toString(36).toUpperCase();
  }

  function storage() {
    var value = localStorage.getItem(appId);
    if (typeof value === "string" && value[0] === "{") {
      return JSON.parse(value);
    }
    return {};
  }

  storage.set = function(value) {
    localStorage.setItem(appId, JSON.stringify(value));
  };

  function addButton(extraParams, input, label, overlay) {
    extraParams.type = "button";
    extraParams.style = "font-family: 'Lucida Console', Monaco, monospace";
    if(extraParams["data-time"]) {
      extraParams.value = "Browse page for " + extraParams["data-time"] + " minutes...";
      extraParams.oncontextmenu = function(e) {
        e.preventDefault();
      };
      extraParams.onclick = function(e) {
        var time = e.target.dataset.time;
        if(label.innerHTML === input.value.toUpperCase()) {
          enableAccess(overlay, time);
        } else {
          alert("NOPE.");
        }
      };
    }
    return domElement("input", extraParams);
  }

  var onFocus = function() {
    var btn1, btn2, btn3, controlsContainer, label, input, breakTime,
        overlay = document.querySelector("#" + appId);
    if(isAccessEnabled()) {
      // triggered when captcha was typed in other tab.
      overlay && document.body.removeChild(overlay);
    } else {
      breakTime = isBreakTime();
      if(breakTime && overlay) {
        document.body.removeChild(overlay);
        overlay = undefined;
      }
      timeTracker('update');

      if(!overlay) {
        overlay = domElement("div", {
          style: "width:100vw; height:100vh; background: rgba(0,0,0,.92);position:fixed;top:0;left:0;z-index: 2147483647",
          id: appId,
          innerHTML: "<h1 style='margin:-64px 0 0; font-size: 32px; color: rgb(255, 255, 255); top: 50%; position: absolute; left: 0px; right: 0px; text-align: center;'>Are you on track?</h1>"
        });

        controlsContainer = domElement("div", {
          style: "width:100vw; position:absolute; top: 50%; margin-top:32px;text-align:center;"
        });

        if(breakTime) {
          btn1 = addButton({
            value: "Congratz! After " + allowBreakAfterMinutes + " minutes of work, you are free to go for 5 minutes!",
            onclick: function() {
              enableAccess(overlay, 5);
            }
          });
        } else {
          label = domElement("label", {
            style: "margin-right:1em;font-family: 'Lucida Console', Monaco, monospace; pointer-events: none;-webkit-touch-callout: none;-webkit-user-select: none;-khtml-user-select: none;-moz-user-select: none;-ms-user-select: none;user-select: none;",
            htmlFor: appId + "_INPUT",
            id: appId + "_INPUT",
            innerHTML: getRandomCode()
          });

          input = domElement("input", {
            placeholder: "Re-type text",
            type: "text",
            id: appId + "_INPUT",
            onkeydown: function(e) {
              e && e.keyCode === 13 && btn2.click();
            }
          });

          btn1 = addButton({"data-time": 2}, input, label, overlay);
          btn2 = addButton({"data-time": 5}, input, label, overlay);
          btn3 = addButton({"data-time": 10}, input, label, overlay);

          controlsContainer.appendChild(label);
          controlsContainer.appendChild(input);
          controlsContainer.appendChild(domElement("br"));
        }
        btn1 && controlsContainer.appendChild(btn1);
        btn2 && controlsContainer.appendChild(btn2);
        btn3 && controlsContainer.appendChild(btn3);
        overlay.appendChild(controlsContainer);
        overlay.appendChild(timeTracker());
        document.body.appendChild(overlay);
      }
    }
  };

  window.addEventListener("focus", onFocus);
  document.addEventListener("DOMContentLoaded", onFocus);
  setInterval(onFocus, 2 * 60000);
  setTimeout(function() {
    window.document && window.document.body && onFocus();
  });
})();

// ==/UserScript==