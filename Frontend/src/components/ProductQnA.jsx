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
  const [loading, setLoading] = useState(true);

  console.log('ProductQnA Props:', {
    productId,
    sellerId,
    sellerIdType: typeof sellerId,
    userId: user?._id,
    userIdType: typeof user?._id,
    userRole: user?.role,
    isMatch: user?._id?.toString() === sellerId?.toString(),
  });

  useEffect(() => {
    API.get(`/qna/${productId}`)
      .then(({ data }) => setQnas(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [productId]);

  // Fix: Compare both as strings to avoid ObjectId vs string mismatch
  const isProductSeller =
    user?.role === 'seller' &&
    sellerId &&
    user?._id?.toString() === sellerId?.toString();

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!user) return toast.error('Login to ask a question');
    if (!question.trim()) return;
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
    if (!answerText[qnaId]?.trim()) return toast.error('Enter an answer');
    try {
      const { data } = await API.put(`/qna/${qnaId}/answer`, {
        answer: answerText[qnaId],
      });
      setQnas(qnas.map((q) => (q._id === qnaId ? data : q)));
      setAnsweringId(null);
      setAnswerText({ ...answerText, [qnaId]: '' });
      toast.success('Answer posted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post answer');
    }
  };

  const handleDelete = async (qnaId) => {
    if (!window.confirm('Delete this question?')) return;
    try {
      await API.delete(`/qna/${qnaId}`);
      setQnas(qnas.filter((q) => q._id !== qnaId));
      toast.success('Question deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 mt-6">
      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
        ❓ Product Q&A
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        {isProductSeller
          ? 'You are the seller — answer questions from buyers below.'
          : 'Have a question? Ask the seller directly.'}
      </p>

      {/* Ask Question — only for buyers */}
      {user?.role === 'buyer' && (
        <form onSubmit={handleAsk} className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Ask a Question
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              required
              placeholder="e.g. Is this waterproof? What is the warranty?"
              className="flex-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm hover:bg-blue-700 disabled:opacity-50 transition font-medium flex-shrink-0"
            >
              {submitting ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
              ) : 'Ask'}
            </button>
          </div>
        </form>
      )}

      {/* Not logged in */}
      {!user && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mb-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <a href="/login" className="text-blue-600 hover:underline font-medium">
              Login
            </a>{' '}
            to ask a question
          </p>
        </div>
      )}

      {/* Seller info banner */}
      {isProductSeller && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-3 mb-4 flex items-center gap-2">
          <span className="text-green-600 text-lg">🏪</span>
          <p className="text-green-700 dark:text-green-300 text-sm font-medium">
            You are the seller of this product. Click "Answer" on any unanswered question below.
          </p>
        </div>
      )}

      {/* Q&A List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : qnas.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 dark:bg-gray-700 rounded-xl">
          <p className="text-3xl mb-2">💬</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No questions yet. Be the first to ask!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {qnas.map((qna) => (
            <div
              key={qna._id}
              className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4"
            >
              {/* Question Row */}
              <div className="flex justify-between items-start gap-2">
                <div className="flex gap-2 flex-1">
                  <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">Q</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-800 dark:text-white text-sm font-medium">
                      {qna.question}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      Asked by {qna.askedBy?.name} ·{' '}
                      {new Date(qna.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                {/* Delete button — for question owner or admin */}
                {(user?._id?.toString() === qna.askedBy?._id?.toString() ||
                  user?.role === 'admin') && (
                  <button
                    onClick={() => handleDelete(qna._id)}
                    className="text-xs text-red-400 hover:text-red-600 flex-shrink-0 transition"
                  >
                    Delete
                  </button>
                )}
              </div>

              {/* Answer Row */}
              {qna.isAnswered ? (
                <div className="flex gap-2 mt-3 ml-8 pl-3 border-l-2 border-green-400">
                  <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">A</span>
                  </div>
                  <div>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">
                      {qna.answer}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      Answered by Seller ·{' '}
                      {new Date(qna.updatedAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mt-3 ml-8">
                  {/* Answer button for seller */}
                  {isProductSeller && answeringId !== qna._id && (
                    <button
                      onClick={() => setAnsweringId(qna._id)}
                      className="text-xs bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800 px-3 py-1.5 rounded-lg hover:bg-green-100 transition font-medium"
                    >
                      ✏️ Answer this question
                    </button>
                  )}

                  {/* Answer input form */}
                  {isProductSeller && answeringId === qna._id && (
                    <div className="space-y-2">
                      <textarea
                        value={answerText[qna._id] || ''}
                        onChange={(e) =>
                          setAnswerText({ ...answerText, [qna._id]: e.target.value })
                        }
                        placeholder="Write a helpful answer for the buyer..."
                        rows={2}
                        className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-600 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAnswer(qna._id)}
                          className="bg-green-600 text-white px-4 py-1.5 rounded-lg text-xs hover:bg-green-700 transition font-medium"
                        >
                          Post Answer
                        </button>
                        <button
                          onClick={() => {
                            setAnsweringId(null);
                            setAnswerText({ ...answerText, [qna._id]: '' });
                          }}
                          className="text-gray-500 dark:text-gray-400 text-xs px-3 py-1.5 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Awaiting answer message for non-sellers */}
                  {!isProductSeller && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 italic">
                      ⏳ Awaiting seller response...
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductQnA;