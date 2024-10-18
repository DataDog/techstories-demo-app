import { useState } from 'react';
import { useRouter } from 'next/router';
import { api } from "~/utils/api";

const SignupForm = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const mutation = api.user.createUser.useMutation({
    async onSuccess() {
      await router.push(`/`);
    },
  });

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();

    // Validate email domain
    // we do not want users to sign up with real data
    if (!email.endsWith('@example.com')) {
      setError('Email must end with @example.com');
      return;
    }

    console.log('Creating user...');
    mutation.mutate({ name: firstName + ' ' + lastName, email, password });
  };

  const formContainerStyle = {
    maxWidth: '400px',
    margin: '0 auto',
    padding: '1rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  };

  const formTitleStyle: React.CSSProperties = {
    textAlign: 'center',
    marginBottom: '1rem',
  };

  const formLabelStyle = {
    display: 'block',
    marginBottom: '0.5rem',
  };

  const formInputStyle = {
    width: '100%',
    padding: '0.5rem',
    marginBottom: '1rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
  };

  const formButtonStyle = {
    width: '100%',
    padding: '0.5rem',
    backgroundColor: '#0070f3',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  };

  const formButtonHoverStyle = {
    backgroundColor: '#005bb5',
  };

  const errorStyle = {
    color: 'red',
    marginBottom: '1rem',
  };

  return (
    <div style={formContainerStyle}>
      <h1 style={formTitleStyle}>Signup</h1>
      <form onSubmit={handleSubmit}>
        {error && <p style={errorStyle}>{error}</p>}
        <label style={formLabelStyle}>
          First Name:
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            style={formInputStyle}
          />
        </label>
        <label style={formLabelStyle}>
          Last Name:
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            style={formInputStyle}
          />
        </label>
        <label style={formLabelStyle}>
          Email:
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={formInputStyle}
          />
        </label>
        <label style={formLabelStyle}>
          Password:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={formInputStyle}
          />
        </label>
        <button
          type="submit"
          style={formButtonStyle}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = formButtonHoverStyle.backgroundColor)}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = formButtonStyle.backgroundColor)}
        >
          Signup
        </button>
      </form>
    </div>
  );
};

export default SignupForm;