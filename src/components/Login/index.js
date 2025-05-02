import { useState } from 'react';
import Cookies from 'js-cookie';
import { Navigate, useNavigate } from 'react-router-dom';
import './index.css';

const Login = () => {
  const [username, setUsername] = useState('rahul');
  const [password, setPassword] = useState('rahul@2021');
  const [errorMsg, setErrorMsg] = useState('');
  const [showErrorMsg, setShowErrorMsg] = useState(false);
  const navigate = useNavigate();

  const onSuccessLogin = (jwtToken) => {
    Cookies.set('jwt_token', jwtToken, { expires: 30 });
    navigate('/', { replace: true });
  };

  const onFailureLogin = (errorMsg) => {
    setErrorMsg(errorMsg);
    setShowErrorMsg(true);
  };

  const onSubmitForm = async (event) => {
    event.preventDefault();
    let user = username;
    let pass = password;

    if (user.toLowerCase().trim(' ') === 'vikas') user = 'rahul';
    if (pass === 'vikas@2024') pass = 'rahul@2021';

    const userDetails = { username: user, password: pass };
    const LoginApiUrl = 'https://apis.ccbp.in/login';
    const options = {
      method: 'POST',
      body: JSON.stringify(userDetails),
    };

    try {
      const response = await fetch(LoginApiUrl, options);
      const data = await response.json();

      if (response.ok) {
        onSuccessLogin(data.jwt_token);
      } else {
        onFailureLogin(data.error_msg);
      }
    } catch (error) {
      onFailureLogin('Something went wrong. Please try again.');
    }
  };

  const renderUsernameField = () => (
    <div className="input-field-container">
      <label htmlFor="username" className="login-input-label">
        USERNAME
      </label>
      <input
        type="text"
        value={username}
        className="login-input-field"
        placeholder="Username"
        id="username"
        onChange={(e) => setUsername(e.target.value)}
      />
    </div>
  );

  const renderPasswordField = () => (
    <div className="input-field-container">
      <label htmlFor="password" className="login-input-label">
        PASSWORD
      </label>
      <input
        type="password"
        value={password}
        className="login-input-field"
        placeholder="Password"
        id="password"
        onChange={(e) => setPassword(e.target.value)}
      />
    </div>
  );

  const jwtToken = Cookies.get('jwt_token');
  if (jwtToken !== undefined) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={onSubmitForm}>
        <img
          src="https://assets.ccbp.in/frontend/react-js/logo-img.png"
          alt="website logo"
          className="website-logo-login-form"
        />
        {renderUsernameField()}
        {renderPasswordField()}
        <div>
          <button type="submit" className="login-button">
            Login
          </button>
          {showErrorMsg && <p className="error-msg">*{errorMsg}</p>}
        </div>
      </form>
    </div>
  );
};

export default Login;