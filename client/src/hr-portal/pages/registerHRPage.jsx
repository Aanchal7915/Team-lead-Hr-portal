// src/pages/auth/RegisterHRPage.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth.jsx';
import Card from '../components/Card.jsx';
import Input from '../components/Input.jsx';
import Button from '../components/Button.jsx';
import Spinner from '../components/Spinner.jsx';

const RegisterHRPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { registerHR } = useAuth();
  const navigate = useNavigate();

  const { name, email, password } = formData;

  console.log("Sending HR registration data:", { name, email, password });


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await registerHR({ name, email, password });
      navigate('/hr/dashboard');
    } catch (err) {
      setError(err.response?.data?.message);
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center py-12">
      <Card className="w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Create HR Admin Account</h2>
        <p className="text-center text-sm text-gray-500 mb-4">This page should be removed or protected in production.</p>
        {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input id="name" name="name" label="Full Name" value={name} onChange={handleChange} required />
          <Input id="email" name="email" label="Email Address" type="email" value={email} onChange={handleChange} required />
          <Input id="password" name="password" label="Password" type="password" value={password} onChange={handleChange} required />
          <Button type="submit" variant="primary" className="w-full" disabled={loading}>
            {loading ? <Spinner /> : 'Create HR Account'}
          </Button>
        </form>
        <p className="text-center text-sm text-gray-600 mt-6">
          Already an admin? <Link to="/login" className="font-medium text-blue-600 hover:underline">Login here</Link>
        </p>
      </Card>
    </div>
  );
};

export default RegisterHRPage;
