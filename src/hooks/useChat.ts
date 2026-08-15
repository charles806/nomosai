try {
      await waitForRateLimit();

      const currentConv = state.conversations.find(c => c.id === conversationId);
      const history = currentConv?.messages.map(m => ({
        role: m.type === 'user' ? 'user' : 'assistant',
        text: m.content
      })) || [];

      // Create the assistant message up front with empty content, and push
      // it immediately so isLoading can drop as soon as the first chunk
      // arrives rather than waiting for the whole response.
      const assistantMessageId = crypto.randomUUID();
      const assistantMessage: Message = {
        id: assistantMessageId,
        type: 'assistant',
        content: '',
        timestamp: new Date()
      };

      setState(prev => {
        const conversations = prev.conversations.map(conv =>
          conv.id === conversationId
            ? { ...conv, messages: [...conv.messages, assistantMessage], updatedAt: new Date() }
            : conv
        );
        return { ...prev, conversations };
      });

      let firstChunkReceived = false;

      const onChunk = (chunkText: string) => {
        if (!firstChunkReceived) {
          firstChunkReceived = true;
          // Drop the loading indicator the moment real text starts arriving,
          // instead of waiting for the full response to finish.
          setState(prev => ({ ...prev, isLoading: false }));
        }

        setState(prev => {
          const conversations = prev.conversations.map(conv =>
            conv.id === conversationId
              ? {
                  ...conv,
                  messages: conv.messages.map(m =>
                    m.id === assistantMessageId
                      ? { ...m, content: m.content + chunkText }
                      : m
                  ),
                  updatedAt: new Date()
                }
              : conv
          );
          return { ...prev, conversations };
        });
      };

      const finalText = await retryWithBackoff(async () => {
        return await geminiService.generateResponseStream(userMessage.content, history, attachments, onChunk);
      });

      // Reconcile: ensure the final stored content exactly matches what the
      // service returned (guards against any dropped/out-of-order chunk),
      // and persist to localStorage now that the message is complete.
      setState(prev => {
        const conversations = prev.conversations.map(conv =>
          conv.id === conversationId
            ? {
                ...conv,
                messages: conv.messages.map(m =>
                  m.id === assistantMessageId ? { ...m, content: finalText } : m
                ),
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
