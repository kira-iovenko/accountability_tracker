function getGoals(){
    return JSON.parse(localStorage.getItem("goals")) || [];
}

function saveGoals(goals){
    localStorage.setItem("goals", JSON.stringify(goals));
}

document.getElementById("createBtn").addEventListener("click", createGoal);

function createGoal(){
    const name = document.getElementById("goalName").value;
    if(!name) return;
    const motivation = document.getElementById("motivation").value;
    const goals = getGoals();
    goals.push({id: Date.now().toString(), name: name, motivation: motivation, createdAt: getToday(), streak: 0, lastCompleted: null, notes:[], messages:[]});
    saveGoals(goals);
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
            <h3>${goal.name}</h3>
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
        btn.addEventListener("click", function(){
            completeGoal(btn.dataset.id);
        });
    });
}
function renderGoal(goal){
    const message = goal.messages.length>0?goal.messages[0]:"no messages yet.";
    return`
        <h1>${goal.name}</h1>
        <p class="goal-motivation">${goal.motivation ||"no motivation yet."}</p>
        <p class="created-date">Started on ${goal.createdAt}</p>
        <hr>
        <h3>Streak</h3>
        <p>${goal.streak} day${goal.streak===1?"":"s"}</p>
        <hr>
        <h3>Past Messages</h3>
        <p class="past-message">"${message}"</p>
        <hr>
        <h3>Notes</h3>
        ${goal.notes.length?`<ul>${goal.notes.map(function(note){
            return `<li>${note}</li>`;
        }).join("")}</ul>`:"<p>no notes yet.</p>"}
        <button class="overlay-complete-btn">Complete Today</button>`;
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
}
function getToday(){
    return new Date().toISOString().split("T")[0];
}
function getYesterday(){
    const d = new Date();
    d.setDate(d.getDate()-1);
    return d.toISOString().split("T")[0];
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
    saveGoals(goals);
    displayGoals();
}
document.getElementById("closeOverlay").addEventListener("click", function(){
    document.getElementById("goalOverlay").classList.add("hidden");
});
document.getElementById("goalOverlay").addEventListener("click",  function(event){
    if(event.target.id==="goalOverlay"){
        document.getElementById("goalOverlay").classList.add("hidden");
    }
});
displayGoals();
