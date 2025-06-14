const addTaskBtn = document.getElementById("addTaskBtn");
const popup = document.getElementById("popup");
const taskForm = document.getElementById("taskForm");
const confirmation = document.getElementById("confirmation");
const taskList = document.getElementById("taskList");

let tasks = JSON.parse(localStorage.getItem("tasks") || "[]");

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function getDateStr(date) {
    return date.toISOString().split("T")[0];
}

function groupAndSortTasks(tasks) {
    const groups = {
        Today: [],
        Yesterday: [],
        Tomorrow: [],
        Others: {},
    };

    const now = new Date();
    const todayStr = getDateStr(now);

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const yesterdayStr = getDateStr(yesterday);

    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const tomorrowStr = getDateStr(tomorrow);

    tasks.forEach(task => {
        if (task.date === todayStr) {
            groups.Today.push(task);
        } else if (task.date === yesterdayStr) {
            groups.Yesterday.push(task);
        } else if (task.date === tomorrowStr) {
            groups.Tomorrow.push(task);
        } else {
            if (!groups.Others[task.date]) groups.Others[task.date] = [];
            groups.Others[task.date].push(task);
        }
    });

    for (const key of ["Today", "Yesterday", "Tomorrow"]) {
        groups[key].sort((a, b) => a.time.localeCompare(b.time));
    }
    Object.keys(groups.Others).forEach(date => {
        groups.Others[date].sort((a, b) => a.time.localeCompare(b.time));
    });

    return groups;
}

function renderTasks() {
    taskList.innerHTML = "";
    const grouped = groupAndSortTasks(tasks);
    const now = new Date();
    const todayStr = getDateStr(now);
    const allEmpty =
        grouped.Today.length === 0 &&
        grouped.Yesterday.length === 0 &&
        grouped.Tomorrow.length === 0 &&
        Object.values(grouped.Others).every(group => group.length === 0);

    if (allEmpty) {
        const emptyMsg = document.createElement("li");
        emptyMsg.textContent = "Add new task here...";
        emptyMsg.style.textAlign = "center";
        emptyMsg.style.color = "white";
        emptyMsg.style.fontStyle = "italic";
        emptyMsg.style.fontSize = "24px";
        taskList.appendChild(emptyMsg);
        return;
    }

    function renderGroup(title, taskArray) {
        if (taskArray.length === 0) return;

        const header = document.createElement("h3");
        header.textContent = title;
        header.style.margin = "15px 0 5px";
        taskList.appendChild(header);

        taskArray.forEach((task, index) => {
            const li = document.createElement("li");
            li.className = "task-item";

            const taskDateTime = new Date(${task.date}T${task.time});
            let statusHTML = "";
            let blurClass = "";

            if (task.completed) {
                statusHTML = <span class="status completed">✅ Completed</span>;
                blurClass = "blur";
            } else {
                if (task.date < todayStr) {
                    statusHTML = <span class="status overdue">❌ Overdue</span>;
                } else if (task.date === todayStr) {
                    if (now >= taskDateTime) {
                        statusHTML = <span class="status running">⏳ Running</span>;
                    } else {
                        statusHTML = <span class="status upcoming">🕓 Upcoming</span>;
                    }
                } else {
                    statusHTML = <span class="status upcoming">🕓 Upcoming</span>;
                }
            }

            li.innerHTML = `
        <label class="checklist-label ${blurClass}">
          <input type="checkbox" class="checklist-checkbox" ${task.completed ? "checked" : ""} data-index="${tasks.indexOf(task)}">
          <div class="task-content">
            <div class="task-title ${task.completed ? "completed" : ""}">${task.title}</div>
            <div class="task-date">${task.date} at ${task.time}</div>
          </div>
          ${statusHTML}
        </label>
        <button class="delete-btn" data-index="${tasks.indexOf(task)}">×</button>
      `;

            taskList.appendChild(li);
        });
    }

    renderGroup("Today", grouped.Today);
    renderGroup("Yesterday", grouped.Yesterday);
    renderGroup("Tomorrow", grouped.Tomorrow);
    Object.keys(grouped.Others).sort().forEach(date => {
        renderGroup(date, grouped.Others[date]);
    });
}

addTaskBtn.addEventListener("click", () => {
    popup.classList.remove("hidden");
    taskForm.classList.remove("hidden");
    confirmation.classList.add("hidden");
});

taskForm.addEventListener("submit", e => {
    e.preventDefault();
    const title = document.getElementById("taskTitle").value.trim();
    const date = document.getElementById("taskDate").value;
    const time = document.getElementById("taskTime").value;

    if (title && date && time) {
        tasks.push({ title, date, time, completed: false });
        saveTasks();
        renderTasks();

        taskForm.reset();
        taskForm.classList.add("hidden");
        confirmation.classList.remove("hidden");

        setTimeout(() => {
            confirmation.classList.add("hidden");
            popup.classList.add("hidden");
        }, 2000);
    }
});

taskList.addEventListener("change", (e) => {
    if (
        e.target.classList.contains("checklist-checkbox") &&
        !e.target.disabled &&
        !e.target.checked
    ) {
        const index = e.target.getAttribute("data-index");
        tasks[index].completed = true;
        tasks[index].completedAt = new Date().toISOString();
        saveTasks();
        renderTasks();
    }
});


taskList.addEventListener("click", (e) => {
    if (e.target.classList.contains("delete-btn")) {
        const index = e.target.getAttribute("data-index");
        tasks.splice(index, 1);
        saveTasks();
        renderTasks();
    }
});

document.getElementById("closePopupBtn").addEventListener("click", () => {
    popup.classList.add("hidden");
});

document.getElementById("okConfirmBtn").addEventListener("click", () => {
    confirmation.classList.add("hidden");
    popup.classList.add("hidden");
});

renderTasks();
