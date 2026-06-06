import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Send, Plus, Trash2 } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const Chat = () => {
  const queryClient = useQueryClient();
  const [selectedSession, setSelectedSession] = useState(null);
  const [message, setMessage] = useState('');

  const { data: sessions } = useQuery({
    queryKey: ['chat-sessions'],
    queryFn: () => api.get('/chat/history').then(res => res.data),
  });

  const { data: currentSession } = useQuery({
    queryKey: ['chat-session', selectedSession],
    queryFn: () => api.get(`/chat/session/${selectedSession}`).then(res => res.data),
    enabled: !!selectedSession,
  });

  const sendMessageMutation = useMutation({
    mutationFn: (data) => api.post('/chat/message', data),
    onSuccess: (data) => {
      setSelectedSession(data.sessionId);
      queryClient.invalidateQueries(['chat-session', data.sessionId]);
      queryClient.invalidateQueries(['chat-sessions']);
      setMessage('');
    },
  });

  const deleteSessionMutation = useMutation({
    mutationFn: (sessionId) => api.delete(`/chat/session/${sessionId}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['chat-sessions']);
      if (selectedSession) {
        setSelectedSession(null);
      }
      toast.success('Session deleted');
    },
  });

  const handleSendMessage = () => {
    if (!message.trim()) return;
    sendMessageMutation.mutate({
      message,
      sessionId: selectedSession,
    });
  };

  const handleNewChat = () => {
    setSelectedSession(null);
    setMessage('');
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-6">
      <div className="w-64 card overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Chat History
          </h2>
          <button
            onClick={handleNewChat}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <Plus className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
        <div className="space-y-2">
          {sessions?.map((session) => (
            <div
              key={session._id}
              onClick={() => setSelectedSession(session._id)}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                selectedSession === session._id
                  ? 'bg-primary-100 dark:bg-primary-900/20'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {session.title}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {new Date(session.updatedAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 card flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {currentSession?.messages?.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] p-3 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                }`}
              >
                <p className="text-sm">{msg.content}</p>
              </div>
            </div>
          ))}
          {!currentSession && (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-600 dark:text-gray-400">
                Start a new conversation with your AI mentor
              </p>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask anything about your career..."
              className="flex-1 input-field"
            />
            <button
              onClick={handleSendMessage}
              disabled={sendMessageMutation.isLoading}
              className="btn-primary"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
