import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import chatService from '../services/chatService';
import { 
  PaperAirplaneIcon, 
  UserIcon, 
  ChatBubbleLeftIcon,
  PlusIcon,
  TrashIcon,
  ClockIcon,
  SparklesIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { 
  ChatBubbleLeftIcon as ChatBubbleLeftSolidIcon,
  HeartIcon as HeartSolidIcon
} from '@heroicons/react/24/solid';

const Home = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [currentSessionTitle, setCurrentSessionTitle] = useState('');
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadChatSessions();
  }, []);

  const loadChatSessions = async () => {
    setLoadingSessions(true);
    const result = await chatService.getChatSessions();
    if (result.success) {
      setSessions(result.data || []);
    }
    setLoadingSessions(false);
  };

  const loadChatSession = async (sessionId) => {
    setLoading(true);
    const result = await chatService.getChatSession(sessionId);
    if (result.success) {
      const session = result.data;
      setCurrentSessionId(session.id);
      setCurrentSessionTitle(session.title);
      
      // Convert backend messages to frontend format
      const formattedMessages = [];
      if (session.messages) {
        session.messages.forEach(msg => {
          formattedMessages.push({
            id: `${msg.id}-user`,
            type: 'user',
            content: msg.userMessage,
            timestamp: new Date(msg.timestamp)
          });
          formattedMessages.push({
            id: `${msg.id}-bot`,
            type: 'bot',
            content: msg.botResponse,
            timestamp: new Date(msg.timestamp),
            confidence: msg.confidenceScore,
            references: msg.sourceReferences
          });
        });
      }
      setMessages(formattedMessages);
    }
    setLoading(false);
  };

  const startNewSession = async () => {
    try {
      setLoading(true);
      const result = await chatService.createNewChatSession();
      
      if (result.success) {
        setCurrentSessionId(result.data.id);
        setCurrentSessionTitle(result.data.title);
        setMessages([{
          id: 'welcome',
          type: 'bot',
          content: 'Hello! I\'m your AI medical assistant. How can I help you today?',
          timestamp: new Date()
        }]);
        
        // Refresh session list
        loadChatSessions();
      } else {
        // Fallback to local new session
        setCurrentSessionId(null);
        setCurrentSessionTitle('');
        setMessages([{
          id: 'welcome',
          type: 'bot',
          content: 'Hello! I\'m your AI medical assistant. How can I help you today?',
          timestamp: new Date()
        }]);
      }
    } catch (error) {
      // Fallback to local new session
      setCurrentSessionId(null);
      setCurrentSessionTitle('');
      setMessages([{
        id: 'welcome',
        type: 'bot',
        content: 'Hello! I\'m your AI medical assistant. How can I help you today?',
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || loading) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToSend = inputMessage.trim();
    setInputMessage('');
    setLoading(true);

    try {
      let result;
      
      if (currentSessionId) {
        // Send to existing session
        result = await chatService.sendMessage(messageToSend, currentSessionId);
      } else {
        // Create new session
        const sessionTitle = messageToSend.length > 50 
          ? messageToSend.substring(0, 47) + '...' 
          : messageToSend;
        result = await chatService.sendMessage(messageToSend, null, sessionTitle);
      }
      
      if (result.success) {
        const chatData = result.data;
        
        // Update session info if new session was created
        if (chatData.isNewSession && chatData.sessionId) {
          setCurrentSessionId(chatData.sessionId);
          setCurrentSessionTitle(chatData.sessionTitle);
          loadChatSessions(); // Refresh session list
        }

        const botMessage = {
          id: `bot-${Date.now()}`,
          type: 'bot',
          content: chatData.botResponse,
          timestamp: new Date(chatData.timestamp),
          confidence: chatData.confidenceScore,
          references: chatData.sourceReferences
        };

        setMessages(prev => [...prev, botMessage]);
      } else {
        const errorMessage = {
          id: `error-${Date.now()}`,
          type: 'bot',
          content: result.error || 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      const errorMessage = {
        id: `error-${Date.now()}`,
        type: 'bot',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const deleteChatSession = async (sessionId) => {
    const result = await chatService.deleteChatSession(sessionId);
    if (result.success) {
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      if (currentSessionId === sessionId) {
        startNewSession();
      }
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {/* Welcome Header */}
          <div className="text-center py-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl float">
                <SparklesIcon className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold gradient-text mb-2">Medical AI Assistant</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Your intelligent healthcare companion, ready to help 24/7
            </p>
          </div>

          {/* Chat Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Chat Sessions Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 dark:border-slate-600/50 overflow-hidden hover-lift">
                <div className="p-6 border-b border-gray-200/50 dark:border-slate-600/50">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                      <ChatBubbleLeftSolidIcon className="w-5 h-5 text-blue-500" />
                      <span>Chat History</span>
                    </h3>
                    <button
                      onClick={startNewSession}
                      className="flex items-center space-x-2 px-4 py-2 text-sm bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover-scale"
                    >
                      <PlusIcon className="h-4 w-4" />
                      <span>New Chat</span>
                    </button>
                  </div>
                </div>
                
                <div className="max-h-96 overflow-y-auto chat-scrollbar">
                  {loadingSessions ? (
                    <div className="p-6 flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                  ) : sessions.length === 0 ? (
                    <div className="p-6 text-center">
                      <ChatBubbleLeftIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        No conversations yet.<br />Start your first chat!
                      </p>
                    </div>
                  ) : (
                    <div className="p-2 space-y-2">
                      {sessions.map((session, index) => (
                        <div
                          key={session.id}
                          className={`p-4 cursor-pointer rounded-xl transition-all duration-200 hover-lift ${
                            currentSessionId === session.id 
                              ? 'bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-200 dark:border-blue-700' 
                              : 'hover:bg-gray-50 dark:hover:bg-slate-700/50'
                          } slide-in-left`}
                          style={{ animationDelay: `${index * 0.1}s` }}
                          onClick={() => loadChatSession(session.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate mb-1">
                                {session.title}
                              </h4>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate mb-2">
                                {session.lastMessage}
                              </p>
                              <div className="flex items-center text-xs text-gray-400 dark:text-gray-500">
                                <ClockIcon className="h-3 w-3 mr-1" />
                                {formatDate(session.updatedAt)}
                              </div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteChatSession(session.id);
                              }}
                              className="ml-2 p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Chat Interface */}
            <div className="lg:col-span-3">
              <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 dark:border-slate-600/50 overflow-hidden hover-lift">
                {/* Chat Header */}
                <div className="p-6 border-b border-gray-200/50 dark:border-slate-600/50 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-700">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                      <HeartSolidIcon className="w-6 h-6 text-white pulse-glow" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {currentSessionTitle || 'AI Medical Assistant'}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Always here to help with your health questions
                      </p>
                      {currentSessionId && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          Session ID: {currentSessionId}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Chat Messages */}
                <div className="h-96 overflow-y-auto p-6 space-y-4 chat-scrollbar">
                  {messages.length === 0 && !currentSessionId && (
                    <div className="text-center text-gray-500 dark:text-gray-400 mt-16 fade-in">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <ChatBubbleLeftIcon className="h-10 w-10 text-blue-400" />
                      </div>
                      <h4 className="text-lg font-medium mb-2">Ready to help you!</h4>
                      <p className="text-sm">Start a new conversation or select an existing session from the sidebar</p>
                    </div>
                )}
                
                {messages.map((message, index) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.type === 'user' ? 'justify-end' : 'justify-start'
                    } slide-in-${message.type === 'user' ? 'right' : 'left'}`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className={`flex items-start space-x-3 max-w-4xl ${
                      message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                    }`}>
                      {/* Avatar */}
                      <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${
                        message.type === 'user'
                          ? 'bg-gradient-to-br from-blue-500 to-purple-600'
                          : 'bg-gradient-to-br from-green-400 to-blue-500'
                      }`}>
                        {message.type === 'user' ? (
                          <UserIcon className="w-6 h-6 text-white" />
                        ) : (
                          <HeartSolidIcon className="w-6 h-6 text-white" />
                        )}
                      </div>
                      
                      {/* Message Content */}
                      <div
                        className={`px-6 py-4 rounded-2xl shadow-lg max-w-lg hover-lift ${
                          message.type === 'user'
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                            : 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-600'
                        }`}
                      >
                        <div className="text-sm whitespace-pre-wrap leading-relaxed">
                          {message.content}
                        </div>
                        
                        {/* Show confidence score and references for bot messages */}
                        {message.type === 'bot' && message.confidence && (
                          <div className="mt-4 pt-3 border-t border-gray-200 dark:border-slate-600">
                            <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                              <div className="flex items-center space-x-1">
                                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                <span>Confidence: {Math.round(message.confidence * 100)}%</span>
                              </div>
                            </div>
                            {message.references && message.references.length > 0 && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                <span className="font-medium">Sources:</span> {message.references.join(', ')}
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Timestamp */}
                        <div className={`text-xs mt-2 ${
                          message.type === 'user' 
                            ? 'text-blue-100' 
                            : 'text-gray-400 dark:text-gray-500'
                        }`}>
                          {formatTime(message.timestamp)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {loading && (
                  <div className="flex justify-start slide-in-left">
                    <div className="flex items-start space-x-3 max-w-4xl">
                      <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-br from-green-400 to-blue-500">
                        <HeartSolidIcon className="w-6 h-6 text-white pulse-glow" />
                      </div>
                      <div className="bg-white dark:bg-slate-700 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-600 px-6 py-4 rounded-2xl shadow-lg">
                        <div className="flex items-center space-x-3">
                          <div className="flex space-x-1">
                            <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce"></div>
                            <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-3 h-3 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                          <span className="text-sm text-gray-500 dark:text-gray-400">AI is thinking...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="border-t border-gray-200/50 dark:border-slate-600/50 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 p-6">
                <form onSubmit={handleSendMessage} className="flex space-x-4">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder="Ask me about medical conditions, symptoms, treatments..."
                      className="w-full border border-gray-300 dark:border-slate-600 rounded-2xl px-6 py-4 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 shadow-lg transition-all duration-200"
                      disabled={loading}
                      maxLength={1000}
                    />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-xs text-gray-400 dark:text-gray-500">
                      {inputMessage.length}/1000
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading || !inputMessage.trim()}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-4 rounded-2xl hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover-scale"
                  >
                    <PaperAirplaneIcon className="h-6 w-6" />
                  </button>
                </form>
                <div className="flex items-center justify-center mt-4 text-xs text-gray-500 dark:text-gray-400">
                  <HeartIcon className="w-4 h-4 mr-2 text-red-400" />
                  <span>AI medical assistant • Always consult healthcare professionals for serious medical concerns</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default Home;
