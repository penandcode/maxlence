import React, { useEffect, useState } from 'react';
import axios from 'axios';
import config from '../../config';
import Snackbar from '../components/Snackbar';


const refreshToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  try {
    const response = await axios.post(`${config.BACKEND_URL}/api/auth/refresh-token`, {
      refreshToken
    });
    localStorage.setItem('token', response.data.token);
    return response.data.token;
  } catch (err) {
    console.error('Failed to refresh token:', err);
    window.location.href = '/login';
    return null;
  }
};

axios.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const newToken = await refreshToken();
      if (newToken) {
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        return axios(originalRequest);
      }
    }
    return Promise.reject(error);
  }
);


const Dashboard = () => {
  const [data, setData] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);

  const [dataPage, setDataPage] = useState(1);
  const [usersPage, setUsersPage] = useState(1);
  const [dataTotalPages, setDataTotalPages] = useState(1);
  const [usersTotalPages, setUsersTotalPages] = useState(1);

  const [isAdmin, setIsAdmin] = useState(false);

  const [activeTab, setActiveTab] = useState('normalData');

  const fetchNormalData = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`${config.BACKEND_URL}/api/data?page=${dataPage}&limit=10`, {

        headers: { Authorization: `Bearer ${token}` }
      });

      setData(response.data.data);
      setDataTotalPages(response.data.totalPages);


    } catch (err) {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'normalData') {
      fetchNormalData();
    }
  }, [dataPage, activeTab]);


  const fetchUserData = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`${config.BACKEND_URL}/api/users?page=${usersPage}&limit=10`, {

        headers: { Authorization: `Bearer ${token}` }
      });

      setUsers(response.data.users);
      setUsersTotalPages(response.data.totalPages);


    } catch (err) {
      setError('Failed to fetch user data');
    }
  };


  useEffect(() => {
    if (activeTab === 'userData') {
      fetchUserData();
    }
  }, [usersPage, activeTab]);



  useEffect(() => {
    const checkAdmin = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get(`${config.BACKEND_URL}/api/auth/check-admin`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setIsAdmin(response.data.isAdmin);
        } catch (err) {
          console.error('Failed to check admin status', err);
        }
      }
    };

    checkAdmin();
  }, []);

  const handleDeleteUser = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${config.BACKEND_URL}/api/users/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } });
      setUsers(users.filter(user => user.id !== userId));
    } catch (err) {
      setError('Failed to delete user');
    }
  };

  const handleDeleteData = async (dataId) => {
    try {
      await axios.delete(`${config.BACKEND_URL}/api/data/${dataId}`,
        { headers: { Authorization: `Bearer ${token}` } });
      setData(data.filter(item => item.id !== dataId));
    } catch (err) {
      setError('Failed to delete data');
    }
  };

  if (loading) return <div>Loading...</div>;


  return (
    <div className="min-h-screen p-4 bg-gray-100">
      {error && <>
        <Snackbar
          message={error}
          onClose={() => { setError("") }}
        />
      </>}
      <h2 className="text-2xl font-bold mb-4">{isAdmin ? "Admin " : "User"} Dashboard</h2>
      {isAdmin && <div className="flex mb-4">
        <button onClick={() => setActiveTab('userData')} className={` text-white px-4 py-2 rounded mr-2 ${activeTab === 'userData' ? 'font-bold bg-blue-500' : 'bg-blue-400'}`}>User Data</button>
        <button onClick={() => setActiveTab('normalData')} className={`text-white px-4 py-2 rounded ${activeTab === 'normalData' ? 'font-bold bg-blue-500' : 'bg-blue-400'}`}>Normal Data</button>
      </div>}
      {activeTab === 'userData' ? (
        <div className="overflow-x-auto min-h-[80lvh]">
          <h3 className="text-xl font-semibold mt-6">Users</h3>
          <div className="overflow-x-auto rounded-lg shadow-md">
            <table className="min-w-[640px] w-full bg-white border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left border-b-2 border-gray-300 px-4 py-2">Email</th>
                  <th className="text-left border-b-2 border-gray-300 px-4 py-2">Account Created</th>
                  <th className="text-left border-b-2 border-gray-300 px-4 py-2">Verified</th>
                  <th className="text-left border-b-2 border-gray-300 px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="border-b border-gray-300 px-4 py-2">{user.email}</td>
                    <td className="border-b border-gray-300 px-4 py-2">
                      {new Date(user.createdAt).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="border-b border-gray-300 px-4 py-2">{user.isVerified ? 'Yes' : 'No'}</td>
                    <td className="border-b border-gray-300 px-4 py-2">
                      <button className="text-red-500 hover:underline" onClick={() => handleDeleteUser(user.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!users.length && <div className='text-center mt-[40lvh]'>No User Data Present</div>}
        </div>
      ) : (
        <div className="overflow-x-auto min-h-[80lvh]">
          <h3 className="text-xl font-semibold mt-6">Data</h3>
          <div className="overflow-x-auto rounded-lg shadow-md">
            <table className="min-w-[640px] w-full bg-white border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border-b-2 border-gray-300 px-4 py-2">Name</th>
                  <th className="border-b-2 border-gray-300 px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="border-b border-gray-300 px-4 py-2">{item.name}</td>
                    <td className="border-b border-gray-300 px-4 py-2">
                      {isAdmin && <button className="text-red-500 hover:underline" onClick={() => handleDeleteData(item.id)}>Delete</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!data.length && <div className='text-center mt-[40lvh]'>No Data Present</div>}
        </div>
      )}


      <div className="mt-4 text-center">
        <button
          className="bg-blue-500 disabled:bg-gray-400 text-white px-4 py-2 rounded"
          onClick={() => activeTab === 'normalData' ? setDataPage(dataPage - 1) : setUsersPage(usersPage - 1)}
          disabled={activeTab === 'normalData' ? dataPage === 1 : usersPage === 1}
        >
          Previous
        </button>
        <span className="mx-4">Page {activeTab === 'normalData' ? dataPage : usersPage} of {activeTab === 'normalData' ? dataTotalPages : usersTotalPages}</span>
        <button
          className="bg-blue-500 disabled:bg-gray-400 text-white px-4 py-2 rounded"
          onClick={() => activeTab === 'normalData' ? setDataPage(dataPage + 1) : setUsersPage(usersPage + 1)}
          disabled={activeTab === 'normalData' ? dataPage === dataTotalPages : usersPage === usersTotalPages}

        >
          Next
        </button>
      </div>

    </div>
  );
};

export default Dashboard;
