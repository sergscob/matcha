import { useState } from "react";
import { Link } from "react-router-dom";

import { api } from "../api/client";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await api.post("/auth/forgot-password", { email });
      setMessage(res.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="card">
      <h1>Forgot password</h1>

      {message ? (
        <p>{message}</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <label>
            Email
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </label>

          <button type="submit" disabled={submitting}>
            {submitting ? "Sending..." : "Send reset link"}
          </button>
        </form>
      )}

      <p><Link to="/login">Back to log in</Link></p>
    </div>
  );
}
