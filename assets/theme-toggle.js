(function () {
  const KEY = "siteDarkTheme";

  function createGear() {
    const gear = document.createElement("button");
    gear.className = "theme-gear";
    gear.setAttribute("aria-label", "Site settings");
    gear.innerHTML = `
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M19.14,12.94a7.14,7.14,0,0,0,0-1.88l2.11-1.65a.5.5,0,0,0,.12-.64l-2-3.46a.5.5,0,0,0-.6-.22l-2.49,1A7.28,7.28,0,0,0,14.9,4.6l-.38-2.65A.5.5,0,0,0,14,1.6H10a.5.5,0,0,0-.5.35L9.12,4.6A7.28,7.28,0,0,0,6.82,5.09l-2.49-1a.5.5,0,0,0-.6.22l-2,3.46a.5.5,0,0,0,.12.64L4,11.06a7.14,7.14,0,0,0,0,1.88L1.88,14.59a.5.5,0,0,0-.12.64l2,3.46a.5.5,0,0,0,.6.22l2.49-1a7.28,7.28,0,0,0,2.3.49l.38,2.65A.5.5,0,0,0,10,22.4h4a.5.5,0,0,0,.5-.35l.38-2.65a7.28,7.28,0,0,0,2.3-.49l2.49,1a.5.5,0,0,0,.6-.22l2-3.46a.5.5,0,0,0-.12-.64Z M12,15.5A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z"/>
      </svg>`;
    return gear;
  }

  function createPopover() {
    const pop = document.createElement("div");
    pop.className = "theme-popover";
    pop.innerHTML = `
      <h4>Appearance</h4>
      <div class="controls">
        <button id="theme-light-btn">Light</button>
        <button id="theme-dark-btn">Dark</button>
      </div>
      <div style="font-size:12px;margin-top:8px;color:#666">Shortcut: Shift + Ctrl</div>
    `;
    return pop;
  }

  function applyTheme(isDark, save = true) {
    if (isDark) document.documentElement.classList.add("dark-theme");
    else document.documentElement.classList.remove("dark-theme");
    if (save) {
      try {
        localStorage.setItem(KEY, isDark ? "1" : "0");
      } catch (e) {}
    }
    // update button states if present
    const lightBtn = document.getElementById("theme-light-btn");
    const darkBtn = document.getElementById("theme-dark-btn");
    if (lightBtn && darkBtn) {
      if (isDark) {
        darkBtn.setAttribute("aria-pressed", "true");
        darkBtn.classList.add("active");
        lightBtn.setAttribute("aria-pressed", "false");
        lightBtn.classList.remove("active");
      } else {
        lightBtn.setAttribute("aria-pressed", "true");
        lightBtn.classList.add("active");
        darkBtn.setAttribute("aria-pressed", "false");
        darkBtn.classList.remove("active");
      }
    }
  }

  function init() {
    // avoid duplicate insertion
    if (document.querySelector(".theme-gear")) return;

    const gear = createGear();
    const pop = createPopover();

    document.body.appendChild(gear);
    document.body.appendChild(pop);

    gear.addEventListener("click", function (e) {
      pop.classList.toggle("open");
    });

    document.addEventListener("click", function (e) {
      if (!pop.contains(e.target) && !gear.contains(e.target)) {
        pop.classList.remove("open");
      }
    });

    document
      .getElementById("theme-light-btn")
      .addEventListener("click", function () {
        applyTheme(false);
      });
    document
      .getElementById("theme-dark-btn")
      .addEventListener("click", function () {
        applyTheme(true);
      });

    // set initial pressed states
    const setInitial = function () {
      const v = (function () {
        try {
          return localStorage.getItem(KEY);
        } catch (e) {
          return null;
        }
      })();
      const isDark =
        v === "1" || document.documentElement.classList.contains("dark-theme");
      applyTheme(isDark, false);
    };
    setInitial();

    // keyboard shortcut: Shift + Ctrl (press both modifiers together to toggle)
    (function () {
      const state = { shift: false, ctrl: false, triggered: false };
      document.addEventListener("keydown", function (e) {
        if (e.key === "Shift") state.shift = true;
        if (e.key === "Control") state.ctrl = true;
        if (state.shift && state.ctrl && !state.triggered) {
          state.triggered = true;
          const is = document.documentElement.classList.contains("dark-theme");
          applyTheme(!is);
        }
      });
      document.addEventListener("keyup", function (e) {
        if (e.key === "Shift") state.shift = false;
        if (e.key === "Control") state.ctrl = false;
        // reset trigger when either key is released so another toggle can occur on next hold
        if (!state.shift || !state.ctrl) state.triggered = false;
      });
    })();

    // initialize from storage
    try {
      const v = localStorage.getItem(KEY);
      if (v === "1") applyTheme(true, false);
    } catch (e) {}
  }

  // run on DOM ready
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", init);
  else init();
})();
