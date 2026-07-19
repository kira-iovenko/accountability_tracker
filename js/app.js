let editingJournalId = null;
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
const journalPage = document.getElementById("journalPage");
const journalEntries = document.getElementById("journalEntries");
const journalTitle = document.getElementById("journalTitle");
const journalText = document.getElementById("journalText");
const saveJournalBtn = document.getElementById("saveJournalBtn");
const createGoalModal = document.getElementById("createGoalModal");
const openCreateGoal = document.getElementById("openCreateGoal");
const cancelCreateBtn = document.getElementById("cancelCreateBtn");
const createJournalModal = document.getElementById("createJournalModal");
const openCreateJournal = document.getElementById("openCreateJournal");
const cancelJournalBtn = document.getElementById("cancelJournalBtn");
const journalViewModal = document.getElementById("journalViewModal");
const journalViewTitle = document.getElementById("journalViewTitle");
const journalViewDate = document.getElementById("journalViewDate");
const journalViewText = document.getElementById("journalViewText");
const closeJournalView = document.getElementById("closeJournalView");
let currentGoalId = null;
let calendarMonth = new Date().getMonth();
let calendarYear = new Date().getFullYear();

openCreateGoal.onclick = function(){
    createGoalModal.classList.remove("hidden");
    openCreateGoal.classList.add("hidden");
}

cancelCreateBtn.onclick = function(){
    createGoalModal.classList.add("hidden");
    openCreateGoal.classList.remove("hidden");
}

openCreateJournal.onclick = function(){
    createJournalModal.classList.remove("hidden");
    openCreateJournal.classList.add("hidden");
}

cancelJournalBtn.onclick = function(){
    editingJournalId = null;
    journalTitle.value = "";
    journalText.value = "";
    createJournalModal.classList.add("hidden");
    openCreateJournal.classList.remove("hidden");
}

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
        goal.longestStreak??=0;
        goal.lastCompleted??=null;
        goal.createdAt ??= getToday();
    });
    return goals;
}

function saveGoals(goals){
    localStorage.setItem("goals", JSON.stringify(goals));
}

function getJournalEntries(){
    try{
        return JSON.parse(localStorage.getItem("journalEntries")) || [];
    }catch{
        return[];
    }
}
function saveJournalEntries(entries){
    localStorage.setItem("journalEntries", JSON.stringify(entries));
    createJournalModal.classList.add("hidden");
    openCreateJournal.classList.remove("hidden");
}

document.getElementById("createBtn").addEventListener("click", createGoal);

function createGoal(){
    const name = document.getElementById("goalName").value.trim();
    if(!name) return;
    const motivation = document.getElementById("motivation").value;
    const emoji = document.getElementById("goalEmoji").value.trim()|| "🌸";
    const goals = getGoals();
    goals.push({id: Date.now().toString(), name, emoji, motivation, createdAt: getToday(), streak: 0, longestStreak: 0,lastCompleted: null, completedDates: [],notes:[], messages:[]});
    saveGoals(goals);
    document.getElementById("goalEmoji").value = "";
    document.getElementById("goalName").value="";
    document.getElementById("motivation").value="";
    createGoalModal.classList.add("hidden");
    openCreateGoal.classList.remove("hidden");
    displayGoals();
}

function renderGoalCard(goal){
    const completedToday = goal.lastCompleted === getToday();
    return `
        <h3>${goal.emoji || "🌸"} ${goal.name}</h3>
        <hr class="card-divider">
        <p>${goal.streak} day${goal.streak===1?"":"s"} streak</p>
        <p class="preview-message">${goal.motivation?goal.motivation.slice(0,80)+(goal.motivation.length>80 ? "...":""):"no motivation yet."}</p>
        <button class="complete-btn ${completedToday?"completed":""}" data-id="${goal.id}" ${completedToday?"disabled":""}>${completedToday?"✓ Completed":"Complete Today"}</button>
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

function openJournalEntry(id){
    const entries = getJournalEntries();
    const entry = entries.find(function(e){
        return e.id === id;
    });
    if(!entry) return;
    journalViewTitle.textContent = entry.title;
    journalViewDate.textContent = entry.date;
    journalViewText.textContent = entry.text;
    journalViewModal.classList.remove("hidden");
}

closeJournalView.onclick = function(){
    journalViewModal.classList.add("hidden");
}

function displayJournal(){
    const entries = getJournalEntries();
    journalEntries.innerHTML = "";
    if(entries.length === 0){
        journalEntries.innerHTML = `<p>No entries in your journal yet</p>`;
        return;
    }
    entries.forEach(function(entry){
        const div = document.createElement("div");
        const preview = entry.text.length > 180 ? entry.text.slice(0,180) + "...": entry.text;
        div.className = "journal-entry";
        div.innerHTML = `
            <div class="journal-header item-row">
                <div>
                    <h3>${escapeHtml(entry.title)}</h3>
                    <p class="journal-date">${entry.date}</p>
                </div>
                <div class="more-actions-menu">
                    <button class="menu-btn" data-type="journal" data-id="${entry.id}">⋮</button>
                    <div class="menu-dropdown hidden">
                        <button class="edit-journal-btn" data-id="${entry.id}">Edit</button>
                        <button class="delete-journal-btn" data-id="${entry.id}">Delete</button>
                    </div>
                </div>
            </div>
            <p class="journal-preview">${escapeHtml(preview)}</p>
        `;
        journalEntries.appendChild(div);
        div.addEventListener("click", function(event){
            if(event.target.closest(".more-actions-menu")){
                return;
            }
            openJournalEntry(entry.id);
        });
    });
    attachJournalEvents();
}

function attachJournalEvents(){
    document.querySelectorAll(".edit-journal-btn").forEach(function(btn){
        btn.onclick = function(){
            editJournalEntry(this.dataset.id);
        };
    });
    document.querySelectorAll(".delete-journal-btn").forEach(function(btn){
        btn.onclick = function(){
            deleteJournalEntry(this.dataset.id);
        };
    });
    document.querySelectorAll(".menu-btn").forEach(function(btn){
        if(btn.dataset.type !== "journal") return;
        btn.onclick = function(event){
            event.stopPropagation();
            document.querySelectorAll(".menu-dropdown").forEach(function(menu){
                if(menu!==btn.nextElementSibling){
                    menu.classList.add("hidden");
                }
            });
            btn.nextElementSibling.classList.toggle("hidden");
        };
    });
}

function editJournalEntry(id){
    const entries = getJournalEntries();
    const entry = entries.find(function(e){
        return e.id === id;
    });
    if(!entry) return;
    editingJournalId = id;
    journalTitle.value = entry.title;
    journalText.value = entry.text;
    createJournalModal.classList.remove("hidden");
    openCreateJournal.classList.add("hidden");
}

function deleteJournalEntry(id){
    if(!confirm("Delete this entry?")) return;
    const entries = getJournalEntries().filter(function(entry){
        return entry.id !== id;
    });
    saveJournalEntries(entries);
    displayJournal();
}

function addWidgetStuff(){
    document.querySelectorAll(".complete-btn").forEach(function(btn){
        btn.onclick = function(event){
            event.stopPropagation();
            const rec = this.getBoundingClientRect();
            completeGoal(this.dataset.id, true, rec.left+ rec.width/2, rec.top+ rec.height/2);
        };
    });
}

function getGoalStats(goal){
    const today = new Date();
    const created = new Date(goal.createdAt);
    const dif = today - created;
    const daysSince = Math.max(1, Math.floor(dif / (1000*60*60*24))+1);
    const totalCompletion = goal.completedDates.length;
    const rate = Math.round(totalCompletion / daysSince*100);
    return{
        daysSince,
        totalCompletion,
        rate
    };
}

function renderCalendar(goal){
    const firstD = new Date(calendarYear, calendarMonth, 1);
    const monthDays = new Date(calendarYear, calendarMonth+1, 0).getDate();
    const monthName = firstD.toLocaleString("default", {month: "long"});
    let html = `
        <div class="calendar">
            <div class="calendar-header">
                <button id="prevMonthBtn">◀</button>
                <h3>${monthName} ${calendarYear}</h3>
                <button id="nextMonthBtn" ${isCurrentMonth()?"disabled":""}>▶</button>
            </div>
            <div class="calendar-grid">
    `;
    const weekDays = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
    weekDays.forEach(function(day){
        html += `<div class="calendar-head">${day}</div>`;
    });
    const startDay = (firstD.getDay()+6)%7;
    for(let i=0; i<startDay; i++){
        html +=`<div></div>`;
    }
    const today = getToday();
    for(let d = 1; d<=monthDays; d++){
        const dateString = `${calendarYear}-${String(calendarMonth+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
        const completed = goal.completedDates.includes(dateString);
        const isToday = dateString === today;
        html += `<div class="calendar-day ${completed?"completed":""} ${isToday ? "today": ""}">${d}</div>`;
    }
    html += `
            </div>
        </div>
    `;
    return html;
}

function renderGoalHeader(goal){
    const formattedDate = new Date(goal.createdAt).toLocaleDateString("en-US", {month: "long", day: "numeric", year: "numeric"});
    return `
        <div class="goal-main">
            <div class="goal-emoji">${goal.emoji || "🌸"}</div>
            <h1 class="goal-name">${goal.name}</h1>
            <p class="goal-motivation">${escapeHtml(goal.motivation)|| "no motivation yet."}</p>
        </div>
        <p class="created-date">Started ${formattedDate}</p>
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
function renderStatsCard(goal){
    const stats = getGoalStats(goal);
    return `
        <div class="stats-card">
            <h3>My Stats</h3>
            <div class="stat-row">
                <span>Current Streak</span>
                <strong>${goal.streak} day${goal.streak===1?"":"s"}</strong>            
            </div>
            <div class="stat-row">
                <span>Longest Streak</span>
                <strong>${goal.longestStreak} day${goal.longestStreak === 1?"":"s"}</strong>
            </div>
            <div class="stat-row">
                <span>Total Completions</span>
                <strong>${stats.totalCompletion}</strong>
            </div>
            <div class="stat-row">
                <span>Completion Rate</span>
                <strong>${stats.rate}%</strong>
            </div>
            <div class="stat-row">
                <span>Days Since Started</span>
                <strong>${stats.daysSince}</strong>
            </div>
        </div>
    `
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

function renderActions(goal){
    const completedToday = goal.lastCompleted === getToday();
    return `<div class="goal-actions"><button id="addNoteBtn">+ Add Note</button><button id="addMessageBtn">+ Add Message</button><button id="editGoalBtn">Edit</button></div>
    <button class="overlay-complete-btn ${completedToday?"completed":""}" ${completedToday?"disabled":""}>${completedToday?"✓ Completed":"Complete Today"}</button>
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
        ${renderStatsCard(goal)}
        <hr>
        ${renderCalendar(goal)}
        <hr>
        ${renderMessagesArea(goal)}
        <hr>
        ${renderNotesArea(goal)}
        <hr>
        ${renderActions(goal)}
    `;
}

function attachGoalEvents(id){
    document.querySelector(".overlay-complete-btn").onclick = function(){
        const rec = this.getBoundingClientRect();
        completeGoal(id, false, rec.left+rec.width/2, rec.top + rec.height/2);
        renderCurrentGoal();
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
    document.getElementById("prevMonthBtn").onclick = function(){
        calendarMonth--;
        if(calendarMonth<0){
            calendarMonth = 11;
            calendarYear--;
        }
        renderCurrentGoal();
    };
    document.getElementById("nextMonthBtn").onclick = function(){
        const today = new Date();
        if(
            calendarYear === today.getFullYear() && calendarMonth === today.getMonth()
        ){
            return;
        }
        calendarMonth++;
        if(calendarMonth>11){
            calendarMonth = 0;
            calendarYear++;
        }
        renderCurrentGoal();
    };
}


function openGoal(id){
    currentGoalId = id;
    calendarMonth = new Date().getMonth();
    calendarYear = new Date().getFullYear();
    renderCurrentGoal();
    document.getElementById("goalOverlay").classList.remove("hidden");
}

function renderCurrentGoal(){
    const goals = getGoals();
    const goal = goals.find(function(g){
        return g.id === currentGoalId;
    });
    if(!goal) return;
    const content = document.getElementById("goalContent");
    content.innerHTML = renderGoal(goal);
    attachGoalEvents(goal.id);
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

function isCurrentMonth(){
    const now = new Date();
    return(
        calendarMonth === now.getMonth() && calendarYear === now.getFullYear()
    );
}

function completeGoal(id, refresh=true, x=null, y=null){
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
    if(goal.streak > goal.longestStreak){
        goal.longestStreak = goal.streak;
    }
    goal.lastCompleted = today;
    goal.completedDates ??=[];
    if(!goal.completedDates.includes(today)){
        goal.completedDates.push(today);
    }
    saveGoals(goals);
    if(x!==null){
        launchConfetti(x,y);
    }
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
        renderCurrentGoal();
    });
}

function deleteNote(goalId, noteId){
    if(!confirm("Delete this note?")) return;
    const goals = getGoals();
    const goal = goals.find(g=>g.id===goalId);
    goal.notes = goal.notes.filter(n=>n.id !== noteId);
    saveGoals(goals);
    renderCurrentGoal();
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
    renderCurrentGoal();
}

document.addEventListener("click", function(){
    document.querySelectorAll(".menu-dropdown").forEach(function(menu){
        menu.classList.add("hidden");
    });
});

function launchConfetti(x,y){
    const container = document.getElementById("confetti-container");
    const colors=["#ff7eb6", "#ffb347", "#ffe066", "#7dd87d", "#6ec6ff", "#b388ff"];
    for(let i=0; i<80; i++){
        const piece = document.createElement("div");
        const size = 6+Math.random()*8;
        piece.className = "confetti";
        piece.style.left = (x+(Math.random()-0.5)*20) + "px";
        piece.style.top = (y+(Math.random()-0.5)*20) +"px";
        piece.style.width = size+"px";
        piece.style.height=size *1.5 +"px";
        piece.style.background = colors[Math.floor(Math.random()*colors.length)];
        const angle = Math.random() * Math.PI  * 2;
        const speed = 350 + Math.random() *300;
        const dx = Math.cos(angle)*speed;
        const dy = Math.sin(angle)*speed - 250;
        container.appendChild(piece);
        const animation = piece.animate(
            [
                {transform: "translate(0,0) rotate(0deg)", opacity:1},
                {transform: `translate(${dx}px, ${dy+400}px) rotate(${720+Math.random()*360}deg)`, opacity:0}
            ], {duration: 1800+Math.random()*600, easing: "cubic-bezier(.15, .8,.25,1)", fill:"forwards"});
        animation.onfinish = () => piece.remove();
    }
}

saveJournalBtn.onclick = function(){
    const title = journalTitle.value.trim() || "Untitled";
    const text = journalText.value.trim();
    if(!text) return;
    const entries = getJournalEntries();
    if(editingJournalId){
        const entry = entries.find(function(e){
            return e.id === editingJournalId;
        });
        if(entry){
            entry.title = title;
            entry.text = text;
        }
        editingJournalId = null;
    } else{
        entries.unshift({id: Date.now().toString(), title, text, date: getToday()});
    }
    saveJournalEntries(entries);
    journalTitle.value = "";
    journalText.value = "";
    createJournalModal.classList.add("hidden");
    openCreateJournal.classList.remove("hidden");
    displayJournal();
};

document.getElementById("journalTab").onclick = function(){
    journalPage.classList.remove("hidden");
    displayJournal();
};
document.getElementById("closeJournal").onclick = function(){
    journalPage.classList.add("hidden");
};


displayGoals();