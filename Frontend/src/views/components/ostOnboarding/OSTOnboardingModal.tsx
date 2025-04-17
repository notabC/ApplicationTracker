import React, { useState, useRef, useEffect, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { X, UploadCloud, Send, Loader, User, Bot, CheckCircle, AlertCircle, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { container } from '@/di/container';
import { SERVICE_IDENTIFIERS } from '@/di/identifiers';
import { OSTOnboardingViewModel } from '@/viewModels/OSTOnboardingViewModel';
import { ChatMessage } from '@/domain/models/OSTUserModels';
import { v4 as uuidv4 } from 'uuid';

interface OSTOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OSTOnboardingModal: React.FC<OSTOnboardingModalProps> = observer(({ isOpen, onClose }) => {
  const viewModel = container.get<OSTOnboardingViewModel>(SERVICE_IDENTIFIERS.OSTOnboardingViewModel);
  const [inputValue, setInputValue] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [smartModeEnabled, setSmartModeEnabled] = useState(false);

  // Sync the isOpen prop with viewModel.state.isModalOpen
  useEffect(() => {
    if (isOpen && !viewModel.state.isModalOpen) {
      viewModel.openModal();
    } else if (!isOpen && viewModel.state.isModalOpen) {
      viewModel.closeModal();
    }
  }, [isOpen, viewModel]);

  // Debug logging
  useEffect(() => {
    console.log("OSTOnboardingModal: viewModel state:", viewModel.state);
    console.log("OSTOnboardingModal: chatMessages count:", viewModel.chatMessages.length);
  }, [viewModel.state, viewModel.chatMessages]);

  // Scroll to bottom when new messages appear
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [viewModel.chatMessages]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      viewModel.setResumeFile(event.target.files[0]);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    if (viewModel.state.step === 'questioning') {
      // Normal question-answer mode
      viewModel.submitAnswer(inputValue.trim());
      setInputValue('');
    } else if (smartModeEnabled) {
      // Smart reasoning mode
      viewModel.startReasoning(inputValue.trim());
      setInputValue('');
    }
  };

  const toggleSmartMode = () => {
    setSmartModeEnabled(prev => !prev);
    
    // Add system message about mode change
    if (!smartModeEnabled) {
      viewModel.addChatMessage({
        id: uuidv4(),
        sender: 'system',
        text: "Smart reasoning mode enabled. I'll think step by step about your questions.",
        timestamp: new Date()
      });
    } else {
      viewModel.addChatMessage({
        id: uuidv4(),
        sender: 'system',
        text: "Smart reasoning mode disabled.",
        timestamp: new Date()
      });
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleModalClose = useCallback(() => {
    viewModel.closeModal(); // First close via the viewModel
    onClose(); // Then notify parent
  }, [viewModel, onClose]);

  const renderChatMessage = (msg: ChatMessage) => {
    const isUser = msg.sender === 'user';
    const isAI = msg.sender === 'ai';
    const isSystem = msg.sender === 'system';

    return (
      <motion.div
        key={msg.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`flex items-start gap-3 mb-4 ${isUser ? 'justify-end' : ''}`}
      >
        {!isUser && (
          <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center 
                          ${isAI ? 'bg-cyan-600/30 text-cyan-300' : 'bg-gray-600/30 text-gray-300'}
                          shadow-[inset_2px_2px_4px_#111316,inset_-2px_-2px_4px_#232732]
                         `}>
            {isAI ? <Bot size={16} /> : <AlertCircle size={16} />}
          </div>
        )}
        <div className={`
            px-4 py-2 rounded-xl max-w-[75%] 
            ${isUser 
              ? 'bg-blue-600/40 text-blue-100 shadow-[inset_2px_2px_4px_rgba(0,0,100,0.3),inset_-2px_-2px_4px_rgba(0,0,255,0.2)]' 
              : 'bg-[#1a1d24] text-gray-200 shadow-[inset_2px_2px_4px_#111316,inset_-2px_-2px_4px_#232732]'}
          `}
        >
          <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
          {/* Optional: Add timestamp */}
          {/* <span className="text-xs text-gray-500 block mt-1 text-right">{msg.timestamp.toLocaleTimeString()}</span> */}
        </div>
         {isUser && (
          <div className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center bg-blue-600/30 text-blue-300 shadow-[inset_2px_2px_4px_rgba(0,0,100,0.3),inset_-2px_-2px_4px_rgba(0,0,255,0.2)]">
            <User size={16} />
          </div>
        )}
      </motion.div>
    );
  };

  const isLoading = viewModel.state.step === 'uploading' || viewModel.state.step === 'analyzing' || viewModel.state.step === 'submitting' || viewModel.reasoningActive;
  const showInput = viewModel.state.step === 'questioning' || viewModel.state.step === 'completed' || viewModel.state.step === 'idle';
  const showUpload = viewModel.state.step === 'idle' || viewModel.state.errorMessage === 'Please select a valid PDF file.';
  const isInputDisabled = isLoading || (viewModel.state.step === 'questioning' && viewModel.reasoningActive);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={handleModalClose} // Updated to use the new handler
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="bg-[#1a1d24] w-full max-w-2xl h-[85vh] rounded-2xl overflow-hidden border border-[#232732]/20 shadow-[8px_8px_16px_#111316,-8px_-8px_16px_#232732] flex flex-col"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#232732]/20 shadow-[inset_0_-2px_4px_#111316]">
              <div className="flex items-center">
                <h2 className="text-lg font-semibold text-white/90">AI Job Search Optimizer Setup</h2>
                
                {/* Smart Mode Toggle */}
                {(viewModel.state.step === 'completed' || viewModel.state.step === 'idle') && (
                  <button
                    onClick={toggleSmartMode}
                    className={`ml-4 p-1.5 rounded-lg flex items-center gap-1 text-xs transition-colors
                      ${smartModeEnabled 
                        ? 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/30' 
                        : 'bg-gray-700/30 text-gray-400 border border-gray-600/30'}`}
                    title={smartModeEnabled ? "Disable step-by-step reasoning" : "Enable step-by-step reasoning"}
                  >
                    <Brain size={14} />
                    <span>{smartModeEnabled ? "Smart Mode" : "Basic Mode"}</span>
                  </button>
                )}
              </div>
              
              <button 
                onClick={handleModalClose}
                className="p-1.5 rounded-lg hover:bg-gray-700/50 transition-colors text-gray-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Chat Area */}
            <div ref={chatContainerRef} className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-[#232732] scrollbar-track-[#16181d]">
              {viewModel.chatMessages.map(renderChatMessage)}
              {isLoading && (
                <div className="flex justify-center items-center mt-4">
                  <Loader size={20} className="animate-spin text-cyan-400 mr-2" />
                  <span className="text-sm text-cyan-400">{viewModel.state.processingUpdates[viewModel.state.processingUpdates.length - 1] || 'Processing...'}</span>
                </div>
              )}
              {viewModel.state.step === 'completed' && viewModel.state.createdProfile && (
                  <div className="flex justify-center items-center mt-4 p-3 rounded-lg bg-green-600/20 border border-green-500/30">
                      <CheckCircle size={20} className="text-green-400 mr-2 flex-shrink-0" />
                      <span className="text-sm text-green-300">
                          Profile created! User ID: {viewModel.state.createdProfile.user_id}
                      </span>
                  </div>
              )}
              {viewModel.state.step === 'error' && viewModel.state.errorMessage && (
                  <div className="flex justify-center items-center mt-4 p-3 rounded-lg bg-red-600/20 border border-red-500/30">
                      <AlertCircle size={20} className="text-red-400 mr-2 flex-shrink-0" />
                      <span className="text-sm text-red-300">Error: {viewModel.state.errorMessage}</span>
                  </div>
              )}
            </div>

            {/* Footer: Upload or Input */}
            <div className="p-4 border-t border-[#232732]/20 shadow-[inset_0_2px_4px_#111316]">
              {showUpload && (
                <button
                  onClick={handleUploadClick}
                  disabled={viewModel.state.step === 'uploading' || viewModel.state.step === 'analyzing'}
                  className="
                    w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl
                    bg-[#1a1d24] border border-[#232732]/20
                    shadow-[4px_4px_8px_#111316,-4px_-4px_8px_#232732]
                    hover:shadow-[inset_4px_4px_8px_#111316,inset_-4px_-4px_8px_#232732]
                    text-cyan-400 hover:text-cyan-300 font-medium
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-all duration-200 group
                  "
                >
                  <UploadCloud size={18} className="text-cyan-400 group-hover:text-cyan-300"/>
                  {viewModel.state.resumeFileName ? `Upload: ${viewModel.state.resumeFileName}` : 'Upload Resume (PDF)'}
                </button>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf"
                className="hidden"
              />

              {showInput && (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    placeholder={smartModeEnabled ? "Ask me anything about job searching..." : "Type your answer..."}
                    disabled={isInputDisabled}
                    className="
                      flex-1 px-4 py-3 text-sm
                      bg-[#1a1d24] border border-[#232732]/20
                      shadow-[inset_4px_4px_8px_#111316,inset_-4px_-4px_8px_#232732]
                      rounded-xl text-white placeholder-gray-400
                      focus:border-cyan-500/30 focus:ring-2 focus:ring-cyan-500/20
                      transition-all duration-200 disabled:opacity-50
                    "
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={isInputDisabled || !inputValue.trim()}
                    className="
                      p-3 rounded-xl bg-[#1a1d24]
                      border border-[#232732]/20
                      shadow-[4px_4px_8px_#111316,-4px_-4px_8px_#232732]
                      hover:shadow-[inset_4px_4px_8px_#111316,inset_-4px_-4px_8px_#232732]
                      text-cyan-400 hover:text-cyan-300 
                      disabled:opacity-50 disabled:cursor-not-allowed
                      transition-all duration-200 group
                    "
                  >
                    <Send size={18} className="text-cyan-400 group-hover:text-cyan-300"/>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}); 