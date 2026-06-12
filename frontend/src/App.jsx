import { useEffect, useState } from "react";
import {
  completeTask,
  createTask,
  deleteTask,
  getTasks,
  updateTask,
} from "./api";

const emptyForm = {
  name: "",
  description: "",
};

const filters = ["all", "active", "completed"];

function formatDate(value) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState("all");
  const [remainingCount, setRemainingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [workingId, setWorkingId] = useState(null);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [feedback, setFeedback] = useState({
    type: "info",
    message: "Ready to organize your day.",
  });

  useEffect(() => {
    loadTasks(filter);
  }, [filter]);

  async function loadTasks(selectedFilter) {
    try {
      setLoading(true);
      const [taskData, activeTasks] = await Promise.all([
        getTasks(selectedFilter),
        getTasks("active"),
      ]);
      setTasks(taskData);
      setRemainingCount(activeTasks.length);
    } catch (error) {
      setFeedback({ type: "error", message: error.message });
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setFormData(emptyForm);
    setEditingId(null);
    setIsComposerOpen(false);
  }

  function startEdit(task) {
    setEditingId(task.id);
    setFormData({
      name: task.name,
      description: task.description || "",
    });
    setSelectedTaskId(null);
    setIsComposerOpen(true);
    setFeedback({
      type: "info",
      message: `Editing "${task.name}"`,
    });
  }

  function openComposer() {
    setEditingId(null);
    setFormData(emptyForm);
    setSelectedTaskId(null);
    setIsComposerOpen(true);
    setFeedback({
      type: "info",
      message: "Create a fresh task for your list.",
    });
  }

  function selectedTask() {
    return tasks.find((task) => task.id === selectedTaskId) || null;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim() || null,
    };

    if (!payload.name) {
      setFeedback({ type: "error", message: "Task name is required." });
      return;
    }

    try {
      setSubmitting(true);

      if (editingId) {
        await updateTask(editingId, payload);
        setFeedback({ type: "success", message: "Task updated successfully." });
      } else {
        await createTask(payload);
        setFeedback({ type: "success", message: "Task created successfully." });
      }

      resetForm();
      await loadTasks(filter);
    } catch (error) {
      setFeedback({ type: "error", message: error.message });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleComplete(taskId) {
    try {
      setWorkingId(taskId);
      await completeTask(taskId);
      if (selectedTaskId === taskId) {
        setSelectedTaskId(null);
      }
      await loadTasks(filter);
      setFeedback({ type: "success", message: "Task marked as completed." });
    } catch (error) {
      setFeedback({ type: "error", message: error.message });
    } finally {
      setWorkingId(null);
    }
  }

  async function handleDelete(taskId) {
    try {
      setWorkingId(taskId);
      await deleteTask(taskId);

      if (editingId === taskId) {
        resetForm();
      }

      if (selectedTaskId === taskId) {
        setSelectedTaskId(null);
      }

      await loadTasks(filter);
      setFeedback({ type: "success", message: "Task deleted." });
    } catch (error) {
      setFeedback({ type: "error", message: error.message });
    } finally {
      setWorkingId(null);
    }
  }

  return (
    <div className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <main className="layout">
        <section className="hero panel">
          <div>
            <p className="eyebrow">Todo command center</p>
            <h1>Pulse Tasks</h1>
            <p className="hero-copy">
              A focused workspace for browsing your tasks, opening details when
              you need them, and keeping the next priority in view.
            </p>
          </div>

          <div className="hero-progress">
            <div className="progress-ring">
              <div className="progress-label">
                <strong>{remainingCount}</strong>
                <span>{remainingCount === 1 ? "Task remaining" : "Tasks remaining"}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="panel list-panel">
          <div className="board-topbar">
            <div>
              <p className="eyebrow">Task board</p>
              <h2>Track the day in motion</h2>
            </div>
            <button className="add-task-button" onClick={openComposer} type="button">
              <span>+</span>
            </button>
          </div>

          <div className="section-heading board-controls">
            <div className="filter-row">
              {filters.map((filterName) => (
                <button
                  key={filterName}
                  type="button"
                  className={filterName === filter ? "filter-chip active" : "filter-chip"}
                  onClick={() => setFilter(filterName)}
                >
                  {filterName}
                </button>
              ))}
            </div>
            <div className={`feedback inline-feedback feedback-${feedback.type}`}>
              {feedback.message}
            </div>
          </div>

          {loading ? (
            <div className="empty-state">Loading tasks...</div>
          ) : tasks.length === 0 ? (
            <div className="empty-state">
              No tasks in this view yet. Use the `+` button to add one.
            </div>
          ) : (
            <div className="task-list">
              {tasks.map((task) => {
                const isBusy = workingId === task.id;

                return (
                  <article
                    key={task.id}
                    className={task.is_completed ? "task-card completed" : "task-card"}
                    onClick={() => setSelectedTaskId(task.id)}
                  >
                    <div className="task-main">
                      <div className="task-title-row">
                        <h3>{task.name}</h3>
                        <span className="status-pill">
                          {task.is_completed ? "Completed" : "In progress"}
                        </span>
                      </div>

                      <span className="task-date">
                        Created {formatDate(task.created_at)}
                      </span>
                    </div>

                    <div className="task-actions" onClick={(event) => event.stopPropagation()}>
                      <button
                        type="button"
                        className="ghost-button"
                        onClick={() => startEdit(task)}
                        disabled={isBusy}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="ghost-button"
                        onClick={() => handleDelete(task.id)}
                        disabled={isBusy}
                      >
                        {isBusy ? "Working..." : "Delete"}
                      </button>
                      {!task.is_completed ? (
                        <button
                          type="button"
                          className="primary-button compact"
                          onClick={() => handleComplete(task.id)}
                          disabled={isBusy}
                        >
                          Complete
                        </button>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {isComposerOpen ? (
        <div className="modal-backdrop" onClick={resetForm}>
          <aside className="panel modal-card composer-card" onClick={(event) => event.stopPropagation()}>
            <div className="section-heading">
              <div>
                <p className="eyebrow">{editingId ? "Update task" : "New task"}</p>
                <h2>{editingId ? "Refine the details" : "Capture the next step"}</h2>
              </div>
              <button className="ghost-button icon-close" onClick={resetForm} type="button">
                x
              </button>
            </div>

            <form className="task-form" onSubmit={handleSubmit}>
              <label>
                <span>Task name</span>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Finish API integration"
                  maxLength={120}
                />
              </label>

              <label>
                <span>Description</span>
                <textarea
                  rows="5"
                  value={formData.description}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  placeholder="Add any extra notes for this task"
                  maxLength={500}
                />
              </label>

              <button className="primary-button" type="submit" disabled={submitting}>
                {submitting
                  ? "Saving..."
                  : editingId
                    ? "Update task"
                    : "Create task"}
              </button>
            </form>
          </aside>
        </div>
      ) : null}

      {selectedTask() ? (
        <div className="modal-backdrop" onClick={() => setSelectedTaskId(null)}>
          <section
            className="panel modal-card detail-card"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="section-heading">
              <div>
                <p className="eyebrow">Task detail</p>
                <h2>{selectedTask().name}</h2>
              </div>
              <button
                className="ghost-button icon-close"
                onClick={() => setSelectedTaskId(null)}
                type="button"
              >
                x
              </button>
            </div>

            <div className="detail-meta">
              <span className="status-pill">
                {selectedTask().is_completed ? "Completed" : "In progress"}
              </span>
              <span className="task-date">
                Created {formatDate(selectedTask().created_at)}
              </span>
            </div>

            <div className="detail-copy">
              {selectedTask().description || "No description added for this task yet."}
            </div>

            <div className="task-actions">
              <button
                type="button"
                className="ghost-button"
                onClick={() => startEdit(selectedTask())}
              >
                Edit
              </button>
              <button
                type="button"
                className="ghost-button"
                onClick={() => handleDelete(selectedTask().id)}
              >
                Delete
              </button>
              {!selectedTask().is_completed ? (
                <button
                  type="button"
                  className="primary-button compact"
                  onClick={() => handleComplete(selectedTask().id)}
                >
                  Complete
                </button>
              ) : null}
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
