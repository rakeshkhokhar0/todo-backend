const defaultHeaders = {
  "Content-Type": "application/json",
};

async function request(path, options = {}) {
  const response = await fetch(path, {
    headers: defaultHeaders,
    ...options,
  });

  if (!response.ok) {
    let message = "Something went wrong";

    try {
      const errorData = await response.json();
      message = errorData.detail || message;
    } catch {
      message = response.statusText || message;
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export function getTasks(filter = "all") {
  if (filter === "active") {
    return request("/tasks/?completed=false");
  }

  if (filter === "completed") {
    return request("/tasks/?completed=true");
  }

  return request("/tasks/");
}

export function createTask(payload) {
  return request("/tasks/create", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateTask(taskId, payload) {
  return request(`/tasks/${taskId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function completeTask(taskId) {
  return request(`/tasks/${taskId}/complete`, {
    method: "PATCH",
  });
}

export function deleteTask(taskId) {
  return request(`/tasks/${taskId}`, {
    method: "DELETE",
  });
}
