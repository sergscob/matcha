import { useState } from "react";
import { Link } from "react-router-dom";

import { api } from "../../api/client";
import { Spinner } from "../../components/Spinner";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await api.post("/auth/forgot-password", { email });
      setMessage(res.message);
    } catch (err) {
      setError(err.message);
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
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
          </label>

          {error && <p className="error">{error}</p>}

          <button type="submit" disabled={submitting}>
            {submitting && <Spinner />}
            {submitting ? "Sending..." : "Send reset link"}
          </button>
        </form>
      )}

      <p><Link to="/login">Back to log in</Link></p>
    </div>
  );
}
