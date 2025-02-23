import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import config from '../../config';

const VerifyEmail = () => {
  const { token } = useParams();
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await axios.get(`${config.BACKEND_URL}/api/auth/verify-email/${token}`);
        setMessage(response.data.msg);
      } catch (error) {
        setMessage(error.response?.data?.msg || 'Verification failed');
      }
    };

    verifyToken();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Email Verification</h2>
        <p>{message}</p>
      </div>
    </div>
  );
};

export default VerifyEmail;
