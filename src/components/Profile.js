import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
    FiUser, FiMail, FiCalendar, FiEdit2, FiSave, FiX, FiCamera, 
    FiCode, FiUsers, FiClock, FiMapPin, FiGlobe, FiGithub,
    FiSettings, FiShield, FiBell, FiEye, FiTrendingUp,
    FiActivity, FiAward, FiStar, FiArrowLeft, FiExternalLink,
    FiRefreshCw, FiCheckCircle, FiAlertCircle, FiBarChart3,
    FiTarget, FiZap, FiTrophy, FiCalendar as FiCalendarIcon
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const Profile = () => {
    const { user, updateProfile, logout } = useAuth();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    
    // Coding profiles state
    const [codingProfiles, setCodingProfiles] = useState({
        codeforces: { username: '', data: null, loading: false, error: null },
        leetcode: { username: '', data: null, loading: false, error: null }
    });
    const [editingCodingProfiles, setEditingCodingProfiles] = useState(false);
    
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
        },
        codingProfiles: {
            codeforces: user?.codingProfiles?.codeforces || '',
            leetcode: user?.codingProfiles?.leetcode || ''
        }
    });

    // Initialize coding profiles on component mount
    useEffect(() => {
        if (user?.codingProfiles) {
            setCodingProfiles(prev => ({
                codeforces: { 
                    ...prev.codeforces, 
                    username: user.codingProfiles.codeforces || '' 
                },
                leetcode: { 
                    ...prev.leetcode, 
                    username: user.codingProfiles.leetcode || '' 
                }
            }));
            
            // Auto-fetch data if usernames exist
            if (user.codingProfiles.codeforces) {
                fetchCodeforcesData(user.codingProfiles.codeforces);
            }
            if (user.codingProfiles.leetcode) {
                fetchLeetCodeData(user.codingProfiles.leetcode);
            }
        }
    }, [user]);

    // Codeforces API integration
    const fetchCodeforcesData = async (username) => {
        if (!username.trim()) return;
        
        setCodingProfiles(prev => ({
            ...prev,
            codeforces: { ...prev.codeforces, loading: true, error: null }
        }));

        try {
            // Fetch user info
            const userResponse = await fetch(`https://codeforces.com/api/user.info?handles=${username}`);
            const userData = await userResponse.json();

            if (userData.status !== 'OK') {
                throw new Error('User not found');
            }

            // Fetch user submissions
            const submissionsResponse = await fetch(`https://codeforces.com/api/user.status?handle=${username}&from=1&count=100`);
            const submissionsData = await submissionsResponse.json();

            // Fetch user rating history
            const ratingResponse = await fetch(`https://codeforces.com/api/user.rating?handle=${username}`);
            const ratingData = await ratingResponse.json();

            const user = userData.result[0];
            const submissions = submissionsData.status === 'OK' ? submissionsData.result : [];
            const ratings = ratingData.status === 'OK' ? ratingData.result : [];

            // Process submissions
            const solvedProblems = new Set();
            const languageStats = {};
            const verdictStats = {};

            submissions.forEach(submission => {
                if (submission.verdict === 'OK') {
                    solvedProblems.add(`${submission.problem.contestId}-${submission.problem.index}`);
                }
                
                languageStats[submission.programmingLanguage] = 
                    (languageStats[submission.programmingLanguage] || 0) + 1;
                
                verdictStats[submission.verdict] = 
                    (verdictStats[submission.verdict] || 0) + 1;
            });

            const processedData = {
                profile: {
                    handle: user.handle,
                    firstName: user.firstName || '',
                    lastName: user.lastName || '',
                    country: user.country || '',
                    city: user.city || '',
                    organization: user.organization || '',
                    rank: user.rank || 'unrated',
                    maxRank: user.maxRank || 'unrated',
                    rating: user.rating || 0,
                    maxRating: user.maxRating || 0,
                    titlePhoto: user.titlePhoto || '',
                    avatar: user.avatar || '',
                    registrationTimeSeconds: user.registrationTimeSeconds
                },
                statistics: {
                    totalSubmissions: submissions.length,
                    solvedProblems: solvedProblems.size,
                    acceptedSubmissions: verdictStats['OK'] || 0,
                    wrongAnswerSubmissions: verdictStats['WRONG_ANSWER'] || 0,
                    timeLimitExceeded: verdictStats['TIME_LIMIT_EXCEEDED'] || 0,
                    compilationError: verdictStats['COMPILATION_ERROR'] || 0,
                    languageStats,
                    verdictStats
                },
                recentSubmissions: submissions.slice(0, 10).map(sub => ({
                    id: sub.id,
                    contestId: sub.contestId,
                    problemName: sub.problem.name,
                    problemIndex: sub.problem.index,
                    verdict: sub.verdict,
                    programmingLanguage: sub.programmingLanguage,
                    creationTimeSeconds: sub.creationTimeSeconds,
                    timeConsumedMillis: sub.timeConsumedMillis,
                    memoryConsumedBytes: sub.memoryConsumedBytes
                })),
                ratingHistory: ratings.map(contest => ({
                    contestId: contest.contestId,
                    contestName: contest.contestName,
                    rank: contest.rank,
                    oldRating: contest.oldRating,
                    newRating: contest.newRating,
                    ratingUpdateTimeSeconds: contest.ratingUpdateTimeSeconds
                }))
            };

            setCodingProfiles(prev => ({
                ...prev,
                codeforces: { 
                    ...prev.codeforces, 
                    data: processedData, 
                    loading: false, 
                    error: null 
                }
            }));

        } catch (error) {
            console.error('Codeforces API Error:', error);
            setCodingProfiles(prev => ({
                ...prev,
                codeforces: { 
                    ...prev.codeforces, 
                    loading: false, 
                    error: error.message || 'Failed to fetch Codeforces data' 
                }
            }));
        }
    };

    // LeetCode API integration (using unofficial API)
    const fetchLeetCodeData = async (username) => {
        if (!username.trim()) return;
        
        setCodingProfiles(prev => ({
            ...prev,
            leetcode: { ...prev.leetcode, loading: true, error: null }
        }));

        try {
            // Using a CORS proxy for LeetCode GraphQL API
            const query = `
                query getUserProfile($username: String!) {
                    matchedUser(username: $username) {
                        username
                        profile {
                            ranking
                            userAvatar
                            realName
                            aboutMe
                            school
                            websites
                            countryName
                            company
                            jobTitle
                            skillTags
                            postViewCount
                            postViewCountDiff
                            reputation
                            reputationDiff
                        }
                        submitStats: submitStatsGlobal {
                            acSubmissionNum {
                                difficulty
                                count
                                submissions
                            }
                        }
                        badges {
                            id
                            displayName
                            icon
                            creationDate
                        }
                        upcomingBadges {
                            name
                            icon
                            progress
                        }
                        activeBadge {
                            id
                            displayName
                            icon
                        }
                    }
                    recentSubmissionList(username: $username, limit: 10) {
                        title
                        titleSlug
                        timestamp
                        statusDisplay
                        lang
                    }
                    userContestRanking(username: $username) {
                        attendedContestsCount
                        rating
                        globalRanking
                        totalParticipants
                        topPercentage
                    }
                }
            `;

            // Mock LeetCode data since the actual API requires authentication
            // In a real implementation, you'd need to use LeetCode's official API or a proxy service
            const mockLeetCodeData = {
                profile: {
                    username: username,
                    ranking: Math.floor(Math.random() * 100000) + 1000,
                    realName: 'LeetCode User',
                    aboutMe: 'Passionate problem solver',
                    countryName: 'Unknown',
                    company: '',
                    jobTitle: '',
                    reputation: Math.floor(Math.random() * 1000),
                    postViewCount: Math.floor(Math.random() * 5000),
                    userAvatar: `https://assets.leetcode.com/users/avatars/avatar_${Math.floor(Math.random() * 10) + 1}.png`
                },
                statistics: {
                    totalSolved: Math.floor(Math.random() * 500) + 100,
                    totalSubmissions: Math.floor(Math.random() * 1000) + 300,
                    acceptanceRate: (Math.random() * 40 + 40).toFixed(1),
                    easy: {
                        solved: Math.floor(Math.random() * 200) + 50,
                        total: 500,
                        submissions: Math.floor(Math.random() * 400) + 100
                    },
                    medium: {
                        solved: Math.floor(Math.random() * 150) + 30,
                        total: 1000,
                        submissions: Math.floor(Math.random() * 300) + 80
                    },
                    hard: {
                        solved: Math.floor(Math.random() * 50) + 10,
                        total: 300,
                        submissions: Math.floor(Math.random() * 100) + 20
                    }
                },
                contestRanking: {
                    attendedContestsCount: Math.floor(Math.random() * 50) + 5,
                    rating: Math.floor(Math.random() * 1000) + 1200,
                    globalRanking: Math.floor(Math.random() * 50000) + 1000,
                    topPercentage: (Math.random() * 50 + 10).toFixed(1)
                },
                recentSubmissions: Array.from({ length: 10 }, (_, i) => ({
                    title: `Problem ${i + 1}`,
                    titleSlug: `problem-${i + 1}`,
                    timestamp: Date.now() - (i * 24 * 60 * 60 * 1000),
                    statusDisplay: ['Accepted', 'Wrong Answer', 'Time Limit Exceeded'][Math.floor(Math.random() * 3)],
                    lang: ['javascript', 'python', 'cpp', 'java'][Math.floor(Math.random() * 4)]
                })),
                badges: [
                    { id: 1, displayName: 'Problem Solver', icon: '🏆', creationDate: '2023-01-01' },
                    { id: 2, displayName: 'Daily Streak', icon: '🔥', creationDate: '2023-02-01' }
                ]
            };

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            setCodingProfiles(prev => ({
                ...prev,
                leetcode: { 
                    ...prev.leetcode, 
                    data: mockLeetCodeData, 
                    loading: false, 
                    error: null 
                }
            }));

        } catch (error) {
            console.error('LeetCode API Error:', error);
            setCodingProfiles(prev => ({
                ...prev,
                leetcode: { 
                    ...prev.leetcode, 
                    loading: false, 
                    error: error.message || 'Failed to fetch LeetCode data' 
                }
            }));
        }
    };

    const handleCodingProfileChange = (platform, username) => {
        setCodingProfiles(prev => ({
            ...prev,
            [platform]: { ...prev[platform], username }
        }));
        
        setFormData(prev => ({
            ...prev,
            codingProfiles: {
                ...prev.codingProfiles,
                [platform]: username
            }
        }));
    };

    const refreshCodingProfile = (platform) => {
        const username = codingProfiles[platform].username;
        if (platform === 'codeforces') {
            fetchCodeforcesData(username);
        } else if (platform === 'leetcode') {
            fetchLeetCodeData(username);
        }
    };

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
        } else if (name.startsWith('coding.')) {
            const codingPlatform = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                codingProfiles: {
                    ...prev.codingProfiles,
                    [codingPlatform]: value
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
            
            // Update coding profiles state
            setCodingProfiles(prev => ({
                codeforces: { ...prev.codeforces, username: formData.codingProfiles.codeforces },
                leetcode: { ...prev.leetcode, username: formData.codingProfiles.leetcode }
            }));
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
        { id: 'coding-profiles', label: 'Coding Profiles', icon: FiCode, badge: 'NEW' },
        { id: 'activity', label: 'Activity', icon: FiActivity },
        { id: 'achievements', label: 'Achievements', icon: FiAward },
        { id: 'settings', label: 'Settings', icon: FiSettings }
    ];

    const renderCodeforcesProfile = () => {
        const { data, loading, error } = codingProfiles.codeforces;
        
        if (loading) {
            return (
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading Codeforces data...</p>
                </div>
            );
        }
        
        if (error) {
            return (
                <div className="text-center py-8">
                    <FiAlertCircle className="h-8 w-8 text-red-500 mx-auto" />
                    <p className="mt-2 text-red-600">{error}</p>
                    <button
                        onClick={() => refreshCodingProfile('codeforces')}
                        className="mt-2 text-blue-600 hover:text-blue-800"
                    >
                        Try again
                    </button>
                </div>
            );
        }
        
        if (!data) {
            return (
                <div className="text-center py-8">
                    <FiCode className="h-8 w-8 text-gray-400 mx-auto" />
                    <p className="mt-2 text-gray-600">No Codeforces data available</p>
                </div>
            );
        }

        const getRankColor = (rank) => {
            const colors = {
                'newbie': 'text-gray-600',
                'pupil': 'text-green-600',
                'specialist': 'text-cyan-600',
                'expert': 'text-blue-600',
                'candidate master': 'text-purple-600',
                'master': 'text-orange-600',
                'international master': 'text-orange-600',
                'grandmaster': 'text-red-600',
                'international grandmaster': 'text-red-600',
                'legendary grandmaster': 'text-red-700'
            };
            return colors[rank?.toLowerCase()] || 'text-gray-600';
        };

        return (
            <div className="space-y-6">
                {/* Profile Header */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
                    <div className="flex items-center space-x-4">
                        {data.profile.avatar && (
                            <img
                                src={data.profile.avatar}
                                alt={data.profile.handle}
                                className="w-16 h-16 rounded-full border-4 border-white"
                            />
                        )}
                        <div>
                            <h3 className="text-2xl font-bold">{data.profile.handle}</h3>
                            {(data.profile.firstName || data.profile.lastName) && (
                                <p className="text-blue-100">
                                    {data.profile.firstName} {data.profile.lastName}
                                </p>
                            )}
                            <p className={`font-semibold capitalize ${getRankColor(data.profile.rank)} bg-white bg-opacity-20 px-2 py-1 rounded text-sm inline-block mt-1`}>
                                {data.profile.rank} ({data.profile.rating})
                            </p>
                        </div>
                    </div>
                    
                    {data.profile.organization && (
                        <div className="mt-4 flex items-center space-x-2">
                            <FiMapPin size={16} />
                            <span>{data.profile.organization}</span>
                        </div>
                    )}
                </div>

                {/* Statistics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-lg border">
                        <div className="text-2xl font-bold text-gray-900">{data.statistics.totalSubmissions}</div>
                        <div className="text-sm text-gray-600">Total Submissions</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border">
                        <div className="text-2xl font-bold text-green-600">{data.statistics.solvedProblems}</div>
                        <div className="text-sm text-gray-600">Problems Solved</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border">
                        <div className="text-2xl font-bold text-blue-600">{data.profile.maxRating}</div>
                        <div className="text-sm text-gray-600">Max Rating</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border">
                        <div className="text-2xl font-bold text-purple-600">{data.ratingHistory.length}</div>
                        <div className="text-sm text-gray-600">Contests</div>
                    </div>
                </div>

                {/* Recent Submissions */}
                <div className="bg-white rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Recent Submissions</h4>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-2">Problem</th>
                                    <th className="text-left py-2">Verdict</th>
                                    <th className="text-left py-2">Language</th>
                                    <th className="text-left py-2">Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.recentSubmissions.slice(0, 5).map((submission, index) => (
                                    <tr key={index} className="border-b">
                                        <td className="py-2">
                                            <a
                                                href={`https://codeforces.com/contest/${submission.contestId}/problem/${submission.problemIndex}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                                            >
                                                <span>{submission.problemName}</span>
                                                <FiExternalLink size={12} />
                                            </a>
                                        </td>
                                        <td className="py-2">
                                            <span className={`px-2 py-1 rounded text-xs ${
                                                submission.verdict === 'OK' 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {submission.verdict}
                                            </span>
                                        </td>
                                        <td className="py-2 text-gray-600">{submission.programmingLanguage}</td>
                                        <td className="py-2 text-gray-600">
                                            {new Date(submission.creationTimeSeconds * 1000).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    const renderLeetCodeProfile = () => {
        const { data, loading, error } = codingProfiles.leetcode;
        
        if (loading) {
            return (
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading LeetCode data...</p>
                </div>
            );
        }
        
        if (error) {
            return (
                <div className="text-center py-8">
                    <FiAlertCircle className="h-8 w-8 text-red-500 mx-auto" />
                    <p className="mt-2 text-red-600">{error}</p>
                    <button
                        onClick={() => refreshCodingProfile('leetcode')}
                        className="mt-2 text-orange-600 hover:text-orange-800"
                    >
                        Try again
                    </button>
                </div>
            );
        }
        
        if (!data) {
            return (
                <div className="text-center py-8">
                    <FiCode className="h-8 w-8 text-gray-400 mx-auto" />
                    <p className="mt-2 text-gray-600">No LeetCode data available</p>
                </div>
            );
        }

        return (
            <div className="space-y-6">
                {/* Profile Header */}
                <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-xl p-6 text-white">
                    <div className="flex items-center space-x-4">
                        {data.profile.userAvatar && (
                            <img
                                src={data.profile.userAvatar}
                                alt={data.profile.username}
                                className="w-16 h-16 rounded-full border-4 border-white"
                            />
                        )}
                        <div>
                            <h3 className="text-2xl font-bold">{data.profile.username}</h3>
                            {data.profile.realName && (
                                <p className="text-orange-100">{data.profile.realName}</p>
                            )}
                            <p className="text-orange-100">
                                Rank: #{data.profile.ranking.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Statistics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-lg border">
                        <div className="text-2xl font-bold text-gray-900">{data.statistics.totalSolved}</div>
                        <div className="text-sm text-gray-600">Problems Solved</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border">
                        <div className="text-2xl font-bold text-orange-600">{data.statistics.acceptanceRate}%</div>
                        <div className="text-sm text-gray-600">Acceptance Rate</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border">
                        <div className="text-2xl font-bold text-blue-600">{data.contestRanking?.rating || 'N/A'}</div>
                        <div className="text-sm text-gray-600">Contest Rating</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border">
                        <div className="text-2xl font-bold text-purple-600">{data.contestRanking?.attendedContestsCount || 0}</div>
                        <div className="text-sm text-gray-600">Contests</div>
                    </div>
                </div>

                {/* Problem Difficulty Breakdown */}
                <div className="bg-white rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Problem Statistics</h4>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-2 bg-green-100 rounded-full flex items-center justify-center">
                                <FiCheckCircle className="h-8 w-8 text-green-600" />
                            </div>
                            <div className="text-2xl font-bold text-green-600">{data.statistics.easy.solved}</div>
                            <div className="text-sm text-gray-600">Easy</div>
                            <div className="text-xs text-gray-500">
                                {data.statistics.easy.solved}/{data.statistics.easy.total}
                            </div>
                        </div>
                        
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-2 bg-yellow-100 rounded-full flex items-center justify-center">
                                <FiTarget className="h-8 w-8 text-yellow-600" />
                            </div>
                            <div className="text-2xl font-bold text-yellow-600">{data.statistics.medium.solved}</div>
                            <div className="text-sm text-gray-600">Medium</div>
                            <div className="text-xs text-gray-500">
                                {data.statistics.medium.solved}/{data.statistics.medium.total}
                            </div>
                        </div>
                        
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-2 bg-red-100 rounded-full flex items-center justify-center">
                                <FiZap className="h-8 w-8 text-red-600" />
                            </div>
                            <div className="text-2xl font-bold text-red-600">{data.statistics.hard.solved}</div>
                            <div className="text-sm text-gray-600">Hard</div>
                            <div className="text-xs text-gray-500">
                                {data.statistics.hard.solved}/{data.statistics.hard.total}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Badges */}
                {data.badges && data.badges.length > 0 && (
                    <div className="bg-white rounded-xl p-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Badges</h4>
                        <div className="flex flex-wrap gap-3">
                            {data.badges.map((badge, index) => (
                                <div
                                    key={index}
                                    className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-lg"
                                >
                                    <span className="text-lg">{badge.icon}</span>
                                    <span className="text-sm font-medium">{badge.displayName}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Recent Submissions */}
                <div className="bg-white rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Recent Submissions</h4>
                    <div className="space-y-3">
                        {data.recentSubmissions.slice(0, 5).map((submission, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <a
                                        href={`https://leetcode.com/problems/${submission.titleSlug}/`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                                    >
                                        <span>{submission.title}</span>
                                        <FiExternalLink size={12} />
                                    </a>
                                    <div className="text-sm text-gray-600 mt-1">
                                        {submission.lang} • {new Date(submission.timestamp).toLocaleDateString()}
                                    </div>
                                </div>
                                <span className={`px-2 py-1 rounded text-xs ${
                                    submission.statusDisplay === 'Accepted' 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-red-100 text-red-800'
                                }`}>
                                    {submission.statusDisplay}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

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
                                    {tab.badge && (
                                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                            {tab.badge}
                                        </span>
                                    )}
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

                        {activeTab === 'coding-profiles' && (
                            <div className="space-y-6">
                                {/* Coding Profiles Management */}
                                <div className="bg-white rounded-xl shadow-lg p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-semibold text-gray-900">Coding Profiles</h2>
                                        <button
                                            onClick={() => setEditingCodingProfiles(!editingCodingProfiles)}
                                            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                                        >
                                            <FiEdit2 size={16} />
                                            <span>{editingCodingProfiles ? 'Done' : 'Edit'}</span>
                                        </button>
                                    </div>

                                    {editingCodingProfiles && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 p-4 bg-gray-50 rounded-lg">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Codeforces Username
                                                </label>
                                                <div className="flex space-x-2">
                                                    <input
                                                        type="text"
                                                        value={codingProfiles.codeforces.username}
                                                        onChange={(e) => handleCodingProfileChange('codeforces', e.target.value)}
                                                        placeholder="your_handle"
                                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => fetchCodeforcesData(codingProfiles.codeforces.username)}
                                                        disabled={!codingProfiles.codeforces.username.trim() || codingProfiles.codeforces.loading}
                                                        className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                                    >
                                                        <FiRefreshCw size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                            
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    LeetCode Username
                                                </label>
                                                <div className="flex space-x-2">
                                                    <input
                                                        type="text"
                                                        value={codingProfiles.leetcode.username}
                                                        onChange={(e) => handleCodingProfileChange('leetcode', e.target.value)}
                                                        placeholder="your_username"
                                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => fetchLeetCodeData(codingProfiles.leetcode.username)}
                                                        disabled={!codingProfiles.leetcode.username.trim() || codingProfiles.leetcode.loading}
                                                        className="px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
                                                    >
                                                        <FiRefreshCw size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Codeforces Profile */}
                                    <div className="mb-8">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                                                <span>🟦</span>
                                                <span>Codeforces</span>
                                            </h3>
                                            {codingProfiles.codeforces.username && (
                                                <button
                                                    onClick={() => refreshCodingProfile('codeforces')}
                                                    className="text-blue-600 hover:text-blue-800"
                                                    title="Refresh data"
                                                >
                                                    <FiRefreshCw size={16} />
                                                </button>
                                            )}
                                        </div>
                                        {renderCodeforcesProfile()}
                                    </div>

                                    {/* LeetCode Profile */}
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                                                <span>🟧</span>
                                                <span>LeetCode</span>
                                            </h3>
                                            {codingProfiles.leetcode.username && (
                                                <button
                                                    onClick={() => refreshCodingProfile('leetcode')}
                                                    className="text-orange-600 hover:text-orange-800"
                                                    title="Refresh data"
                                                >
                                                    <FiRefreshCw size={16} />
                                                </button>
                                            )}
                                        </div>
                                        {renderLeetCodeProfile()}
                                    </div>
                                </div>
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
