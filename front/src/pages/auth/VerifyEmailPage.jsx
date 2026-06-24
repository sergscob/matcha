import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { api } from "../../api/client";

export function VerifyEmailPage() {
  const { token } = useParams();
  const [status, setStatus] = useState("pending");
  const [error, setError] = useState(null);
  const requested = useRef(false);

  useEffect(() => {
    if (requested.current) return;
    requested.current = true;

    api.post("/auth/verify-email", { token })
      .then(() => setStatus("success"))
      .catch(err => {
        setError(err.message);
        setStatus("error");
      });
  }, [token]);

  return (
    <div className="card">
      <h1>Email verification</h1>

      {status === "pending" && <p className="status">Verifying your email...</p>}

      {status === "success" && (
        <>
          <p>Your email has been verified. You can log in now.</p>
          <Link to="/login">Go to log in</Link>
        </>
      )}

      {status === "error" && <p className="error">{error}</p>}
    </div>
  );
}
