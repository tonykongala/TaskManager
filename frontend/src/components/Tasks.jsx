import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import Loader from './utils/Loader';
import Tooltip from './utils/Tooltip';

const Tasks = () => {
  const authState = useSelector(state => state.authReducer);
  const [tasks, setTasks] = useState([]);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [fetchData, { loading }] = useFetch();

  const fetchTasks = useCallback(() => {
    const config = { url: "/tasks", method: "get", headers: { Authorization: authState.token } };
    fetchData(config, { showSuccessToast: false }).then(data => {
      const sortedTasks = data.tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setTasks(sortedTasks);
    });
  }, [authState.token, fetchData]);

  useEffect(() => {
    if (!authState.isLoggedIn) return;
    fetchTasks();
  }, [authState.isLoggedIn, fetchTasks]);

  const handleDelete = (id) => {
    const config = { url: `/tasks/${id}`, method: "delete", headers: { Authorization: authState.token } };
    fetchData(config).then(() => fetchTasks());
  };

  const handleSelectTask = (taskId) => {
    setSelectedTasks(prev =>
      prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleMarkSelectedCompleted = async () => {
    for (let taskId of selectedTasks) {
      const config = {
        url: `/tasks/${taskId}`,
        method: "put",
        headers: { Authorization: authState.token },
        data: { completed: true }
      };
      await fetchData(config, { showSuccessToast: false });
    }
    setSelectedTasks([]);
    fetchTasks();
  };

  const handleMarkSelectedIncomplete = async () => {
    for (let taskId of selectedTasks) {
      const config = {
        url: `/tasks/${taskId}`,
        method: "put",
        headers: { Authorization: authState.token },
        data: { completed: false }
      };
      await fetchData(config, { showSuccessToast: false });
    }
    setSelectedTasks([]);
    fetchTasks();
  };

  const filteredTasks = tasks.filter(task => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      task.description.toLowerCase().includes(query) ||
      task.priority.toLowerCase() === query ||
      (task.user?.name.toLowerCase().includes(query) ?? false);

    const matchesCategory = (
      selectedCategory === "All" && !task.completed ||
      selectedCategory === "Completed" && task.completed ||
      selectedCategory === "Pending" && !task.completed ||
      selectedCategory === "Personal" && !task.completed && task.category.toLowerCase() === "personal" ||
      selectedCategory === "Professional" && !task.completed && task.category.toLowerCase() === "professional"
    );

    return matchesCategory && matchesSearch;
  });

  const pendingGrouped = { High: [], Medium: [], Low: [] };
  if (selectedCategory === "Pending") {
    for (const task of filteredTasks) {
      pendingGrouped[task.priority || "Medium"].push(task);
    }
  }

  return (
    <div className="flex flex-col md:flex-row gap-8 my-8 mx-auto max-w-[1200px] p-4 bg-[#111111] text-white min-h-screen">
      
      {/* Sidebar */}
      <div className="md:w-1/4 bg-[#1a1a1a] p-4 border rounded-md shadow-md h-fit">
        <h3 className="text-lg font-bold mb-4">Categories</h3>
        <div className="flex md:flex-col gap-4">
          {['All', 'Personal', 'Professional', 'Completed', 'Pending'].map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-md font-medium transition ${selectedCategory === category ? 'bg-blue-600 text-white' : 'bg-gray-800 hover:bg-gray-700'}`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Search Field */}
        <div className="mt-6">
          <input
            type="text"
            placeholder="Search by name, priority, or task..."
            className="w-full px-3 py-2 rounded-md bg-[#222] text-white border border-gray-600 focus:outline-none focus:ring focus:ring-blue-600"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="md:w-3/4">
        <div className='flex items-center justify-between mb-4'>
          <h2 className='text-2xl font-bold'>{selectedCategory} Tasks ({filteredTasks.length})</h2>
          <Link to="/tasks/add" className="bg-blue-500 text-white hover:bg-blue-600 font-medium rounded-md px-4 py-2">
            + Add new task
          </Link>
        </div>

        {selectedTasks.length > 0 && (
          <div className="flex gap-4 mb-4">
            {selectedTasks.every(id => tasks.find(t => t._id === id)?.completed === false) && (
              <button className='bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md font-medium transition' onClick={handleMarkSelectedCompleted}>
                Mark Selected as Completed
              </button>
            )}
            {selectedTasks.every(id => tasks.find(t => t._id === id)?.completed === true) && (
              <button className='bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md font-medium transition' onClick={handleMarkSelectedIncomplete}>
                Mark Selected as Incomplete
              </button>
            )}
          </div>
        )}

        {loading ? (
          <Loader />
        ) : (
          <div>
            {filteredTasks.length === 0 ? (
              <div className='w-full h-[300px] flex items-center justify-center text-red-400'>
                <span>No tasks found</span>
              </div>
            ) : (
              selectedCategory === "Pending" ? (
                Object.entries(pendingGrouped).map(([priority, tasks]) => (
                  <div key={priority}>
                    {tasks.length > 0 && (
                      <>
                        <h3 className='text-lg font-bold mt-6'>{priority} Priority</h3>
                        {tasks.map((task, index) => (
                          <TaskCard key={task._id} task={task} index={index} handleSelectTask={handleSelectTask} selectedTasks={selectedTasks} handleDelete={handleDelete} />
                        ))}
                      </>
                    )}
                  </div>
                ))
              ) : (
                filteredTasks.map((task, index) => (
                  <TaskCard key={task._id} task={task} index={index} handleSelectTask={handleSelectTask} selectedTasks={selectedTasks} handleDelete={handleDelete} />
                ))
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const TaskCard = ({ task, index, handleSelectTask, selectedTasks, handleDelete }) => (
  <div className='bg-[#1a1a1a] my-4 p-4 text-gray-300 rounded-md shadow-md'>
    <div className='flex items-center'>
      <input type="checkbox" checked={selectedTasks.includes(task._id)} onChange={() => handleSelectTask(task._id)} className='mr-4' />
      <span className={`font-medium ${task.completed ? 'line-through text-green-400' : ''}`}>Task #{index + 1}</span>
      <Tooltip text={"Edit this task"} position={"top"}>
        <Link to={`/tasks/${task._id}`} className='ml-auto mr-2 text-green-400 cursor-pointer'><i className="fa-solid fa-pen"></i></Link>
      </Tooltip>
      <Tooltip text={"Delete this task"} position={"top"}>
        <span className='text-red-400 cursor-pointer' onClick={() => handleDelete(task._id)}><i className="fa-solid fa-trash"></i></span>
      </Tooltip>
    </div>
    <div className='whitespace-pre mt-2'>{task.description}</div>
    {task.dueDate && (<p className='text-sm mt-2'>Due: {new Date(task.dueDate).toLocaleDateString('en-CA')}</p>)}
    <p className='text-sm mt-2'>Priority: {task.priority || "Medium"}</p>
    <p className='text-sm mt-2'>Category: {task.category || "Personal"}</p>
    {task.project?.name && (<p className='text-sm mt-2 text-gray-400'>Project: {task.project.name}</p>)}
    {task.createdAt && (<p className='text-sm text-gray-500 mt-2'>Created On: {new Date(task.createdAt).toLocaleDateString('en-CA')}</p>)}
    {task.user && (<p className='text-sm text-gray-500'>Created by: {task.user.name}</p>)}
    {task.isDueSoon && (<p className='text-sm text-red-500 font-semibold mt-2'>⚠️ Due Soon!</p>)}
  </div>
);

export default Tasks;
