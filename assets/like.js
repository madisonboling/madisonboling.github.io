// Like button logic: persist total likes in localStorage, prevent multiple likes per session with sessionStorage
(function () {
  const LIKE_KEY = "siteLikeCount";
  const SESSION_FLAG = "likedThisSession";

  function $(sel) {
    return document.querySelector(sel);
  }

  function readCount() {
    try {
      return parseInt(localStorage.getItem(LIKE_KEY) || "0", 10);
    } catch (e) {
      return 0;
    }
  }
  function writeCount(n) {
    try {
      localStorage.setItem(LIKE_KEY, String(n));
    } catch (e) {}
  }

  function init() {
    const btn = $("#site-like-button");
    const countEl = $("#like-count");
    if (!btn || !countEl) return;
    const leaveInput = document.getElementById("leave-like-text");
    const leaveDisplay = document.getElementById("leave-like-display");

    const adminWrapper = document.querySelector(".like-admin");
    const resetBtn = document.getElementById("reset-likes-btn");
    // show admin controls if URL contains ?admin=1
    if (adminWrapper && window.location.search.indexOf("admin=1") !== -1) {
      adminWrapper.style.display = "block";
    }

    // expose a global reset function for console/admin usage
    window.resetLikes = async function () {
      try {
        // reset local value
        writeCount(0);
        if (countEl) countEl.textContent = "0";
        // if firebase enabled, reset DB value too
        if (window.FIREBASE_LIKE_ENABLED && window.firebaseConfig) {
          try {
            if (!window.firebase || !firebase.apps || !firebase.apps.length)
              firebase.initializeApp(window.firebaseConfig);
            const db = firebase.database();
            await db.ref("siteLikes").set({ total: 0 });
          } catch (e) {
            console.warn("Failed to reset firebase likes", e);
          }
        }
      } catch (e) {
        console.warn("resetLikes failed", e);
      }
    };
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        window.resetLikes();
      });
    }

    // Immediately reset likes to 0 as requested
    try {
      window.resetLikes && window.resetLikes();
    } catch (e) {
      console.warn(e);
    }

    // messages persistence
    const MSG_KEY = "siteLikeMessages";
    function readMessages() {
      try {
        return JSON.parse(localStorage.getItem(MSG_KEY) || "[]");
      } catch (e) {
        return [];
      }
    }
    function writeMessages(arr) {
      try {
        localStorage.setItem(MSG_KEY, JSON.stringify(arr || []));
      } catch (e) {}
    }
    const submitBtn = document.getElementById("leave-like-submit");
    const messagesList = document.getElementById("like-messages-list");

    function renderMessages() {
      if (!messagesList) return;
      messagesList.innerHTML = "";
      const msgs = readMessages();
      msgs
        .slice()
        .reverse()
        .forEach((m, idx) => {
          const li = document.createElement("li");
          const span = document.createElement("span");
          span.className = "msg-text";
          span.textContent = m;
          li.appendChild(span);
          const del = document.createElement("button");
          del.className = "delete-msg";
          del.setAttribute("aria-label", "Delete message");
          del.innerHTML = "🗑";
          del.addEventListener("click", () => {
            // delete from storage (note: reverse index)
            const all = readMessages();
            const realIndex = all.length - 1 - idx;
            all.splice(realIndex, 1);
            writeMessages(all);
            renderMessages();
          });
          li.appendChild(del);
          messagesList.appendChild(li);
        });
    }
    renderMessages();
    if (submitBtn && leaveInput) {
      submitBtn.addEventListener("click", () => {
        const v = (leaveInput.value || "").trim();
        if (!v) return;
        const msgs = readMessages();
        msgs.push(v);
        writeMessages(msgs);
        renderMessages();
        leaveInput.value = "";
        document.getElementById("leave-like-display").textContent = "";
      });
    }

    // removed live typing preview per request

    // If Firebase is enabled via assets/firebase-config.js, use the realtime DB to store a global count
    const useFirebase = window.FIREBASE_LIKE_ENABLED && window.firebaseConfig;

    if (useFirebase) {
      try {
        // initialize firebase if needed
        if (!window.firebase || !firebase.apps || !firebase.apps.length) {
          firebase.initializeApp(window.firebaseConfig);
        }
        const db = firebase.database();
        const ref = db.ref("siteLikes/total");

        // listen for updates
        ref.on("value", (snap) => {
          const val = snap.val() || 0;
          countEl.textContent = String(val);
        });

        // click handler writes atomically
        btn.addEventListener("click", async function () {
          // transaction to increment safely (every click increments)
          await ref.transaction((curr) => (curr || 0) + 1);
          btn.setAttribute("aria-pressed", "true");
          const heart = document.getElementById("like-heart");
          if (heart) {
            heart.style.transition = "transform 220ms ease";
            heart.style.transform = "scale(1.25)";
            setTimeout(() => (heart.style.transform = ""), 220);
          }
        });
        return;
      } catch (e) {
        console.warn("Firebase likes failed, falling back to local storage", e);
      }
    }

    // fallback: localStorage per-browser
    let count = readCount();
    countEl.textContent = String(count);
    btn.addEventListener("click", function () {
      count = readCount() + 1;
      writeCount(count);
      countEl.textContent = String(count);
      btn.setAttribute("aria-pressed", "true");
      const heart = document.getElementById("like-heart");
      if (heart) {
        heart.style.transition = "transform 220ms ease";
        heart.style.transform = "scale(1.25)";
        setTimeout(() => (heart.style.transform = ""), 220);
      }
    });

    // live mirror removed
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
