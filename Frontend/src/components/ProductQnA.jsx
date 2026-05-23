import { useEffect, useState } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ProductQnA = ({ productId, sellerId }) => {
  const { user } = useAuth();
  const [qnas, setQnas] = useState([]);
  const [question, setQuestion] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [answerText, setAnswerText] = useState({});
  const [answeringId, setAnsweringId] = useState(null);

  useEffect(() => {
    API.get(`/qna/${productId}`)
      .then(({ data }) => setQnas(data))
      .catch(() => {});
  }, [productId]);

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!user) return toast.error('Login to ask a question');
    setSubmitting(true);
    try {
      const { data } = await API.post(`/qna/${productId}`, { question });
      setQnas([data, ...qnas]);
      setQuestion('');
      toast.success('Question submitted!');
    } catch {
      toast.error('Failed to submit question');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAnswer = async (qnaId) => {
    try {
      const { data } = await API.put(`/qna/${qnaId}/answer`, { answer: answerText[qnaId] });
      setQnas(qnas.map((q) => q._id === qnaId ? data : q));
      setAnsweringId(null);
      setAnswerText({ ...answerText, [qnaId]: '' });
      toast.success('Answer posted!');
    } catch {
      toast.error('Failed to post answer');
    }
  };

  const handleDelete = async (qnaId) => {
    try {
      await API.delete(`/qna/${qnaId}`);
      setQnas(qnas.filter((q) => q._id !== qnaId));
      toast.success('Question deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const isSeller = user?.role === 'seller';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 mt-6">
      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
        ❓ Product Q&A
        {qnas.length > 0 && (
          <span className="ml-2 text-sm font-normal text-gray-400 dark:text-gray-500">
            ({qnas.length} questions)
          </span>
        )}
      </h2>

      {/* Ask Question Form */}
      {user && user.role === 'buyer' && (
        <form onSubmit={handleAsk} className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              required
              placeholder="Ask a question about this product..."
              className="flex-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm hover:bg-blue-700 disabled:opacity-50 transition font-medium"
            >
              {submitting ? '...' : 'Ask'}
            </button>
          </div>
        </form>
      )}

      {!user && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          <a href="/login" className="text-blue-600 hover:underline">Login</a> to ask a question
        </p>
      )}

      {/* Q&A List */}
      {qnas.length === 0 ? (
        <div className="text-center py-8 text-gray-400 dark:text-gray-500">
          <p className="text-3xl mb-2">💬</p>
          <p className="text-sm">No questions yet. Be the first to ask!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {qnas.map((qna) => (
            <div key={qna._id} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">

              {/* Question */}
              <div className="flex justify-between items-start gap-2 mb-2">
                <div className="flex gap-2 flex-1">
                  <span className="text-blue-600 font-bold text-sm flex-shrink-0">Q.</span>
                  <div>
                    <p className="text-gray-800 dark:text-white text-sm font-medium">{qna.question}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      Asked by {qna.askedBy?.name} · {new Date(qna.createdAt).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                </div>
                {(user?._id === qna.askedBy?._id || user?.role === 'admin') && (
                  <button
                    onClick={() => handleDelete(qna._id)}
                    className="text-xs text-red-400 hover:text-red-600 flex-shrink-0"
                  >
                    Delete
                  </button>
                )}
              </div>

              {/* Answer */}
              {qna.isAnswered ? (
                <div className="flex gap-2 mt-3 pl-4 border-l-2 border-green-400">
                  <span className="text-green-600 font-bold text-sm flex-shrink-0">A.</span>
                  <div>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">{qna.answer}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      Answered by Seller · {new Date(qna.updatedAt).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {isSeller && user?._id === sellerId && answeringId !== qna._id ? (
                    <button
                      onClick={() => setAnsweringId(qna._id)}
                      className="mt-2 text-xs text-blue-600 hover:underline"
                    >
                      + Answer this question
                    </button>
                  ) : isSeller && answeringId === qna._id ? (
                    <div className="mt-3 flex gap-2">
                      <input
                        type="text"
                        value={answerText[qna._id] || ''}
                        onChange={(e) => setAnswerText({ ...answerText, [qna._id]: e.target.value })}
                        placeholder="Write your answer..."
                        className="flex-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-600 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      <button
                        onClick={() => handleAnswer(qna._id)}
                        className="bg-green-600 text-white px-3 py-2 rounded-lg text-xs hover:bg-green-700 transition"
                      >
                        Post
                      </button>
                      <button
                        onClick={() => setAnsweringId(null)}
                        className="text-gray-400 text-xs px-2"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 italic">
                      Awaiting seller response...
                    </p>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductQnA;