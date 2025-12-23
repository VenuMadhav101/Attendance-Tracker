const startDate = new Date(2025, 11); // Dec 2025
const endDate   = new Date(2026, 3);  // April 2026
let currentDate = new Date(startDate);

let attendanceData = {};
let selectedKey = null;

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

  const first = new Date(y, m, 1).getDay();

  for (let i = 0; i < first; i++) {
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

  calculateMonth();
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
  closeModal();
  renderCalendar();
}

function clearDate() {
  delete attendanceData[selectedKey];
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

function calculateMonth() {
  const y = currentDate.getFullYear();
  const m = currentDate.getMonth();
  const total = daysInMonth(y, m);

  let present = 0, absent = 0, holiday = 0, undecided = 0;

  for (let d = 1; d <= total; d++) {
    const date = new Date(y, m, d);
    const key = `${y}-${m + 1}-${d}`;
    const status = attendanceData[key];

    if (date.getDay() === 0 || status === "holiday") holiday++;
    else if (status === "present") present++;
    else if (status === "absent") absent++;
    else undecided++;
  }

  const working = present + absent;
  const percentage = working === 0 ? 0 : (present / working) * 100;

  document.getElementById("present").textContent = present;
  document.getElementById("absent").textContent = absent;
  document.getElementById("holiday").textContent = holiday;
  document.getElementById("percentage").textContent =
    percentage.toFixed(2) + "%";

  recommendLeaves(present, working, undecided);
}

function recommendLeaves(present, working, remaining) {
  const target = Number(document.getElementById("target").value) / 100;
  const advice = document.getElementById("advice");
  const planner = document.getElementById("planner");

  const maxWorking = working + remaining;
  const requiredPresent = Math.ceil(target * maxWorking);
  const leavesAllowed = maxWorking - requiredPresent - (working - present);

  if (leavesAllowed >= 0) {
    advice.textContent = "Target achievable this month";
    advice.style.color = "#22c55e";
    planner.innerHTML =
      `You can take <b>${leavesAllowed}</b> more leave(s).`;
  } else {
    advice.textContent = "Target not achievable this month";
    advice.style.color = "#ef4444";
    planner.textContent =
      "No more leaves possible for this target.";
  }
}

renderCalendar();
