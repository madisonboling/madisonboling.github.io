(function () {
  const canvas = document.getElementById("draw-canvas");
  const colorInput = document.getElementById("draw-color");
  const sizeInput = document.getElementById("draw-size");
  const clearBtn = document.getElementById("draw-clear");
  const eraserBtn = document.getElementById("draw-eraser");
  const saveBtn = document.getElementById("draw-save");
  let ctx = null;
  let drawing = false;
  let last = { x: 0, y: 0 };
  let isEraser = false;
  let brush = "round";

  function ensureCtx() {
    if (!canvas) return;
    if (!ctx) ctx = canvas.getContext("2d");
  }

  function resizeCanvas() {
    if (!canvas) return;
    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const tmp = document.createElement("canvas");
    tmp.width = canvas.width;
    tmp.height = canvas.height;
    tmp.getContext("2d").drawImage(canvas, 0, 0);
    canvas.width = Math.round(rect.width * ratio);
    canvas.height = Math.round(rect.height * ratio);
    canvas.style.width = rect.width + "px";
    canvas.style.height = rect.height + "px";
    ensureCtx();
    ctx.scale(ratio, ratio);
    ctx.fillStyle = getComputedStyle(canvas).backgroundColor || "#ffffff";
    ctx.fillRect(0, 0, rect.width, rect.height);
    ctx.drawImage(
      tmp,
      0,
      0,
      tmp.width / ratio,
      tmp.height / ratio,
      0,
      0,
      rect.width,
      rect.height
    );
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }

  function getPos(e) {
    const r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }
  function start(e) {
    drawing = true;
    const p = getPos(e);
    last.x = p.x;
    last.y = p.y;
  }
  function move(e) {
    if (!drawing) return;
    e.preventDefault();
    const p = getPos(e);
    const color = isEraser ? "#000000" : colorInput.value;
    const size = parseFloat(sizeInput.value);
    ctx.globalCompositeOperation = isEraser ? "destination-out" : "source-over";
    // render depending on brush
    if (brush === "round") {
      ctx.beginPath();
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = color;
      ctx.lineWidth = size;
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    } else if (brush === "square") {
      ctx.beginPath();
      ctx.lineCap = "butt";
      ctx.lineJoin = "miter";
      ctx.strokeStyle = color;
      ctx.lineWidth = size;
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    } else if (brush === "marker") {
      // semi-transparent wide stroke for marker effect
      ctx.beginPath();
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = color + "88";
      ctx.lineWidth = size * 1.6;
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      // overlay a thin darker core
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = Math.max(1, size * 0.35);
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    } else if (brush === "chalk") {
      // chalk: scatter small semi-opaque dots along the stroke
      const steps = Math.max(1, Math.floor(size / 3));
      for (let i = 0; i < steps; i++) {
        const t = i / steps;
        const x =
          last.x + (p.x - last.x) * t + (Math.random() - 0.5) * size * 0.6;
        const y =
          last.y + (p.y - last.y) * t + (Math.random() - 0.5) * size * 0.6;
        ctx.fillStyle =
          color +
            Math.floor(180 + Math.random() * 40)
              .toString(16)
              .slice(0, 2) || color; // fallback
        ctx.globalAlpha = 0.8 * (Math.random() * 0.6 + 0.4);
        ctx.beginPath();
        ctx.arc(x, y, Math.max(1, size * 0.18 * Math.random()), 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }
    } else if (brush === "spray") {
      // spray: scatter many tiny points in radius
      const density = Math.min(120, Math.floor(size * 8));
      for (let i = 0; i < density; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = Math.random() * size * 0.6;
        const x = p.x + Math.cos(angle) * r;
        const y = p.y + Math.sin(angle) * r;
        ctx.fillStyle = color;
        ctx.globalAlpha = Math.random() * 0.6 + 0.15;
        ctx.fillRect(x, y, 1, 1);
        ctx.globalAlpha = 1.0;
      }
    }
    last.x = p.x;
    last.y = p.y;
  }
  function stop() {
    drawing = false;
  }

  function init() {
    ensureCtx();
    resizeCanvas();
    window.addEventListener("resize", () => {
      clearTimeout(init._t);
      init._t = setTimeout(resizeCanvas, 120);
    });
    canvas.addEventListener("pointerdown", (e) => {
      canvas.setPointerCapture(e.pointerId);
      start(e);
    });
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", (e) => {
      canvas.releasePointerCapture(e.pointerId);
      stop();
    });
    canvas.addEventListener("pointercancel", stop);
    canvas.addEventListener("pointerleave", stop);

    clearBtn.addEventListener("click", () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = getComputedStyle(canvas).backgroundColor || "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    });
    eraserBtn.addEventListener("click", () => {
      isEraser = !isEraser;
      eraserBtn.classList.toggle("active", isEraser);
      eraserBtn.textContent = isEraser ? "Eraser (On)" : "Eraser";
    });
    saveBtn.addEventListener("click", () => {
      const rect = canvas.getBoundingClientRect();
      const exportC = document.createElement("canvas");
      exportC.width = rect.width;
      exportC.height = rect.height;
      const ex = exportC.getContext("2d");
      ex.drawImage(canvas, 0, 0, exportC.width, exportC.height);
      const url = exportC.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = "drawing.png";
      a.click();
    });

    // brush buttons
    const brushBtns = document.querySelectorAll(".brush-btn");
    brushBtns.forEach((b) => {
      b.addEventListener("click", () => {
        brushBtns.forEach((x) => x.setAttribute("aria-pressed", "false"));
        b.setAttribute("aria-pressed", "true");
        brush = b.dataset.brush || "round";
      });
    });

    // brush previews: draw small sample strokes on each preview canvas
    const previews = document.querySelectorAll(".brush-preview");

    function getPreviewBg() {
      // choose a solid fallback that matches the CSS gradient used for previews
      return document.documentElement.classList.contains("dark-theme")
        ? "#2b2118"
        : "#fffdf7";
    }

    function renderPreview(pc) {
      const type = pc.dataset.brush || "round";
      const pctx = pc.getContext("2d");
      // clear and set solid background matching theme
      pctx.clearRect(0, 0, pc.width, pc.height);
      pctx.fillStyle = getPreviewBg();
      pctx.fillRect(0, 0, pc.width, pc.height);
      // draw sample stroke using current color
      const midY = pc.height / 2;
      const col = colorInput ? colorInput.value || "#7c5c36" : "#7c5c36";
      pctx.strokeStyle = col;
      pctx.fillStyle = col;
      pctx.lineJoin = "round";
      if (type === "round") {
        pctx.lineWidth = 8;
        pctx.lineCap = "round";
        pctx.beginPath();
        pctx.moveTo(8, midY);
        pctx.lineTo(pc.width - 8, midY);
        pctx.stroke();
      } else if (type === "square") {
        pctx.lineWidth = 10;
        pctx.lineCap = "butt";
        pctx.beginPath();
        pctx.moveTo(8, midY);
        pctx.lineTo(pc.width - 8, midY);
        pctx.stroke();
      } else if (type === "marker") {
        pctx.globalAlpha = 0.7;
        pctx.lineWidth = 12;
        pctx.lineCap = "round";
        pctx.beginPath();
        pctx.moveTo(8, midY);
        pctx.lineTo(pc.width - 8, midY);
        pctx.stroke();
        pctx.globalAlpha = 1;
        pctx.lineWidth = 3;
        pctx.beginPath();
        pctx.moveTo(12, midY);
        pctx.lineTo(pc.width - 12, midY);
        pctx.stroke();
      } else if (type === "chalk") {
        for (let i = 0; i < 120; i++) {
          const x = 8 + (pc.width - 16) * Math.random();
          const y = midY + (Math.random() - 0.5) * 8;
          pctx.globalAlpha = Math.random() * 0.8;
          pctx.beginPath();
          pctx.arc(x, y, Math.random() * 2 + 0.5, 0, Math.PI * 2);
          pctx.fill();
        }
        pctx.globalAlpha = 1;
      } else if (type === "spray") {
        for (let i = 0; i < 220; i++) {
          const angle = Math.random() * Math.PI * 2;
          const r = Math.random() * 10;
          const x = pc.width / 2 + Math.cos(angle) * r;
          const y = midY + Math.sin(angle) * r;
          pctx.fillRect(x, y, 1, 1);
        }
      }
      // clickable to select brush
      pc.style.cursor = "pointer";
      if (!pc._previewBound) {
        pc.addEventListener("click", () => {
          const btn = document.querySelector(
            `.brush-btn[data-brush="${type}"]`
          );
          if (btn) btn.click();
        });
        pc._previewBound = true;
      }
    }

    function renderPreviews() {
      previews.forEach(renderPreview);
    }

    // initial render
    renderPreviews();

    // re-render previews when theme changes (watch class on <html>)
    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.attributeName === "class") {
          renderPreviews();
          break;
        }
      }
    });
    mo.observe(document.documentElement, { attributes: true });

    // also update previews when color or size changes
    if (colorInput) colorInput.addEventListener("input", renderPreviews);
    if (sizeInput) sizeInput.addEventListener("input", renderPreviews);

    // fill background
    ctx.fillStyle = getComputedStyle(canvas).backgroundColor || "#fff";
    const rect = canvas.getBoundingClientRect();
    ctx.fillRect(0, 0, rect.width, rect.height);
  }

  // wait for DOM
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", init);
  else init();
})();
