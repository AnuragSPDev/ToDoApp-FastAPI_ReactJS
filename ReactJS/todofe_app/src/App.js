import React, { useEffect, useState } from 'react';
import './App.css'; // Import the CSS file

function App() {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [tasks, setTasks] = useState([]);

  const fetchTasks = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/tasks/');
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error("There was an error fetching the tasks!", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newTask = { title, desc, is_completed: isCompleted };

      const response = await fetch('http://127.0.0.1:8000/task/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTask),
      });

      if (!response.ok) {
        throw new Error('Failed to create task');
      }

      const createdTask = await response.json();
      setTitle('');
      setDesc('');
      setIsCompleted(false);
      fetchTasks();  // Refresh tasks list after adding a new task
    } catch (error) {
      console.error("There was an error creating the task!", error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleUpdate = async (taskId, updatedStatus) => {
    try {
      const updatedTask = { 
        // title, 
        // desc, 
        is_completed: updatedStatus 
      }

      const response = await fetch(`http://127.0.0.1:8000/task/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTask),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }
      fetchTasks();
    } catch (error) {
      console.error("There was an error creating the task!", error);
    }

  }

  const handleDelete = async (taskId) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/delete_task/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to delete task');
      }
      fetchTasks();
    } catch (error) {
      console.error("There was an error creating the task!", error);
    }

  }

  return (
    <div className="App">
      <h1>Todo List</h1>

      {/* Task Form */}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          // required
        />
        <input
          type="text"
          placeholder="Description"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          // required
        />
        <label>
          Completed:
          <input
            type="checkbox"
            checked={isCompleted}
            onChange={(e) => setIsCompleted(e.target.checked)}
          />
        </label>
        <button type="submit">Add Task</button>
      </form>

      {/* List of tasks */}
      <h2>Task List:</h2>
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            <strong>Title: {task.title}</strong>
            <p>Description: {task.desc}</p>
            <p>{task.is_completed ? "Completed" : "Not Completed"}</p>

            {/* Task update button */}
            <button className='btn btn-primary' onClick={() => handleUpdate(task.id, !task.is_completed)}>
              {task.is_completed ? 'Incomplete' : 'Complete'}
            </button>

            {/* Task delete button */}
            <button className='btn btn-danger' onClick={() => handleDelete(task.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
