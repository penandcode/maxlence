import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import ResetPassword from './pages/ResetPassword';
import RequestPasswordReset from './pages/RequestPasswordReset';
import Dashboard from './pages/Dashboard'; 





  function App() {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/request-password-reset" element={<RequestPasswordReset />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/" element={<Login />} />

        </Routes>
      </Router>
    );
  }

export default App;
