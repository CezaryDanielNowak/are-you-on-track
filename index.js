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
   * After this time, website will be blocked by captcha again.
   */
  var allowBrowsingForMinutes = 1.5;

  function now() {
    return 1*(new Date());
  }

  function isAccessEnabled() {
    var lastCaptchaSolved = data.get().lastCaptchaSolved || 0;
    return now() - lastCaptchaSolved <= allowBrowsingForMinutes*60000;
  }

  function domElement(element, props) {
    if(typeof element === "string") {
      element = document.createElement(element);
    }
    for(var field in props) {
      if(["innerHTML", "id", "value"].indexOf(field) !== -1 || field.substr(0, 2) === "on") {
        element[field] = props[field];
      } else {
        element.setAttribute(field, props[field]);
      }
    }
    return element;
  }

  function updateTracker() {
    var diff;
    var lastCaptchaSolved = data.get().lastCaptchaSolved || 0;
    if(lastCaptchaSolved) {
      diff = now() - lastCaptchaSolved;
      timeTracker.innerHTML = "<br>Last time you've typed captcha <strong>" + (diff/60000).toFixed(2) + " minutes</strong> ago.";
    } else {
      timeTracker.innerHTML = "";
    }
  }

  function getRandomCode() {
    return parseInt(Math.random()*100000000).toString(36).toUpperCase();
  }

  var data = {
    set: function(value) {
      localStorage.setItem(appId, JSON.stringify(value));
    },
    get: function() {
      var value = localStorage.getItem(appId);
      if (typeof value === "string" && value[0] === "{") {
        return JSON.parse(value);
      }
      return {};
    }
  };

  var timeTracker = domElement("div", {
    style: "width:100vw; position:absolute; top:50%; margin-top:64px; color: #FFF; text-align:center"
  });

  var onFocus = function() {
    var overlay = document.querySelector("#" + appId);
    if(isAccessEnabled()) {
      // triggered when captcha was typed in other tab.
      overlay && document.body.removeChild(overlay);
    } else {
      updateTracker();
      if(!overlay) {
        overlay = domElement("div", {
          style: "width:100vw; height:100vh; background: rgba(0,0,0,.92);position:fixed;top:0;left:0;z-index: 2147483647",
          id: appId,
          innerHTML: "<h1 style='margin:-64px 0 0; font-size: 32px; color: rgb(255, 255, 255); top: 50%; position: absolute; left: 0px; right: 0px; text-align: center;'>Are you on track?</h1>"
        });

        var controlsContainer = domElement("div", {
          style: "width:100vw; position:absolute; top: 50%; margin-top:32px;text-align:center;"
        });

        var btn = domElement("input", {
          value: getRandomCode(),
          type: "button",
          oncontextmenu: function(e) {
            e.preventDefault();
          },
          onclick: function() {
            if(input.value.toUpperCase() === btn.value) {
              data.set({lastCaptchaSolved: now()});
              document.body.removeChild(overlay);
            } else {
              alert("NOPE.");
            }
          }
        });

        var input = domElement("input", {
          placeholder: "Re-type text from input: ",
          type: "text",
          onkeydown: function(e) {
            if(e && e.keyCode === 13) {
              btn.click();
            }
          }
        });
        controlsContainer.appendChild(input);
        controlsContainer.appendChild(btn);
        overlay.appendChild(controlsContainer);
        overlay.appendChild(timeTracker);

        document.body.appendChild(overlay);
      }
    }
  };

  window.addEventListener("focus", onFocus);
  document.addEventListener("DOMContentLoaded", onFocus);
  setInterval(onFocus, allowBrowsingForMinutes * 60000);
})();

// ==/UserScript==