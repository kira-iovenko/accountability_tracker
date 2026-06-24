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
    goals.push({id: Date.now().toString(), name, motivation, streak: 0, lastCompleted: null, notes:[]});
    saveGoals(goals);
    document.getElementById("goalName").value="";
    document.getElementById("motivation").value="";
    displayGoals();
}

function displayGoals(){
    const container = document.getElementById("goalsContainer");
    container.innerHTML = "";
    const goals = getGoals();
    goals.forEach(function(goal){
        const div = document.createElement("div");
        div.className = "widget";
        div.innerHTML = `
            <h3>${goal.name}</h3>
            <p>Streak: ${goal.streak}</p>
            <button class="complete-btn" data-id="${goal.id}">Complete Today</button>
            <button class="view-btn" data-id="${goal.id}">View</button>
        `;
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
    document.querySelectorAll(".view-btn").forEach(function(btn){
        btn.addEventListener("click", function(){
            openGoal(btn.dataset.id);
        });
    });
}
function openGoal(id){
    window.location.href=`goal.html?id=${id}`;
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
displayGoals();