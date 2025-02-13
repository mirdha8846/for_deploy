import React, { useState } from "react";
import { Clock, Users, AlertCircle, X, CheckCircle } from "lucide-react";
import axios from "axios";
import { app } from "./firebase";
import { signInWithPopup, GoogleAuthProvider, getAuth } from 'firebase/auth';

const LateEntryForm = () => {
  const [formData, setFormData] = useState({
    studentName: "",
    studentID: "",
    studentEmail: "",
    friends: [{ name: "", rollNumber: "" }],
    reason: "",
    exitTime: "",
    entryTime: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const getauth = getAuth(app);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFriendChange = (index, e) => {
    const { name, value } = e.target;
    const updatedFriends = [...formData.friends];
    updatedFriends[index][name] = value;
    setFormData({ ...formData, friends: updatedFriends });
  };

  const addFriend = () => {
    setFormData({
      ...formData,
      friends: [...formData.friends, { name: "", rollNumber: "" }],
    });
  };

  const removeFriend = (index) => {
    const updatedFriends = formData.friends.filter((_, i) => i !== index);
    setFormData({ ...formData, friends: updatedFriends });
  };

  const verifyStudentEmail = async () => {
    try {
      setVerificationLoading(true);
      setError("");
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(getauth, provider);
      const user = result.user;
      
      const response = await axios.post(`${import.meta.env.VITE_URL_LOCAL}/verifyEmail`, { user });
      if (response.data.success) {
        setIsVerified(true);
        setFormData(prev => ({
          ...prev,
          studentEmail: user.email,
          studentName: user.displayName || prev.studentName
        }));
      } else {
        setError(response.data.error || "Email verification failed");
      }
    } catch (error) {
      setError(error.message || "Failed to verify email");
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isVerified) {
      setError("Please verify your email first");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      const response = await axios.post(`${import.meta.env.VITE_URL_LOCAL}`, formData);
      if (response.data.success) {
        setShowModal(true);
        setFormData({
          studentName: "",
          studentID: "",
          studentEmail: "",
          friends: [{ name: "", rollNumber: "" }],
          reason: "",
          exitTime: "",
          entryTime: "",
        });
      } else {
        setError(response.data.error || "Failed to submit form");
      }
    } catch (error) {
      setError(error.message || "Failed to submit form");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
              <Clock className="w-8 h-8" />
              Late Entry Form
            </h2>
            <p className="text-blue-100 mt-2">Please verify your email before submitting the form</p>
          </div>

          {!isVerified && (
            <div className="p-8 text-center flex flex-col items-center justify-center space-y-4">
              <p className="text-gray-600 mb-4">Please verify your email to continue</p>
              <button
                onClick={verifyStudentEmail}
                disabled={verificationLoading}
                className="w-full max-w-md py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center cursor-pointer justify-center gap-2"
              >
                {verificationLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent  rounded-full animate-spin"></div>
                    Verifying...
                  </>
                ) : (
                  "Verify with Google"
                )}
              </button>
            </div>
          )}

          {isVerified && (
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <p className="text-green-700">Email verified successfully!</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Your Name</label>
                  <input
                    type="text"
                    name="studentName"
                    placeholder="Enter your full name"
                    value={formData.studentName}
                    onChange={handleChange}
                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Student ID</label>
                  <input
                    type="text"
                    name="studentID"
                    placeholder="Enter your student ID"
                    value={formData.studentID}
                    onChange={handleChange}
                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                <input
                  type="email"
                  name="studentEmail"
                  value={formData.studentEmail}
                  readOnly
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Accompanying Friends
                  </label>
                  <button
                    type="button"
                    onClick={addFriend}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  >
                    Add Friend
                  </button>
                </div>

                {formData.friends.map((friend, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-500">Friend {index + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeFriend(index)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        name="name"
                        placeholder="Friend's Name"
                        value={friend.name}
                        onChange={(e) => handleFriendChange(index, e)}
                        className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        required
                      />
                      <input
                        type="text"
                        name="rollNumber"
                        placeholder="Friend's Roll Number"
                        value={friend.rollNumber}
                        onChange={(e) => handleFriendChange(index, e)}
                        className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        required
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Reason for Late Entry
                </label>
                <textarea
                  name="reason"
                  placeholder="Please provide a detailed reason for your late entry"
                  value={formData.reason}
                  onChange={handleChange}
                  rows={4}
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Exit Time</label>
                  <input
                    type="time"
                    name="exitTime"
                    value={formData.exitTime}
                    onChange={handleChange}
                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Entry Time</label>
                  <input
                    type="time"
                    name="entryTime"
                    value={formData.entryTime}
                    onChange={handleChange}
                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Submitting...
                  </>
                ) : (
                  "Submit Request"
                )}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Success Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full transform transition-all">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Request Submitted Successfully!</h3>
              <p className="mt-2 text-sm text-gray-500">
                Your late entry request has been submitted. You will receive a confirmation email shortly.
              </p>
              <button
                onClick={() => {setShowModal(false);setIsVerified(false)}}
                className="mt-4 w-full inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg">
          {error}
        </div>
      )}
    </div>
  );
};

export default LateEntryForm;