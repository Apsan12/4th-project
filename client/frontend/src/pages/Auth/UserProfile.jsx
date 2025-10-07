import React, { useState, useEffect } from "react";
import {
  userProfile,
  updateUserProfile,
  changePassword,
} from "../../Services/auth";
import "./UserProfile.css";

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const [message, setMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Profile form data
  const [profileData, setProfileData] = useState({
    username: "",
    email: "",
    phoneNumber: "",
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    address: "",
    emergencyContact: "",
    imageUrl: "",
  });

  // File upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Password change data
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await userProfile();
      // console.log("User profile response:", response); // Debug log
      // console.log("User imageUrl:", response.user?.imageUrl); // Debug log
      // console.log(
      //   "Complete user object:",
      //   JSON.stringify(response.user, null, 2)
      // ); // Debug log
      setUser(response.user);
      setProfileData({
        username: response.user.username || "",
        email: response.user.email || "",
        phoneNumber: response.user.phoneNumber || "",
        firstName: response.user.firstName || "",
        lastName: response.user.lastName || "",
        dateOfBirth: response.user.dateOfBirth || "",
        address: response.user.address || "",
        emergencyContact: response.user.emergencyContact || "",
        imageUrl: response.user.imageUrl || "",
      });
    } catch (error) {
      setMessage(error.message || "Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);

    if (file) {
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      // Create FormData for file upload
      const formData = new FormData();

      // Add all profile data to FormData (exclude imageUrl if uploading file)
      Object.keys(profileData).forEach((key) => {
        // Skip imageUrl if we're uploading a file (let Cloudinary handle it)
        if (key === "imageUrl" && selectedFile) {
          console.log(
            "⏭️ Skipping imageUrl field because file is being uploaded"
          );
          return;
        }

        if (profileData[key]) {
          formData.append(key, profileData[key]);
        }
      });

      // Add the file if one is selected
      if (selectedFile) {
        console.log("📎 Uploading file:", {
          name: selectedFile.name,
          size: selectedFile.size,
          type: selectedFile.type,
        });
        formData.append("userImage", selectedFile);
      } else {
        console.log("⚠️ No file selected for upload");
      }

      // Debug: Log FormData contents
      // console.log("📋 FormData contents:");
      for (let [key, value] of formData.entries()) {
        console.log(`  ${key}:`, value);
      }

      // console.log("🚀 Submitting form data...");
      const response = await updateUserProfile(formData);
      console.log("Update response:", response); // Debug log

      // Update user state immediately with response data
      if (response.user) {
        setUser(response.user);
        setProfileData({
          username: response.user.username || "",
          email: response.user.email || "",
          phoneNumber: response.user.phoneNumber || "",
          firstName: response.user.firstName || "",
          lastName: response.user.lastName || "",
          dateOfBirth: response.user.dateOfBirth || "",
          address: response.user.address || "",
          emergencyContact: response.user.emergencyContact || "",
          imageUrl: response.user.imageUrl || "",
        });
      }

      setMessage("Profile updated successfully!");
      setIsEditing(false);
      setSelectedFile(null);
      setImagePreview(null);

      // Also fetch fresh data to ensure consistency
      fetchUserProfile();
    } catch (error) {
      console.error("Profile update error:", error); // Debug log
      setMessage(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage("New password must be at least 6 characters long");
      return;
    }

    try {
      setLoading(true);
      await changePassword({
        oldPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setMessage("Password changed successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      setMessage(error.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords({
      ...showPasswords,
      [field]: !showPasswords[field],
    });
  };

  if (loading && !user) {
    return (
      <div className="profile-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-avatar">
            <div className="avatar-circle">
              {user?.imageUrl ? (
                <img
                  src={`${user.imageUrl}?t=${Date.now()}`}
                  alt="Profile"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: "50%",
                  }}
                  onError={(e) => {
                    console.log("❌ Image failed to load:", user.imageUrl);
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                  onLoad={() => {
                    console.log("✅ Image loaded successfully:", user.imageUrl);
                  }}
                />
              ) : null}
              {!user?.imageUrl && (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#4CAF50",
                    color: "white",
                    fontSize: "2rem",
                    fontWeight: "bold",
                    borderRadius: "50%",
                  }}
                >
                  {user?.username?.charAt(0).toUpperCase() || "👤"}
                </div>
              )}
            </div>
          </div>
          <div className="profile-info">
            <h1 className="profile-name">
              {user?.firstName && user?.lastName
                ? `${user.firstName} ${user.lastName}`
                : user?.username || "User"}
            </h1>
            <p className="profile-email">{user?.email}</p>
            {/* Debug info - remove this after testing */}
            {/* <p style={{ fontSize: "12px", color: "#666" }}>
              Debug: imageUrl = {user?.imageUrl || "null"}
            </p> */}
            <p className="profile-status">
              <span
                className={`status-badge ${
                  user?.isVerified ? "verified" : "unverified"
                }`}
              >
                {user?.isVerified ? "✅ Verified" : "❌ Unverified"}
              </span>
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="profile-tabs">
          <button
            className={`tab-button ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            📝 Profile Details
          </button>
          <button
            className={`tab-button ${activeTab === "security" ? "active" : ""}`}
            onClick={() => setActiveTab("security")}
          >
            🔒 Security
          </button>
          <button
            className={`tab-button ${activeTab === "activity" ? "active" : ""}`}
            onClick={() => setActiveTab("activity")}
          >
            📊 Activity
          </button>
        </div>

        {/* Tab Content */}
        <div className="profile-content">
          {activeTab === "profile" && (
            <div className="tab-content">
              <div className="content-header">
                <h2>Profile Information</h2>
                <button
                  className="edit-button"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? "Cancel" : "Edit Profile"}
                </button>
              </div>

              <form onSubmit={handleProfileSubmit} className="profile-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={profileData.username}
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="firstName">First Name</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={profileData.firstName}
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="lastName">Last Name</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={profileData.lastName}
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="phoneNumber">Phone Number</label>
                    <input
                      type="tel"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={profileData.phoneNumber}
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="dateOfBirth">Date of Birth</label>
                    <input
                      type="date"
                      id="dateOfBirth"
                      name="dateOfBirth"
                      value={profileData.dateOfBirth}
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="form-group full-width">
                    <label htmlFor="address">Address</label>
                    <textarea
                      id="address"
                      name="address"
                      value={profileData.address}
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                      rows="3"
                    ></textarea>
                  </div>

                  <div className="form-group full-width">
                    <label htmlFor="emergencyContact">Emergency Contact</label>
                    <input
                      type="text"
                      id="emergencyContact"
                      name="emergencyContact"
                      value={profileData.emergencyContact}
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                      placeholder="Name and phone number"
                    />
                  </div>
                </div>
                <div className="form-group full-width">
                  <label htmlFor="profileImage">Profile Image</label>

                  {/* Current/Preview Image */}
                  {(imagePreview || profileData.imageUrl) && (
                    <div className="image-preview">
                      <img
                        src={imagePreview || profileData.imageUrl}
                        alt="Profile preview"
                        style={{
                          width: "100px",
                          height: "100px",
                          objectFit: "cover",
                          borderRadius: "50%",
                          marginBottom: "10px",
                        }}
                      />
                    </div>
                  )}

                  {/* File Upload Input */}
                  {isEditing && (
                    <input
                      type="file"
                      id="profileImage"
                      name="profileImage"
                      onChange={handleFileChange}
                      accept="image/*"
                      style={{ marginBottom: "10px" }}
                    />
                  )}

                  {/* URL Input as fallback */}
                  <input
                    type="text"
                    id="imageUrl"
                    name="imageUrl"
                    value={profileData.imageUrl}
                    onChange={handleProfileChange}
                    disabled={!isEditing}
                    placeholder="Or enter image URL"
                  />
                </div>

                {isEditing && (
                  <div className="form-actions">
                    <button
                      type="submit"
                      className="save-button"
                      disabled={loading}
                    >
                      {loading ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                )}
              </form>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div className="tab-content">
              <h2>Change Password</h2>
              <form onSubmit={handlePasswordSubmit} className="password-form">
                <div className="form-group">
                  <label htmlFor="currentPassword">Current Password</label>
                  <div className="password-input-container">
                    <input
                      type={showPasswords.current ? "text" : "password"}
                      id="currentPassword"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => togglePasswordVisibility("current")}
                    >
                      {showPasswords.current ? "👁️" : "🙈"}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="newPassword">New Password</label>
                  <div className="password-input-container">
                    <input
                      type={showPasswords.new ? "text" : "password"}
                      id="newPassword"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => togglePasswordVisibility("new")}
                    >
                      {showPasswords.new ? "👁️" : "🙈"}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm New Password</label>
                  <div className="password-input-container">
                    <input
                      type={showPasswords.confirm ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => togglePasswordVisibility("confirm")}
                    >
                      {showPasswords.confirm ? "👁️" : "🙈"}
                    </button>
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="submit"
                    className="save-button"
                    disabled={loading}
                  >
                    {loading ? "Changing Password..." : "Change Password"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === "activity" && (
            <div className="tab-content">
              <h2>Account Activity</h2>
              <div className="activity-stats">
                <div className="stat-card">
                  <div className="stat-icon">🎫</div>
                  <div className="stat-info">
                    <h3>Total Bookings</h3>
                    <p className="stat-number">12</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">📅</div>
                  <div className="stat-info">
                    <h3>Member Since</h3>
                    <p className="stat-number">
                      {user?.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">⭐</div>
                  <div className="stat-info">
                    <h3>Profile Status</h3>
                    <p className="stat-number">
                      {user?.isVerified ? "Verified" : "Pending"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Message Display */}
        {message && (
          <div
            className={`message ${
              message.includes("success") ? "success" : "error"
            }`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
