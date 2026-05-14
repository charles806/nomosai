import { useState, useEffect, useCallback, useRef } from 'react';
import { Message, Conversation, ChatState, FileAttachment } from '../types/chat';
import { GeminiService } from '../services/geminiService';

const STORAGE_KEY = 'lawgreen_conversations';
const MIN_REQUEST_INTERVAL = 500; // 0.5 second between requests

export function useChat() {
  const [state, setState] = useState<ChatState>({
    conversations: [],
    currentConversationId: null,
    isLoading: false,
    error: null
  });

  const geminiService = GeminiService.getInstance();
  const lastRequestTime = useRef<number>(0);
  const requestQueue = useRef<boolean>(false);

  // Load conversations from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const conversations = JSON.parse(stored).map((conv: any) => ({
          ...conv,
          createdAt: new Date(conv.createdAt),
          updatedAt: new Date(conv.updatedAt),
          messages: conv.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));
        setState(prev => ({ ...prev, conversations }));
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  }, []);

  // Save conversations to localStorage
  const saveConversations = useCallback((conversations: Conversation[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    } catch (error) {
      console.error('Failed to save conversations:', error);
    }
  }, []);

  const createNewConversation = useCallback(() => {
    const newConversation: Conversation = {
      id: crypto.randomUUID(),
      title: 'New Legal Consultation',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setState(prev => {
      const updated = {
        ...prev,
        conversations: [newConversation, ...prev.conversations],
        currentConversationId: newConversation.id
      };
      saveConversations(updated.conversations);
      return updated;
    });

    return newConversation.id;
  }, [saveConversations]);

  const selectConversation = useCallback((conversationId: string) => {
    setState(prev => ({
      ...prev,
      currentConversationId: conversationId
    }));
  }, []);

  const waitForRateLimit = async () => {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime.current;
    
    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
      const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    lastRequestTime.current = Date.now();
  };

  const retryWithBackoff = async <T,>(
    fn: () => Promise<T>,
    maxRetries = 3
  ): Promise<T> => {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        const is429Error = error instanceof Error && 
          (error.message.includes('429') || error.message.includes('Too Many Requests'));
        
        const isLastAttempt = attempt === maxRetries - 1;
        
        if (!is429Error || isLastAttempt) {
          throw error;
        }
        
        const backoffTime = Math.pow(2, attempt + 1) * 1000;
        
        setState(prev => ({
          ...prev,
          error: `Rate limited. Retrying in ${backoffTime / 1000} seconds...`
        }));
        
        await new Promise(resolve => setTimeout(resolve, backoffTime));
      }
    }
    throw new Error('Max retries exceeded');
  };

  const sendMessage = useCallback(async (content: string, attachments?: FileAttachment[]) => {
    if (!content.trim() && (!attachments || attachments.length === 0)) return;

    if (requestQueue.current) {
      setState(prev => ({
        ...prev,
        error: 'Please wait for the current message to complete'
      }));
      return;
    }

    requestQueue.current = true;

    let conversationId = state.currentConversationId;
    if (!conversationId) {
      conversationId = createNewConversation();
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      type: 'user',
      content: content.trim() || "Please analyze the uploaded file(s) and provide a detailed legal analysis.",
      timestamp: new Date(),
      attachments
    };

    setState(prev => {
      const conversations = prev.conversations.map(conv =>
        conv.id === conversationId
          ? {
              ...conv,
              messages: [...conv.messages, userMessage],
              updatedAt: new Date(),
              title: conv.messages.length === 0 ? userMessage.content.slice(0, 50) + '...' : conv.title
            }
          : conv
      );
      saveConversations(conversations);
      return {
        ...prev,
        conversations,
        isLoading: true,
        error: null
      };
    });

    try {
      await waitForRateLimit();

      const currentConv = state.conversations.find(c => c.id === conversationId);
      const history = currentConv?.messages.map(m => ({
        role: m.type === 'user' ? 'user' : 'assistant',
        text: m.content
      })) || [];

      const response = await retryWithBackoff(async () => {
        return await geminiService.generateResponse(userMessage.content, history, attachments);
      });

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        type: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setState(prev => {
        const conversations = prev.conversations.map(conv =>
          conv.id === conversationId
            ? {
                ...conv,
                messages: [...conv.messages, assistantMessage],
                updatedAt: new Date()
              }
            : conv
        );
        saveConversations(conversations);
        return {
          ...prev,
          conversations,
          isLoading: false,
          error: null
        };
      });
    } catch (error: any) {
      console.error('Error calling Gemini API:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'An error occurred'
      }));
    } finally {
      requestQueue.current = false;
    }
  }, [state.currentConversationId, state.conversations, geminiService, createNewConversation, saveConversations]);

  const deleteConversation = useCallback((conversationId: string) => {
    setState(prev => {
      const filtered = prev.conversations.filter(c => c.id !== conversationId);
      const newCurrentId = filtered.length > 0 ? filtered[0].id : null;
      saveConversations(filtered);
      return {
        ...prev,
        conversations: filtered,
        currentConversationId: prev.currentConversationId === conversationId ? newCurrentId : prev.currentConversationId
      };
    });
  }, [saveConversations]);

  const clearAllConversations = useCallback(() => {
    setState(prev => {
      saveConversations([]);
      return {
        ...prev,
        conversations: [],
        currentConversationId: null
      };
    });
  }, [saveConversations]);

  const currentConversation = state.conversations.find(
    conv => conv.id === state.currentConversationId
  );

  return {
    conversations: state.conversations,
    currentConversation,
    isLoading: state.isLoading,
    error: state.error,
    sendMessage,
    createNewConversation,
    selectConversation,
    deleteConversation,
    clearAllConversations
  };
}