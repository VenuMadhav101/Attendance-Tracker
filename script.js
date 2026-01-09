const startDate = new Date(2025, 11);
const endDate   = new Date(2026, 3); 
let currentDate = new Date(startDate);

const STORAGE_KEY = "attendance_data_v2";
let attendanceData =
  JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};

let selectedKey = null;

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(attendanceData));
}

function daysInMonth(y, m) {
  return new Date(y, m + 1, 0).getDate();
}

function renderCalendar() {
  const cal = document.getElementById("calendar");
  cal.innerHTML = "";

  const y = currentDate.getFullYear();
  const m = currentDate.getMonth();

  document.getElementById("monthLabel").textContent =
    currentDate.toLocaleString("default", { month: "long", year: "numeric" });

  const firstDay = new Date(y, m, 1).getDay();

  for (let i = 0; i < firstDay; i++) {
    const e = document.createElement("div");
    e.className = "day empty";
    cal.appendChild(e);
  }

  for (let d = 1; d <= daysInMonth(y, m); d++) {
    const date = new Date(y, m, d);
    const key = `${y}-${m + 1}-${d}`;

    if (date.getDay() === 0 && !attendanceData[key]) {
      attendanceData[key] = "holiday";
    }

    const cell = document.createElement("div");
    cell.className = `day ${attendanceData[key] || ""}`;
    cell.textContent = d;
    cell.onclick = () => openModal(key, date);

    cal.appendChild(cell);
  }

  saveData();
  calculateGlobal();
}

function openModal(key, date) {
  if (date.getDay() === 0) return;
  selectedKey = key;
  document.getElementById("statusModal").classList.remove("hidden");
}

function closeModal() {
  selectedKey = null;
  document.getElementById("statusModal").classList.add("hidden");
}

function setStatus(status) {
  attendanceData[selectedKey] = status;
  saveData();
  closeModal();
  renderCalendar();
}

function clearDate() {
  delete attendanceData[selectedKey];
  saveData();
  closeModal();
  renderCalendar();
}

function nextMonth() {
  const n = new Date(currentDate);
  n.setMonth(n.getMonth() + 1);
  if (n <= endDate) {
    currentDate = n;
    renderCalendar();
  }
}

function prevMonth() {
  const p = new Date(currentDate);
  p.setMonth(p.getMonth() - 1);
  if (p >= startDate) {
    currentDate = p;
    renderCalendar();
  }
}

function calculateGlobal() {
  let present = 0, absent = 0, holiday = 0, remaining = 0;

  const d = new Date(startDate);
  while (d <= endDate) {
    const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    const status = attendanceData[key];

    if (d.getDay() === 0 || status === "holiday") holiday++;
    else if (status === "present") present++;
    else if (status === "absent") absent++;
    else remaining++;

    d.setDate(d.getDate() + 1);
  }

  const working = present + absent;
  const percent = working === 0 ? 0 : (present / working) * 100;

  document.getElementById("present").textContent = present;
  document.getElementById("absent").textContent = absent;
  document.getElementById("holiday").textContent = holiday;
  document.getElementById("percentage").textContent =
    percent.toFixed(2) + "%";

  recommendGlobal(present, working, remaining);
}

function recommendGlobal(present, working, remaining) {
  const target = Number(document.getElementById("target").value) / 100;
  const advice = document.getElementById("advice");
  const planner = document.getElementById("planner");

  const maxWorking = working + remaining;
  const requiredPresent = Math.ceil(target * maxWorking);
  const leavesAllowed =
    maxWorking - requiredPresent - (working - present);

  if (leavesAllowed >= 0) {
    advice.textContent = "Target achievable for the semester";
    advice.style.color = "#22c55e";
    planner.innerHTML =
      `You can take <b>${leavesAllowed}</b> more leave(s) till April 2026.`;
  } else {
    advice.textContent = "Target not achievable for the semester";
    advice.style.color = "#ef4444";
    planner.textContent =
      "No more leaves possible for this target.";
  }
}

renderCalendar();
