import React, { useState, useRef, useEffect } from 'react';
import { FiSend, FiCpu, FiUser, FiCode, FiHelpCircle, FiRefreshCw, FiCopy, FiThumbsUp, FiThumbsDown, FiZap } from 'react-icons/fi';
import { aiService } from '../services/api';
import toast from 'react-hot-toast';

const AIAssistant = ({ code, language, username }) => {
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'assistant',
            content: `Hello ${username}! 👋 I'm your AI coding assistant. I can help you with:
            
• **Code Review** - Analyze your code for bugs and improvements
• **Code Explanation** - Understand complex code snippets  
• **Code Generation** - Generate code from descriptions
• **Debugging Help** - Find and fix issues in your code
• **Best Practices** - Learn coding best practices and patterns

What would you like help with today?`,
            timestamp: new Date().toISOString(),
            suggestions: [
                'Review my current code',
                'Explain this code to me',
                'Help me debug an issue',
                'Generate code for me'
            ]
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [activeFeature, setActiveFeature] = useState(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const addMessage = (type, content, suggestions = null) => {
        const newMessage = {
            id: Date.now(),
            type,
            content,
            timestamp: new Date().toISOString(),
            suggestions
        };
        setMessages(prev => [...prev, newMessage]);
        return newMessage;
    };

    const handleSendMessage = async () => {
        if (!inputMessage.trim() || isLoading) return;

        const userMessage = addMessage('user', inputMessage);
        setInputMessage('');
        setIsLoading(true);

        try {
            const response = await aiService.getCodingHelp(inputMessage, code, language);
            addMessage('assistant', response.content, response.suggestions);
        } catch (error) {
            console.error('AI Assistant Error:', error);
            addMessage('assistant', 'Sorry, I encountered an error. Please try again or rephrase your question.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuickAction = async (action) => {
        setActiveFeature(action);
        setIsLoading(true);

        try {
            let response;
            let userPrompt = '';

            switch (action) {
                case 'review':
                    userPrompt = 'Please review my current code';
                    response = await aiService.reviewCode(code, language);
                    break;
                case 'explain':
                    userPrompt = 'Please explain this code to me';
                    response = await aiService.explainCode(code, language);
                    break;
                case 'debug':
                    userPrompt = 'Help me debug this code';
                    response = await aiService.getCodingHelp('Help me debug and find issues in this code', code, language);
                    break;
                case 'optimize':
                    userPrompt = 'How can I optimize this code?';
                    response = await aiService.getCodingHelp('How can I optimize this code for better performance?', code, language);
                    break;
                default:
                    return;
            }

            addMessage('user', userPrompt);
            addMessage('assistant', response.content, response.suggestions);

        } catch (error) {
            console.error('Quick Action Error:', error);
            addMessage('assistant', 'Sorry, I encountered an error while processing your request.');
        } finally {
            setIsLoading(false);
            setActiveFeature(null);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        setInputMessage(suggestion);
    };

    const copyMessageContent = async (content) => {
        try {
            await navigator.clipboard.writeText(content);
            toast.success('Copied to clipboard');
        } catch (error) {
            toast.error('Failed to copy');
        }
    };

    return (
        <div className="ai-assistant">
            <div className="ai-header">
                <div className="ai-title">
                    <FiCpu className="ai-icon" size={20} />
                    <span>AI Coding Assistant</span>
                    <div className="ai-status online">
                        <div className="status-dot"></div>
                        Online
                    </div>
                </div>
                
                <div className="ai-quick-actions">
                    <button 
                        onClick={() => handleQuickAction('review')}
                        className={`quick-action ${activeFeature === 'review' ? 'active' : ''}`}
                        title="Review code"
                        disabled={isLoading || !code.trim()}
                    >
                        <FiZap size={14} />
                    </button>
                    <button 
                        onClick={() => handleQuickAction('explain')}
                        className={`quick-action ${activeFeature === 'explain' ? 'active' : ''}`}
                        title="Explain code"
                        disabled={isLoading || !code.trim()}
                    >
                        <FiHelpCircle size={14} />
                    </button>
                    <button 
                        onClick={() => handleQuickAction('debug')}
                        className={`quick-action ${activeFeature === 'debug' ? 'active' : ''}`}
                        title="Debug help"
                        disabled={isLoading || !code.trim()}
                    >
                        <FiCode size={14} />
                    </button>
                    <button 
                        onClick={() => handleQuickAction('optimize')}
                        className={`quick-action ${activeFeature === 'optimize' ? 'active' : ''}`}
                        title="Optimize code"
                        disabled={isLoading || !code.trim()}
                    >
                        <FiRefreshCw size={14} />
                    </button>
                </div>
            </div>

            <div className="ai-messages">
                {messages.map((message) => (
                    <div key={message.id} className={`ai-message ${message.type}`}>
                        <div className="message-avatar">
                            {message.type === 'assistant' ? (
                                <FiCpu size={16} />
                            ) : (
                                <FiUser size={16} />
                            )}
                        </div>
                        
                        <div className="message-content">
                            <div className="message-header">
                                <span className="message-sender">
                                    {message.type === 'assistant' ? 'AI Assistant' : username}
                                </span>
                                <span className="message-time">
                                    {new Date(message.timestamp).toLocaleTimeString()}
                                </span>
                            </div>
                            
                            <div className="message-text">
                                {message.content}
                            </div>
                            
                            {message.suggestions && (
                                <div className="message-suggestions">
                                    {message.suggestions.map((suggestion, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleSuggestionClick(suggestion)}
                                            className="suggestion-chip"
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            )}
                            
                            <div className="message-actions">
                                <button
                                    onClick={() => copyMessageContent(message.content)}
                                    className="message-action"
                                    title="Copy message"
                                >
                                    <FiCopy size={12} />
                                </button>
                                
                                {message.type === 'assistant' && (
                                    <>
                                        <button className="message-action" title="Helpful">
                                            <FiThumbsUp size={12} />
                                        </button>
                                        <button className="message-action" title="Not helpful">
                                            <FiThumbsDown size={12} />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                
                {isLoading && (
                    <div className="ai-message assistant">
                        <div className="message-avatar">
                            <FiCpu size={16} />
                        </div>
                        <div className="message-content">
                            <div className="typing-indicator">
                                <div className="typing-dots">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                                <span className="typing-text">AI is thinking...</span>
                            </div>
                        </div>
                    </div>
                )}
                
                <div ref={messagesEndRef} />
            </div>

            <div className="ai-input-container">
                <div className="ai-input-wrapper">
                    <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="Ask me anything about coding..."
                        className="ai-input"
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={isLoading || !inputMessage.trim()}
                        className="ai-send-btn"
                    >
                        <FiSend size={16} />
                    </button>
                </div>
                
                <div className="ai-input-footer">
                    <span className="ai-disclaimer">
                        AI responses may contain errors. Always verify code before using.
                    </span>
                </div>
            </div>
        </div>
    );
};

export default AIAssistant;
