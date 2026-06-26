import { useState } from "react";
import { Link } from "react-router-dom";

import { api } from "../../api/client";
import { Spinner } from "../../components/Spinner";

const initialForm = { email: "", username: "", firstName: "", lastName: "", password: "" };

export function RegisterPage() {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState(null);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await api.post("/auth/register", form);
      setRegisteredEmail(form.email);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (registeredEmail) {
    return (
      <div className="card">
        <h1>Check your email</h1>
        <p>We sent a verification link to {registeredEmail}. Click it to activate your account.</p>
        <Link to="/login">Back to log in</Link>
      </div>
    );
  }

  return (
    <div className="card">
      <h1>Create an account</h1>

      <form onSubmit={handleSubmit}>
        <label>
          Email
          <input type="email" name="email" value={form.email} onChange={handleChange} required autoComplete="email" maxLength={254} />
        </label>

        <label>
          Login
          <input type="text" name="username" value={form.username} onChange={handleChange} minLength={4} maxLength={30} required autoComplete="username" />
        </label>

        <label>
          First name
          <input type="text" name="firstName" value={form.firstName} onChange={handleChange} required autoComplete="given-name" maxLength={50} />
        </label>

        <label>
          Last name
          <input type="text" name="lastName" value={form.lastName} onChange={handleChange} required autoComplete="family-name" maxLength={50} />
        </label>

        <label>
          Password
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
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
          {submitting ? "Creating account..." : "Sign up"}
        </button>
      </form>

      <p>Already have an account? <Link to="/login">Log in</Link></p>
    </div>
  );
}
