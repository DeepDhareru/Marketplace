import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import Loader from '../components/Loader';
import { FiSend, FiArrowLeft, FiMessageCircle } from 'react-icons/fi';

const ChatPage = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);
  const [otherUser, setOtherUser] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Fetch conversations
  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await API.get('/chat/conversations');
        setConversations(data);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  // Fetch messages when userId changes
  useEffect(() => {
    if (!userId) return;
    const fetch = async () => {
      setMsgLoading(true);
      try {
        const { data } = await API.get(`/chat/messages/${userId}`);
        setMessages(data);
        if (data.length > 0) {
          const other =
            data[0].sender._id === user._id ? data[0].receiver : data[0].sender;
          setOtherUser(other);
        }
      } finally {
        setMsgLoading(false);
      }
    };
    fetch();
  }, [userId]);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    socket.on('receiveMessage', (newMessage) => {
      if (
        newMessage.sender._id === userId ||
        newMessage.receiver._id === userId
      ) {
        setMessages((prev) => [...prev, newMessage]);
      }
      // Update conversations
      setConversations((prev) =>
        prev.map((c) =>
          c.conversationId === newMessage.conversationId
            ? { ...c, lastMessage: newMessage.message, lastTime: newMessage.createdAt }
            : c
        )
      );
    });

    socket.on('typing', ({ senderName }) => {
      setIsTyping(true);
    });

    socket.on('stopTyping', () => {
      setIsTyping(false);
    });

    return () => {
      socket.off('receiveMessage');
      socket.off('typing');
      socket.off('stopTyping');
    };
  }, [socket, userId]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleTyping = () => {
    if (socket && userId) {
      socket.emit('typing', { receiverId: userId, senderName: user.name });
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('stopTyping', { receiverId: userId });
      }, 1500);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim() || !userId) return;
    setSending(true);

    try {
      const { data } = await API.post('/chat/send', {
        receiverId: userId,
        message: message.trim(),
      });

      setMessages((prev) => [...prev, data]);
      socket?.emit('sendMessage', { receiverId: userId, message: data });
      socket?.emit('stopTyping', { receiverId: userId });
      setMessage('');

      // Update conversations list
      setConversations((prev) => {
        const existing = prev.find((c) => c.conversationId === data.conversationId);
        if (existing) {
          return prev.map((c) =>
            c.conversationId === data.conversationId
              ? { ...c, lastMessage: data.message, lastTime: data.createdAt }
              : c
          );
        }
        return [
          {
            conversationId: data.conversationId,
            otherUser: data.receiver,
            lastMessage: data.message,
            lastTime: data.createdAt,
            unreadCount: 0,
          },
          ...prev,
        ];
      });
    } catch {
      // toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, msg) => {
    const date = formatDate(msg.createdAt);
    if (!groups[date]) groups[date] = [];
    groups[date].push(msg);
    return groups;
  }, {});

  if (loading) return <Loader />;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow overflow-hidden flex h-[75vh]">

        {/* Conversations Sidebar */}
        <div className={`w-full md:w-80 border-r dark:border-gray-700 flex flex-col ${userId ? 'hidden md:flex' : 'flex'}`}>

          {/* Sidebar Header */}
          <div className="p-4 border-b dark:border-gray-700">
            <h2 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <FiMessageCircle size={20} className="text-blue-600" />
              Messages
            </h2>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="text-center py-12 px-4 text-gray-400 dark:text-gray-500">
                <FiMessageCircle size={40} className="mx-auto mb-3 opacity-50" />
                <p className="text-sm font-medium">No conversations yet</p>
                <p className="text-xs mt-1">
                  Start a chat from any product page
                </p>
              </div>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.conversationId}
                  onClick={() => navigate(`/chat/${conv.otherUser._id}`)}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition border-b dark:border-gray-700 last:border-0 ${
                    userId === conv.otherUser._id
                      ? 'bg-blue-50 dark:bg-blue-900/20'
                      : ''
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-11 h-11 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold">
                      {conv.otherUser?.name?.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <p className="font-medium text-gray-800 dark:text-white text-sm truncate">
                        {conv.otherUser?.name}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0 ml-1">
                        {formatTime(conv.lastTime)}
                      </p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {conv.lastMessage}
                      </p>
                      {conv.unreadCount > 0 && (
                        <span className="ml-1 bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        {userId ? (
          <div className="flex-1 flex flex-col">

            {/* Chat Header */}
            <div className="p-4 border-b dark:border-gray-700 flex items-center gap-3">
              <button
                onClick={() => navigate('/chat')}
                className="md:hidden text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <FiArrowLeft size={20} />
              </button>
              <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold flex-shrink-0">
                {(otherUser?.name || messages[0]?.sender?.name || 'U')
                  .charAt(0)
                  .toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-800 dark:text-white text-sm">
                  {otherUser?.name ||
                    (messages[0]?.sender?._id === user._id
                      ? messages[0]?.receiver?.name
                      : messages[0]?.sender?.name) ||
                    'Chat'}
                </p>
                <p className="text-xs text-green-500">Online</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {msgLoading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500">
                  <FiMessageCircle size={48} className="mb-3 opacity-30" />
                  <p className="text-sm">No messages yet</p>
                  <p className="text-xs mt-1">Send a message to start the conversation</p>
                </div>
              ) : (
                Object.entries(groupedMessages).map(([date, msgs]) => (
                  <div key={date}>
                    {/* Date Separator */}
                    <div className="flex items-center gap-3 my-4">
                      <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                      <span className="text-xs text-gray-400 dark:text-gray-500 px-2">
                        {date}
                      </span>
                      <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                    </div>

                    {/* Messages for this date */}
                    <div className="space-y-2">
                      {msgs.map((msg) => {
                        const isMine = msg.sender._id === user._id ||
                          msg.sender._id?.toString() === user._id?.toString();
                        return (
                          <div
                            key={msg._id}
                            className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-xs lg:max-w-md ${isMine ? 'items-end' : 'items-start'} flex flex-col`}>
                              <div
                                className={`px-4 py-2.5 rounded-2xl text-sm ${
                                  isMine
                                    ? 'bg-blue-600 text-white rounded-br-sm'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-bl-sm'
                                }`}
                              >
                                {msg.message}
                              </div>
                              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 px-1">
                                {formatTime(msg.createdAt)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-bl-sm px-4 py-3">
                    <div className="flex gap-1 items-center">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form
              onSubmit={handleSend}
              className="p-4 border-t dark:border-gray-700 flex gap-2"
            >
              <input
                type="text"
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  handleTyping();
                }}
                placeholder="Type a message..."
                className="flex-1 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={!message.trim() || sending}
                className="bg-blue-600 text-white w-11 h-11 rounded-xl flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 transition flex-shrink-0"
              >
                {sending ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <FiSend size={16} />
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center text-gray-400 dark:text-gray-500 flex-col">
            <FiMessageCircle size={64} className="mb-4 opacity-20" />
            <p className="text-lg font-medium">Select a conversation</p>
            <p className="text-sm mt-1">Or start a chat from a product page</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;