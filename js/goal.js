// function getGoals(){
//     return JSON.parse(localStorage.getItem("goals")) || [];
// }
// function loadGoalPage(){
//     const id = new URLSearchParams(window.location.search).get("id");
//     const goals = getGoals();
//     const goal = goals.find(g=>g.id===id);
//     if(!goal) return;
//     document.getElementById("title").textContent = goal.name;
//     document.getElementById("motivation").textContent = goal.motivation;
//     const notesList = document.getElementById("notes");
//     notesList.innerHTML = "";
//     goal.notes.forEach(function(note){
//         const li = document.createElement("li");
//         li.textContent = note;
//         notesList.appendChild(li);
//     });
// }
// loadGoalPage();
