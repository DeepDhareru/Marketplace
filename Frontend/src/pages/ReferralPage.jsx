import { useEffect, useState } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';

const ReferralPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await API.get('/auth/referral/stats');
        setStats(data);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const copyCode = () => {
    navigator.clipboard.writeText(stats?.referralCode || '');
    setCopied(true);
    toast.success('Referral code copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const copyLink = () => {
    const link = `${window.location.origin}/register?ref=${stats?.referralCode}`;
    navigator.clipboard.writeText(link);
    toast.success('Referral link copied!');
  };

  const shareLink = () => {
    const link = `${window.location.origin}/register?ref=${stats?.referralCode}`;
    if (navigator.share) {
      navigator.share({
        title: 'Join Marketplace!',
        text: `Use my referral code ${stats?.referralCode} and get ₹30 credits when you sign up!`,
        url: link,
      });
    } else {
      copyLink();
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
        🎁 Referral Program
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">
        Invite friends and earn credits for every successful referral
      </p>

      {/* How it works */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { step: '1', icon: '🔗', title: 'Share Your Link', desc: 'Share your unique referral code or link with friends' },
          { step: '2', icon: '👤', title: 'Friend Signs Up', desc: 'Your friend creates an account using your referral code' },
          { step: '3', icon: '💰', title: 'Both Get Credits', desc: 'You get ₹50 and your friend gets ₹30 credits!' },
        ].map((item) => (
          <div key={item.step} className="bg-white dark:bg-gray-800 rounded-2xl shadow p-5 text-center relative overflow-hidden">
            <div className="absolute top-3 right-3 w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-blue-600 dark:text-blue-300">{item.step}</span>
            </div>
            <p className="text-3xl mb-3">{item.icon}</p>
            <p className="font-semibold text-gray-800 dark:text-white mb-1">{item.title}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Credits Card */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 mb-6 text-white">
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <p className="text-blue-200 text-sm mb-1">Your Referral Credits</p>
            <p className="text-4xl font-bold">₹{stats?.referralCredits || 0}</p>
            <p className="text-blue-200 text-sm mt-1">
              Available to use at checkout
            </p>
          </div>
          <div className="text-right">
            <p className="text-blue-200 text-sm mb-1">Total Referrals</p>
            <p className="text-4xl font-bold">{stats?.totalReferrals || 0}</p>
            <p className="text-blue-200 text-sm mt-1">Friends joined</p>
          </div>
        </div>
      </div>

      {/* Referral Code Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 mb-6">
        <h2 className="font-semibold text-gray-800 dark:text-white mb-4">
          Your Referral Code
        </h2>

        {/* Code Display */}
        <div className="flex gap-3 items-center mb-4">
          <div className="flex-1 bg-gray-50 dark:bg-gray-700 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-xl px-6 py-4 text-center">
            <p className="text-2xl font-bold font-mono tracking-widest text-blue-600 dark:text-blue-400">
              {stats?.referralCode}
            </p>
          </div>
          <button
            onClick={copyCode}
            className={`px-4 py-3 rounded-xl font-medium text-sm transition flex-shrink-0 ${
              copied
                ? 'bg-green-600 text-white'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {copied ? '✓ Copied!' : 'Copy Code'}
          </button>
        </div>

        {/* Share Buttons */}
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={copyLink}
            className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 py-2.5 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition font-medium flex items-center justify-center gap-2"
          >
            🔗 Copy Link
          </button>
          <button
            onClick={shareLink}
            className="flex-1 bg-green-600 text-white py-2.5 rounded-xl text-sm hover:bg-green-700 transition font-medium flex items-center justify-center gap-2"
          >
            📤 Share
          </button>
        </div>

        {/* Referral Link Preview */}
        <div className="mt-3 bg-gray-50 dark:bg-gray-700 rounded-lg px-3 py-2">
          <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
            {window.location.origin}/register?ref={stats?.referralCode}
          </p>
        </div>
      </div>

      {/* Referral History */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
        <h2 className="font-semibold text-gray-800 dark:text-white mb-4">
          Referral History
        </h2>
        {stats?.referrals?.length === 0 ? (
          <div className="text-center py-10 text-gray-400 dark:text-gray-500">
            <p className="text-4xl mb-3">👥</p>
            <p className="font-medium mb-1">No referrals yet</p>
            <p className="text-sm">Share your code and start earning!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {stats?.referrals?.map((referral, i) => (
              <div
                key={referral._id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold">
                    {referral.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white text-sm">
                      {referral.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Joined {new Date(referral.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                <span className="text-green-600 dark:text-green-400 font-semibold text-sm">
                  +₹50
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReferralPage;