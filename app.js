// ===================== Exercise Library =====================
const EXERCISE_LIBRARY = [
  "Jumping Jacks", "Wall Sit", "Push Ups", "Abdominal Crunches", "Step Ups",
  "Squats", "Triceps Dips", "Plank", "High Knees", "Lunges",
  "Burpees", "Skipping", "Mountain Climbers", "Jump Squats", "Skater Jumps",
  "Butt Kicks", "Plank Jacks", "Fast Feet",
  "Push-up + Rotation", "Side Plank — Left", "Side Plank — Right",
  "Fast Feet", "Plank Jacks", "Butt Kicks", "Squat Thrusts",
  "Pike Push-ups", "Lateral Raises", "Prone Y-Raises", "Prone T-Raises",
  "Plank Shoulder Taps"
];
// dedupe (High Knees appears in both lists)
const EXERCISES = [...new Set(EXERCISE_LIBRARY)];

const PREP_TIME = 15;
const STORAGE_KEY = "exerciseTimerSavedSets";

// ===================== Persistence =====================
function loadSavedSets() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) return JSON.parse(raw);

  const defaults = [
    {
      id: "default-7min",
      name: "7 Minute Workout",
      exercises: ["Jumping Jacks", "Wall Sit", "Push Ups", "Abdominal Crunches", "Step Ups", "Squats", "Triceps Dips", "Plank"],
      exerciseDuration: 30,
      exerciseRest: 10,
      repeatCount: 1,
      setRest: 60
    },
    {
      id: "default-cardio",
      name: "Intense Cardio",
      exercises: ["Burpees", "Skipping", "Mountain Climbers", "High Knees", "Jump Squats", "Skater Jumps"],
      exerciseDuration: 30,
      exerciseRest: 10,
      repeatCount: 1,
      setRest: 60
    }
  ];
  saveSavedSets(defaults);
  return defaults;
}

function saveSavedSets(sets) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sets));
}

let savedSets = loadSavedSets();
let workout = []; // array of { setId, repeatCount } referencing savedSets, with own repeat override

// ===================== DOM refs =====================
const screens = {
  builder: document.getElementById("screen-builder"),
  editor: document.getElementById("screen-editor"),
  timer: document.getElementById("screen-timer"),
  complete: document.getElementById("screen-complete")
};

function showScreen(name) {
  Object.values(screens).forEach(s => s.classList.add("hidden"));
  screens[name].classList.remove("hidden");
}

// ===================== Render: Saved Sets =====================
function renderSavedSets() {
  const container = document.getElementById("saved-sets-list");
  container.innerHTML = "";
  if (savedSets.length === 0) {
    container.innerHTML = '<p class="empty-msg">No saved sets yet.</p>';
    return;
  }
  savedSets.forEach(set => {
    const div = document.createElement("div");
    div.className = "saved-set-item";
    div.innerHTML = `
      <div class="info">
        <strong>${set.name}</strong>
        <span class="meta">${set.exercises.length} exercises &middot; ${set.exerciseDuration}s / ${set.exerciseRest}s rest</span>
      </div>
      <div class="actions">
        <button class="btn btn-secondary btn-add" data-id="${set.id}">Add</button>
        <button class="btn-danger btn-delete" data-id="${set.id}">Delete</button>
      </div>
    `;
    container.appendChild(div);
  });

  container.querySelectorAll(".btn-add").forEach(btn => {
    btn.addEventListener("click", () => addSetToWorkout(btn.dataset.id));
  });
  container.querySelectorAll(".btn-delete").forEach(btn => {
    btn.addEventListener("click", () => deleteSavedSet(btn.dataset.id));
  });
}

function deleteSavedSet(id) {
  savedSets = savedSets.filter(s => s.id !== id);
  saveSavedSets(savedSets);
  workout = workout.filter(w => w.setId !== id);
  renderSavedSets();
  renderWorkout();
}

// ===================== Render: Workout Builder =====================
function addSetToWorkout(id) {
  const set = savedSets.find(s => s.id === id);
  workout.push({ setId: id, repeatCount: set.repeatCount });
  renderWorkout();
}

function removeFromWorkout(index) {
  workout.splice(index, 1);
  renderWorkout();
}

function renderWorkout() {
  const container = document.getElementById("workout-list");
  container.innerHTML = "";
  if (workout.length === 0) {
    container.innerHTML = '<p class="empty-msg">No sets added yet.</p>';
  } else {
    workout.forEach((item, index) => {
      const set = savedSets.find(s => s.id === item.setId);
      if (!set) return;
      const div = document.createElement("div");
      div.className = "workout-item";
      div.innerHTML = `
        <div class="info">
          <strong>${index + 1}. ${set.name}</strong>
          <span class="meta">${set.exercises.length} exercises</span>
        </div>
        <div class="actions">
          Repeat &times;
          <input type="number" min="1" max="10" class="repeat-input" value="${item.repeatCount}" data-index="${index}">
          <button class="btn-danger btn-remove" data-index="${index}">Remove</button>
        </div>
      `;
      container.appendChild(div);
    });

    container.querySelectorAll(".repeat-input").forEach(inp => {
      inp.addEventListener("change", () => {
        const idx = parseInt(inp.dataset.index, 10);
        workout[idx].repeatCount = Math.max(1, parseInt(inp.value, 10) || 1);
        renderWorkout();
      });
    });
    container.querySelectorAll(".btn-remove").forEach(btn => {
      btn.addEventListener("click", () => removeFromWorkout(parseInt(btn.dataset.index, 10)));
    });
  }

  document.getElementById("total-time").textContent = workout.length
    ? `Total time: approx ${estimateTotalMinutes()} min`
    : "";
}

function estimateTotalMinutes() {
  let totalSec = PREP_TIME;
  workout.forEach(item => {
    const set = savedSets.find(s => s.id === item.setId);
    if (!set) return;
    const perRound = set.exercises.length * set.exerciseDuration + (set.exercises.length - 1) * set.exerciseRest;
    totalSec += perRound * item.repeatCount;
    totalSec += set.setRest * (item.repeatCount - 1);
  });
  return Math.max(1, Math.round(totalSec / 60));
}

// ===================== Set Editor =====================
function renderExerciseChecklist() {
  const container = document.getElementById("exercise-checklist");
  container.innerHTML = "";
  EXERCISES.forEach(ex => {
    const label = document.createElement("label");
    label.className = "chk";
    label.innerHTML = `<input type="checkbox" value="${ex}"> ${ex}`;
    container.appendChild(label);
  });
}

document.getElementById("btn-new-set").addEventListener("click", () => {
  document.getElementById("set-name").value = "";
  document.getElementById("exercise-duration").value = "30";
  document.getElementById("exercise-rest").value = "10";
  document.getElementById("repeat-count").value = "1";
  document.getElementById("set-rest").value = "60";
  renderExerciseChecklist();
  showScreen("editor");
});

document.getElementById("btn-cancel-set").addEventListener("click", () => showScreen("builder"));

document.getElementById("btn-save-set").addEventListener("click", () => {
  const name = document.getElementById("set-name").value.trim();
  const checked = [...document.querySelectorAll("#exercise-checklist input:checked")].map(c => c.value);

  if (!name) { alert("Please enter a set name."); return; }
  if (checked.length === 0) { alert("Please select at least one exercise."); return; }

  const newSet = {
    id: "set-" + Date.now(),
    name,
    exercises: checked,
    exerciseDuration: parseInt(document.getElementById("exercise-duration").value, 10),
    exerciseRest: parseInt(document.getElementById("exercise-rest").value, 10),
    repeatCount: parseInt(document.getElementById("repeat-count").value, 10),
    setRest: parseInt(document.getElementById("set-rest").value, 10)
  };

  savedSets.push(newSet);
  saveSavedSets(savedSets);
  renderSavedSets();
  showScreen("builder");
});

// ===================== Timer Engine =====================
// Build a flat timeline of steps from the workout.
// Each step: { type: 'prep'|'exercise'|'rest'|'setrest'|'settransition', ... }
function buildTimeline() {
  const steps = [];
  steps.push({ type: "prep", duration: PREP_TIME });

  workout.forEach((item, setIndex) => {
    const set = savedSets.find(s => s.id === item.setId);
    if (!set) return;

    for (let round = 1; round <= item.repeatCount; round++) {
      set.exercises.forEach((ex, exIndex) => {
        steps.push({
          type: "exercise",
          name: ex,
          duration: set.exerciseDuration,
          setName: set.name,
          round, totalRounds: item.repeatCount,
          nextName: exIndex < set.exercises.length - 1 ? set.exercises[exIndex + 1] : null
        });
        if (exIndex < set.exercises.length - 1) {
          steps.push({
            type: "rest",
            duration: set.exerciseRest,
            setName: set.name,
            round, totalRounds: item.repeatCount,
            nextName: set.exercises[exIndex + 1]
          });
        }
      });

      const isLastRoundOfSet = round === item.repeatCount;
      const isLastSet = setIndex === workout.length - 1;

      if (!isLastRoundOfSet) {
        steps.push({
          type: "setrest",
          duration: set.setRest,
          setName: set.name,
          round, totalRounds: item.repeatCount,
          nextName: set.exercises[0]
        });
      } else if (!isLastSet) {
        const nextSet = savedSets.find(s => s.id === workout[setIndex + 1].setId);
        steps.push({
          type: "settransition",
          duration: set.setRest,
          setName: set.name,
          nextSetName: nextSet ? nextSet.name : ""
        });
      }
    }
  });

  steps.push({ type: "complete" });
  return steps;
}

let timeline = [];
let stepIndex = 0;
let remaining = 0;
let intervalId = null;
let paused = false;
let wakeLock = null;

async function requestWakeLock() {
  if (!("wakeLock" in navigator)) return;
  try {
    wakeLock = await navigator.wakeLock.request("screen");
  } catch (e) {
    wakeLock = null;
  }
}

function releaseWakeLock() {
  if (wakeLock) {
    wakeLock.release().catch(() => {});
    wakeLock = null;
  }
}

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible" && !paused &&
      !document.getElementById("screen-timer").classList.contains("hidden")) {
    requestWakeLock();
  }
});

function speak(text) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  window.speechSynthesis.speak(u);
}

function formatTime(sec) {
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = (sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function startWorkout() {
  if (workout.length === 0) { alert("Add at least one set to your workout first."); return; }
  timeline = buildTimeline();
  stepIndex = 0;
  showScreen("timer");
  requestWakeLock();
  runStep();
}

function runStep() {
  const step = timeline[stepIndex];
  if (!step) return;

  if (step.type === "complete") {
    clearInterval(intervalId);
    releaseWakeLock();
    speak("Workout complete. Great job!");
    showScreen("complete");
    return;
  }

  remaining = step.duration;
  paused = false;
  document.getElementById("btn-pause").textContent = "Pause";
  updateTimerDisplay(step);
  announceStep(step);

  clearInterval(intervalId);
  intervalId = setInterval(tick, 1000);
}

function announceStep(step) {
  if (step.type === "prep") speak("Get ready");
  else if (step.type === "exercise") speak(step.name);
  else if (step.type === "rest") speak(step.nextName ? `Rest. Next, ${step.nextName}` : "Rest");
  else if (step.type === "setrest") speak(`Set complete. Rest.`);
  else if (step.type === "settransition") speak(`Set complete. Next, ${step.nextSetName}`);
}

function updateTimerDisplay(step) {
  const setNameEl = document.getElementById("timer-set-name");
  const roundEl = document.getElementById("timer-round");
  const phaseEl = document.getElementById("timer-phase");
  const nextEl = document.getElementById("timer-next");

  if (step.type === "prep") {
    setNameEl.textContent = "";
    roundEl.textContent = "";
    phaseEl.textContent = "GET READY";
    nextEl.textContent = "";
  } else if (step.type === "exercise") {
    setNameEl.textContent = step.setName;
    roundEl.textContent = `Round ${step.round} of ${step.totalRounds}`;
    phaseEl.textContent = step.name.toUpperCase();
    nextEl.textContent = step.nextName ? `Next: ${step.nextName}` : "";
  } else if (step.type === "rest") {
    setNameEl.textContent = step.setName;
    roundEl.textContent = `Round ${step.round} of ${step.totalRounds}`;
    phaseEl.textContent = "REST";
    nextEl.textContent = step.nextName ? `Next: ${step.nextName}` : "";
  } else if (step.type === "setrest") {
    setNameEl.textContent = step.setName;
    roundEl.textContent = "";
    phaseEl.textContent = "SET REST";
    nextEl.textContent = `Next round: ${step.nextName}`;
  } else if (step.type === "settransition") {
    setNameEl.textContent = "SET COMPLETE";
    roundEl.textContent = "";
    phaseEl.textContent = "REST";
    nextEl.textContent = `Next: ${step.nextSetName}`;
  }

  document.getElementById("timer-clock").textContent = formatTime(remaining);
}

function tick() {
  if (paused) return;
  remaining--;
  document.getElementById("timer-clock").textContent = formatTime(remaining);
  if (remaining <= 0) {
    clearInterval(intervalId);
    stepIndex++;
    runStep();
  }
}

document.getElementById("btn-pause").addEventListener("click", () => {
  paused = !paused;
  document.getElementById("btn-pause").textContent = paused ? "Resume" : "Pause";
  if (paused) {
    window.speechSynthesis.cancel();
    releaseWakeLock();
  } else {
    requestWakeLock();
  }
});

document.getElementById("btn-skip").addEventListener("click", () => {
  clearInterval(intervalId);
  stepIndex++;
  runStep();
});

document.getElementById("btn-exit").addEventListener("click", () => {
  clearInterval(intervalId);
  window.speechSynthesis.cancel();
  releaseWakeLock();
  showScreen("builder");
});

document.getElementById("btn-again").addEventListener("click", () => {
  startWorkout();
});

document.getElementById("btn-back").addEventListener("click", () => {
  showScreen("builder");
});

document.getElementById("btn-start-workout").addEventListener("click", startWorkout);

// ===================== Init =====================
renderSavedSets();
renderWorkout();
showScreen("builder");

// ===================== Service Worker =====================
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {});
  });
}
