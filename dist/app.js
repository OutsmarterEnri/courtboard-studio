"use strict";
const $ = (id) => document.getElementById(id),
  cv = $("court"),
  ctx = cv.getContext("2d");
const clone = (x) => JSON.parse(JSON.stringify(x));
function roster() {
  let a = [];
  for (let i = 0; i < 5; i++) {
    let x = [620, 420, 420, 240, 240][i],
      y = [425, 180, 670, 310, 540][i];
    a.push({ id: "a" + i, type: "attack", n: i + 1, x, y });
    a.push({ id: "d" + i, type: "defend", n: i + 1, x: x - 60, y: y + 25 });
  }
  a.push({ id: "ball", type: "ball", x: 654, y: 443 });
  return a;
}
let frames = [{ duration: 2, items: roster(), lines: [] }],
  index = 0,
  tool = "move",
  selected = "a0",
  drag = null,
  draft = null,
  playing = false,
  exporting = false,
  time = 0,
  start = 0,
  raf = 0;
const visible = (o) =>
  ($("teams").value === "both" || o.type !== "defend") &&
  ($("view").value === "full" || o.x <= 750);
const maxX = () => ($("view").value === "half" ? 735 : 1435);
const baseWidth = () => ($("view").value === "half" ? 800 : 1500);
const rotation = () => CourtGeometry.normalize($("rotation").value);
function applyPresets() {
  pause();
  drag = null;
  draft = null;
  const size = CourtGeometry.dimensions(baseWidth(), 850, rotation());
  cv.width = size.width;
  cv.height = size.height;
  cv.style.aspectRatio = size.width + " / " + size.height;
  fitBoard();
  $("courtbadge").textContent =
    ($("view").value === "half"
      ? "METÀ CAMPO OFFENSIVA · 14 × 15 M"
      : "CAMPO FIBA · 28 × 15 M") +
    " · " +
    rotation() +
    "°";
  ui();
}
$("teams").onchange = applyPresets;
$("view").onchange = applyPresets;
$("rotation").onchange = applyPresets;
$("rotate").onclick = () => {
  if (exporting) return;
  $("rotation").value = String((rotation() + 90) % 360);
  applyPresets();
};
function uprightText(c, text, x, y) {
  c.save();
  c.translate(x, y);
  c.rotate((-rotation() * Math.PI) / 180);
  c.fillText(text, 0, 0);
  c.restore();
}
const current = () => frames[index],
  total = () => frames.reduce((a, f) => a + f.duration, 0);
function say(t) {
  $("status").textContent = t;
}
function line(c, x1, y1, x2, y2) {
  c.beginPath();
  c.moveTo(x1, y1);
  c.lineTo(x2, y2);
  c.stroke();
}
function circle(c, x, y, r, fill) {
  c.beginPath();
  c.arc(x, y, r, 0, Math.PI * 2);
  if (fill) c.fill();
  else c.stroke();
}
function court(c) {
  c.fillStyle = "#253f40";
  c.fillRect(0, 0, 1500, 850);
  // Expanded runoff around the court: it gives inbound plays a visible
  // staging area while keeping the saved player coordinates unchanged.
  c.save();
  c.strokeStyle = "#78918d";
  c.lineWidth = 2;
  c.setLineDash([9, 8]);
  c.strokeRect(24, 24, 1452, 802);
  c.setLineDash([]);
  c.strokeStyle = "#d6b27d";
  c.lineWidth = 2.5;
  for (const y of [50, 800]) {
    c.beginPath();
    c.moveTo(24, y);
    c.lineTo(50, y);
    c.moveTo(1450, y);
    c.lineTo(1476, y);
    c.stroke();
  }
  for (const x of [50, 1450]) {
    c.beginPath();
    c.moveTo(x, 24);
    c.lineTo(x, 50);
    c.moveTo(x, 800);
    c.lineTo(x, 826);
    c.stroke();
  }
  c.fillStyle = "#d6b27d";
  c.font = "12px Arial";
  c.textAlign = "center";
  c.fillText("RIMESSA", 37, 45);
  c.fillText("RIMESSA", 1463, 45);
  c.restore();
  c.save();
  c.translate(50, 50);
  c.scale(50, 50);
  c.lineWidth = 0.045;
  c.strokeStyle = "#b6ccbd";
  c.fillStyle = "#2b4a49";
  c.fillRect(0, 0, 28, 15);
  c.strokeRect(0, 0, 28, 15);
  line(c, 14, 0, 14, 15);
  circle(c, 14, 7.5, 1.8);
  for (let side = 0; side < 2; side++) {
    c.save();
    if (side) {
      c.translate(28, 15);
      c.rotate(Math.PI);
    }
    c.fillStyle = "#355553";
    c.fillRect(0, 5.05, 5.8, 4.9);
    c.strokeRect(0, 5.05, 5.8, 4.9);
    c.beginPath();
    c.arc(5.8, 7.5, 1.8, -Math.PI / 2, Math.PI / 2);
    c.stroke();
    c.save();
    c.setLineDash([0.12, 0.12]);
    c.beginPath();
    c.arc(5.8, 7.5, 1.8, Math.PI / 2, Math.PI * 1.5);
    c.stroke();
    c.restore();
    let a = Math.asin(6.6 / 6.75),
      ix = 1.575 + Math.sqrt(6.75 ** 2 - 6.6 ** 2);
    line(c, 0, 0.9, ix, 0.9);
    line(c, 0, 14.1, ix, 14.1);
    c.beginPath();
    c.arc(1.575, 7.5, 6.75, -a, a);
    c.stroke();
    c.beginPath();
    c.arc(1.575, 7.5, 1.25, -Math.PI / 2, Math.PI / 2);
    c.stroke();
    line(c, 1.2, 6.6, 1.2, 8.4);
    c.strokeStyle = "#ffcf91";
    circle(c, 1.575, 7.5, 0.225);
    c.restore();
  }
  c.restore();
}
function annotation(c, l) {
  if (l.type === "pen") {
    c.save();
    c.strokeStyle = l.color || "#f8e7b8";
    c.lineCap = "round";
    c.lineJoin = "round";
    for (let i = 1; i < l.points.length; i++) {
      const a = l.points[i - 1],
        b = l.points[i];
      c.lineWidth = (l.width || 5) * (b.pressure ?? 1);
      line(c, a.x, a.y, b.x, b.y);
    }
    c.restore();
    return;
  }
  let p = l.points;
  if (p.length < 2) return;
  c.save();
  c.strokeStyle = l.color || "#f8e7b8";
  c.fillStyle = l.color || "#f8e7b8";
  c.lineWidth = l.width || 3.5;
  c.lineJoin = "round";
  c.lineCap = "round";
  if (l.type === "pass") c.setLineDash([11, 10]);
  c.beginPath();
  c.moveTo(p[0].x, p[0].y);
  for (let i = 1; i < p.length; i++) c.lineTo(p[i].x, p[i].y);
  c.stroke();
  c.setLineDash([]);
  let b = p.at(-1),
    a = p.at(-2),
    ang = Math.atan2(b.y - a.y, b.x - a.x);
  c.translate(b.x, b.y);
  c.rotate(ang);
  if (l.type === "screen") line(c, 0, -13, 0, 13);
  else {
    line(c, 0, 0, -14, -8);
    line(c, 0, 0, -14, 8);
  }
  c.restore();
  if (l.type === "shot") {
    let a = p[0],
      b = p.at(-1),
      ang = Math.atan2(b.y - a.y, b.x - a.x),
      ox = -Math.sin(ang) * 7,
      oy = Math.cos(ang) * 7;
    annotation(c, {
      type: "run",
      color: l.color,
      width: l.width,
      points: [
        { x: a.x + ox, y: a.y + oy },
        { x: b.x + ox, y: b.y + oy },
      ],
    });
  }
}
function draw(
  items = current().items,
  lines = current().lines,
  c = ctx,
  highlight = true,
) {
  c.clearRect(0, 0, c.canvas.width, c.canvas.height);
  c.save();
  CourtGeometry.applyTransform(c, baseWidth(), 850, rotation());
  c.beginPath();
  c.rect(0, 0, baseWidth(), 850);
  c.clip();
  court(c);
  if ($("trails").checked) lines.forEach((l) => annotation(c, l));
  if (draft) annotation(c, draft);
  for (const o of items.filter(visible)) {
    c.save();
    c.translate(o.x, o.y);
    if (highlight && o.id === selected && !playing) {
      c.strokeStyle = "#fff";
      c.lineWidth = 2;
      c.setLineDash([4, 5]);
      circle(c, 0, 0, 29);
      c.setLineDash([]);
    }
    c.lineWidth = 3;
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.font = "bold 22px Arial";
    if (o.type === "attack") {
      c.fillStyle = "#ffb96f";
      circle(c, 0, 0, 22, true);
      c.fillStyle = "#362718";
      uprightText(c, o.n, 0, 1);
    } else if (o.type === "defend") {
      c.fillStyle = "#a5d6fa";
      uprightText(c, "X" + o.n, 0, 1);
    } else if (o.type === "ball") {
      c.fillStyle = "#ec833c";
      circle(c, 0, 0, 13, true);
      c.strokeStyle = "#542c18";
      c.lineWidth = 1.5;
      circle(c, 0, 0, 13);
      line(c, -13, 0, 13, 0);
      line(c, 0, -13, 0, 13);
      c.beginPath();
      c.ellipse(0, 0, 6, 13, 0, 0, 7);
      c.stroke();
    } else if (o.type === "cone") {
      c.fillStyle = "#ffdc67";
      c.beginPath();
      c.ellipse(0, 5, 17, 9, 0, 0, 7);
      c.fill();
      c.strokeStyle = "#705820";
      c.stroke();
      c.fillStyle = "#fff1aa";
      circle(c, 0, 0, 5, true);
    } else {
      c.strokeStyle = "#eef0f1";
      c.lineWidth = 7;
      line(c, -22, 0, 22, 0);
      line(c, -22, -10, -22, 10);
      line(c, 22, -10, 22, 10);
    }
    c.restore();
  }
  if ($("view").value === "half") {
    c.fillStyle = "#253f40";
    c.fillRect(752, 0, 48, 850);
  }
  c.restore();
  let title = $("title").value.trim() || "Nuovo schema";
  c.save();
  let fs = 26;
  c.font = "bold " + fs + "px Arial";
  while (c.measureText(title).width > c.canvas.width - 170 && fs > 12) {
    c.font = "bold " + --fs + "px Arial";
  }
  c.fillStyle = "#152c2de8";
  c.fillRect(72, 67, Math.min(890, c.measureText(title).width + 30), 48);
  c.fillStyle = "#f6f2e6";
  c.textAlign = "left";
  c.textBaseline = "middle";
  c.fillText(title, 87, 91);
  c.restore();
  c.save();
  c.fillStyle = "#d4e0d7";
  c.font = "13px Arial";
  c.textAlign = "center";
  c.fillText("COURTBOARD", c.canvas.width / 2, c.canvas.height - 19);
  c.restore();
  if (c === ctx && !playing && !exporting) scheduleSave();
}
function ui() {
  $("frameCount").textContent =
    String(frames.length).padStart(2, "0") + " frame";
  $("previousFrame").disabled = index === 0;
  $("nextFrame").disabled = index === frames.length - 1;
  $("undoLine").disabled = !undoStack.length;
  $("redo").disabled = !redoStack.length;
  $("frames").replaceChildren(
    ...frames.map((f, i) => {
      let b = document.createElement("button");
      b.className = "frame" + (i === index ? " active" : "");
      b.innerHTML =
        "<strong>" +
        String(i + 1).padStart(2, "0") +
        " · " +
        (i ? "Frame " + (i + 1) : "Inizio") +
        "</strong><small>" +
        f.duration.toFixed(1) +
        " secondi</small>";
      b.onclick = () => {
        if (exporting) return;
        pause();
        index = i;
        time = frames.slice(0, i).reduce((a, f) => a + f.duration, 0);
        ui();
      };
      return b;
    }),
  );
  $("duration").value = current().duration;
  $("selected").replaceChildren(
    ...current()
      .items.filter(visible)
      .map((o) => {
        let e = document.createElement("option");
        e.value = o.id;
        e.textContent = label(o);
        return e;
      }),
  );
  if (!current().items.some((o) => o.id === selected && visible(o)))
    selected = current().items.find(visible)?.id || "";
  $("selected").value = selected;
  $("deleteFrame").disabled = frames.length === 1 || exporting;
  $("scrub").max = total();
  updateClock();
  draw();
}
function label(o) {
  return (
    {
      attack: "Attaccante ",
      defend: "Difensore X",
      ball: "Palla",
      cone: "Cinesino",
      barrier: "Ostacolo",
    }[o.type] + (o.n || "")
  );
}
function updateClock() {
  $("scrub").value = time;
  $("clock").textContent = time.toFixed(1) + " / " + total().toFixed(1) + " s";
}
function at(t) {
  let elapsed = 0;
  for (let i = 0; i < frames.length; i++) {
    let f = frames[i];
    if (t <= elapsed + f.duration || i === frames.length - 1) {
      let prev = frames[Math.max(0, i - 1)],
        r = Math.max(0, Math.min(1, (t - elapsed) / f.duration));
      return {
        items: f.items.map((o) => {
          let p = prev.items.find((x) => x.id === o.id) || o;
          return { ...o, x: p.x + (o.x - p.x) * r, y: p.y + (o.y - p.y) * r };
        }),
        lines: f.lines,
      };
    }
    elapsed += f.duration;
  }
}
function pause() {
  playing = false;
  cancelAnimationFrame(raf);
  $("play").textContent = "▶ Riproduci";
}
function tick(now) {
  if (!playing) return;
  time = Math.min(total(), (now - start) / 1000);
  let state = at(time);
  draw(state.items, state.lines, ctx, false);
  updateClock();
  if (time >= total()) {
    pause();
    return;
  }
  raf = requestAnimationFrame(tick);
}
$("play").onclick = () => {
  if (exporting) return;
  if (playing) {
    pause();
    return;
  }
  if (time >= total()) time = 0;
  playing = true;
  start = performance.now() - time * 1000;
  $("play").textContent = "Ⅱ Pausa";
  raf = requestAnimationFrame(tick);
};
$("stop").onclick = () => {
  if (exporting) return;
  pause();
  time = 0;
  index = 0;
  ui();
};
$("scrub").oninput = () => {
  if (exporting) return;
  pause();
  time = +$("scrub").value;
  let s = at(time);
  draw(s.items, s.lines, ctx, false);
  updateClock();
};
$("addFrame").onclick = () => {
  if (exporting) return;
  pause();
  frames.splice(index + 1, 0, clone(current()));
  index++;
  current().lines = [];
  ui();
  say("Nuova fase: sposta gli elementi nelle posizioni di arrivo.");
};
$("deleteFrame").onclick = () => {
  if (exporting || frames.length < 2) return;
  pause();
  frames.splice(index, 1);
  index = Math.max(0, index - 1);
  time = 0;
  ui();
};
$("duration").onchange = () => {
  current().duration = Math.min(30, Math.max(0.5, +$("duration").value || 2));
  time = 0;
  ui();
};
$("title").oninput = () => draw();
$("trails").onchange = () => draw();
$("selected").onchange = () => {
  selected = $("selected").value;
  draw();
};
$("tools").onclick = (e) => {
  let b = e.target.closest("[data-tool]");
  if (!b || exporting) return;
  pause();
  tool = b.dataset.tool;
  document
    .querySelectorAll("[data-tool]")
    .forEach((x) => x.setAttribute("aria-pressed", x === b));
  $("toolhint").textContent =
    tool === "move"
      ? "Trascina un elemento. Oppure selezionalo e usa le frecce della tastiera."
      : "Trascina sul campo per disegnare. Il segno viene salvato nella fase corrente.";
};
function point(e) {
  const r = cv.getBoundingClientRect();
  const p = CourtGeometry.toCourt(
    {
      x: ((e.clientX - r.left) * cv.width) / r.width,
      y: ((e.clientY - r.top) * cv.height) / r.height,
    },
    baseWidth(),
    850,
    rotation(),
  );
  return {
    x: Math.max(65, Math.min(maxX(), p.x)),
    y: Math.max(65, Math.min(785, p.y)),
  };
}
cv.onpointerdown = (e) => {
  if (
    playing ||
    exporting ||
    activePointer !== null ||
    (e.pointerType === "mouse" && e.button !== 0)
  )
    return;
  if (tool !== "move" && $("pencilOnly").checked && e.pointerType !== "pen")
    return;
  if (!["move", "erase"].includes(tool) && current().lines.length >= 500) {
    say(
      "Limite di segni raggiunto per questo frame. Usa un nuovo frame o la gomma.",
    );
    return;
  }
  activePointer = e.pointerId;
  gestureBefore = snapshot();
  checkpoint();
  cv.focus();
  cv.setPointerCapture(e.pointerId);
  let p = point(e);
  if (tool === "move") {
    let o = current()
      .items.filter(visible)
      .sort(
        (a, b) =>
          Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y),
      )
      .find((o) => Math.hypot(o.x - p.x, o.y - p.y) < 35);
    if (o) {
      selected = o.id;
      drag = { o, dx: o.x - p.x, dy: o.y - p.y };
      $("selected").value = selected;
    }
  } else if (tool === "erase") {
    eraseAt(p);
  } else {
    draft = {
      type: tool,
      color: $("ink").value,
      width: +$("strokeWidth").value,
      points: [
        {
          ...p,
          pressure:
            e.pointerType === "pen" ? Math.max(0.2, e.pressure) * 1.8 : 1,
        },
        p,
      ],
    };
  }
  draw();
};
cv.onpointermove = (e) => {
  if (exporting || e.pointerId !== activePointer) return;
  if (tool === "erase") {
    eraseAt(point(e));
    draw();
    return;
  }
  let p = point(e);
  if (drag) {
    drag.o.x = Math.max(65, Math.min(maxX(), p.x + drag.dx));
    drag.o.y = Math.max(65, Math.min(785, p.y + drag.dy));
  }
  if (draft) {
    let a = draft.points[0];
    if (tool === "pen") {
      for (const sample of e.getCoalescedEvents?.().length
        ? e.getCoalescedEvents()
        : [e]) {
        if (draft.points.length < 2000)
          draft.points.push({
            ...point(sample),
            pressure:
              sample.pointerType === "pen"
                ? Math.max(0.2, sample.pressure) * 1.8
                : 1,
          });
      }
    } else if (tool === "dribble") {
      let dx = p.x - a.x,
        dy = p.y - a.y,
        len = Math.hypot(dx, dy),
        ang = Math.atan2(dy, dx);
      let n = Math.max(2, Math.ceil(len / 4));
      draft.points = Array.from({ length: n }, (_, i) => {
        let t = i / (n - 1),
          v = Math.sin((t * len) / 8) * 5;
        return {
          x: a.x + dx * t - Math.sin(ang) * v,
          y: a.y + dy * t + Math.cos(ang) * v,
        };
      });
    } else draft.points = [a, p];
  }
  if (drag || draft) draw();
};
function finish(e) {
  if (e && e.pointerId !== activePointer) return;
  if (
    draft &&
    (draft.type === "pen" ||
      Math.hypot(
        draft.points.at(-1).x - draft.points[0].x,
        draft.points.at(-1).y - draft.points[0].y,
      ) > 8)
  )
    current().lines.push(draft);
  drag = null;
  draft = null;
  activePointer = null;
  gestureBefore = null;
  draw();
  updateHistory();
}
cv.onpointerup = finish;
cv.onpointercancel = (e) => {
  if (e.pointerId !== activePointer) return;
  if (gestureBefore) {
    restoreSnapshot(gestureBefore);
    undoStack.pop();
  }
  drag = null;
  draft = null;
  activePointer = null;
  gestureBefore = null;
  ui();
};
cv.onkeydown = (e) => {
  if (playing || exporting) return;
  let o = current().items.find((o) => o.id === selected),
    dirs = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
    };
  if (o && dirs[e.key]) {
    e.preventDefault();
    checkpoint();
    let raw = dirs[e.key],
      v = CourtGeometry.vectorToCourt({ x: raw[0], y: raw[1] }, rotation()),
      d = [v.x, v.y],
      s = e.shiftKey ? 20 : 5;
    o.x = Math.max(65, Math.min(maxX(), o.x + d[0] * s));
    o.y = Math.max(65, Math.min(785, o.y + d[1] * s));
    draw();
  }
  if (e.key === "Delete") $("remove").click();
};
for (const type of ["cone", "barrier"])
  $(type).onclick = () => {
    if (exporting) return;
    pause();
    let o = {
      id:
        crypto.randomUUID?.() ||
        "item-" + Date.now() + "-" + Math.random().toString(36).slice(2),
      type,
      x: baseWidth() / 2,
      y: 425,
    };
    current().items.push(o);
    selected = o.id;
    ui();
  };
$("remove").onclick = () => {
  if (exporting) return;
  pause();
  current().items = current().items.filter((o) => o.id !== selected);
  ui();
};
$("restore").onclick = () => {
  if (exporting) return;
  pause();
  let existing = new Set(current().items.map((o) => o.id));
  current().items.push(...roster().filter((o) => !existing.has(o.id)));
  ui();
  say("Giocatori e palla mancanti ripristinati.");
};
$("undoLine").onclick = () => undo();
$("redo").onclick = () => redo();
function download(blob, name) {
  let url = URL.createObjectURL(blob),
    a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}
function filename() {
  return (
    ($("title").value || "schema")
      .replace(/[^\p{L}\p{N} _-]/gu, "")
      .slice(0, 60) || "schema"
  );
}
$("save").onclick = () =>
  download(
    new Blob([JSON.stringify(project(), null, 2)], {
      type: "application/json",
    }),
    filename() + ".json",
  );
$("load").onclick = () => {
  if (!exporting) $("file").click();
};
function valid(data) {
  if (
    !data ||
    data.version !== 1 ||
    typeof data.title !== "string" ||
    !Array.isArray(data.frames) ||
    !data.frames.length ||
    data.frames.length > 300
  )
    return false;
  return data.frames.every(
    (f) =>
      Number.isFinite(f.duration) &&
      f.duration >= 0.5 &&
      f.duration <= 30 &&
      Array.isArray(f.items) &&
      f.items.length <= 200 &&
      new Set(f.items.map((o) => o.id)).size === f.items.length &&
      f.items.filter((o) => o.type === "attack").length <= 5 &&
      f.items.filter((o) => o.type === "defend").length <= 5 &&
      f.items.filter((o) => o.type === "ball").length <= 1 &&
      f.items.every(
        (o) =>
          typeof o.id === "string" &&
          ["attack", "defend", "ball", "cone", "barrier"].includes(o.type) &&
          Number.isFinite(o.x) &&
          o.x >= 65 &&
          o.x <= 1435 &&
          Number.isFinite(o.y) &&
          o.y >= 65 &&
          o.y <= 785 &&
          (!["attack", "defend"].includes(o.type) ||
            (Number.isInteger(o.n) && o.n >= 1 && o.n <= 5)),
      ) &&
      Array.isArray(f.lines) &&
      f.lines.length <= 500 &&
      f.lines.every(
        (l) =>
          ["run", "pass", "dribble", "screen", "shot", "pen"].includes(
            l.type,
          ) &&
          (l.color === undefined || /^#[0-9a-f]{6}$/i.test(l.color)) &&
          (l.width === undefined ||
            (Number.isFinite(l.width) && l.width >= 1 && l.width <= 20)) &&
          Array.isArray(l.points) &&
          l.points.length >= 2 &&
          l.points.length <= 2000 &&
          l.points.every(
            (p) =>
              (p.pressure === undefined ||
                (Number.isFinite(p.pressure) &&
                  p.pressure >= 0 &&
                  p.pressure <= 2)) &&
              Number.isFinite(p.x) &&
              Number.isFinite(p.y) &&
              p.x >= 0 &&
              p.x <= 1500 &&
              p.y >= 0 &&
              p.y <= 850,
          ),
      ),
  );
}
$("file").onchange = async () => {
  try {
    let f = $("file").files[0];
    if (!f) return;
    if (f.size > 5000000) throw Error();
    let data = JSON.parse(await f.text());
    if (!valid(data)) throw Error();
    checkpoint();
    loadProject(data);
    applyPresets();
    say("Schema caricato.");
  } catch {
    say("File non valido. Apri uno schema JSON salvato da Courtboard.");
  } finally {
    $("file").value = "";
  }
};
$("export").onclick = async () => {
  if (exporting) return;
  if (!window.MediaRecorder || !cv.captureStream) {
    say(
      "Questo browser non supporta la registrazione video. Aggiorna Safari o usa un browser compatibile.",
    );
    return;
  }
  pause();
  exporting = true;
  cancelRecording = false;
  $("cancelExport").hidden = false;
  let controls = [...document.querySelectorAll("button,input,select")],
    disabled = controls.map((x) => x.disabled);
  controls
    .filter((x) => x.id !== "cancelExport")
    .forEach((x) => (x.disabled = true));
  let stream, rec;
  try {
    const mime = [
      "video/mp4;codecs=avc1.42E01E",
      "video/mp4",
      "video/webm;codecs=vp9",
      "video/webm;codecs=vp8",
      "video/webm",
    ].find((x) => MediaRecorder.isTypeSupported(x));
    if (!mime) throw Error("Nessun formato video disponibile.");
    const output = document.createElement("canvas");
    output.width = cv.width;
    output.height = cv.height;
    let c = output.getContext("2d"),
      s = at(0);
    draw(s.items, s.lines, c, false);
    stream = output.captureStream(30);
    rec = new MediaRecorder(stream, {
      mimeType: mime,
      videoBitsPerSecond: 6000000,
    });
    let chunks = [];
    let result = new Promise((resolve, reject) => {
      rec.ondataavailable = (e) => {
        if (e.data.size) chunks.push(e.data);
      };
      rec.onstop = () => resolve(new Blob(chunks, { type: rec.mimeType }));
      rec.onerror = () => reject(Error("Registrazione non riuscita."));
    });
    rec.start(250);
    let begin = performance.now();
    await new Promise((resolve) => {
      function step() {
        if (cancelRecording) {
          resolve();
          return;
        }
        let elapsed = Math.min(total(), (performance.now() - begin) / 1000),
          state = at(elapsed);
        draw(state.items, state.lines, c, false);
        draw(state.items, state.lines, ctx, false);
        time = elapsed;
        updateClock();
        say(
          "Esportazione video… " +
            Math.round((elapsed / total()) * 100) +
            "%. Mantieni questa scheda aperta e visibile.",
        );
        if (elapsed < total()) setTimeout(step, 1000 / 30);
        else setTimeout(resolve, 150);
      }
      step();
    });
    rec.stop();
    let blob = await result;
    if (cancelRecording) {
      say("Esportazione annullata.");
    } else {
      exportedVideo = {
        blob,
        name: filename() + (rec.mimeType.includes("mp4") ? ".mp4" : ".webm"),
      };
      if (videoURL) URL.revokeObjectURL(videoURL);
      videoURL = URL.createObjectURL(blob);
      $("videoPreview").src = videoURL;
      const file = new File([blob], exportedVideo.name, { type: blob.type });
      $("shareVideo").hidden = !navigator.canShare?.({ files: [file] });
      $("videoHelp").textContent =
        "Il video è pronto sul dispositivo. Salvalo o condividilo prima di chiudere l’app.";
      $("videoDialog").showModal();
      say("Video pronto da salvare.");
    }
  } catch (e) {
    say("Esportazione non riuscita: " + e.message);
  } finally {
    if (rec && rec.state !== "inactive") rec.stop();
    stream?.getTracks().forEach((t) => t.stop());
    exporting = false;
    $("cancelExport").hidden = true;
    controls.forEach((x, i) => (x.disabled = disabled[i]));
    time = 0;
    ui();
  }
};

// The editor always stores positions in court coordinates, regardless of view.
let activePointer = null,
  gestureBefore = null;
let undoStack = [],
  redoStack = [];
let hydrated = false,
  saveTimer,
  lastSerialized = "",
  writeQueue = Promise.resolve();
let exportedVideo = null,
  videoURL = null,
  cancelRecording = false;
function project() {
  return {
    version: 1,
    title: $("title").value,
    presets: {
      teams: $("teams").value,
      view: $("view").value,
      rotation: rotation(),
    },
    preferences: {
      trails: $("trails").checked,
      pencilOnly: $("pencilOnly").checked,
      ink: $("ink").value,
      width: +$("strokeWidth").value,
    },
    frames,
  };
}
function loadProject(data) {
  pause();
  frames = clone(data.frames);
  index = 0;
  time = 0;
  $("title").value = data.title.slice(0, 70);
  $("teams").value = data.presets?.teams === "attack" ? "attack" : "both";
  $("view").value = data.presets?.view === "half" ? "half" : "full";
  $("rotation").value = String(CourtGeometry.normalize(data.presets?.rotation));
  $("trails").checked = data.preferences?.trails !== false;
  $("pencilOnly").checked = data.preferences?.pencilOnly === true;
  $("ink").value = /^#[0-9a-f]{6}$/i.test(data.preferences?.ink)
    ? data.preferences.ink
    : "#f8e7b8";
  $("strokeWidth").value = [3, 5, 9].includes(data.preferences?.width)
    ? String(data.preferences.width)
    : "5";
}
function scheduleSave() {
  if (!hydrated) return;
  clearTimeout(saveTimer);
  $("saveStatus").textContent = "Salvataggio locale…";
  saveTimer = setTimeout(flushSave, 180);
}
function flushSave() {
  if (!hydrated) return;
  clearTimeout(saveTimer);
  const data = project(),
    serialized = JSON.stringify(data);
  if (serialized === lastSerialized) {
    $("saveStatus").textContent = "Salvato sul dispositivo";
    return;
  }
  writeQueue = writeQueue
    .catch(() => {})
    .then(async () => {
      await LocalProject.save(JSON.parse(serialized));
      lastSerialized = serialized;
      $("saveStatus").textContent = "Salvato sul dispositivo";
    })
    .catch(() => {
      $("saveStatus").textContent = "Backup JSON necessario";
      say(
        "Salvataggio locale non disponibile o spazio esaurito: esporta lo schema JSON.",
      );
    });
}
document.addEventListener("visibilitychange", () => {
  if (document.hidden) flushSave();
});
function snapshot() {
  return { frames: clone(frames), index };
}
function restoreSnapshot(s) {
  frames = clone(s.frames);
  index = Math.min(s.index, frames.length - 1);
  time = 0;
}
function updateHistory() {
  $("undoLine").disabled = undoStack.length === 0;
  $("redo").disabled = redoStack.length === 0;
}
function checkpoint() {
  if (exporting) return;
  undoStack.push(snapshot());
  if (undoStack.length > 40) undoStack.shift();
  redoStack = [];
  updateHistory();
}
function undo() {
  if (exporting || !undoStack.length) return;
  pause();
  redoStack.push(snapshot());
  restoreSnapshot(undoStack.pop());
  ui();
}
function redo() {
  if (exporting || !redoStack.length) return;
  pause();
  undoStack.push(snapshot());
  restoreSnapshot(redoStack.pop());
  ui();
}
for (const id of [
  "addFrame",
  "deleteFrame",
  "cone",
  "barrier",
  "remove",
  "restore",
]) {
  const original = $(id).onclick;
  $(id).onclick = (e) => {
    if (exporting) return;
    if (id === "addFrame" && frames.length >= 300) {
      say("Limite di 300 frame raggiunto.");
      return;
    }
    if (["cone", "barrier"].includes(id) && current().items.length >= 200) {
      say("Limite di elementi raggiunto.");
      return;
    }
    checkpoint();
    original(e);
  };
}
const changeDuration = $("duration").onchange;
$("duration").onchange = (e) => {
  checkpoint();
  changeDuration(e);
};
for (const id of ["previousFrame", "nextFrame"])
  $(id).onclick = () => {
    if (exporting) return;
    pause();
    index = Math.max(
      0,
      Math.min(frames.length - 1, index + (id === "previousFrame" ? -1 : 1)),
    );
    ui();
  };
function distanceToSegment(p, a, b) {
  const dx = b.x - a.x,
    dy = b.y - a.y;
  const t = Math.max(
    0,
    Math.min(
      1,
      ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy || 1),
    ),
  );
  return Math.hypot(p.x - a.x - t * dx, p.y - a.y - t * dy);
}
function eraseAt(p) {
  const threshold = (12 * cv.width) / cv.getBoundingClientRect().width;
  for (let i = current().lines.length - 1; i >= 0; i--) {
    const points = current().lines[i].points;
    if (
      points
        .slice(1)
        .some((b, j) => distanceToSegment(p, points[j], b) < threshold)
    ) {
      current().lines.splice(i, 1);
      return;
    }
  }
}
function fitBoard() {
  const stage = $("boardStage");
  if (!stage) return;
  const size = stage.getBoundingClientRect(),
    scale = Math.min(size.width / cv.width, size.height / cv.height);
  $("boardSurface").style.width = Math.floor(cv.width * scale) + "px";
  $("boardSurface").style.height = Math.floor(cv.height * scale) + "px";
}
new ResizeObserver(fitBoard).observe($("boardStage"));
$("openSettings").onclick = () => {
  pause();
  $("settings").showModal();
};
$("closeSettings").onclick = () => $("settings").close();
$("settings").addEventListener("click", (e) => {
  const r = $("settings").getBoundingClientRect();
  if (e.target === $("settings") && (e.clientX < r.left || e.clientX > r.right))
    $("settings").close();
});
$("closeVideo").onclick = () => {
  $("videoPreview").pause();
  $("videoDialog").close();
};
$("downloadVideo").onclick = () => {
  if (exportedVideo) download(exportedVideo.blob, exportedVideo.name);
};
$("shareVideo").onclick = async () => {
  if (!exportedVideo) return;
  try {
    await navigator.share({
      files: [
        new File([exportedVideo.blob], exportedVideo.name, {
          type: exportedVideo.blob.type,
        }),
      ],
    });
  } catch (e) {
    if (e.name !== "AbortError")
      $("videoHelp").textContent =
        "Condivisione non disponibile: usa Salva video.";
  }
};
$("cancelExport").onclick = () => {
  cancelRecording = true;
};
for (const id of ["ink", "strokeWidth", "pencilOnly"])
  $(id).addEventListener("change", scheduleSave);
document.addEventListener("keydown", (e) => {
  if (
    e.target.closest("input,select,textarea") ||
    $("settings").open ||
    $("videoDialog").open
  )
    return;
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
    e.preventDefault();
    e.shiftKey ? redo() : undo();
  }
});
async function boot() {
  document.querySelector(".app").inert = true;
  try {
    const saved = await LocalProject.load();
    if (saved) {
      if (!valid(saved)) throw Error("invalid");
      loadProject(saved);
      lastSerialized = JSON.stringify(project());
      say("Progetto ripristinato dal dispositivo.");
    }
    $("saveStatus").textContent = "Salvato sul dispositivo";
  } catch {
    $("saveStatus").textContent = "Backup JSON necessario";
    say(
      "Archivio locale non disponibile: salva una copia JSON delle modifiche.",
    );
  } finally {
    applyPresets();
    hydrated = true;
    document.querySelector(".app").inert = false;
    fitBoard();
  }
}
boot();
