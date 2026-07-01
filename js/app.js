const editEmoji = document.getElementById("editEmoji");
const editName = document.getElementById("editName");
const editOverlay = document.getElementById("editArea");
const editMotivation = document.getElementById("editMotivation");
const saveEditBtn = document.getElementById("saveEditBtn");
function getGoals(){
    const goals = JSON.parse(localStorage.getItem("goals")) || [];
    goals.forEach(function(goal){
        goal.completedDates ??=[];
        goal.notes??=[];
        goal.messages??=[];
        goal.streak??=0;
        goal.lastCompleted??=null;
    });
    return goals;
}

function saveGoals(goals){
    localStorage.setItem("goals", JSON.stringify(goals));
}

document.getElementById("createBtn").addEventListener("click", createGoal);

function createGoal(){
    const name = document.getElementById("goalName").value.trim();
    if(!name) return;
    const motivation = document.getElementById("motivation").value;
    const emoji = document.getElementById("goalEmoji").value.trim()|| "🌸";
    const goals = getGoals();
    goals.push({id: Date.now().toString(), name: name, emoji: emoji, motivation: motivation, createdAt: getToday(), streak: 0, lastCompleted: null, completedDates: [],notes:[], messages:[]});
    saveGoals(goals);
    document.getElementById("goalEmoji").value = "";
    document.getElementById("goalName").value="";
    document.getElementById("motivation").value="";
    displayGoals();
}

function displayGoals(){
    const container = document.getElementById("goalContainer");
    container.innerHTML = "";
    const goals = getGoals();
    goals.forEach(function(goal){
        const div = document.createElement("div");
        div.className = "widget";
        div.innerHTML = `
            <h3>${goal.emoji || "🌸"} ${goal.name}</h3>
            <p>${goal.streak} day${goal.streak===1?"":"s"} streak</p>
            <p class="preview-message">${goal.motivation?goal.motivation.slice(0,80)+(goal.motivation.length>80?"...":""):"no motivation yet."}</p>
            <button class="complete-btn" data-id="${goal.id}">Complete Today</button>
        `;
        div.addEventListener("click", function(event){
            if(event.target.classList.contains("complete-btn")){
                return;
            }
            openGoal(goal.id);
        });
        container.appendChild(div);
    });
    addWidgetStuff();
}


function addWidgetStuff(){
    document.querySelectorAll(".complete-btn").forEach(function(btn){
        btn.onclick = function(event){
            event.stopPropagation();
            completeGoal(this.dataset.id);
        };
    });
}
function renderCalendar(goal){
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstD = new Date(year, month, 1);
    const monthDays = new Date(year, month+1, 0).getDate();
    let html = `<div class="calendar"><h3>${now.toLocaleString("default",{month: "long"})} ${year}</h3><div class="calendar-grid">`;
    const weekDays = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
    weekDays.forEach(function(day){
        html += `<div class="calendar-head">${day}</div>`;
    });
    const startDay = (firstD.getDay()+6)%7;
    for(let i=0; i<startDay; i++){
        html +=`<div></div>`;
    }
    for(let d=1; d<=monthDays;d++){
        const str = `${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
        const complete = (goal.completedDates || []).includes(str);
        html += `<div class="calendar-day ${complete?"completed":""}">${d}</div>`;
    }
    html += `</div></div>`;
    return html;
}

function renderGoal(goal){
    goal.notes ??= [];
    goal.messages ??= [];
    goal.completedDates ??= [];
    const messagesHtml = goal.messages.length>0?goal.messages.map(function(message){
        return `<li>${message}</li>`;
    }).join(""):"<li>no messages yet.</li>";
    return`
        <div class="goal-main">
            <div class="goal-emoji">${goal.emoji || "🌸"}</div>
            <h1 class="goal-name">${goal.name}</h1>
            <p class="goal-motivation">${goal.motivation||"no motivation yet."}</p>
        </div>
        <p class="created-date">Started on ${goal.createdAt}</p>
        <hr>
        <div class="streak-card">
            <span class="streak-num">${goal.streak}</span>
            <span class="streak-label">day${goal.streak===1?"":"s"}</span>
        </div>
        <hr>
        ${renderCalendar(goal)}
        <hr>
        <h3>Past Messages</h3>
        <ul class="message-list">${messagesHtml}</ul>
        <hr>
        <h3>Notes</h3>
        ${goal.notes.length?`<ul>${goal.notes.map(function(note){
            return `<li>${note}</li>`;
        }).join("")}</ul>`:"<p>no notes yet.</p>"}
        <hr>
        <div class="goal-actions">
            <button id="addNoteBtn">+ Add Note</button>
            <button id="addMessageBtn">+ Add Message</button>
            <button id="editGoalBtn">Edit</button>
        </div>
        <button class="overlay-complete-btn">Complete Today</button>
        <button id="deleteGoalBtn" class="delete-btn">Delete Goal</button>`;
}

function openGoal(id){
    const goals = getGoals();
    const goal = goals.find(g=>g.id===id);
    if(!goal) return;
    const overlay = document.getElementById("goalOverlay");
    const content = document.getElementById("goalContent");
    content.innerHTML = renderGoal(goal);
    overlay.classList.remove("hidden");
    document.querySelector(".overlay-complete-btn").addEventListener("click", function(){
        completeGoal(goal.id);
        openGoal(goal.id);
    });
    document.getElementById("addNoteBtn").addEventListener("click", function(){
        addNote(goal.id);
    });
    document.getElementById("addMessageBtn").addEventListener("click", function(){
        addMessage(goal.id);
    });
    document.getElementById("editGoalBtn").onclick = function(){
        openEditModal(goal);
    };
    document.getElementById("deleteGoalBtn").addEventListener("click", function(){
        if(confirm("Delete this goal?")){
            deleteGoal(goal.id);
        }
    })
}

function openEditModal(goal){
    editEmoji.value = goal.emoji || "🌸";
    editName.value = goal.name;
    editMotivation.value = goal.motivation || "";
    editOverlay.classList.remove("hidden");
    saveEditBtn.onclick = function(){
        saveGoalEdits(goal.id);
    };
}
function closeEditModal(){
    editOverlay.classList.add("hidden");
}

function saveGoalEdits(id){
    const goals = getGoals();
    const goal = goals.find(function(g){
        return g.id===id;
    });
    if(!goal) return;
    const emoji = document.getElementById("editEmoji").value.trim();
    const name = document.getElementById("editName").value.trim();
    const motivation = document.getElementById("editMotivation").value.trim();
    if(!name) return;
    goal.name = name;
    goal.emoji = emoji ||"🌸";
    goal.motivation = motivation;
    saveGoals(goals);
    displayGoals();
    closeEditModal();
    openGoal(id);
}

function getToday(){
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function getYesterday(){
    const d = new Date();
    d.setDate(d.getDate()-1);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function completeGoal(id){
    const goals = getGoals();
    const today = getToday();
    const goal = goals.find(g=>g.id === id);
    if(!goal) return;
    if(goal.lastCompleted === today) return;
    if(goal.lastCompleted === getYesterday()){
        goal.streak += 1;
    } else {
        goal.streak = 1;
    }
    goal.lastCompleted = today;
    goal.completedDates ??=[];
    if(!goal.completedDates.includes(today)){
        goal.completedDates.push(today);
    }
    saveGoals(goals);
    displayGoals();
}

function addNote(id){
    const text = prompt("Leave a note:");
    if(!text)return;
    const goals = getGoals();
    const goal = goals.find(g=>g.id===id);
    if(!goal)return;
    goal.notes.push(text);
    saveGoals(goals);
    openGoal(id);
}
function addMessage(id){
    const text = prompt("Write your future self a message:");
    if(!text)return;
    const goals = getGoals();
    const goal = goals.find(g=>g.id===id);
    if(!goal)return;
    goal.messages.push(text);
    saveGoals(goals);
    openGoal(id);
}
document.getElementById("closeOverlay").addEventListener("click", function(){
    document.getElementById("goalOverlay").classList.add("hidden");
});
document.getElementById("goalOverlay").addEventListener("click",  function(event){
    if(event.target.id==="goalOverlay"){
        document.getElementById("goalOverlay").classList.add("hidden");
    }
});
document.getElementById("cancelEditBtn").onclick = closeEditModal;

editOverlay.onclick = function(event){
    if(!event.target.closest(".edit-modal")){
        closeEditModal();
    }
};

function deleteGoal(id){
    const goals = getGoals().filter(g=>g.id !== id);
    saveGoals(goals);
    document.getElementById("goalOverlay").classList.add("hidden");
    displayGoals();
}

displayGoals();