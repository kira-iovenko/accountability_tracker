const editEmoji = document.getElementById("editEmoji");
const editName = document.getElementById("editName");
const editOverlay = document.getElementById("editArea");
const editMotivation = document.getElementById("editMotivation");
const saveEditBtn = document.getElementById("saveEditBtn");
const cancelTextBtn = document.getElementById("cancelTextBtn");
const saveTextBtn = document.getElementById("saveTextBtn");
const textModal = document.getElementById("textModal");
const textModalTitle = document.getElementById("textModalTitle");
const textModalInput = document.getElementById("textModalInput");

function getGoals(){
    let goals;
    try{
        goals = JSON.parse(localStorage.getItem("goals")) || [];
    } catch{
        goals = [];
    }
    goals.forEach(function(goal){
        goal.completedDates ??=[];
        goal.notes??=[];
        goal.messages??=[];
        goal.notes = goal.notes.map(function(note){
            return typeof note === "string"?{id: Date.now().toString() + Math.random(), text: note, createdAt: goal.createdAt}:note;
        });
        goal.messages = goal.messages.map(function(message){
            return typeof message === "string"?{id: Date.now().toString() + Math.random(), text: message, createdAt: goal.createdAt}: message;
        });
        goal.streak??=0;
        goal.lastCompleted??=null;
        goal.createdAt ??= getToday();
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
    goals.push({id: Date.now().toString(), name, emoji, motivation, createdAt: getToday(), streak: 0, lastCompleted: null, completedDates: [],notes:[], messages:[]});
    saveGoals(goals);
    document.getElementById("goalEmoji").value = "";
    document.getElementById("goalName").value="";
    document.getElementById("motivation").value="";
    displayGoals();
}

function renderGoalCard(goal){
    return `
        <h3>${goal.emoji || "🌸"} ${goal.name}</h3>
        <p>${goal.streak} day${goal.streak===1?"":"s"} streak</p>
        <p class="preview-message">${goal.motivation?goal.motivation.slice(0,80)+(goal.motivation.length>80 ? "...":""):"no motivation yet."}</p>
        <button class="complete-btn" data-id="${goal.id}">Complete Today</button>
    `
}

function displayGoals(){
    const container = document.getElementById("goalContainer");
    container.innerHTML = "";
    const goals = getGoals();
    goals.forEach(function(goal){
        const div = document.createElement("div");
        div.className = "widget";
        div.innerHTML = renderGoalCard(goal);
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

function renderGoalHeader(goal){
    return `
        <div class="goal-main">
            <div class="goal-emoji">${goal.emoji || "🌸"}</div>
            <h1 class="goal-name">${goal.name}</h1>
            <p class="goal-motivation">${escapeHtml(goal.motivation)|| "no motivation yet."}</p>
        </div>
        <p class="created-date">Started on ${goal.createdAt}</p>
    `;
}
function renderStreakCard(goal){
    return `
        <div class="streak-card">
            <span class="streak-num">${goal.streak}</span>
            <span class="streak-label">day${goal.streak ===1?"" : "s"}</span>
        </div>
    `;
}
function renderMessagesArea(goal){
    if(!goal.messages.length){
        return `
            <h3>Past Messages</h3>
            <ul class="message-list">
                <li>no messages yet.</li>
            </ul>
        `;
    }
    return `
        <h3>Past Messages</h3>
        <ul class="message-list">
            ${goal.messages.map(function(message){
                return `
                    <li class="item-row">
                        <span>${escapeHtml(message.text)}</span>
                        <div class="more-actions-menu">
                            <button class="menu-btn" data-type="message" data-goal="${goal.id}" data-id="${message.id}">⋮</button>
                            <div class="menu-dropdown hidden">
                                <button class="edit-message-btn" data-goal="${goal.id}" data-message="${message.id}">Edit</button>
                                <button class="delete-message-btn" data-goal="${goal.id}" data-message="${message.id}">Delete</button>
                            </div>
                        </div>
                    </li>
                `;
            }).join("")}
        </ul>
    `;
}

function renderNotesArea(goal){
    if(!goal.notes.length){
        return `
            <h3>Notes</h3>
            <p>no notes yet.</p>
        `;
    }
    return `
        <h3>Notes</h3>
        <ul class="note-list">
            ${goal.notes.map(function(note){
                return `
                    <li class="item-row">
                        <span>${escapeHtml(note.text)}</span>
                        <div class="more-actions-menu">
                            <button class="menu-btn" data-type="note" data-goal="${goal.id}" data-id="${note.id}">⋮</button>
                            <div class="menu-dropdown hidden">
                                <button class="edit-note-btn" data-goal="${goal.id}" data-note="${note.id}">Edit</button>
                                <button class="delete-note-btn" data-goal="${goal.id}" data-note="${note.id}">Delete</button>
                            </div>
                        </div>
                    </li>
                `;
            }).join("")}
        </ul>
    `;
}

function renderActions(){
    return `<div class="goal-actions"><button id="addNoteBtn">+ Add Note</button><button id="addMessageBtn">+ Add Message</button><button id="editGoalBtn">Edit</button></div>
    <button class="overlay-complete-btn">Complete Today</button>
    <button id="deleteGoalBtn" class="delete-btn">Delete Goal</button>
    `;
}

function renderGoal(goal){
    goal.notes ??= [];
    goal.messages ??= [];
    goal.completedDates ??= [];
    return`
        ${renderGoalHeader(goal)}
        <hr>
        ${renderStreakCard(goal)}
        <hr>
        ${renderCalendar(goal)}
        <hr>
        ${renderMessagesArea(goal)}
        <hr>
        ${renderNotesArea(goal)}
        <hr>
        ${renderActions()}
    `;
}

function attachGoalEvents(id){
    document.querySelector(".overlay-complete-btn").onclick = function(){
        completeGoal(id, false);
        openGoal(id);
    };
    document.getElementById("addNoteBtn").onclick = function(){
        addNote(id);
    };
    document.getElementById("addMessageBtn").onclick = function(){
        addMessage(id);
    };
    document.getElementById("editGoalBtn").onclick = function(){
        const goal = getGoals().find(g=>g.id === id);
        openEditModal(goal);
    };
    document.getElementById("deleteGoalBtn").onclick = function(){
        if(confirm("Delete this goal?")){
            deleteGoal(id);
        }
    };
    document.querySelectorAll(".edit-note-btn").forEach(function(btn){
        btn.onclick = function(){
            editNote(this.dataset.goal, this.dataset.note);
        };
    });
    document.querySelectorAll(".delete-note-btn").forEach(function(btn){
        btn.onclick = function(){
            deleteNote(this.dataset.goal, this.dataset.note);
        };
    });
    document.querySelectorAll(".edit-message-btn").forEach(function(btn){
        btn.onclick = function(){
            editMessage(this.dataset.goal, this.dataset.message);
        };
    });
    document.querySelectorAll(".delete-message-btn").forEach(function(btn){
        btn.onclick = function(){
            deleteMessage(this.dataset.goal, this.dataset.message);
        };
    });
    document.querySelectorAll(".menu-btn").forEach(function(btn){
        btn.onclick = function(event){
            event.stopPropagation();
            document.querySelectorAll(".menu-dropdown").forEach(function(menu){
                if(menu != btn.nextElementSibling){
                    menu.classList.add("hidden");
                }
            });
            btn.nextElementSibling.classList.toggle("hidden");
        };
    });
}

function openGoal(id){
    const goals = getGoals();
    const goal = goals.find(g=>g.id===id);
    if(!goal) return;
    const overlay = document.getElementById("goalOverlay");
    const content = document.getElementById("goalContent");
    content.innerHTML = renderGoal(goal);
    attachGoalEvents(goal.id);
    overlay.classList.remove("hidden");
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

function closeTextModal(){
    textModal.classList.add("hidden");
    textModalInput.value = "";
    saveTextBtn.onclick = null;
}

function openTextModal(title, value, onSave){
    textModalTitle.textContent = title;
    textModalInput.value = value || "";
    textModal.classList.remove("hidden");
    textModalInput.focus();
    saveTextBtn.onclick = function(){
        const text = textModalInput.value.trim();
        if(!text) return;
        onSave(text);
        closeTextModal();
    };
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

function completeGoal(id, refresh=true){
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
    launchConfetti();
    if(refresh){
        displayGoals();
    }
}

function escapeHtml(text){
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

function addNote(id){
    openTextModal("New Note", "", function(text){
        const goals = getGoals();
        const goal = goals.find(g=>g.id===id);
        if(!goal) return;
        goal.notes.push({id: Date.now().toString(), text, createdAt: getToday()});
        saveGoals(goals);
        openGoal(id);
    });
}
function addMessage(id){
    openTextModal("New Message", "", function(text){
        const goals = getGoals();
        const goal = goals.find(g=>g.id === id);
        if(!goal) return;
        goal.messages.push({id: Date.now().toString(), text, createdAt: getToday()});
        saveGoals(goals);
        openGoal(id);
    });
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

function editNote(goalId, noteId){
    const goals = getGoals();
    const goal = goals.find(g=>g.id===goalId);
    if(!goal) return;
    const note = goal.notes.find(n=>n.id===noteId);
    if(!note) return;
    openTextModal("Edit Note", note.text, function(text){
        note.text = text;
        saveGoals(goals);
        openGoal(goalId);
    });
}

function deleteNote(goalId, noteId){
    if(!confirm("Delete this note?")) return;
    const goals = getGoals();
    const goal = goals.find(g=>g.id===goalId);
    goal.notes = goal.notes.filter(n=>n.id !== noteId);
    saveGoals(goals);
    openGoal(goalId); 
}

function editMessage(goalId, messageId){
    const goals = getGoals();
    const goal = goals.find(g=>g.id===goalId);
    if(!goal) return;
    const message = goal.messages.find(m=>m.id===messageId);
    if(!message) return;
    openTextModal("Edit Message", message.text, function(text){
        message.text = text;
        saveGoals(goals);
        openGoal(goal.id);
    });
}

textModalInput.addEventListener("keydown", function(event){
    if(event.key === "Enter" && (event.ctrlKey || event.metaKey)){
        event.preventDefault();
        saveTextBtn.click();
    }
});

cancelTextBtn.onclick = closeTextModal;
textModal.onclick = function(event){
    if(!event.target.closest(".edit-modal")){
        closeTextModal();
    }
};

function deleteMessage(goalId, messageId){
    if(!confirm("Delete this message?")) return;
    const goals = getGoals();
    const goal = goals.find(g=>g.id === goalId);
    goal.messages = goal.messages.filter(m=>m.id!==messageId);
    saveGoals(goals);
    openGoal(goalId);
}

document.addEventListener("click", function(){
    document.querySelectorAll(".menu-dropdown").forEach(function(menu){
        menu.classList.add("hidden");
    });
});

function launchConfetti(){
    const container = document.getElementById("confetti-container");
    const colors=["#ff7eb6", "#ffb347", "#ffe066", "#7dd87d", "#6ec6ff", "#b388ff"];
    for(let i=0; i<80; i++){
        const piece = document.createElement("div");
        piece.className = "confetti";
        piece.style.left = Math.random()*100 + "vw";
        piece.style.background = colors[Math.floor(Math.random()*colors.length)];
        piece.style.animationDuration = (2+Math.random()*2)+"s";
        piece.style.transform = `rotate(${Math.random()*360}deg)`;
        piece.style.width = (6+Math.random()*8)+"px";
        piece.style.height = (8+Math.random()*10) + "px";
        container.appendChild(piece);
        piece.addEventListener("animation", function(){
            piece.remove();
        });
    }
}

displayGoals();