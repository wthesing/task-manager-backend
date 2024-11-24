const mongoose = require('mongoose');

// Define the Task schema
const taskSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ""
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],  // Task priority levels
    default: 'Medium'
  },
  tags: {
    type: [String],  // Array of tags for categorizing tasks
    default: []
  },
  dueDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  // Flag to check if a task is overdue
  overdue: {
    type: Boolean,
    default: false
  },
  // For archiving completed tasks
  archived: {
    type: Boolean,
    default: false
  }
});

// Create a pre-save hook to check if the task is overdue
taskSchema.pre('save', function(next) {
  if (this.dueDate < Date.now() && this.status !== 'completed') {
    this.overdue = true;  // Set the overdue flag
  }
  next();
});

// Create the Task model
const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
