document.addEventListener("DOMContentLoaded", function () {
    // Go Back To The Welcome Page On "To-Do List" Text Click
    var pageLogo = document.getElementById("pageLogo");
    pageLogo.addEventListener("click", function() {
        location.reload();
    });
    
    var listsDropdown = document.getElementById("lists");
    
    // Get Lists Saved In Local Storage
    loadListsFromLocalStorage();

    // Watcher To Make New List
    var newListButton = document.getElementById("newListBtn");
    newListButton.addEventListener("click", function () {
        var welcomeDiv = document.getElementById("welcome");
        var nameListDiv = document.getElementById("nameList");
        
        if (welcomeDiv) {
            welcomeDiv.remove();
            nameListDiv.innerHTML = createNameListHtml();
            addSubmitListener();
        } else {
            // Check For A List Open

            var currentOpenList = document.getElementById("idAddTask");

            if (currentOpenList) {
                //title
                var title = document.getElementById("title");
                var titleContent = title.children;

                if (titleContent) {
                    while (title.firstChild) {
                        title.removeChild(title.firstChild);
                    }
                }
                //tasks
                var tasks = document.getElementById("tasks");
                var tasksContent = tasks.children;

                if (tasksContent) {
                    while (tasks.firstChild) {
                        tasks.removeChild(tasks.firstChild);
                    }
                }

                var reAdd = document.createElement('option');
                reAdd.id = "removeMe";
                reAdd.value = "choose";
                reAdd.textContent = "Open A List";

                var lists = document.getElementById("lists");
                lists.insertBefore(reAdd, lists.firstChild);
                reAdd.selected = true;
            }

            nameListDiv.innerHTML = createNameListHtml();
            addSubmitListener();
        }
    });

    // Watcher To See When A List Is Choosen From The Dropdown
    var listsDropdown = document.getElementById("lists");
    listsDropdown.addEventListener("change", function () {
        var selectedListName = listsDropdown.value;

        // Remove Welcome Div And The Open A List Option
        var openListOption = document.querySelector('#lists option[value="choose"]');
        if (openListOption) {
            openListOption.remove();
        }

        var welcomeDiv = document.getElementById("welcome");
        if (welcomeDiv) {
            welcomeDiv.remove();
        }

        var nameList = document.getElementById("nameList");
        var nameNewListContent = nameList.children;

        if (nameNewListContent) {
            while (nameList.firstChild) {
                nameList.removeChild(nameList.firstChild);
            }
        }

        // Add The Content Inside The Title Id
        var title = document.getElementById("title");
        title.innerHTML = `
            <div>
                <span> <h3 id="titleText">${selectedListName}</h3> </span>
                <span> <i class="fa-solid fa-pen-to-square hover mx-2" id="titleIcon"></i> </span>
            </div>
            <div id="idAddTask">
                <i class="fa-solid fa-plus hover ml-auto" id="addTask"></i>
            </div>
        `;

        // Reload The Tasks In The Div (Up To Date)
        loadTasks(selectedListName);

        // Add A New Task To The List
        var addTask = document.getElementById("addTask");
        addTask.addEventListener("click", function () {
            var nameNewTask = document.getElementById("nameNewTask");
            nameNewTask.innerHTML = `
                <input type="text" id="newTaskInput" class="form-control" placeholder="Enter A Task Name">
                <i class="fa-regular fa-floppy-disk hover saveLogo" id="saveTask"></i>
            `;

            var saveTask = document.getElementById("saveTask");
            saveTask.addEventListener("click", function () {
                // Handle saving the task (add to list and local storage)
                var newTaskInput = document.getElementById("newTaskInput").value;

                // Check if the task has already been used in the list
                if (isTaskUsed(selectedListName, newTaskInput)) {
                    alert("This Task Name Has Already Been Used in the List.");
                    return;
                }

                if (newTaskInput === '' || /^\s+$/.test(newTaskInput)) {
                    alert("Cannot Submit Because Nothing Was Submitted.");
                    return;
                }

                document.getElementById("newTaskInput").value = '';
                // Add the task to the list and local storage
                addTaskToList(selectedListName, newTaskInput);

                // Reload tasks for the selected list
                loadTasks(selectedListName);
                // Reload the Task Remane
                initializeWatcher();
            });
        });

        // Strik Through Tasks When Checked | Check Div First
        var tasksDiv = document.getElementById("tasks");
        if (tasksDiv) {
            tasksDiv.addEventListener("change", function (event) {
                var target = event.target;

                if (target.type === "checkbox") {
                    var taskText = target.parentNode.nextElementSibling.querySelector("p");
                    if (taskText) {
                        taskText.style.textDecoration = target.checked ? "line-through" : "none";
                    }
                }
            });
        
            // Clear All The Checked Tasks
            var clearCheckedBtn = document.getElementById("taskFinish").querySelector("#clearCheckedBtn");
            if (clearCheckedBtn) {
                clearCheckedBtn.addEventListener("click", function () {
                    var selectedListName = listsDropdown.value;
                    var checkedTasks = document.querySelectorAll('#tasks input[type="checkbox"]:checked');
    
                    checkedTasks.forEach(function (checkbox) {
                        var taskText = checkbox.parentNode.nextElementSibling.querySelector("p");
                        if (taskText) {
                            var taskToRemove = taskText.textContent;
                            removeTaskFromList(selectedListName, taskToRemove);
    
                            // Remove the task from the DOM
                            var taskDiv = checkbox.parentNode.parentNode;
                            taskDiv.parentNode.removeChild(taskDiv);
                        }
                    });
                });
            }
        } else {
            console.warn("Element with ID 'tasks' not found.");
        }
        
        // Change List Name
        var titleIcon = document.getElementById("titleIcon");
        titleIcon.addEventListener("click", function () {
            var titleText = document.getElementById("titleText");

            newName = titleText.innerText.trim(); // Trim To Get Text

            // Current Icon = Edit Then Allow Edit | Current Icon = Save Then Run Checks And Save
            if (titleIcon.classList.contains("fa-pen-to-square")) {
                titleText.setAttribute("contenteditable", "true");
                titleIcon.classList.remove("fa-pen-to-square");
                titleIcon.classList.add("fa-floppy-disk");
                titleText.focus();

                oldName = newName
            } else if (titleIcon.classList.contains("fa-floppy-disk")) {
                // Check For List Name, Length, And Space With Text
                if (isListNameUsed(newName) ) {
                    titleText.innerText =  oldName;
                    titleText.removeAttribute("contenteditable");
                    titleIcon.classList.remove("fa-floppy-disk");
                    titleIcon.classList.add("fa-pen-to-square");
                    alert("This List Name Has Already Been Used.");
                    return;
                }
                if (newName.length > 12) {
                    titleText.innerText =  oldName;
                    titleText.removeAttribute("contenteditable");
                    titleIcon.classList.remove("fa-floppy-disk");
                    titleIcon.classList.add("fa-pen-to-square");
                    alert("The List Name Must Be 12 Characters Or Lower.");
                    return;
                }
                if (newName === '' || /^\s+$/.test(newName)) {
                    titleText.innerText =  oldName;
                    titleText.removeAttribute("contenteditable");
                    titleIcon.classList.remove("fa-floppy-disk");
                    titleIcon.classList.add("fa-pen-to-square");
                    alert("Cannot Submit Because Nothing Was Submitted.");
                    return;
                }
                titleText.removeAttribute("contenteditable");
                titleIcon.classList.remove("fa-floppy-disk");
                titleIcon.classList.add("fa-pen-to-square");
                updateListName(selectedListName, newName);

                var options = listsDropdown.options;
                for (var i = 0; i < options.length; i++) {
                    if (options[i].value === oldName) {
                        options[i].value = newName;
                        options[i].text = newName;
                        break;
                    }
                }
            }
        });

        initializeWatcher(); // Used To Start The Watch Of Task Name Editing. (Error: When The Tasks Are Reloaded; Breaks. On Reload It Loses Contact With The Original Tasks And Doesnt Connect To The New Tasks. There For Making This A Function And Running It On Js File Startup & Task Reload Should Make It Work As Long As There Is A List Open.)

        function initializeWatcher() {
            var taskIcons = document.querySelectorAll('.taskDiv .fa-pen-to-square.Task2');
            var currentlyEditedTask = null;
            taskIcons.forEach(function (editIcon) {
                editIcon.addEventListener('click', function () {
                    // var parentDiv = editIcon.parentNode.parentNode;
                    // console.log(parentDiv); // Log the parent element
                    // console.log(parentDiv.children[1].firstElementChild);
                    var taskTextElement = editIcon.parentNode.parentNode.children[1].firstElementChild;
                    // console.log(taskTextElement);
        
                    if (currentlyEditedTask && currentlyEditedTask !== taskTextElement) {
                        alert("Only One Task Can Be Edited At A Time. Please Finish Editing Your Task Before Editing Another.");
                        return;
                    }
        
                    newName = taskTextElement.innerText.trim();
                    // If Icon = Edit Then Make Editable | If Icon = Save Then Run Checks And Save
                    if (editIcon.classList.contains("fa-pen-to-square")) {
                        taskTextElement.setAttribute("contenteditable", "true");
                        editIcon.classList.remove("fa-pen-to-square");
                        editIcon.classList.add("fa-floppy-disk");
                        taskTextElement.focus();
                        currentlyEditedTask = taskTextElement;
                        oldName = newName
                    } else if (editIcon.classList.contains("fa-floppy-disk")) {
                        // Check If Task Name Has Been Used, As Well As Checking There Is Space With Text
                        if (isTaskUsed(selectedListName, newName) ) {
                            taskTextElement.innerText =  oldName;
                            taskTextElement.removeAttribute("contenteditable");
                            editIcon.classList.remove("fa-floppy-disk");
                            editIcon.classList.add("fa-pen-to-square");
                            currentlyEditedTask = null;
                            alert("This Task Name Has Already Been Used.");
                            return;
                        }
                        if (newName === '' || /^\s+$/.test(newName)) {
                            taskTextElement.innerText =  oldName;
                            taskTextElement.removeAttribute("contenteditable");
                            editIcon.classList.remove("fa-floppy-disk");
                            editIcon.classList.add("fa-pen-to-square");
                            currentlyEditedTask = null;
                            alert("Cannot Submit Because Nothing Was Submitted.");
                            return;
                        }
                        taskTextElement.removeAttribute("contenteditable");
                        editIcon.classList.remove("fa-floppy-disk");
                        editIcon.classList.add("fa-pen-to-square");
                            
                        updateTaskInList(selectedListName, oldName, newName);
                        // loadTasks(selectedListName);
                        currentlyEditedTask = null; // Used To Control Tasks Currently Edited
                    }
                });
            });
        }

        // Watcher: When The Clear Tasks Get Clicked
        var clearCheckedBtn = document.getElementById("taskFinish").querySelector("#clearCheckedBtn");
        if (clearCheckedBtn) {
            clearCheckedBtn.addEventListener("click", function () {
                var selectedListName = listsDropdown.value;
                var checkedTasks = document.querySelectorAll('#tasks input[type="checkbox"]:checked');

                checkedTasks.forEach(function (checkbox) {
                    var taskText = checkbox.parentNode.nextElementSibling.querySelector("p");
                    if (taskText) {
                        var taskToRemove = taskText.textContent;
                        removeTaskFromList(selectedListName, taskToRemove);

                        var taskDiv = checkbox.parentNode.parentNode;
                        taskDiv.parentNode.removeChild(taskDiv);
                    }
                });
            });
        } else {
            console.warn("Element with ID 'clearCheckedBtn' not found.");
        }
    });

    var tasksDiv = document.getElementById("tasks");
    tasksDiv.addEventListener("change", function (event) {
        var target = event.target;

        if (target.type === "checkbox") {
            var taskText = target.parentNode.nextElementSibling.querySelector("p");
            if (taskText) {
                taskText.style.textDecoration = target.checked ? "line-through" : "none";
            }
        }
    });

    document.addEventListener("click", function (event) {
        var target = event.target;
        if (target.id === "deleteListBtn") {
            var selectedListName = listsDropdown.value;
            if (confirm("Are you sure you want to delete this list and all of its tasks?")) {
                deleteListAndTasks(selectedListName);
                location.reload(); // Reload the page after deletion
            }
        }
    });


    



    // Load Tasks From Local Storage For The Selected List And Add Event Listeners
    function loadTasks(listName) {
        var tasks = JSON.parse(localStorage.getItem(listName)) || [];
        var tasksDiv = document.getElementById("tasks");

        // Clear Current Tasks In The Tasks Div
        tasksDiv.innerHTML = '';

        var nameNewTaskDiv = document.createElement("div");
        nameNewTaskDiv.id = "nameNewTask";
        tasksDiv.appendChild(nameNewTaskDiv);

        // Render Tasks 
        tasks.forEach(function (task, index) {
            var taskDiv = document.createElement("div");
            taskDiv.classList.add("taskDiv");
            taskDiv.draggable = true; // Draggable For Orginize
            taskDiv.innerHTML = `
                <span> <input class="hover" type="checkbox" title="Click Checkbox To Clear Task!"> </span>
                <span class="taskMargin"> <p>${task}</p> </span>
                <span> <i class="fa-solid fa-pen-to-square Task2 hover"></i> </span>
            `;
            tasksDiv.appendChild(taskDiv);
        });

        // Task Finish Will Be The Last Div
        tasksDiv.innerHTML += `
            <div id="taskFinish">
                <button class="btn" id="clearCheckedBtn">Clear Checked</button>
                <button class="btn" id="deleteListBtn">Delete List</button>
                <button class="btn" id="helpBtn">Need Help?</button>
            </div>
        `;

        var helpBtn = document.getElementById("helpBtn");
        helpBtn.addEventListener("click", function () {
            window.open("help.html", "_blank");
        });

        // Click Watcher For The Clear Tasks Button, After Its Loaded
        var clearCheckedBtn = document.getElementById("clearCheckedBtn");
        clearCheckedBtn.addEventListener("click", function () {
            var selectedListName = listsDropdown.value;
            var checkedTasks = document.querySelectorAll('#tasks div input[type="checkbox"]:checked');

            checkedTasks.forEach(function (checkbox) {
                var taskText = checkbox.parentNode.nextElementSibling.querySelector("p");
                if (taskText) {
                    var taskToRemove = taskText.textContent;
                    removeTaskFromList(selectedListName, taskToRemove);

                    var taskDiv = checkbox.closest('div');
                    taskDiv.parentNode.removeChild(taskDiv);
                }
            });
        });

        // Drag And Drop Listeners
        tasksDiv.addEventListener('dragstart', handleDragStart);
        tasksDiv.addEventListener('dragover', handleDragOver);
        tasksDiv.addEventListener('drop', handleDrop);

    }
    // Add A Task To The Current Open List
    function addTaskToList(listName, task) {
        var tasks = JSON.parse(localStorage.getItem(listName)) || [];
        tasks.push(task);
        localStorage.setItem(listName, JSON.stringify(tasks));
    }

    // Make Sure The Task Hasn't Been Used In The Current List
    function isTaskUsed(listName, task) {
        var tasks = JSON.parse(localStorage.getItem(listName)) || [];
        return tasks.includes(task);
    }

    // Load Lists From Local Storage On Page Load
    function loadListsFromLocalStorage() {
        var lists = JSON.parse(localStorage.getItem("lists")) || [];
        var optionsDropdown = document.getElementById("lists");

        // Add Lists To The Dropdown
        lists.forEach(function (listName) {
            var newOption = `<option value="${listName}">${listName}</option>`;
            optionsDropdown.innerHTML += newOption;
        });
    }

    // Div To Make A New List
    function createNameListHtml() {
        return `
            <h3>Name Your New List!</h3>
            <p>You'll be able to make changes once you name your new list! A list name can only be 12 characters long.</p>
            <form id="newListForm">
                <input type="text" id="newListInput" class="form-control" placeholder="Enter A List Name">
                <button id="newListNameBtn" type="submit" class="btn2 mt-2">Submit</button>
            </form>
        `;
    }

    // Submit Button Used On List Name
    function addSubmitListener() {
        var newListForm = document.getElementById("newListForm");
        newListForm.addEventListener("submit", function (event) {
            event.preventDefault(); // Don't Allow Default Beheavor

            var currentInputValue = document.getElementById("newListInput");
            var userInput = currentInputValue.value;

            // Check List Name To See If It's Been Used.
            if (isListNameUsed(userInput)) {
                alert("This List Name Has Already Been Used.");
                return;
            }

            // Check The Char Amount
            if (userInput.length > 12) {
                alert("The List Name Must Be 12 Characters Or Lower.");
                return;
            }

            if (userInput === '' || /^\s+$/.test(userInput)) {
                alert("Cannot Submit Because Nothing Was Submitted.");
                return;
            }

            // Add The List To The Array Of Lists
            addListName(userInput);

            // Reload the page
            location.reload();
        });
    }

    // Functions:  List And Task Managment & Drag And Drop Managment

    function isListNameUsed(listName) {
        var lists = JSON.parse(localStorage.getItem("lists")) || [];
        return lists.includes(listName);
    }

    function addListName(listName) {
        var lists = JSON.parse(localStorage.getItem("lists")) || [];
        lists.push(listName);
        localStorage.setItem("lists", JSON.stringify(lists));
    }

    function deleteListAndTasks(listName) {
        var lists = JSON.parse(localStorage.getItem("lists")) || [];
        var index = lists.indexOf(listName);
        if (index !== -1) {
            lists.splice(index, 1);
            localStorage.setItem("lists", JSON.stringify(lists));
        }

        localStorage.removeItem(listName);
    }

    function removeTaskFromList(listName, task) {
        var tasks = JSON.parse(localStorage.getItem(listName)) || [];
        var index = tasks.indexOf(task);
        
        if (index !== -1) {
            tasks.splice(index, 1);
            localStorage.setItem(listName, JSON.stringify(tasks));
        }
    }

    function updateLocalStorage(listName) {
        var tasksDiv = document.getElementById("tasks");
        var tasks = [];
        var taskElements = tasksDiv.querySelectorAll('div:not(#nameNewTask)');

        taskElements.forEach(function (taskElement) {
            var taskText = taskElement.querySelector("p");
            if (taskText) {
                tasks.push(taskText.textContent);
            }
        });

        localStorage.setItem(listName, JSON.stringify(tasks));
    }
});

function addClearCheckedEventListener() {
    var clearCheckedBtn = document.getElementById("taskFinish").querySelector("#clearCheckedBtn");
    if (clearCheckedBtn) {
        clearCheckedBtn.addEventListener("click", function () {
            var selectedListName = listsDropdown.value;
            var checkedTasks = document.querySelectorAll('#tasks input[type="checkbox"]:checked');

            checkedTasks.forEach(function (checkbox) {
                var taskText = checkbox.parentNode.nextElementSibling.querySelector("p");
                if (taskText) {
                    var taskToRemove = taskText.textContent;
                    removeTaskFromList(selectedListName, taskToRemove);

                    // Remove the task from the DOM
                    var taskDiv = checkbox.parentNode.parentNode;
                    taskDiv.parentNode.removeChild(taskDiv);
                }
            });
        });
    } else {
        console.error("Element with ID 'clearCheckedBtn' not found.");
    }
}

function updateListName(oldListName, newListName) {
    var lists = JSON.parse(localStorage.getItem("lists")) || [];
    var index = lists.indexOf(oldListName);
    if (index !== -1) {
        lists[index] = newListName;
        localStorage.setItem("lists", JSON.stringify(lists));
    }

    var tasks = JSON.parse(localStorage.getItem(oldListName)) || [];
    localStorage.removeItem(oldListName);
    localStorage.setItem(newListName, JSON.stringify(tasks));
    // location.reload();
}


// Drag And Drop Handlers
var draggedTask = null;

function handleDragStart(event) {
    // console.log("handleDragStart");
    draggedTask = event.target;
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', draggedTask.querySelector("p").textContent);
}

function handleDragOver(event) {
    // console.log("handleDragOver");
    if (event.preventDefault) {
        event.preventDefault();
    }
    event.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDragEnter(event) {
    // console.log("handleDragEnter");
    event.target.classList.add('over');
}

function handleDragLeave(event) {
    // console.log("handleDragLeave");
    event.target.classList.remove('over');
}

// Handle the drop event
function handleDrop(event) {
    if (event.stopPropagation) {
        event.stopPropagation();
    }

    if (draggedTask !== event.target) {
        var draggedTaskDiv = draggedTask.closest('.taskDiv');
        var targetTaskDiv = event.target.closest('.taskDiv');


        if (draggedTaskDiv && targetTaskDiv) {
            var draggedText = draggedTaskDiv.querySelector(".taskMargin p").textContent;
            var targetText = targetTaskDiv.querySelector(".taskMargin p").textContent;

            draggedTaskDiv.querySelector(".taskMargin p").textContent = targetText;
            targetTaskDiv.querySelector(".taskMargin p").textContent = draggedText;

            updateTaskOrder();
        } else {
            console.error("Parent task divs not found for dragged or target task.");
            console.warn("draggedTask:", draggedTask);
            console.warn("event.target:", event.target);
            console.warn("draggedTaskDiv:", draggedTaskDiv);
            console.warn("targetTaskDiv:", targetTaskDiv);

            draggedTask = null;
            return false;
        }
    }

    draggedTask = null;
    return false;
}

function updateTaskOrder() {
    var selectedListName = document.getElementById("lists").value;
    var tasksDiv = document.getElementById("tasks");
    var tasks = [];

    var taskDivs = tasksDiv.querySelectorAll('div:not(#nameNewTask)');
    taskDivs.forEach(function (taskDiv) {
        var taskText = taskDiv.querySelector(".taskMargin p");
        if (taskText) {
            tasks.push(taskText.textContent);
        }
    });

    localStorage.setItem(selectedListName, JSON.stringify(tasks));
}

function handleDragEnd(event) {
    console.log("handleDragEnd");
    var taskDivs = document.querySelectorAll('#tasks div');
    taskDivs.forEach(function (taskDiv) {
        taskDiv.classList.remove('over');
    });
}

function updateTaskInList(listName, oldTask, newTask) {
    var tasks = JSON.parse(localStorage.getItem(listName)) || [];
    var index = tasks.indexOf(oldTask);
    
    if (index !== -1) {
        tasks[index] = newTask;
        localStorage.setItem(listName, JSON.stringify(tasks));
    }
}