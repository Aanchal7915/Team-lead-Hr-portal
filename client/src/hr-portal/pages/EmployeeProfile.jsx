

import React, { useState, useEffect } from 'react';
import api from '../api/api.js';
import useAuth from '../hooks/useAuth.jsx';
import Spinner from '../components/Spinner.jsx';
import Card from '../components/Card.jsx';
import Input from '../components/Input.jsx';
import Button from '../components/Button.jsx';
import axios from 'axios';
import { motion } from 'framer-motion';

const EmployeeProfile = () => {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ phone: '', address: '', dob: '' });
  const [uploading, setUploading] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/employee/profile');
      const profileData = response?.data?.data || response?.data;
      setProfile(profileData);
      setFormData({
        phone: profileData?.phone || '',
        address: profileData?.address || '',
        dob: profileData?.dob ? profileData.dob.split('T')[0] : ''
      });
    } catch (error) {
      console.error("Failed to fetch profile", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const uploadFile = async (file) => {
    const isImage = file.type.startsWith('image/');
    if (isImage) {
      const uploadData = new FormData();
      uploadData.append('file', file);
      uploadData.append('upload_preset', 'employee_portal');

      const { data } = await axios.post(
        `https://api.cloudinary.com/v1_1/dn0j5mkmb/image/upload`,
        uploadData
      );
      console.log('CLOUDINARY IMAGE UPLOAD SUCCESS. URL:', data.secure_url);
      return data.secure_url;
    } else {
      const uploadData = new FormData();
      uploadData.append('file', file);

      const { data } = await api.post('/employee/upload', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const secureUrl = data?.secure_url || data?.data?.secure_url;
      console.log('BACKEND DOCUMENT UPLOAD SUCCESS. URL:', secureUrl);
      return secureUrl;
    }
  };

  const handleFileChange = async (e, fileType) => {
    const files = Array.from(e.target.files);
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      if (fileType === 'marksheet') {
        const newDocuments = [];
        for (const file of files) {
          const url = await uploadFile(file);
          newDocuments.push({ name: file.name, url });
        }
        
        const updatedData = { documents: [...(profile.documents || []), ...newDocuments] };
        await api.put('/employee/profile', updatedData);
        await fetchProfile();
      } else {
        const url = await uploadFile(files[0]);
        let updatedData = {};
        if (fileType === 'profilePicture') {
          updatedData.profilePictureUrl = url;
        } else if (fileType === 'idProof') {
          updatedData.idProofUrl = url;
        }
        await api.put('/employee/profile', updatedData);
        await fetchProfile();
      }
    } catch (error) {
      if (error.response) {
        console.error('Upload Error Details:', error.response.data);
      }
      alert('Upload failed. Check console for details.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put('/employee/profile', formData);
      setIsEditing(false);
      await fetchProfile();
    } catch (error) {
      console.error('Profile update failed', error);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-br from-[#fff5e6] via-white to-[#f5e6d3] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="bg-white/80 backdrop-blur-md dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-white/50">
        <Spinner />
      </div>
    </div>
  );
  if (!profile) return <p>Could not load profile.</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff5e6] via-[#f5e6d3] to-[#fff5e6] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-6 py-12 transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto space-y-10"
      >
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6 text-center md:text-left">
          <div className="relative">
            <motion.img
              src={profile.profilePictureUrl || `https://ui-avatars.com/api/?name=${profile.name}&background=random`}
              alt="Profile"
              className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover ring-4 ring-[#fff5e6] dark:ring-gray-700 shadow-2xl"
              whileHover={{ scale: 1.05 }}
            />
            <label htmlFor="profile-pic-upload" className="absolute bottom-1 right-1 bg-[#8a6144] p-2 rounded-full cursor-pointer hover:bg-[#433020] transition-colors shadow-lg">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </label>
            <input id="profile-pic-upload" type="file" className="hidden" onChange={(e) => handleFileChange(e, 'profilePicture')} />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl md:text-5xl font-extrabold text-[#433020] dark:text-gray-100 tracking-tight leading-tight">{profile.name}</h1>
            <p className="text-[#8a6144] dark:text-gray-400 font-semibold text-base md:text-xl mt-1">{profile.department} <span className="text-[#433020]/20 dark:text-gray-600 px-1">/</span> {profile.employeeId}</p>
          </div>
        </div>

        {uploading && <div className="flex items-center space-x-2"><Spinner /><p className="text-gray-600 dark:text-gray-300">Uploading...</p></div>}

        <motion.div whileHover={{ scale: 1.01 }} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-6 rounded-3xl shadow-xl shadow-[#433020]/5 dark:shadow-black/20 border border-white/50 dark:border-gray-700 transition-all hover:shadow-2xl hover:shadow-[#433020]/10 dark:hover:shadow-black/30">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-[#433020] dark:text-gray-100 flex items-center gap-3">
              <span className="w-1.5 h-8 bg-[#8a6144] rounded-full inline-block"></span>
              Personal Information
            </h2>
            <Button onClick={() => setIsEditing(!isEditing)} variant="brand" className="text-xs md:text-sm px-4 py-2 w-full sm:w-auto">{isEditing ? 'Cancel' : 'Edit Details'}</Button>
          </div>
          {isEditing ? (
            <form onSubmit={handleUpdate} className="mt-4 space-y-4">
              <Input id="phone" label="Phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="border-[#8a6144]/30 focus:ring-[#8a6144]" />
              <Input id="dob" label="Date of Birth" type="date" value={formData.dob} onChange={(e) => setFormData({ ...formData, dob: e.target.value })} className="border-[#8a6144]/30 focus:ring-[#8a6144]" />
              <Input id="address" label="Address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="border-[#8a6144]/30 focus:ring-[#8a6144]" />
              <Button type="submit" variant="brand">Save Changes</Button>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[#433020] dark:text-gray-200">
              <p className="p-4 bg-[#fffbf5] dark:bg-gray-700/50 rounded-2xl border border-[#8a6144]/10 dark:border-gray-600"><span className="font-bold block text-[#8a6144] dark:text-gray-400 text-xs uppercase tracking-wider mb-1">Email Address</span> <span className="text-sm md:text-base break-all">{profile.email}</span></p>
              <p className="p-4 bg-[#fffbf5] dark:bg-gray-700/50 rounded-2xl border border-[#8a6144]/10 dark:border-gray-600"><span className="font-bold block text-[#8a6144] dark:text-gray-400 text-xs uppercase tracking-wider mb-1">Phone Number</span> <span className="text-sm md:text-base">{profile.phone || 'N/A'}</span></p>
              <p className="p-4 bg-[#fffbf5] dark:bg-gray-700/50 rounded-2xl border border-[#8a6144]/10 dark:border-gray-600"><span className="font-bold block text-[#8a6144] dark:text-gray-400 text-xs uppercase tracking-wider mb-1">Date of Birth</span> <span className="text-sm md:text-base">{profile.dob ? new Date(profile.dob).toLocaleDateString() : 'N/A'}</span></p>
              <p className="p-4 bg-[#fffbf5] dark:bg-gray-700/50 rounded-2xl border border-[#8a6144]/10 dark:border-gray-600 md:col-span-2"><span className="font-bold block text-[#8a6144] dark:text-gray-400 text-xs uppercase tracking-wider mb-1">Residential Address</span> <span className="text-sm md:text-base break-words">{profile.address || 'N/A'}</span></p>
            </div>
          )}
        </motion.div>



        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-3xl shadow-xl shadow-[#433020]/5 dark:shadow-black/20 border border-white/50 dark:border-gray-700 p-6 transition-all hover:shadow-2xl hover:shadow-[#433020]/10 dark:hover:shadow-black/30">
          <h2 className="text-2xl font-bold text-[#433020] dark:text-gray-100 mb-6 flex items-center gap-2">
            <span className="w-2 h-8 bg-[#8a6144] rounded-full inline-block"></span>
            Employment Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[#433020] dark:text-gray-200 text-base">
            <div className="flex items-center space-x-3 p-4 bg-[#fffbf5] dark:bg-gray-700/50 rounded-xl border border-[#8a6144]/10 dark:border-gray-600">
              <span className="text-2xl">📅</span>
              <div>
                <span className="font-bold block text-sm text-[#8a6144] dark:text-gray-400">Joining Date</span>
                <span className="text-lg font-semibold">{profile.joiningDate ? new Date(profile.joiningDate).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-[#fffbf5] dark:bg-gray-700/50 rounded-xl border border-[#8a6144]/10 dark:border-gray-600">
              <span className="text-2xl">💰</span>
              <div>
                <span className="font-bold block text-sm text-[#8a6144] dark:text-gray-400">Current Salary</span>
                <span className="text-lg font-semibold">{profile.salary ? `₹${profile.salary.toLocaleString()}` : 'Not Disclosed'}</span>
              </div>
            </div>
          </div>
        </div>



        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-xl shadow-[#433020]/5 dark:shadow-black/20 border border-white/50 dark:border-gray-700 rounded-3xl p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-[#433020]/10 dark:hover:shadow-black/30">
          <h2 className="text-2xl font-bold text-[#433020] dark:text-gray-100 mb-6 flex items-center gap-2">
            <span className="w-2 h-8 bg-[#8a6144] rounded-full inline-block"></span>
            Documents
          </h2>

          <div className="space-y-6 text-[#433020] dark:text-gray-300">
            {/* ID Proof Section */}
            <div className="p-5 bg-[#fffbf5] dark:bg-gray-700/50 rounded-2xl border border-[#8a6144]/10 dark:border-gray-600 transition duration-300 hover:border-[#8a6144]/40 dark:hover:border-gray-500">
              <h3 className="font-bold text-lg mb-2 text-[#433020] dark:text-gray-200 flex items-center gap-2">🪪 ID Proof</h3>
              {profile.idProofUrl ? (
                <a
                  href={profile.idProofUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-4 py-2 bg-[#8a6144] text-white rounded-lg font-medium text-sm hover:bg-[#6b4d36] transition shadow-md"
                >
                  View ID Proof
                </a>
              ) : (
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="file"
                    onChange={(e) => handleFileChange(e, 'idProof')}
                    className="block w-full text-sm text-gray-600 dark:text-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#f5e6d3] dark:file:bg-gray-600 file:text-[#433020] dark:file:text-white hover:file:bg-[#e6d0b3] dark:hover:file:bg-gray-500 transition cursor-pointer"
                  />
                </label>
              )}
            </div>

            {/* Marksheets & Other Documents */}
            <div className="p-5 bg-[#fffbf5] dark:bg-gray-700/50 rounded-2xl border border-[#8a6144]/10 dark:border-gray-600 transition duration-300 hover:border-[#8a6144]/40 dark:hover:border-gray-500">
              <h3 className="font-bold text-lg mb-2 text-[#433020] dark:text-gray-200 flex items-center gap-2">📚 Marksheets & Other Documents</h3>
              <ul className="space-y-2 mb-4">
                {(profile.documents || []).map((doc, index) => (
                  <li key={index} className="flex items-start gap-2 overflow-hidden">
                    <span className="text-blue-600 dark:text-blue-400 shrink-0">📄</span>
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      download={doc.name.match(/\.(docx|doc)$/i) ? doc.name : undefined}
                      className="text-blue-600 dark:text-blue-400 font-medium hover:underline hover:text-blue-800 dark:hover:text-blue-300 transition break-all leading-tight"
                    >
                      {doc.name}
                    </a>
                  </li>
                ))}
              </ul>

              <div className="mt-4">
                <label
                  htmlFor="marksheet-upload"
                  className="block text-sm font-bold text-[#433020] dark:text-gray-300 mb-2"
                >
                  Upload Multiple Documents:
                </label>
                <input
                  id="marksheet-upload"
                  type="file"
                  multiple
                  accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                  onChange={(e) => handleFileChange(e, 'marksheet')}
                  className="block w-full text-xs md:text-sm text-gray-600 dark:text-gray-200 file:mr-2 md:file:mr-4 file:py-2 file:px-2 md:file:px-4 file:rounded-lg file:border-0 file:text-xs md:file:text-sm file:font-semibold file:bg-[#f5e6d3] dark:file:bg-gray-600 file:text-[#433020] dark:file:text-white hover:file:bg-[#e6d0b3] dark:hover:file:bg-gray-500 transition cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

      </motion.div>
    </div>
  );
};

export default EmployeeProfile;
