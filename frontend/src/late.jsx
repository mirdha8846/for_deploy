import React, { useState } from "react";
import axios from "axios";

const LateEntryForm = () => {
  const [formData, setFormData] = useState({
    studentName: "",
    studentID: "",
    friends: [{ name: "", rollNumber: "" }],
    reason: "",
    exitTime: "",
    entryTime: "",
  });

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

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const data = await axios.post(import.meta.env.VITE_URL, formData);
    alert(data.data.message);
    setFormData({
      studentName: "",
      studentID: "",
      friends: [{ name: "", rollNumber: "" }],
      reason: "",
      exitTime: "",
      entryTime: "",
    });
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-200">
      <div className="w-full max-w-2xl p-8 bg-white bg-opacity-90 rounded-xl shadow-2xl transform transition-all duration-500 hover:scale-105">
        <h2 className="text-4xl font-bold text-center text-gray-800 mb-8">Late Entry Form</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
            <input
              type="text"
              name="studentName"
              placeholder="Enter your name"
              value={formData.studentName}
              onChange={handleChange}
              className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your ID</label>
            <input
              type="text"
              name="studentID"
              placeholder="Enter your ID"
              value={formData.studentID}
              onChange={handleChange}
              className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Friends</label>
            {formData.friends.map((friend, index) => (
              <div key={index} className="space-y-3 mb-4">
                <input
                  type="text"
                  name="name"
                  placeholder="Friend's Name"
                  value={friend.name}
                  onChange={(e) => handleFriendChange(index, e)}
                  className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  required
                />
                <input
                  type="text"
                  name="rollNumber"
                  placeholder="Friend's Roll Number"
                  value={friend.rollNumber}
                  onChange={(e) => handleFriendChange(index, e)}
                  className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => removeFriend(index)}
                  className="text-red-500 hover:text-red-700 font-semibold transition-all"
                >
                  Remove Friend
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addFriend}
              className="mt-2 py-2 px-4 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all"
            >
              Add Friend
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Late Entry</label>
            <textarea
              name="reason"
              placeholder="Enter the reason"
              value={formData.reason}
              onChange={handleChange}
              rows={4}
              className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              required
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Exit Time</label>
            <input
              type="time"
              name="exitTime"
              value={formData.exitTime}
              onChange={handleChange}
              className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Entry Time</label>
            <input
              type="time"
              name="entryTime"
              value={formData.entryTime}
              onChange={handleChange}
              className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default LateEntryForm;
