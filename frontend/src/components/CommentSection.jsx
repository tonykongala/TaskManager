import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import useFetch from '../hooks/useFetch';

const CommentSection = ({ taskId }) => {
  const { token, user } = useSelector(state => state.authReducer);
  const [fetchData, { loading }] = useFetch();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");

  const fetchComments = async () => {
    const config = {
      url: `/comments/${taskId}`,
      method: "get",
      headers: { Authorization: token }
    };
    const res = await fetchData(config, { showSuccessToast: false });
    if (res) setComments(res);
  };

  useEffect(() => {
    if (taskId) {
      fetchComments();
    }
  }, [taskId]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    const config = {
      url: "/comments",
      method: "post",
      data: { taskId, text },
      headers: { Authorization: token }
    };
    const res = await fetchData(config);
    if (res) {
      setText("");
      fetchComments();
    }
  };

  return (
    <div className="mt-10 p-4 border-t border-gray-700">
      <h3 className="text-lg font-semibold mb-4 text-white">Comments</h3>

      {/* New Comment Form */}
      <form onSubmit={handleCommentSubmit} className="mb-6">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full bg-[#2c2c2c] text-white p-3 border border-gray-600 rounded-md resize-none"
          rows="3"
          placeholder="Write a comment..."
        />
        <button
          type="submit"
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Post Comment
        </button>
      </form>

      {/* All Comments */}
      {loading ? (
        <p className="text-gray-400">Loading comments...</p>
      ) : comments.length === 0 ? (
        <p className="text-gray-400">No comments yet.</p>
      ) : (
        <ul className="space-y-4">
          {comments.map(comment => (
            <li key={comment._id} className="p-3 bg-[#2a2a2a] rounded-md border border-gray-600">
              <div className="text-sm text-gray-400 mb-1">
                <span className="font-semibold text-white">{comment.user.name}</span> •{" "}
                {new Date(comment.createdAt).toLocaleString()}
              </div>
              <div className="text-white">{comment.text}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CommentSection;
