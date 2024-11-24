// index.js
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
app.use(cors({ origin: '*' }));
// Allow requests from localhost:3000 (or from any frontend address)
/*
app.use(cors({
    origin: 'http://localhost:3000', // Allow requests from your frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed methods
}));
*/

console.log('Serving static files from:', path.join(__dirname, 'public'));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));


const absoluteVideoPath = '/Users/williamthesing/Documents/Soph Lab - Applied Computing/task-manager-backend/public/videos';
app.use('/videos', express.static(absoluteVideoPath));
console.log('Serving videos from:', absoluteVideoPath);



mongoose.connect('mongodb+srv://thesingwilliam:8GncJUAJrrMYVJAj@cluster0.absju.mongodb.net/taskmanager', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('Could not connect to MongoDB Atlas:', err));

// Load Task model
const Task = require('./models/Task'); // Assuming your Task model is in the 'models' folder

app.use(express.json()); // Middleware to parse JSON bodies

// POST route to create a new task
app.post('/tasks', async (req, res) => {
    try {
      const { name, description, priority, tags, dueDate, status } = req.body;
  
      const task = new Task({
        name,
        description,
        priority,
        tags,
        dueDate,
        status,
      });

      await task.save();
      res.status(201).json(task);  // Respond with the created task
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
});

// GET all tasks with sorting, filtering, and archived status
app.get('/tasks', async (req, res) => {
    try {
        const { priority, category, status, sortBy, archived } = req.query; // Get filter and sorting params
        const filter = {};
        
        if (priority) filter.priority = priority;
        if (category) filter.tags = { $in: [category] }; // Assuming "tags" is an array
        if (status) filter.status = status;

        // Check for archived filter (convert to boolean)
        if (archived !== undefined) filter.archived = archived === 'true';

        const sortOptions = sortBy ? { [sortBy]: 1 } : {}; // Sorting by specified field
        
        const tasks = await Task.find(filter).sort(sortOptions); // Retrieves tasks with filters and sorting

        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving tasks', error });
    }
});


// Get a specific task by ID
app.get('/tasks/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const task = await Task.findById(id);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.status(200).json(task);
    } catch (error) {
        res.status(400).json({ error: 'Invalid task ID' });
    }
});

// PUT /tasks/:id - Update a task
app.put('/tasks/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, priority, tags, dueDate, status, completionPercentage, recurrence } = req.body;

        // Update task with the provided fields
        const updatedTask = await Task.findByIdAndUpdate(
            id,
            {
                name,
                description,
                priority,
                tags,
                dueDate,
                status,
                completionPercentage,
                recurrence,
            },
            { new: true, runValidators: true } // Return the updated document
        );

        if (!updatedTask) {
            return res.status(404).json({ error: 'Task not found' });
        }

        res.json(updatedTask);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update task', details: error.message });
    }
});

// PATCH route to archive or unarchive a task
app.patch('/tasks/:id/archive', async (req, res) => {
    const { id } = req.params;

    try {
        const task = await Task.findById(id);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        // Toggle the archived status
        task.archived = !task.archived;
        await task.save();

        res.status(200).json(task);  // Respond with the updated task
    } catch (error) {
        res.status(500).json({ message: 'Error archiving task', error });
    }
});



// DELETE /tasks/:id - Delete a task
app.delete('/tasks/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Find and delete the task
        const deletedTask = await Task.findByIdAndDelete(id);

        if (!deletedTask) {
            return res.status(404).json({ error: 'Task not found' });
        }

        res.json({ message: 'Task deleted successfully', task: deletedTask });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete task', details: error.message });
    }
});

// Server setup
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

