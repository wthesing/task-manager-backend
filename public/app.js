// Set the API base URL (make sure this matches your backend URL)
const apiUrl = 'http://localhost:3000';


async function fetchTasks() {
    try {
        // Fetch active and archived tasks
        const [activeResponse, archivedResponse] = await Promise.all([
            fetch(`${apiUrl}/tasks?archived=false`),
            fetch(`${apiUrl}/tasks?archived=true`),
        ]);

        if (!activeResponse.ok || !archivedResponse.ok) {
            throw new Error('Failed to fetch tasks');
        }

        const activeTasks = await activeResponse.json();
        const archivedTasks = await archivedResponse.json();

        // Update Active Task List
        const activeTaskList = document.getElementById('task-list');
        activeTaskList.innerHTML = '';
        activeTasks.forEach((task) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <strong>${task.name}</strong><br>
                ${task.description}<br>
                <em>Due: ${new Date(task.dueDate).toLocaleDateString()}</em><br>
                <strong>Priority:</strong>
                <select onchange="updateTaskPriority('${task._id}', this.value)">
                    <option value="Low" ${task.priority === 'Low' ? 'selected' : ''}>Low</option>
                    <option value="Medium" ${task.priority === 'Medium' ? 'selected' : ''}>Medium</option>
                    <option value="High" ${task.priority === 'High' ? 'selected' : ''}>High</option>
                </select><br>
                <strong>Status:</strong>
                <select onchange="updateTaskStatus('${task._id}', this.value)">
                    <option value="pending" ${task.status === 'pending' ? 'selected' : ''}>Pending</option>
                    <option value="completed" ${task.status === 'completed' ? 'selected' : ''}>Completed</option>
                </select><br>
                <button onclick="archiveTask('${task._id}')">Archive</button>
                <button onclick="deleteTask('${task._id}')">Delete</button>
            `;
            activeTaskList.appendChild(li);
        });

        // Update Archived Task List
        const archivedTaskList = document.getElementById('archived-task-list');
        archivedTaskList.innerHTML = '';
        archivedTasks.forEach((task) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <strong>${task.name}</strong><br>
                ${task.description}<br>
                <em>Due: ${new Date(task.dueDate).toLocaleDateString()}</em><br>
                <strong>Priority:</strong> ${task.priority}<br>
                <strong>Status:</strong> ${task.status}<br>
                <button onclick="deleteTask('${task._id}')">Delete</button>
            `;
            archivedTaskList.appendChild(li);
        });
    } catch (error) {
        console.error('Error in fetchTasks:', error.message);
    }
}

function showCategoryImages(category) {
    const imageContainer = document.getElementById('imageContainer');
    
    if (!imageContainer) {
        console.error('Image container not found!');
        return;
    }
    
    imageContainer.innerHTML = ''; // Clear previous images

    const images = getImagesForCategory(category); // Get images for selected category
    images.forEach(image => {
        const imgElement = document.createElement('img');
        imgElement.src = `images/${image.filename}`;
        imgElement.alt = category;

        // Add a data-subcategory to the image
        imgElement.setAttribute('data-subcategory', image.subcategory);

        // Add a click event to populate the Tag field with subcategory
        imgElement.addEventListener('click', function() {
            const tagField = document.getElementById('task-tags');
            tagField.value = imgElement.getAttribute('data-subcategory');  // Set the Tag field to the subcategory name
        });

        imageContainer.appendChild(imgElement);
    });
}

// Update the getImagesForCategory function to include filenames and subcategories
function getImagesForCategory(category) {
    const imageMap = {
        'School': [
            { filename: 'Assignment.webp', subcategory: 'Assignment' },
            { filename: 'Paper-Project.webp', subcategory: 'Paper/Project' },
            { filename: 'Test.webp', subcategory: 'Test' }
        ],
        'Work': [
            { filename: 'Work - Collaboration.webp', subcategory: 'Collaboration' },
            { filename: 'Work - Project Management.webp', subcategory: 'Project Management' },
            { filename: 'Focus.webp', subcategory: 'Focus' }
        ],
        'Personal': [
            { filename: 'Personal - Errands.webp', subcategory: 'Errands' },
            { filename: 'Fitness.webp', subcategory: 'Fitness' },
            { filename: 'SelfCare.webp', subcategory: 'Self Care' }
        ]
    };

    return imageMap[category] || []; // Return images for category, default to an empty array if not found
}

// Function to handle category selection change
function handleCategoryChange() {
    // Hide all subcategory image groups
    document.getElementById("school-images").style.display = "none";
    document.getElementById("work-images").style.display = "none";
    document.getElementById("personal-images").style.display = "none";

    // Show the images for the selected category
    const selectedCategory = this.value;
    document.getElementById(selectedCategory.toLowerCase() + "-images").style.display = "block";
}


// Function for handling clicks on subcategory images to assign tags

function handleImageClick() {
    const selectedTag = this.alt; // Use the alt attribute for the subcategory name
    document.getElementById("task-tags").value = selectedTag; // Set the value of the task tags field
}



// When the page is loaded and DOM is fully ready
document.addEventListener("DOMContentLoaded", function () {
    // Add event listener for category change
    document.getElementById("category").addEventListener("change", handleCategoryChange);

    // Add event listeners for image clicks
    const subcategoryImages = document.querySelectorAll(".subcategory-img");
    subcategoryImages.forEach(image => {
        image.addEventListener("click", handleImageClick);
    });
});


// Example for handling task creation (make sure this matches your form and input IDs)
document.getElementById('task-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    // Capture form data
    const newTask = {
        name: document.getElementById('task-name').value.trim(),
        description: document.getElementById('task-description').value.trim(),
        dueDate: document.getElementById('task-due-date').value,
        priority: document.getElementById('task-priority').value,
        status: document.getElementById('task-status').value,
        tags: document.getElementById('task-tags').value.trim(), // Tag from category images
    };

    try {
        // Send new task to the backend
        const response = await fetch(`${apiUrl}/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newTask),
        });

        if (!response.ok) {
            throw new Error(`Failed to add task: ${response.status}`);
        }

        // Clear form fields after successful submission
        document.getElementById('task-form').reset();
        document.getElementById('task-tags').value = ''; // Reset tag field

        // Refresh Task List tab
        fetchTasks();
    } catch (error) {
        console.error('Error adding task:', error.message);
    }
});


// Function to create a new task
async function createTask(event) {
    event.preventDefault();

    const taskName = document.getElementById('task-name').value;
    const taskDescription = document.getElementById('task-description').value;
    const taskDueDate = document.getElementById('task-due-date').value;
    const taskPriority = document.getElementById('task-priority').value; // Get the selected priority
    // const taskCompletion = document.getElementById('task-completion').value; // Get the completion percentage
    const taskCompletion = document.getElementById('task-completion')?.value || 0;
    const taskStatus = document.getElementById('task-status').value;
    // const taskTags = document.getElementById('task-tags').value.split(',').map(tag => tag.trim()); // Get and split tags
    const taskTags = document.getElementById('task-tags')?.value.split(',').map(tag => tag.trim()) || [];

    const newTask = {
        name: taskName,
        description: taskDescription,
        dueDate: taskDueDate,
        priority: taskPriority,  // Include the selected priority
        completionPercentage: taskCompletion || 0, // Default to 0 if not provided
        status: taskStatus,
        tags: taskTags,
        archived: false,
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newTask),
        });

        const task = await response.json();
        fetchTasks(); // Refresh the task list
        document.getElementById('task-form').reset(); // Reset the form
    } catch (error) {
        console.error('Error creating task:', error);
    }
}

async function archiveTask(taskId) {
    try {
        const response = await fetch(`${apiUrl}/tasks/${taskId}/archive`, {
            method: 'PATCH',
        });

        if (!response.ok) {
            throw new Error('Failed to archive task');
        }

        fetchTasks(); // Refresh tasks
    } catch (error) {
        console.error('Error archiving task:', error.message);
    }
}

// Function to update task status
async function updateTaskStatus(taskId, newStatus) {
    try {
        const response = await fetch(`${apiUrl}/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: newStatus }),
        });

        if (response.ok) {
            console.log('Task status updated successfully.');
            fetchTasks(); // Refresh the task list
        } else {
            console.error('Failed to update task status:', await response.json());
        }
    } catch (error) {
        console.error('Error updating task status:', error);
    }
}

// Function to switch between tabs
function showTab(tabName) {
    // Hide all tab content
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach((tab) => {
        tab.style.display = tab.id === tabName ? 'block' : 'none';
    });

    // Handle video playback for video tabs
    const videos = document.querySelectorAll('video');
    videos.forEach((video) => {
        video.pause(); // Pause all videos
        if (video.closest('.tab-content') && video.closest('.tab-content').id === tabName) {
            video.currentTime = 0; // Reset video to start
            video.play(); // Play the video in the active tab
        }
    });

    // Fetch tasks if switching to "Task List"
    if (tabName === 'taskList') {
        fetchTasks();
    }
}

  

// Make sure the default tab is the "Create Task" tab when the page loads
document.addEventListener("DOMContentLoaded", function () {
    showTab("create"); // Default to "Create Task"
  });

  async function deleteTask(taskId) {
    try {
        const response = await fetch(`${apiUrl}/tasks/${taskId}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error('Failed to delete task');
        }

        fetchTasks(); // Refresh tasks
    } catch (error) {
        console.error('Error deleting task:', error.message);
    }
}

// Add event listener to the form to create tasks
document.getElementById('task-form').addEventListener('submit', createTask);
