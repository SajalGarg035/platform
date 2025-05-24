import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
    FiUser, FiMail, FiCalendar, FiEdit2, FiSave, FiX, FiCamera, 
    FiCode, FiUsers, FiClock, FiMapPin, FiGlobe, FiGithub,
    FiSettings, FiShield, FiBell, FiEye, FiTrendingUp,
    FiActivity, FiAward, FiStar, FiArrowLeft
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const Profile = () => {
    const { user, updateProfile, logout } = useAuth();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [formData, setFormData] = useState({
        username: user?.username || '',
        email: user?.email || '',
        bio: user?.bio || '',
        location: user?.location || '',
        website: user?.website || '',
        company: user?.company || '',
        jobTitle: user?.jobTitle || '',
        skills: user?.skills?.join(', ') || '',
        socialLinks: {
            github: user?.socialLinks?.github || '',
            linkedin: user?.socialLinks?.linkedin || '',
            twitter: user?.socialLinks?.twitter || ''
        }
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('social.')) {
            const socialPlatform = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                socialLinks: {
                    ...prev.socialLinks,
                    [socialPlatform]: value
                }
            }));
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const profileData = {
            ...formData,
            skills: formData.skills.split(',').map(skill => skill.trim()).filter(Boolean)
        };

        const result = await updateProfile(profileData);
        
        if (result.success) {
            toast.success('Profile updated successfully!');
            setIsEditing(false);
        } else {
            toast.error(result.error);
        }
        
        setLoading(false);
    };

    const handleCancel = () => {
        setFormData({
            username: user?.username || '',
            email: user?.email || '',
            bio: user?.bio || '',
            location: user?.location || '',
            website: user?.website || '',
            company: user?.company || '',
            jobTitle: user?.jobTitle || '',
            skills: user?.skills?.join(', ') || '',
            socialLinks: {
                github: user?.socialLinks?.github || '',
                linkedin: user?.socialLinks?.linkedin || '',
                twitter: user?.socialLinks?.twitter || ''
            }
        });
        setIsEditing(false);
    };

    const mockStats = {
        codingSessions: 47,
        collaborations: 23,
        hoursTracked: 156,
        projectsCompleted: 12,
        linesOfCode: 25647,
        favoriteLanguage: 'JavaScript'
    };

    const mockActivity = [
        { type: 'session', message: 'Started a new coding session', time: '2 hours ago', icon: FiCode },
        { type: 'collaboration', message: 'Collaborated with team on React project', time: '1 day ago', icon: FiUsers },
        { type: 'achievement', message: 'Earned "Code Master" badge', time: '2 days ago', icon: FiAward },
        { type: 'profile', message: 'Updated profile information', time: '3 days ago', icon: FiUser }
    ];

    const tabs = [
        { id: 'overview', label: 'Overview', icon: FiUser },
        { id: 'activity', label: 'Activity', icon: FiActivity },
        { id: 'achievements', label: 'Achievements', icon: FiAward },
        { id: 'settings', label: 'Settings', icon: FiSettings }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate('/')}
                                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                <FiArrowLeft size={20} />
                                <span>Back to Home</span>
                            </button>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <FiEdit2 size={16} />
                                <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
                            </button>
                            
                            <button
                                onClick={logout}
                                className="text-gray-600 hover:text-red-600 transition-colors"
                                title="Logout"
                            >
                                <FiShield size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Profile Header */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-32 sm:h-48 relative">
                        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                    </div>
                    
                    <div className="relative px-6 pb-6">
                        {/* Profile Picture and Basic Info */}
                        <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-6 -mt-16 sm:-mt-20">
                            <div className="relative mb-4 sm:mb-0">
                                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-full flex items-center justify-center text-3xl sm:text-4xl font-bold text-blue-600 shadow-lg border-4 border-white">
                                    {user?.profilePicture ? (
                                        <img
                                            src={user.profilePicture}
                                            alt={user.username}
                                            className="w-full h-full rounded-full object-cover"
                                        />
                                    ) : (
                                        user?.username?.charAt(0).toUpperCase()
                                    )}
                                </div>
                                <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors">
                                    <FiCamera size={16} />
                                </button>
                            </div>
                            
                            <div className="flex-1 min-w-0 sm:pb-4">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">
                                            {user?.username}
                                        </h1>
                                        <p className="text-gray-600 flex items-center mt-1">
                                            <FiMail size={16} className="mr-2" />
                                            {user?.email}
                                        </p>
                                        {user?.jobTitle && (
                                            <p className="text-blue-600 font-medium mt-1">
                                                {user.jobTitle} {user?.company && `at ${user.company}`}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-600">
                                    <div className="flex items-center">
                                        <FiCalendar size={16} className="mr-2" />
                                        Joined {new Date(user?.createdAt).toLocaleDateString()}
                                    </div>
                                    {user?.location && (
                                        <div className="flex items-center">
                                            <FiMapPin size={16} className="mr-2" />
                                            {user.location}
                                        </div>
                                    )}
                                    {user?.website && (
                                        <a
                                            href={user.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                                        >
                                            <FiGlobe size={16} className="mr-2" />
                                            Website
                                        </a>
                                    )}
                                </div>

                                {/* Quick Stats */}
                                <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-gray-100">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-gray-900">{mockStats.codingSessions}</div>
                                        <div className="text-sm text-gray-600">Sessions</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-gray-900">{mockStats.collaborations}</div>
                                        <div className="text-sm text-gray-600">Collaborations</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-gray-900">{mockStats.hoursTracked}h</div>
                                        <div className="text-sm text-gray-600">Coded</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="bg-white rounded-xl shadow-lg mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-8 px-6">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                                        activeTab === tab.id
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    <tab.icon size={16} />
                                    <span>{tab.label}</span>
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        {activeTab === 'overview' && (
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
                                </div>

                                {isEditing ? (
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        {/* Basic Information */}
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Username
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="username"
                                                        value={formData.username}
                                                        onChange={handleChange}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>
                                                
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Email
                                                    </label>
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        value={formData.email}
                                                        onChange={handleChange}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Professional Information */}
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900 mb-4">Professional Information</h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Job Title
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="jobTitle"
                                                        value={formData.jobTitle}
                                                        onChange={handleChange}
                                                        placeholder="Software Engineer"
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>
                                                
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Company
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="company"
                                                        value={formData.company}
                                                        onChange={handleChange}
                                                        placeholder="Tech Corp"
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Bio and Skills */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Bio
                                            </label>
                                            <textarea
                                                name="bio"
                                                rows={4}
                                                value={formData.bio}
                                                onChange={handleChange}
                                                placeholder="Tell us about yourself..."
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Skills (comma separated)
                                            </label>
                                            <input
                                                type="text"
                                                name="skills"
                                                value={formData.skills}
                                                onChange={handleChange}
                                                placeholder="JavaScript, React, Node.js, Python"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>

                                        {/* Location and Website */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Location
                                                </label>
                                                <input
                                                    type="text"
                                                    name="location"
                                                    value={formData.location}
                                                    onChange={handleChange}
                                                    placeholder="San Francisco, CA"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                            
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Website
                                                </label>
                                                <input
                                                    type="url"
                                                    name="website"
                                                    value={formData.website}
                                                    onChange={handleChange}
                                                    placeholder="https://your-website.com"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                        </div>

                                        {/* Social Links */}
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900 mb-4">Social Links</h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        GitHub
                                                    </label>
                                                    <input
                                                        type="url"
                                                        name="social.github"
                                                        value={formData.socialLinks.github}
                                                        onChange={handleChange}
                                                        placeholder="https://github.com/username"
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>
                                                
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        LinkedIn
                                                    </label>
                                                    <input
                                                        type="url"
                                                        name="social.linkedin"
                                                        value={formData.socialLinks.linkedin}
                                                        onChange={handleChange}
                                                        placeholder="https://linkedin.com/in/username"
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>
                                                
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Twitter
                                                    </label>
                                                    <input
                                                        type="url"
                                                        name="social.twitter"
                                                        value={formData.socialLinks.twitter}
                                                        onChange={handleChange}
                                                        placeholder="https://twitter.com/username"
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                                            <button
                                                type="button"
                                                onClick={handleCancel}
                                                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                            >
                                                <FiX size={16} />
                                                <span>Cancel</span>
                                            </button>
                                            
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                            >
                                                <FiSave size={16} />
                                                <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="space-y-8">
                                        {/* Bio Section */}
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900 mb-3">About</h3>
                                            <p className="text-gray-700 leading-relaxed">
                                                {user?.bio || 'No bio provided yet. Share something about yourself!'}
                                            </p>
                                        </div>

                                        {/* Skills Section */}
                                        {user?.skills?.length > 0 && (
                                            <div>
                                                <h3 className="text-lg font-medium text-gray-900 mb-3">Skills</h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {user.skills.map((skill, index) => (
                                                        <span
                                                            key={index}
                                                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                                                        >
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Professional Info */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Job Title</h3>
                                                <p className="text-gray-900">
                                                    {user?.jobTitle || 'Not specified'}
                                                </p>
                                            </div>
                                            
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Company</h3>
                                                <p className="text-gray-900">
                                                    {user?.company || 'Not specified'}
                                                </p>
                                            </div>
                                            
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Location</h3>
                                                <p className="text-gray-900">
                                                    {user?.location || 'Not specified'}
                                                </p>
                                            </div>
                                            
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Website</h3>
                                                <p>
                                                    {user?.website ? (
                                                        <a
                                                            href={user.website}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-600 hover:text-blue-800 transition-colors"
                                                        >
                                                            {user.website}
                                                        </a>
                                                    ) : (
                                                        <span className="text-gray-900">Not specified</span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Social Links */}
                                        {(user?.socialLinks?.github || user?.socialLinks?.linkedin || user?.socialLinks?.twitter) && (
                                            <div>
                                                <h3 className="text-lg font-medium text-gray-900 mb-3">Social Links</h3>
                                                <div className="flex space-x-4">
                                                    {user.socialLinks.github && (
                                                        <a
                                                            href={user.socialLinks.github}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                                                        >
                                                            <FiGithub size={20} />
                                                            <span>GitHub</span>
                                                        </a>
                                                    )}
                                                    {/* Add other social links similarly */}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'activity' && (
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
                                
                                <div className="space-y-4">
                                    {mockActivity.map((activity, index) => (
                                        <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                                            <div className={`p-2 rounded-full ${
                                                activity.type === 'session' ? 'bg-blue-100 text-blue-600' :
                                                activity.type === 'collaboration' ? 'bg-green-100 text-green-600' :
                                                activity.type === 'achievement' ? 'bg-purple-100 text-purple-600' :
                                                'bg-gray-100 text-gray-600'
                                            }`}>
                                                <activity.icon size={16} />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-gray-900">{activity.message}</p>
                                                <p className="text-sm text-gray-500 mt-1">{activity.time}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'achievements' && (
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-6">Achievements</h2>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="p-4 border border-gray-200 rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            <div className="p-2 bg-yellow-100 rounded-full">
                                                <FiStar className="h-5 w-5 text-yellow-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-gray-900">Code Master</h3>
                                                <p className="text-sm text-gray-500">Completed 50+ coding sessions</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="p-4 border border-gray-200 rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            <div className="p-2 bg-green-100 rounded-full">
                                                <FiUsers className="h-5 w-5 text-green-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-gray-900">Team Player</h3>
                                                <p className="text-sm text-gray-500">Collaborated on 20+ projects</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'settings' && (
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-6">Account Settings</h2>
                                
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            <FiBell className="h-5 w-5 text-gray-600" />
                                            <div>
                                                <h3 className="font-medium text-gray-900">Email Notifications</h3>
                                                <p className="text-sm text-gray-500">Receive updates about your activity</p>
                                            </div>
                                        </div>
                                        <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm">
                                            Enabled
                                        </button>
                                    </div>
                                    
                                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            <FiEye className="h-5 w-5 text-gray-600" />
                                            <div>
                                                <h3 className="font-medium text-gray-900">Profile Visibility</h3>
                                                <p className="text-sm text-gray-500">Control who can see your profile</p>
                                            </div>
                                        </div>
                                        <button className="bg-green-600 text-white px-3 py-1 rounded text-sm">
                                            Public
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Detailed Stats */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Detailed Statistics</h2>
                            
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="bg-blue-100 p-2 rounded-lg">
                                            <FiCode className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <span className="text-gray-900">Lines of Code</span>
                                    </div>
                                    <span className="text-xl font-semibold text-gray-900">{mockStats.linesOfCode.toLocaleString()}</span>
                                </div>
                                
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="bg-green-100 p-2 rounded-lg">
                                            <FiTrendingUp className="h-5 w-5 text-green-600" />
                                        </div>
                                        <span className="text-gray-900">Projects</span>
                                    </div>
                                    <span className="text-xl font-semibold text-gray-900">{mockStats.projectsCompleted}</span>
                                </div>
                                
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="bg-purple-100 p-2 rounded-lg">
                                            <FiStar className="h-5 w-5 text-purple-600" />
                                        </div>
                                        <span className="text-gray-900">Favorite Language</span>
                                    </div>
                                    <span className="text-xl font-semibold text-gray-900">{mockStats.favoriteLanguage}</span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
                            
                            <div className="space-y-3">
                                <button
                                    onClick={() => navigate('/')}
                                    className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <FiCode size={16} />
                                    <span>Start Coding</span>
                                </button>
                                
                                <button className="w-full flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors">
                                    <FiUsers size={16} />
                                    <span>Find Collaborators</span>
                                </button>
                                
                                <button className="w-full flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors">
                                    <FiAward size={16} />
                                    <span>View Achievements</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
