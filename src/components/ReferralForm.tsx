import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export const ReferralForm = () => {
  const { data: session, status } = useSession();
  const [referral, setReferral] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [referrals, setReferrals] = useState<string[]>([]);

  const sendReferral = async () => {
    setMessage(null);
    setError(null);

    const response = await fetch("/api/referrals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: session?.user?.email,
        referral,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      setError(result.error || "Something went wrong. Please try again.");
    } else {
      setMessage(
        `✅ Nice! You just referred ${referral} and earned 10 points. Your total is now ${result.points} points.`
      );
      setReferral("");

      // Refresh referral history
      const history = await fetch(
        `/api/referrals/history?email=${session?.user?.email}`
      );
      const historyResult = await history.json();
      setReferrals(
        historyResult.referrals?.map((r: any) => r.referee_email) || []
      );
    }

    // Auto-clear success/error message after 5 seconds
    setTimeout(() => {
      setMessage(null);
      setError(null);
    }, 5000);
  };

    // If not authenticated, show a login prompt
    if (status === "unauthenticated" || !session) {
        return (
        <div className="container">
            <h2>Please log in to refer a friend</h2>
            <p>You must be signed in to access the referral program.</p>
            <style jsx>{`
            .container {
                max-width: 600px;
                margin: 50px auto;
                background: #fff;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
                font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
                text-align: center;
            }
            h2 {
                font-size: 20px;
                color: #333;
                margin-bottom: 10px;
            }
            p {
                color: #555;
            }
            `}</style>
        </div>
        );
    }

  return (
    <div className="container">
      <h1>Hi {session?.user?.name || "there"} 👋</h1>
      <h2>Earn Rewards by Referring Friends</h2>
      <p>
        Invite your friends to try TechStories and earn <strong>10 points</strong> for every signup!
        Accumulate points and unlock exclusive perks like merch, beta access, and more.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void sendReferral();
        }}
      >
        <div className="form-group">
          <label htmlFor="referral">
            Friend’s Email <span className="required">*</span>
          </label>
          <input
            type="email"
            id="referral"
            value={referral}
            onChange={(e) => setReferral(e.target.value)}
            placeholder="friend@example.com"
            required
          />
        </div>
        <button type="submit">Send Invite</button>
      </form>

      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}

      {referrals.length > 0 && (
        <div className="referral-history">
          <h3>Your Recent Referrals</h3>
          <ul>
            {referrals.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      )}

      <style jsx>{`
        .container {
          max-width: 600px;
          margin: 50px auto;
          background: #fff;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
          font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
        }
        h1 {
          margin-bottom: 10px;
          font-size: 24px;
          color: #222;
        }
        h2 {
          margin: 10px 0;
          font-size: 20px;
          color: #007bff;
        }
        p {
          color: #555;
          margin-bottom: 20px;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          margin-bottom: 20px;
        }
        label {
          font-weight: 500;
          margin-bottom: 8px;
          color: #333;
        }
        .required {
          color: red;
        }
        input[type="email"] {
          padding: 12px;
          font-size: 16px;
          border: 1px solid #ccc;
          border-radius: 6px;
        }
        input[type="email"]:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.2);
        }
        button {
          padding: 12px;
          background-color: #007bff;
          color: white;
          font-weight: bold;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }
        button:hover {
          background-color: #0056b3;
        }
        .success {
          color: green;
          margin-top: 10px;
          font-weight: 500;
        }
        .error {
          color: red;
          margin-top: 10px;
          font-weight: 500;
        }
        .referral-history {
          margin-top: 30px;
          background-color: #f9f9f9;
          padding: 15px;
          border-radius: 8px;
          border: 1px solid #eee;
        }
        .referral-history h3 {
          margin-bottom: 10px;
          color: #444;
        }
        .referral-history ul {
          list-style-type: disc;
          padding-left: 20px;
        }
        .referral-history li {
          margin-bottom: 5px;
        }
      `}</style>
    </div>
  );
};

export default ReferralForm;