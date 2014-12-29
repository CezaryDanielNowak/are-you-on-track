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
  var appId = "ARE_YOU_ON_TRACK";
  var allowBrowsingForMinutes = 1.5;

  var now = function() {
    return 1*(new Date());
  };
  var data = {
    set: function(value) {
      localStorage.setItem(appId, JSON.stringify(value));
    },
    get: function() {
      var value = localStorage.getItem(appId);
      if (typeof value === 'string' && value[0] === "{") {
        return JSON.parse(value);
      }
      return {}
    }
  };

  var lastVisited = 0;

  var timeTracker = document.createElement('div');
  var trackerCSS = 'width:100vw; position:absolute; top:50%; margin-top:64px; color: #FFF; text-align:center';
  timeTracker.setAttribute('style', trackerCSS);
  var updateTracker = function () {
    var diff;
    var lastCaptchaSolved = data.get().lastCaptchaSolved || 0;
    if(lastCaptchaSolved) {
      diff = now() - lastCaptchaSolved;
      timeTracker.innerHTML = "<br>Last time you've typed captcha <strong>" + parseInt(diff/1000) + " seconds</strong> ago.";
    } else {
      timeTracker.innerHTML = '';
    }

    if(lastVisited) {
      diff = now() - lastVisited;
      timeTracker.innerHTML += "<br>Last time you've visited this site <strong>" + parseInt(diff/1000) + " seconds</strong> ago.";
    }
  };

  var onFocus = function() {
    var lastCaptchaSolved = data.get().lastCaptchaSolved || 0;
    var overlay = document.querySelector('#' + appId);
    if(!overlay) {
      if(now() - lastCaptchaSolved > allowBrowsingForMinutes*60000) {
        updateTracker();
        overlay = document.createElement('div');
        var overlayCSS = 'width:100vw; height:100vh; background: rgba(0,0,0,.92);position:fixed;top:0;left:0;z-index: 2147483647';
        overlay.setAttribute('style', overlayCSS);
        overlay.id = appId;

        overlay.innerHTML = "<h1 style='margin:-64px 0 0; font-size: 32px; color: rgb(255, 255, 255); top: 50%; position: absolute; left: 0px; right: 0px; text-align: center;'>Are you on track?</h1>";

        var controlsContainer = document.createElement('div');
        controlsContainer.setAttribute('style', 'width:100vw; position:absolute; top: 50%; margin-top:32px;text-align:center;');
        overlay.appendChild(controlsContainer);
        overlay.appendChild(timeTracker);

        var btn = document.createElement('input');
        btn.value = parseInt(Math.random()*100000000).toString(36).toUpperCase();
        btn.type = 'button';
        btn.oncontextmenu = function(e) {
          e.preventDefault();
        };
        var input = document.createElement('input');
        input.placeholder = "Re-type text from input: ";
        input.type = 'text';
        input.onkeydown = function(e) {
          if(e && e.keyCode === 13) {
            btn.click();
          }
        };

        btn.onclick = function() {
          if(input.value.toUpperCase() === btn.value) {
            data.set({lastCaptchaSolved: now()});
            document.body.removeChild(overlay);
          } else {
            alert('NOPE.');
          }
        };
        controlsContainer.appendChild(input);
        controlsContainer.appendChild(btn);

        document.body.appendChild(overlay);
      } else {
        // triggered when focus tab (captcha typed somewhere else.)
        document.body.removeChild(overlay);
      }
    }
  };

  window.addEventListener('focus', onFocus);
  document.addEventListener('DOMContentLoaded', onFocus);
  setInterval(onFocus, allowBrowsingForMinutes * 60000);

  window.addEventListener('blur', function() {
    lastVisited = now();
  });
})();

// ==/UserScript==