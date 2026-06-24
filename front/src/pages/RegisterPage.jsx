import { useState } from "react";
import { Link } from "react-router-dom";

import { api } from "../api/client";

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
          <input type="email" name="email" value={form.email} onChange={handleChange} required />
        </label>

        <label>
          Username
          <input type="text" name="username" value={form.username} onChange={handleChange} minLength={3} maxLength={30} required />
        </label>

        <label>
          First name
          <input type="text" name="firstName" value={form.firstName} onChange={handleChange} required />
        </label>

        <label>
          Last name
          <input type="text" name="lastName" value={form.lastName} onChange={handleChange} required />
        </label>

        <label>
          Password
          <input type="password" name="password" value={form.password} onChange={handleChange} minLength={8} required />
        </label>

        {error && <p className="error">{error}</p>}

        <button type="submit" disabled={submitting}>
          {submitting ? "Creating account..." : "Sign up"}
        </button>
      </form>

      <p>Already have an account? <Link to="/login">Log in</Link></p>
    </div>
  );
}
