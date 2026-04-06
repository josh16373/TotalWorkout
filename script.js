let currentUser = "";

// ===== USERS DATA =====
const users = {
  "1000": {
    password: "126",
    name: "You",
    workouts: {
      Monday: ["Dumbbell Bench Press 3x8", "Bent-over Rows 3x8", "Pushups 3x12"],
      Tuesday: ["Squats 3x8", "Lunges 2x10", "Crunches 3x12"],
      Wednesday: ["Bicep Curls 3x10", "Overhead Press 2x8"],
      Thursday: ["Squats 3x8", "Light Deadlifts 2x8"],
      Friday: ["Pushups 3x10", "Dumbbell Rows 3x8"],
      Saturday: ["Bodyweight Squats 2x12", "Glute Bridges 2x12"],
      Sunday: []
    },
    macros: { protein: 120, carbs: 180, fat: 35, calories: 1800, sugar: 20 }
  },
  "1001": {
    password: "226",
    name: "Mum",
    workouts: {
      Monday: ["Bodyweight Squats 2x12", "Light Deadlifts 2x10", "Glute Bridges 2x12"],
      Tuesday: ["Bicep Curls 2x10", "Overhead Press 2x8", "Resistance Band Rows 2x10"],
      Wednesday: ["Glute Bridges 2x12", "Standing Side Bends 2x12"],
      Thursday: ["Squats 2x10", "Light Deadlifts 2x8"],
      Friday: ["Bicep Curls 2x10", "Resistance Band Rows 2x10"],
      Saturday: ["Bodyweight Squats 2x12", "Glute Bridges 2x12"],
      Sunday: []
    },
    macros: { protein: 80, carbs: 150, fat: 25, calories: 1500, sugar: 15 }
  }
};

// ===== LOGIN FUNCTION =====
function login() {
  const code = document.getElementById("code").value;
  const pass = document.getElementById("pass").value;

  if(users[code] && users[code].password === pass){
    currentUser = code;

    const currentWeek = getWeekNumber(new Date());
    const lastWeek = localStorage.getItem("week_" + currentUser);

    if(lastWeek != currentWeek){
      Object.keys(users[currentUser].workouts).forEach(day => {
        localStorage.removeItem(currentUser + "_" + day);
      });
      localStorage.removeItem(currentUser + "_intake");
      localStorage.setItem("week_" + currentUser, currentWeek);
    }

    document.getElementById("login").style.display = "none";
    document.getElementById("welcome").style.display = "block";
    document.getElementById("userName").innerText = "Welcome, " + users[code].name;

    highlightTodayDropdown();

    const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    const today = days[new Date().getDay()];
    document.getElementById("daySelect").value = today;

    showDayPlan(currentUser, today);
    showMacros(currentUser);

  } else {
    alert("Invalid username or password");
  }
}

// ===== SHOW WORKOUTS =====
function showDayPlan(username, day){
  const dayExercises = users[username].workouts[day];
  const container = document.getElementById("plan");
  container.innerHTML = "";

  let saved = JSON.parse(localStorage.getItem(username + "_" + day)) || {};

  dayExercises.forEach((ex, i) => {
    const div = document.createElement("div");
    const checked = saved[i] ? "checked" : "";
    div.innerHTML = `<input type="checkbox" data-index="${i}" ${checked}> ${ex} <button onclick="removeExercise('${day}',${i})">Remove</button>`;
    container.appendChild(div);
  });

  container.querySelectorAll("input[type=checkbox]").forEach(cb => {
    cb.addEventListener("change", () => {
      let ticks = JSON.parse(localStorage.getItem(username + "_" + day)) || {};
      ticks[cb.dataset.index] = cb.checked;
      localStorage.setItem(username + "_" + day, JSON.stringify(ticks));
      updateStreak(username);
    });
  });

  highlightTodayDropdown();
  updateStreak(username);
}

// ===== STREAK =====
function updateStreak(username){
  const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const todayIndex = new Date().getDay();
  const day = days[todayIndex];

  const dayExercises = users[username].workouts[day];
  if(dayExercises.length === 0) return;

  const ticks = JSON.parse(localStorage.getItem(username + "_" + day)) || {};
  const allDone = dayExercises.every((ex, idx)=> ticks[idx]);

  if(allDone && day === "Monday"){
    let streak = (JSON.parse(localStorage.getItem(username + "_streak")) || 0) + 1;
    localStorage.setItem(username + "_streak", streak);
  }

  document.getElementById("streak").innerText = "Current Streak: " + (localStorage.getItem(username + "_streak") || 0) + " week(s)";
}

// ===== HIGHLIGHT TODAY =====
function highlightTodayDropdown(){
  const daySelect = document.getElementById("daySelect");
  const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const today = days[new Date().getDay()];
  Array.from(daySelect.options).forEach(opt=>{
    if(opt.value===today) opt.classList.add("today");
    else opt.classList.remove("today");
  });
}

// ===== ADD/REMOVE EXERCISES =====
function addExercise(day){
  const newEx = prompt("Enter new exercise:");
  if(newEx){
    // Add to user workouts
    users[currentUser].workouts[day].push(newEx);

    // Save updated workouts to localStorage
    localStorage.setItem(currentUser + "_workouts", JSON.stringify(users[currentUser].workouts));

    // Refresh the UI
    showDayPlan(currentUser, day);
  }
}

function removeExercise(day,index){
  // Remove from user workouts
  users[currentUser].workouts[day].splice(index,1);

  // Remove saved ticks for that day
  localStorage.removeItem(currentUser + "_" + day);

  // Save updated workouts to localStorage
  localStorage.setItem(currentUser + "_workouts", JSON.stringify(users[currentUser].workouts));

  // Refresh the UI
  showDayPlan(currentUser, day);
}

// ===== MACROS =====
function showMacros(username){
  const macros = users[username].macros;
  document.getElementById("proteinGoal").innerText = macros.protein;
  document.getElementById("carbsGoal").innerText = macros.carbs;
  document.getElementById("fatGoal").innerText = macros.fat;
  document.getElementById("caloriesGoal").innerText = macros.calories;
  document.getElementById("sugarGoal").innerText = macros.sugar;

  const intake = JSON.parse(localStorage.getItem(username + "_intake")) || {protein:0, carbs:0, fat:0, calories:0, sugar:0};
  document.getElementById("eatProtein").value = intake.protein;
  document.getElementById("eatCarbs").value = intake.carbs;
  document.getElementById("eatFat").value = intake.fat;
  document.getElementById("eatCalories").value = intake.calories;
  document.getElementById("eatSugar").value = intake.sugar;
}

function updateIntake(){
  const intake = {
    protein: Number(document.getElementById("eatProtein").value) || 0,
    carbs: Number(document.getElementById("eatCarbs").value) || 0,
    fat: Number(document.getElementById("eatFat").value) || 0,
    calories: Number(document.getElementById("eatCalories").value) || 0,
    sugar: Number(document.getElementById("eatSugar").value) || 0
  };

  localStorage.setItem(currentUser + "_intake", JSON.stringify(intake));
  alert("Macros updated!");
}

// ===== HELPER: WEEK NUMBER =====
function getWeekNumber(d) {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
  return Math.ceil((((d - yearStart) / 86400000) + 1)/7);
}

// ===== DROPDOWN CHANGE =====
document.getElementById("daySelect").addEventListener("change", ()=>{
  if(currentUser) showDayPlan(currentUser, document.getElementById("daySelect").value);
});

// ===== CHECK LOGIN ON PAGE LOAD =====
window.onload = function() {
    const savedUser = localStorage.getItem("currentUser");
    if(savedUser && users[savedUser]){
        currentUser = savedUser;
        document.getElementById("login").style.display = "none";
        document.getElementById("welcome").style.display = "block";
        document.getElementById("logoutBtn").style.display = "inline-block";
        document.getElementById("userName").innerText = "Welcome, " + users[currentUser].name;
        
        highlightTodayDropdown();
        const today = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][new Date().getDay()];
        document.getElementById("daySelect").value = today;
        showDayPlan(currentUser, today);
        showMacros(currentUser);
    }
};

// ===== LOGOUT FUNCTION =====
function logout() {
    localStorage.removeItem("currentUser");
    currentUser = "";
    document.getElementById("login").style.display = "block";
    document.getElementById("welcome").style.display = "none";
    document.getElementById("logoutBtn").style.display = "none";
    document.getElementById("code").value = "";
    document.getElementById("pass").value = "";
}

// ===== MODIFY LOGIN FUNCTION TO SAVE CURRENT USER =====
function login() {
    const code = document.getElementById("code").value;
    const pass = document.getElementById("pass").value;
    // Load saved workouts if they exist
    const savedWorkouts = JSON.parse(localStorage.getItem(currentUser + "_workouts"));
    if(savedWorkouts) {
    users[currentUser].workouts = savedWorkouts;
    }

    if(users[code] && users[code].password === pass){
        currentUser = code;
        localStorage.setItem("currentUser", code); // <-- save login for persistence

        const currentWeek = getWeekNumber(new Date());
        const lastWeek = localStorage.getItem("week_" + currentUser);

        if(lastWeek != currentWeek){
            Object.keys(users[currentUser].workouts).forEach(day => {
                localStorage.removeItem(currentUser + "_" + day);
            });
            localStorage.removeItem(currentUser + "_intake");
            localStorage.setItem("week_" + currentUser, currentWeek);
        }

        document.getElementById("login").style.display = "none";
        document.getElementById("welcome").style.display = "block";
        document.getElementById("logoutBtn").style.display = "inline-block";
        document.getElementById("userName").innerText = "Welcome, " + users[code].name;

        highlightTodayDropdown();

        const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
        const today = days[new Date().getDay()];
        document.getElementById("daySelect").value = today;

        showDayPlan(currentUser, today);
        showMacros(currentUser);

    } else {
        alert("Invalid username or password");
    }




    
}

