import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiMessageCircle } from 'react-icons/fi';

const ChatButton = ({ sellerId, sellerName }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleChat = () => {
    if (!user) return toast.error('Login to chat with seller');
    if (user.role === 'seller' && user._id === sellerId) {
      return toast.error("You can't chat with yourself");
    }
    navigate(`/chat/${sellerId}`);
  };

  if (!sellerId) return null;
  if (user?._id?.toString() === sellerId?.toString()) return null;

  return (
    <button
      onClick={handleChat}
      className="w-full flex items-center justify-center gap-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-3 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition text-sm"
    >
      <FiMessageCircle size={18} />
      Chat with Seller
    </button>
  );
};

export default ChatButton;