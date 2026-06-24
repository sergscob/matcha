import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/useAuth";
import { Spinner } from "../../components/Spinner";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await login(form.username, form.password);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="card">
      <h1>Log in</h1>

      <form onSubmit={handleSubmit}>
        <label>
          Username
          <input type="text" name="username" value={form.username} onChange={handleChange} required autoComplete="username" maxLength={30} />
        </label>

        <label>
          Password
          <input type="password" name="password" value={form.password} onChange={handleChange} required autoComplete="current-password" maxLength={128} />
        </label>

        {error && <p className="error">{error}</p>}

        <button type="submit" disabled={submitting}>
          {submitting && <Spinner />}
          {submitting ? "Logging in..." : "Log in"}
        </button>
      </form>

      <p><Link to="/forgot-password">Forgot your password?</Link></p>
      <p>No account yet? <Link to="/register">Sign up</Link></p>
    </div>
  );
}
