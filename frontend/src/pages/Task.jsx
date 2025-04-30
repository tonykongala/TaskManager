// Task.jsx
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Textarea } from '../components/utils/Input';
import Loader from '../components/utils/Loader';
import useFetch from '../hooks/useFetch';
import MainLayout from '../layouts/MainLayout';
import validateManyFields from '../validations';
import CommentSection from '../components/CommentSection';

const Task = () => {
  const authState = useSelector(state => state.authReducer);
  const navigate = useNavigate();
  const [fetchData, { loading }] = useFetch();
  const { taskId } = useParams();

  const mode = taskId === undefined ? "add" : "update";
  const [task, setTask] = useState(null);

  const [formData, setFormData] = useState({
    description: "",
    dueDate: "",
    priority: "",
    category: "",
    projectName: ""
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    document.title = mode === "add" ? "Add Task" : "Update Task";
  }, [mode]);

  useEffect(() => {
    if (mode === "update") {
      const config = {
        url: `/tasks/${taskId}`,
        method: "get",
        headers: { Authorization: authState.token }
      };
      fetchData(config, { showSuccessToast: false }).then((data) => {
        setTask(data.task);
        setFormData({
          description: data.task.description,
          dueDate: data.task.dueDate ? data.task.dueDate.substring(0, 10) : "",
          priority: data.task.priority || "",
          category: data.task.category || "",
          projectName: data.task.project?.name || ""
        });
      });
    }
  }, [mode, authState, taskId, fetchData]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleReset = (e) => {
    e.preventDefault();
    if (task) {
      setFormData({
        description: task.description,
        dueDate: task.dueDate ? task.dueDate.substring(0, 10) : "",
        priority: task.priority || "",
        category: task.category || "",
        projectName: task.project?.name || ""
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = validateManyFields("task", { description: formData.description });
    setFormErrors({});

    if (!formData.priority || !formData.category) {
      alert("Please select both Priority and Category!");
      return;
    }

    if (formData.category === "Professional" && !formData.projectName.trim()) {
      alert("Please enter a project name for Professional tasks!");
      return;
    }

    if (errors.length > 0) {
      setFormErrors(errors.reduce((total, ob) => ({ ...total, [ob.field]: ob.err }), {}));
      return;
    }

    const config = {
      url: mode === "add" ? "/tasks" : `/tasks/${taskId}`,
      method: mode === "add" ? "post" : "put",
      data: formData,
      headers: { Authorization: authState.token }
    };

    fetchData(config).then(() => {
      navigate("/");
    });
  };

  const fieldError = (field) => (
    <p className={`mt-1 text-pink-400 text-sm ${formErrors[field] ? "block" : "hidden"}`}>
      <i className='mr-2 fa-solid fa-circle-exclamation'></i>
      {formErrors[field]}
    </p>
  );

  return (
    <MainLayout>
      <form className='m-auto my-16 max-w-[1000px] bg-[#1e1e1e] text-white p-8 border border-gray-700 shadow-md rounded-md'>
        {loading ? (
          <Loader />
        ) : (
          <>
            <h2 className='text-center mb-4 text-white'>{mode === "add" ? "Add New Task" : "Edit Task"}</h2>

            {/* Description */}
            <div className="mb-4">
              <label htmlFor="description" className="text-gray-300">Description</label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                placeholder="Write here.."
                onChange={handleChange}
                className="bg-[#2c2c2c] border border-gray-600 text-white"
              />
              {fieldError("description")}
            </div>

            {/* Due Date */}
            <div className="mb-4">
              <label htmlFor="dueDate" className="text-gray-300">Due Date</label>
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className="block w-full mt-2 px-3 py-2 bg-[#2c2c2c] text-white rounded border border-gray-600"
              />
            </div>

            {/* Priority */}
            <div className="mb-4">
              <label htmlFor="priority" className="text-gray-300">Priority</label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="block w-full mt-2 px-3 py-2 bg-[#2c2c2c] text-white rounded border border-gray-600"
              >
                <option value="">-- Select Priority --</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            {/* Category */}
            <div className="mb-4">
              <label htmlFor="category" className="text-gray-300">Category</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="block w-full mt-2 px-3 py-2 bg-[#2c2c2c] text-white rounded border border-gray-600"
              >
                <option value="">-- Select Category --</option>
                <option value="Personal">Personal</option>
                <option value="Professional">Professional</option>
              </select>
            </div>

            {/* Project Name Input */}
            {formData.category === "Professional" && (
              <div className="mb-4">
                <label htmlFor="projectName" className="text-gray-300">Project Name</label>
                <input
                  type="text"
                  id="projectName"
                  name="projectName"
                  value={formData.projectName}
                  onChange={handleChange}
                  placeholder="Enter project name"
                  className="block w-full mt-2 px-3 py-2 bg-[#2c2c2c] text-white rounded border border-gray-600 focus:border-blue-500 outline-none"
                />
              </div>
            )}

            {/* Buttons */}
            <div className="mt-6">
              <button
                className='bg-blue-600 text-white px-4 py-2 font-medium rounded hover:bg-blue-700'
                onClick={handleSubmit}
              >
                {mode === "add" ? "Add Task" : "Update Task"}
              </button>
              <button
                type="button"
                className='ml-4 bg-red-600 text-white px-4 py-2 font-medium rounded hover:bg-red-700'
                onClick={() => navigate("/")}
              >
                Cancel
              </button>
              {mode === "update" && (
                <button
                  className='ml-4 bg-gray-600 text-white px-4 py-2 font-medium rounded hover:bg-gray-700'
                  onClick={handleReset}
                >
                  Reset
                </button>
              )}
            </div>
          </>
        )}
      </form>
      {mode === "update" && <CommentSection taskId={taskId} />}
    </MainLayout>
  );
};

export default Task;
