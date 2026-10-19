(() => {
  "use strict";
  const STORAGE_KEY = "studyflow.tasks.v1";
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const dialog = $("#task-dialog");
  const form = $("#task-form");
  let tasks = loadTasks();
  let currentFilter = "all";
  let currentView = "dashboard";
  let editingId = null;
  let toastTimer;

  function loadTasks() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.warn("Could not load saved tasks:", error);
      return [];
    }
  }
  function saveTasks() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); }
    catch (error) { showToast("Could not save changes in this browser."); console.error(error); }
  }
  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  }
  function dateLabel(date) {
    if (!date) return "No due date";
    const d = new Date(`${date}T12:00:00`);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  }
  function todayISO() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;
  }
  function dueText(task) {
    if (task.done) return "Completed";
    if (task.date < todayISO()) return `Overdue · ${dateLabel(task.date)}`;
    if (task.date === todayISO()) return "Due today";
    return `Due ${dateLabel(task.date)}`;
  }
  function showToast(message) {
    const toast = $("#toast");
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
  }
  function updateStats() {
    const done = tasks.filter(t => t.done).length;
    const upcoming = tasks.filter(t => !t.done && t.date >= todayISO()).length;
    const progress = tasks.length ? Math.round(done / tasks.length * 100) : 0;
    $("#total-count").textContent = tasks.length;
    $("#done-count").textContent = done;
    $("#upcoming-count").textContent = upcoming;
    $("#progress-count").textContent = `${progress}%`;
    $("#progress-bar").style.width = `${progress}%`;
  }
  function render() {
    updateStats();
    const sorted = [...tasks].sort((a,b) => Number(a.done)-Number(b.done) || a.date.localeCompare(b.date));
    let visible = sorted;
    if (currentFilter === "active") visible = sorted.filter(t => !t.done);
    if (currentFilter === "done") visible = sorted.filter(t => t.done);
    if (currentView === "dashboard") visible = visible.slice(0, 5);
    $("#task-list").innerHTML = visible.map(task => `
      <article class="task-row ${task.done ? "completed" : ""}">
        <input class="task-check" type="checkbox" aria-label="Mark ${escapeHTML(task.title)} complete" data-action="toggle" data-id="${task.id}" ${task.done ? "checked" : ""}>
        <div class="task-details">
          <p class="task-title">${escapeHTML(task.title)}</p>
          <div class="task-meta">
            ${task.subject ? `<span class="subject-tag">${escapeHTML(task.subject)}</span>` : ""}
            <span class="priority ${escapeHTML(task.priority)}">${escapeHTML(task.priority)} priority</span>
            <span class="due ${!task.done && task.date < todayISO() ? "overdue" : ""}">${escapeHTML(dueText(task))}</span>
          </div>
          ${task.notes ? `<p class="task-note">${escapeHTML(task.notes)}</p>` : ""}
        </div>
        <div class="task-actions"><button class="icon-btn" title="Edit task" aria-label="Edit ${escapeHTML(task.title)}" data-action="edit" data-id="${task.id}">✎</button><button class="icon-btn" title="Delete task" aria-label="Delete ${escapeHTML(task.title)}" data-action="delete" data-id="${task.id}">×</button></div>
      </article>`).join("");
    $("#empty-state").classList.toggle("show", visible.length === 0);
    $("#task-list").style.display = visible.length ? "flex" : "none";
    $("#list-heading").textContent = currentView === "schedule" ? "Your upcoming schedule" : currentView === "tasks" ? "All your tasks" : "Your tasks";
    $("#view-all").hidden = currentView !== "dashboard";
    $("#page-title").textContent = ({dashboard:"Dashboard",tasks:"My tasks",schedule:"Study schedule"})[currentView];
    $$(".nav-item").forEach(btn => btn.classList.toggle("active", btn.dataset.view === currentView));
    $$(".filter").forEach(btn => btn.classList.toggle("active", btn.dataset.filter === currentFilter));
  }
  function openDialog(task = null) {
    editingId = task ? task.id : null;
    form.reset();
    $("#dialog-title").textContent = task ? "Edit task" : "Add a task";
    $("#task-title").value = task?.title || "";
    $("#task-subject").value = task?.subject || "";
    $("#task-date").value = task?.date || todayISO();
    $("#task-priority").value = task?.priority || "medium";
    $("#task-notes").value = task?.notes || "";
    $("#form-error").textContent = "";
    dialog.showModal();
    $("#task-title").focus();
  }
  function closeDialog() { dialog.close(); editingId = null; }
  $("#open-add").addEventListener("click", () => openDialog());
  $("#empty-add").addEventListener("click", () => openDialog());
  $("#close-dialog").addEventListener("click", closeDialog);
  $("#cancel-dialog").addEventListener("click", closeDialog);
  dialog.addEventListener("click", e => { if (e.target === dialog) closeDialog(); });
  form.addEventListener("submit", e => {
    e.preventDefault();
    const title = $("#task-title").value.trim();
    const date = $("#task-date").value;
    if (!title || !date) { $("#form-error").textContent = "Please enter a task name and due date."; return; }
    const data = { title, subject: $("#task-subject").value.trim(), date, priority: $("#task-priority").value, notes: $("#task-notes").value.trim() };
    if (editingId) {
      tasks = tasks.map(t => t.id === editingId ? {...t, ...data} : t);
      showToast("Task updated.");
    } else {
      tasks.push({ id: (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`), ...data, done: false, createdAt: new Date().toISOString() });
      showToast("Task added to your planner.");
    }
    saveTasks(); closeDialog(); render();
  });
  $("#task-list").addEventListener("click", e => {
    const control = e.target.closest("[data-action]");
    if (!control) return;
    const task = tasks.find(t => t.id === control.dataset.id);
    if (!task) return;
    if (control.dataset.action === "edit") openDialog(task);
    if (control.dataset.action === "delete") {
      if (confirm(`Delete "${task.title}" from your planner?`)) {
        tasks = tasks.filter(t => t.id !== task.id);
        saveTasks(); render(); showToast("Task deleted.");
      }
    }
    if (control.dataset.action === "toggle") {
      task.done = control.checked;
      saveTasks(); render(); showToast(task.done ? "Nice work — task completed!" : "Task marked as to do.");
    }
  });
  $$(".filter").forEach(btn => btn.addEventListener("click", () => { currentFilter = btn.dataset.filter; render(); }));
  $$(".nav-item").forEach(btn => btn.addEventListener("click", () => {
    currentView = btn.dataset.view;
    if (currentView === "schedule") currentFilter = "active";
    else if (currentView === "tasks") currentFilter = "all";
    else currentFilter = "all";
    render();
  }));
  $("#view-all").addEventListener("click", () => { currentView = "tasks"; currentFilter = "all"; render(); });
  let focusTimer = null;
  let focusEnd = 0;
  $("#focus-btn").addEventListener("click", () => {
    const status = $("#focus-status");
    if (focusTimer) {
      clearInterval(focusTimer); focusTimer = null;
      $("#focus-btn").textContent = "Start 25-min focus";
      status.textContent = "Focus session paused. Start again when you're ready.";
      return;
    }
    focusEnd = Date.now() + 25 * 60 * 1000;
    $("#focus-btn").textContent = "Pause focus session";
    const update = () => {
      const remaining = Math.max(0, Math.ceil((focusEnd - Date.now()) / 1000));
      status.textContent = `Focus time remaining: ${String(Math.floor(remaining/60)).padStart(2,"0")}:${String(remaining%60).padStart(2,"0")}`;
      if (remaining <= 0) {
        clearInterval(focusTimer); focusTimer = null;
        $("#focus-btn").textContent = "Start another session";
        status.textContent = "Session complete! Take a short break. 🎉";
        showToast("Your focus session is complete!");
      }
    };
    update(); focusTimer = setInterval(update, 1000);
  });
  $("#today-label").textContent = new Date().toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric"}).toUpperCase();
  render();
})();