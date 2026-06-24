const API_URL = import.meta.env.VITE_API_URL;

async function request(path, { method = "GET", body, formData } = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    credentials: "include",
    headers: formData ? undefined : { "Content-Type": "application/json" },
    body: formData || (body ? JSON.stringify(body) : undefined)
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

export const api = {
  get: path => request(path),
  post: (path, body) => request(path, { method: "POST", body }),
  patch: (path, body) => request(path, { method: "PATCH", body }),
  put: (path, body) => request(path, { method: "PUT", body }),
  delete: path => request(path, { method: "DELETE" }),
  upload: (path, formData) => request(path, { method: "POST", formData })
};
