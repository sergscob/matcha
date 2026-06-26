import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { api } from "../../api/client";
import { Spinner } from "../../components/Spinner";

export function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await api.post("/auth/reset-password", { token, password });
      navigate("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="card">
      <h1>Reset password</h1>

      <form onSubmit={handleSubmit}>
        <label>
          New password
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            minLength={8}
            maxLength={30}
            pattern="(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,30}"
            title="8-30 characters, with at least one letter, one digit, and one special character."
            required
            autoComplete="new-password"
          />
          <small className="field-hint">8-30 characters, with at least one letter, one digit, and one special character.</small>
        </label>

        {error && <p className="error">{error}</p>}

        <button type="submit" disabled={submitting}>
          {submitting && <Spinner />}
          {submitting ? "Updating..." : "Update password"}
        </button>
      </form>

      <p><Link to="/login">Back to log in</Link></p>
    </div>
  );
}
