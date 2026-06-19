import React, { useEffect, useRef, useState } from 'react';
import { Copy, Check, Search, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Message } from '../types/chat';
import { useAuth } from '../contexts/AuthContext';

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  onPromptSelect?: (prompt: string) => void;
}

const parseAndStyleLegalText = (text: string): string => {
  const casePattern = /([A-Z][a-zA-Z\s&.']+\s+v\.?\s+[A-Z][a-zA-Z\s&.']+\s*\(\d{4}\)[^\n.]*(?:NWLR|SC|LPELR|NCLR|All NLR|SCNLR|NMLR)[^\n.]*)/g;
  const sectionPattern = /(Section\s+\d+[A-Za-z]?(?:\(\d+\))?(?:\([a-z]\))?(?:\s+of\s+(?:the\s+)?[A-Za-z\s\d&]+(?:Act|Constitution|Code|CAMA)(?:\s+\d{4})?)?)/gi;
  const constitutionPattern = /(1999\s+Constitution(?:\s+of\s+Nigeria)?(?:\s+\(as\s+amended\))?)/gi;
  const actPattern = /((?:Criminal|Penal|Evidence|Land\s+Use|Companies\s+and\s+Allied\s+Matters|Administration\s+of\s+Criminal\s+Justice|Interpretation|Matrimonial\s+Causes|Labour|Arbitration\s+and\s+Conciliation|Sheriffs\s+and\s+Civil\s+Process|Federal\s+High\s+Court|High\s+Court|Magistrate|Customary\s+Court)\s+(?:Code|Act|Law)(?:\s+\d{4})?)/gi;
  const recognizedLawPattern = /\b(Nigerian\s+Constitution|Constitution\s+of\s+the\s+Federal\s+Republic\s+of\s+Nigeria|CAMA|Companies\s+Act|Criminal\s+Code|Penal\s+Code|Evidence\s+Act|Supreme\s+Court\s+Act|Court\s+of\s+Appeal\s+Act|Federal\s+High\s+Court\s+Act|ACJA|Administration\s+of\s+Criminal\s+Justice\s+Act)\b/gi;
  const headingPattern = /^(#{1,6}\s+.+)$/gm;
  const colonHeadingPattern = /^([A-Z][A-Za-z\s]+:)$/gm;
  const titleCasePattern = /^([A-Z][A-Z\s]+)$/gm;
  const maximPattern = /\b(ignorantia juris non excusat|nemo dat quod non habet|actus reus|mens rea|audi alteram partem|res ipsa loquitur|caveat emptor|pacta sunt servanda|ultra vires|in terrorem|ex parte|de facto|de jure|inter alia|ipso facto|per se|vis-à-vis|quantum meruit|sui generis|mutatis mutandis|functus officio|stare decisis|ratio decidendi|obiter dicta|ejusdem generis|expressio unius|noscitur a sociis)\b/gi;
  const legalTermsPattern = /\b(plaintiff|defendant|appellant|respondent|petitioner|claimant|judgment|ruling|order|decree|injunction|damages|liability|negligence|breach|contract|tort|remedy|precedent|burden of proof|prima facie|res judicata|bona fide|locus standi|certiorari|mandamus|prohibition|habeas corpus|jurisdiction|evidence|testimony|witness|prosecution|defense|conviction|acquittal|sentence|appeal|motion|hearing|trial|court|judge|jury|counsel|barrister|solicitor|attorney|indictment|arraignment|bail|probation|parole|affidavit|deposition|discovery|subpoena|writ|estoppel|consideration|capacity|duress|undue influence|misrepresentation|fraud|statute|ordinance|regulation|directive|proviso|schedule|subsection|paragraph|clause)\b/gi;
  const examplePattern = /\b(For example|For instance|Example|Instance|Illustration|Case in point|Namely|Such as|Including|e\.g\.|i\.e\.)\b/gi;

  let styledText = text;
  styledText = styledText.replace(headingPattern, (match) => match.replace(/(#{1,6}\s+)(.+)/, '$1<span style="color: #2563eb; font-weight: 700;">$2</span>'));
  styledText = styledText.replace(colonHeadingPattern, (match) => `<span style="color: #2563eb; font-weight: 700;">${match}</span>`);
  styledText = styledText.replace(titleCasePattern, (match) => `<span style="color: #2563eb; font-weight: 700;">${match}</span>`);
  styledText = styledText.replace(casePattern, (match) => `<span style="color: #2563eb; font-weight: 600;">${match}</span>`);
  styledText = styledText.replace(sectionPattern, (match) => `<span style="color: #2563eb; font-weight: 600;">${match}</span>`);
  styledText = styledText.replace(constitutionPattern, (match) => `<span style="color: #2563eb; font-weight: 600;">${match}</span>`);
  styledText = styledText.replace(actPattern, (match) => `<span style="color: #2563eb; font-weight: 600;">${match}</span>`);
  styledText = styledText.replace(recognizedLawPattern, (match) => `<span style="color: #2563eb; font-weight: 600;">${match}</span>`);
  styledText = styledText.replace(maximPattern, (match) => `<span style="color: #2563eb; font-style: italic; font-weight: 500;">${match}</span>`);
  styledText = styledText.replace(examplePattern, (match) => `<span style="color: #2563eb; font-weight: 600;">${match}</span>`);
  styledText = styledText.replace(legalTermsPattern, (match) => `<span style="color: #2563eb; font-weight: 500;">${match}</span>`);
  return styledText;
};

const PROMPT_CARDS = [
  {
    text: 'What case brought about the neighborhood principle',
    icon: 'search',
  },
  {
    text: 'Create a legal notice for breach of contract',
    icon: 'doc',
  },
  {
    text: 'How do I settle a legal dispute without going to court.',
    icon: 'search',
  },
];

// Unique NOMOS AI Avatar Component
function NomosAvatar() {
  return (
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 flex items-center justify-center shadow-lg shadow-blue-500/30 relative overflow-hidden flex-shrink-0">
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-white/10 rounded-full" />
      <span className="text-white font-bold text-sm relative z-10 tracking-tight" style={{ fontFamily: 'ui-monospace, monospace' }}>N</span>
    </div>
  );
}

// User Avatar Component
function UserAvatar({ name }: { name: string }) {
  const initial = name?.charAt(0).toUpperCase() || 'U';
  return (
    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
      <span className="text-white font-medium text-sm">{initial}</span>
    </div>
  );
}

export function ChatMessages({ messages, isLoading, onPromptSelect }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const handleCopy = async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(messageId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const getUserFirstName = () => {
    if (!user) return 'there';
    if (user.user_metadata?.full_name) {
      return user.user_metadata.full_name.split(' ')[0];
    }
    if (user.email) {
      return user.email.split('@')[0];
    }
    return 'there';
  };

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin">
      {messages.length === 0 && !isLoading && (
        <div className="h-full flex flex-col items-center justify-center px-4 sm:px-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-8 text-center">
            Welcome back, <span className="text-blue-400">{getUserFirstName()}</span>
          </h1>

          <div className="relative w-full max-w-sm h-56 sm:h-64">
            {PROMPT_CARDS.map((card, index) => {
              const rotations = [-8, 4, -4];
              const tops = ['0%', '20%', '42%'];
              const lefts = ['0%', '12%', '2%'];
              const zIndexes = [10, 20, 30];

              return (
                <button
                  key={index}
                  onClick={() => onPromptSelect?.(card.text)}
                  className="absolute w-[72%] rounded-2xl p-4 text-left transition-transform duration-200 hover:scale-105 hover:z-40 cursor-pointer"
                  style={{
                    backgroundColor: '#111827',
                    border: '1px solid #1f2937',
                    top: tops[index],
                    left: lefts[index],
                    transform: `rotate(${rotations[index]}deg)`,
                    zIndex: zIndexes[index],
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                  }}
                >
                  <p className="text-white text-sm font-medium leading-snug mb-6">
                    {card.text}
                  </p>
                  <div className="flex justify-end">
                    <div className="w-7 h-7 rounded-full border border-gray-600 flex items-center justify-center">
                      {card.icon === 'search' ? (
                        <Search className="w-3.5 h-3.5 text-gray-400" />
                      ) : (
                        <FileText className="w-3.5 h-3.5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {messages.length > 0 && (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          {messages.map((message) => {
            const isUser = message.role === 'user';
            const displayContent = isUser ? message.content : parseAndStyleLegalText(message.content);

            return (
              <div
                key={message.id}
                className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                {isUser ? (
                  <UserAvatar name={getUserFirstName()} />
                ) : (
                  <NomosAvatar />
                )}

                {/* Message Content */}
                <div className={`flex flex-col min-w-0 ${isUser ? 'items-end' : 'items-start'} flex-1 max-w-[85%] sm:max-w-[75%]`}>
                  {/* Role Label */}
                  <span className={`text-xs font-semibold mb-1.5 ${isUser ? 'text-gray-400' : 'text-blue-400'}`}>
                    {isUser ? 'You' : 'NOMOS AI'}
                  </span>

                  {/* Message Bubble */}
                  <div
                    className={`w-full rounded-2xl px-4 py-3 ${
                      isUser
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-800/80 border border-gray-700/50'
                    }`}
                  >
                    <div className={`prose prose-sm max-w-none break-words ${isUser ? 'prose-invert' : 'prose-invert prose-gray'}`}>
                      <ReactMarkdown
                        components={{
                          p: ({ ...props }) => (
                            <p style={{ marginBottom: '0.5rem', lineHeight: '1.65', fontSize: '0.9rem' }} {...props} />
                          ),
                          h1: ({ ...props }) => (
                            <h1 style={{ color: '#3b82f6', fontWeight: 600, fontSize: '1.25rem', marginTop: '0.75rem', marginBottom: '0.5rem' }} {...props} />
                          ),
                          h2: ({ ...props }) => (
                            <h2 style={{ color: '#3b82f6', fontWeight: 600, fontSize: '1.1rem', marginTop: '0.75rem', marginBottom: '0.5rem' }} {...props} />
                          ),
                          h3: ({ ...props }) => (
                            <h3 style={{ color: '#3b82f6', fontWeight: 600, fontSize: '1rem', marginTop: '0.5rem', marginBottom: '0.5rem' }} {...props} />
                          ),
                          ul: ({ ...props }) => (
                            <ul style={{ marginBottom: '0.5rem', marginTop: '0.25rem', paddingLeft: '1.25rem' }} {...props} />
                          ),
                          ol: ({ ...props }) => (
                            <ol style={{ marginBottom: '0.5rem', marginTop: '0.25rem', paddingLeft: '1.25rem' }} {...props} />
                          ),
                          li: ({ ...props }) => (
                            <li style={{ marginBottom: '0.25rem', lineHeight: '1.6', fontSize: '0.875rem' }} {...props} />
                          ),
                          code: ({ ...props }) => (
                            <code style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '0.125rem 0.25rem', borderRadius: '0.25rem', fontSize: '0.85em' }} {...props} />
                          ),
                          pre: ({ ...props }) => (
                            <pre style={{ backgroundColor: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '0.5rem', overflow: 'auto' }} {...props} />
                          ),
                        }}
                      >
                        {displayContent}
                      </ReactMarkdown>
                    </div>
                  </div>

                  {/* Copy Button */}
                  {!isUser && (
                    <button
                      onClick={() => handleCopy(message.content, message.id)}
                      className="mt-2 flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-gray-300 transition-colors rounded"
                    >
                      {copiedId === message.id ? (
                        <>
                          <Check className="h-3 w-3" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex gap-3">
              <NomosAvatar />
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-800/80 rounded-2xl border border-gray-700/50">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-gray-400 text-sm">Thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      )}

      {messages.length === 0 && <div ref={messagesEndRef} />}
    </div>
  );
}