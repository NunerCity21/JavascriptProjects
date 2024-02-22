document.addEventListener("DOMContentLoaded", function () {
    var pageLogo = document.getElementById("pageLogo");
    pageLogo.addEventListener("click", function() {
        location.reload();
    });
    
    var listsDropdown = document.getElementById("lists");
    
    // Load lists from local storage on page load
    loadListsFromLocalStorage();

    // New List Watcher
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

    // Dropdown change watcher
    var listsDropdown = document.getElementById("lists");
    listsDropdown.addEventListener("change", function () {
        var selectedListName = listsDropdown.value;

        // Remove the "Open A List" option and welcome div
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

        // Load tasks for the selected list
        loadTasks(selectedListName);

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
                document.getElementById("newTaskInput").value = '';
                // Add the task to the list and local storage
                addTaskToList(selectedListName, newTaskInput);

                // Reload tasks for the selected list
                loadTasks(selectedListName);
                // Reload the Task Remane
                initializeWatcher();
            });
        });

        // Ensure that tasksDiv exists before adding event listener
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
        
            // Clear Checked button click watcher
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
            console.error("Element with ID 'tasks' not found.");
        }

        var titleIcon = document.getElementById("titleIcon");
        titleIcon.addEventListener("click", function () {
            var titleText = document.getElementById("titleText");

            newName = titleText.innerText.trim(); // Trim used to get h3 text.

            // Check The Icon
            if (titleIcon.classList.contains("fa-pen-to-square")) {
                titleText.setAttribute("contenteditable", "true");
                titleIcon.classList.remove("fa-pen-to-square");
                titleIcon.classList.add("fa-floppy-disk");
                titleText.focus();

                oldName = newName
            } else if (titleIcon.classList.contains("fa-floppy-disk")) {
                //Check List name and char
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

        initializeWatcher();

        function initializeWatcher() {
            var taskIcons = document.querySelectorAll('.taskDiv .fa-pen-to-square.Task2');
            var currentlyEditedTask = null;
            taskIcons.forEach(function (editIcon) {
                editIcon.addEventListener('click', function () {
                    // var parentDiv = editIcon.parentNode.parentNode;
                    // console.log(parentDiv); // Log the parent element
                    // console.log(parentDiv.children[1].firstElementChild);
                    var taskTextElement = editIcon.parentNode.parentNode.children[1].firstElementChild;
                    console.log(taskTextElement);
        
                    if (currentlyEditedTask && currentlyEditedTask !== taskTextElement) {
                        alert("Only One Task Can Be Edited At A Time. Please Finish Editing Your Task Before Editing Another.");
                        return;
                    }
        
                    newName = taskTextElement.innerText.trim();
                    // Check The Icon
                    if (editIcon.classList.contains("fa-pen-to-square")) {
                        taskTextElement.setAttribute("contenteditable", "true");
                        editIcon.classList.remove("fa-pen-to-square");
                        editIcon.classList.add("fa-floppy-disk");
                        taskTextElement.focus();
                        currentlyEditedTask = taskTextElement;
                        oldName = newName
                    } else if (editIcon.classList.contains("fa-floppy-disk")) {
                        //Check List name and char
                        if (isTaskUsed(selectedListName, newName) ) { //Changes: Make sure this task name can be used. Change this to do that. Gotta get the list name too.
                            taskTextElement.innerText =  oldName;
                            taskTextElement.removeAttribute("contenteditable");
                            editIcon.classList.remove("fa-floppy-disk");
                            editIcon.classList.add("fa-pen-to-square");
                            currentlyEditedTask = null;
                            alert("This Task Name Has Already Been Used.");
                            return;
                        }
                        taskTextElement.removeAttribute("contenteditable");
                        editIcon.classList.remove("fa-floppy-disk");
                        editIcon.classList.add("fa-pen-to-square");
                            
                        updateTaskInList(selectedListName, oldName, newName);
                        // loadTasks(selectedListName);
                        currentlyEditedTask = null;
                    }
                });
            });
        }

        // Clear Checked button click watcher
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
    });

    // Task completion watcher
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


    



    // Load tasks from local storage for the selected list and add event listeners
    function loadTasks(listName) {
        var tasks = JSON.parse(localStorage.getItem(listName)) || [];
        var tasksDiv = document.getElementById("tasks");

        // Clear existing tasks in tasksDiv
        tasksDiv.innerHTML = '';

        // Create nameNewTask div and append it to tasksDiv
        var nameNewTaskDiv = document.createElement("div");
        nameNewTaskDiv.id = "nameNewTask";
        tasksDiv.appendChild(nameNewTaskDiv);

        // Render each task in the tasksDiv
        tasks.forEach(function (task, index) {
            var taskDiv = document.createElement("div");
            taskDiv.classList.add("taskDiv"); // Add a class to the task parent div
            taskDiv.draggable = true; // Add draggable attribute
            taskDiv.innerHTML = `
                <span> <input class="hover" type="checkbox" title="Click Checkbox To Clear Task!"> </span>
                <span class="taskMargin"> <p>${task}</p> </span>
                <span> <i class="fa-solid fa-pen-to-square Task2 hover"></i> </span>
            `;
            tasksDiv.appendChild(taskDiv);
        });

        // Ensure that taskFinish is always at the end
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

        // Add event listeners after loading tasks
        var clearCheckedBtn = document.getElementById("clearCheckedBtn");
        clearCheckedBtn.addEventListener("click", function () {
            var selectedListName = listsDropdown.value;
            var checkedTasks = document.querySelectorAll('#tasks div input[type="checkbox"]:checked');

            checkedTasks.forEach(function (checkbox) {
                var taskText = checkbox.parentNode.nextElementSibling.querySelector("p");
                if (taskText) {
                    var taskToRemove = taskText.textContent;
                    removeTaskFromList(selectedListName, taskToRemove);

                    // Remove the task from the DOM
                    var taskDiv = checkbox.closest('div');
                    taskDiv.parentNode.removeChild(taskDiv);
                }
            });
        });

        // Other event listeners can go here

        // Add drag-and-drop event listeners
        tasksDiv.addEventListener('dragstart', handleDragStart);
        tasksDiv.addEventListener('dragover', handleDragOver);
        tasksDiv.addEventListener('drop', handleDrop);

    }
    // Add a task to the list and local storage
    function addTaskToList(listName, task) {
        var tasks = JSON.parse(localStorage.getItem(listName)) || [];
        tasks.push(task);
        localStorage.setItem(listName, JSON.stringify(tasks));
    }

    // Check if a task has already been used in the list
    function isTaskUsed(listName, task) {
        var tasks = JSON.parse(localStorage.getItem(listName)) || [];
        return tasks.includes(task);
    }

    // Load lists from local storage on page load
    function loadListsFromLocalStorage() {
        var lists = JSON.parse(localStorage.getItem("lists")) || [];
        var optionsDropdown = document.getElementById("lists");

        // Display each list name in the dropdown
        lists.forEach(function (listName) {
            var newOption = `<option value="${listName}">${listName}</option>`;
            optionsDropdown.innerHTML += newOption;
        });
    }

    // Create HTML for naming a new list
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

    // Add submit listener for naming a new list
    function addSubmitListener() {
        var newListForm = document.getElementById("newListForm");
        newListForm.addEventListener("submit", function (event) {
            event.preventDefault(); // Prevent the default form submission behavior

            var currentInputValue = document.getElementById("newListInput");
            var userInput = currentInputValue.value;

            // Check if the list name is already used
            if (isListNameUsed(userInput)) {
                alert("This List Name Has Already Been Used.");
                return;
            }

            // Check if the list name is 12 characters or below
            if (userInput.length > 12) {
                alert("The List Name Must Be 12 Characters Or Lower.");
                return;
            }

            // Add the new list name to the array
            addListName(userInput);

            // Reload the page
            location.reload();
        });
    }

    // Check if a list name is already used
    function isListNameUsed(listName) {
        var lists = JSON.parse(localStorage.getItem("lists")) || [];
        return lists.includes(listName);
    }

    // Add a new list name to the array and local storage
    function addListName(listName) {
        var lists = JSON.parse(localStorage.getItem("lists")) || [];
        lists.push(listName);
        localStorage.setItem("lists", JSON.stringify(lists));
    }

    function deleteListAndTasks(listName) {
        // Remove list from local storage
        var lists = JSON.parse(localStorage.getItem("lists")) || [];
        var index = lists.indexOf(listName);
        if (index !== -1) {
            lists.splice(index, 1);
            localStorage.setItem("lists", JSON.stringify(lists));
        }

        // Remove tasks associated with the list from local storage
        localStorage.removeItem(listName);
    }

    // Function to remove a task from the list and local storage
    function removeTaskFromList(listName, task) {
        var tasks = JSON.parse(localStorage.getItem(listName)) || [];
        var index = tasks.indexOf(task);
        
        if (index !== -1) {
            tasks.splice(index, 1);
            localStorage.setItem(listName, JSON.stringify(tasks));
        }
    }

    // Function to update local storage after modifying tasks
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

    // Update tasks associated with the list in local storage
    var tasks = JSON.parse(localStorage.getItem(oldListName)) || [];
    localStorage.removeItem(oldListName);
    localStorage.setItem(newListName, JSON.stringify(tasks));
    // location.reload();
}


// Drag and Drop Handlers
var draggedTask = null;

function handleDragStart(event) {
    console.log("handleDragStart");
    draggedTask = event.target;
    event.dataTransfer.effectAllowed = 'move';

    // Store the task content in a data attribute
    event.dataTransfer.setData('text/plain', draggedTask.querySelector("p").textContent);
}

function handleDragOver(event) {
    console.log("handleDragOver");
    if (event.preventDefault) {
        event.preventDefault(); // Necessary. Allows us to drop.
    }
    event.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDragEnter(event) {
    console.log("handleDragEnter");
    event.target.classList.add('over'); // Add the 'over' class to the task being dragged over
}

function handleDragLeave(event) {
    console.log("handleDragLeave");
    event.target.classList.remove('over'); // Remove the 'over' class when leaving a task
}

// Handle the drop event
function handleDrop(event) {
    if (event.stopPropagation) {
        event.stopPropagation(); // Stops some browsers from redirecting.
    }

    // Don't do anything if dropping the task onto itself
    if (draggedTask !== event.target) {
        // Find the parent task div for the dragged and target tasks
        // Inside the handleDrop function
        var draggedTaskDiv = draggedTask.closest('.taskDiv');
        var targetTaskDiv = event.target.closest('.taskDiv');


        // Check if the required parent task divs exist
        if (draggedTaskDiv && targetTaskDiv) {
            // Swap the text content of the dragged task and the target task
            var draggedText = draggedTaskDiv.querySelector(".taskMargin p").textContent;
            var targetText = targetTaskDiv.querySelector(".taskMargin p").textContent;

            draggedTaskDiv.querySelector(".taskMargin p").textContent = targetText;
            targetTaskDiv.querySelector(".taskMargin p").textContent = draggedText;

            // Update the local storage order based on the new order
            updateTaskOrder();
        } else {
            console.error("Parent task divs not found for dragged or target task.");
            console.log("draggedTask:", draggedTask);
            console.log("event.target:", event.target);
            console.log("draggedTaskDiv:", draggedTaskDiv);
            console.log("targetTaskDiv:", targetTaskDiv);

            // Reset draggedTask to null after the drop
            draggedTask = null;
            return false;
        }
    }

    // Reset draggedTask to null after the drop
    draggedTask = null;
    return false;
}




// Update the local storage order based on the new order
function updateTaskOrder() {
    var selectedListName = document.getElementById("lists").value;
    var tasksDiv = document.getElementById("tasks");
    var tasks = [];

    // Iterate through the tasks and update the tasks array
    var taskDivs = tasksDiv.querySelectorAll('div:not(#nameNewTask)');
    taskDivs.forEach(function (taskDiv) {
        var taskText = taskDiv.querySelector(".taskMargin p");
        if (taskText) {
            tasks.push(taskText.textContent);
        }
    });

    // Update local storage with the new task order
    localStorage.setItem(selectedListName, JSON.stringify(tasks));
}




function handleDragEnd(event) {
    console.log("handleDragEnd");
    // Remove the 'over' class from all tasks when the dragging ends
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