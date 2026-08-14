import React, { useEffect, useRef, useState } from 'react';
import { Copy, Check, Search, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
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
  styledText = styledText.replace(headingPattern, (match) => match.replace(/(#{1,6}\s+)(.+)/, '$1<span style="color: #ffffff; font-weight: 700;">$2</span>'));
  styledText = styledText.replace(colonHeadingPattern, (match) => `<span style="color: #ffffff; font-weight: 700;">${match}</span>`);
  styledText = styledText.replace(titleCasePattern, (match) => `<span style="color: #ffffff; font-weight: 700;">${match}</span>`);
  styledText = styledText.replace(casePattern, (match) => `<span style="color: #ffffff; font-weight: 600;">${match}</span>`);
  styledText = styledText.replace(sectionPattern, (match) => `<span style="color: #ffffff; font-weight: 600;">${match}</span>`);
  styledText = styledText.replace(constitutionPattern, (match) => `<span style="color: #ffffff; font-weight: 600;">${match}</span>`);
  styledText = styledText.replace(actPattern, (match) => `<span style="color: #ffffff; font-weight: 600;">${match}</span>`);
  styledText = styledText.replace(recognizedLawPattern, (match) => `<span style="color: #ffffff; font-weight: 600;">${match}</span>`);
  styledText = styledText.replace(maximPattern, (match) => `<span style="color: #ffffff; font-style: italic; font-weight: 500;">${match}</span>`);
  styledText = styledText.replace(examplePattern, (match) => `<span style="color: #ffffff; font-weight: 600;">${match}</span>`);
  styledText = styledText.replace(legalTermsPattern, (match) => `<span style="color: #ffffff; font-weight: 500;">${match}</span>`);
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

// NOMOS AI Avatar — uses the shared logo, falls back to the "N" mark if the image fails to load
function NomosAvatar() {
  const [imgFailed, setImgFailed] = useState(false);

  if (imgFailed) {
    return (
      <div className="w-7 h-7 rounded-full bg-[#3b82f6] flex items-center justify-center flex-shrink-0">
        <span className="text-white font-semibold text-xs relative z-10 tracking-tight">N</span>
      </div>
    );
  }

  return (
    <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 bg-gray-800">
      <img
        src="/logo.png"
        alt="NOMOS AI"
        className="w-full h-full object-cover"
        onError={() => setImgFailed(true)}
      />
    </div>
  );
}

// User Avatar — also uses the shared logo, falls back to initial if missing
function UserAvatar({ name }: { name: string }) {
  const [imgFailed, setImgFailed] = useState(false);
  const initial = name?.charAt(0).toUpperCase() || 'U';

  if (imgFailed) {
    return (
      <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
        <span className="text-white font-medium text-xs">{initial}</span>
      </div>
    );
  }

  return (
    <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 bg-gray-700">
      <img
        src="/logo.png"
        alt={name}
        className="w-full h-full object-cover"
        onError={() => setImgFailed(true)}
      />
    </div>
  );
}

function formatTime(timestamp: Date): string {
  try {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

// Assistant markdown — Claude.ai style: plain flowing text, no bubble, no heading
// background/highlight, headings sit directly above their paragraph with minimal gap
// so they read as part of the same block rather than a separated header.
const markdownComponents = {
  p: ({ ...props }) => (
    <p style={{ margin: '0 0 0.75rem 0', lineHeight: '1.65', fontSize: '0.95rem', color: '#e5e5e5' }} {...props} />
  ),
  h1: ({ ...props }) => (
    <h1 style={{ color: '#f5f5f5', fontWeight: 600, fontSize: '1.15rem', margin: '1.25rem 0 0.5rem 0', lineHeight: '1.4' }} {...props} />
  ),
  h2: ({ ...props }) => (
    <h2 style={{ color: '#f5f5f5', fontWeight: 600, fontSize: '1.05rem', margin: '1.1rem 0 0.4rem 0', lineHeight: '1.4' }} {...props} />
  ),
  h3: ({ ...props }) => (
    <h3 style={{ color: '#f5f5f5', fontWeight: 600, fontSize: '0.98rem', margin: '1rem 0 0.35rem 0', lineHeight: '1.4' }} {...props} />
  ),
  ul: ({ ...props }) => (
    <ul style={{ margin: '0 0 0.75rem 0', paddingLeft: '1.25rem', color: '#e5e5e5' }} {...props} />
  ),
  ol: ({ ...props }) => (
    <ol style={{ margin: '0 0 0.75rem 0', paddingLeft: '1.25rem', color: '#e5e5e5' }} {...props} />
  ),
  li: ({ ...props }) => (
    <li style={{ marginBottom: '0.3rem', lineHeight: '1.6', fontSize: '0.95rem', color: '#e5e5e5' }} {...props} />
  ),
  strong: ({ ...props }) => (
    <strong style={{ color: '#f5f5f5', fontWeight: 600 }} {...props} />
  ),
  em: ({ ...props }) => (
    <em style={{ color: '#e5e5e5' }} {...props} />
  ),
  a: ({ ...props }) => (
    <a style={{ color: '#3b82f6', textDecoration: 'underline', textUnderlineOffset: '2px' }} target="_blank" rel="noopener noreferrer" {...props} />
  ),
  blockquote: ({ ...props }) => (
    <blockquote style={{ borderLeft: '3px solid rgba(255,255,255,0.2)', paddingLeft: '0.9rem', color: '#b8b8b8', margin: '0.5rem 0' }} {...props} />
  ),
  code: ({ ...props }) => (
    <code style={{ backgroundColor: 'rgba(255,255,255,0.08)', padding: '0.15rem 0.35rem', borderRadius: '0.3rem', fontSize: '0.85em', color: '#e5e5e5', fontFamily: 'ui-monospace, monospace' }} {...props} />
  ),
  pre: ({ ...props }) => (
    <pre style={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.08)', padding: '1rem', borderRadius: '0.6rem', overflow: 'auto', color: '#e5e5e5', margin: '0.5rem 0 0.75rem 0' }} {...props} />
  ),
};

// User bubble markdown — text stays pure white, otherwise same rhythm as assistant text
const userMarkdownComponents = {
  ...markdownComponents,
  p: ({ ...props }) => (
    <p style={{ margin: '0 0 0.5rem 0', lineHeight: '1.6', fontSize: '0.95rem', color: '#ffffff' }} {...props} />
  ),
  li: ({ ...props }) => (
    <li style={{ marginBottom: '0.25rem', lineHeight: '1.55', fontSize: '0.95rem', color: '#ffffff' }} {...props} />
  ),
  strong: ({ ...props }) => (
    <strong style={{ color: '#ffffff', fontWeight: 700 }} {...props} />
  ),
};

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

  const getUserDisplayName = () => {
    if (!user) return 'You';
    return user.user_metadata?.full_name || user.email || 'You';
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
        <div className="max-w-3xl mx-auto px-2 sm:px-6 py-6 space-y-6">
          {messages.map((message) => {
            const isUser = message.type === 'user';
            const displayContent = isUser ? message.content : parseAndStyleLegalText(message.content);

            // USER MESSAGE: right-aligned bubble — unchanged in concept, same treatment as before
            if (isUser) {
              return (
                <div key={message.id} className="flex justify-end items-end gap-1.5 sm:gap-2 group">
                  <div className="max-w-[80%] sm:max-w-[65%] flex flex-col items-end gap-1">
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-2 justify-end mb-1">
                        {message.attachments.map((file) => (
                          <div
                            key={file.id}
                            className="flex items-center gap-2 px-3 py-2 bg-blue-900/40 rounded-lg border border-blue-700/50"
                          >
                            <FileText className="h-4 w-4 text-blue-300 flex-shrink-0" />
                            <span className="text-xs text-blue-100 truncate max-w-[120px]">{file.name}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div
                      className="px-4 py-2.5 shadow-md"
                      style={{
                        background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
                        borderRadius: '18px 18px 4px 18px',
                      }}
                    >
                      <div className="prose prose-sm max-w-none break-words prose-invert">
                        <ReactMarkdown components={userMarkdownComponents}>
                          {displayContent}
                        </ReactMarkdown>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pr-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[10px] text-gray-500">{formatTime(message.timestamp)}</span>
                      <button
                        onClick={() => handleCopy(message.content, message.id)}
                        className="text-gray-500 hover:text-white transition-colors"
                        title="Copy"
                      >
                        {copiedId === message.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      </button>
                    </div>
                  </div>

                  <UserAvatar name={getUserDisplayName()} />
                </div>
              );
            }

            // ASSISTANT MESSAGE: plain text, no bubble, no background — Claude.ai style
            return (
              <div key={message.id} className="flex items-start gap-2.5 sm:gap-3 group">
                <div className="pt-0.5">
                  <NomosAvatar />
                </div>

                <div className="max-w-[92%] sm:max-w-[88%] flex flex-col items-start gap-1 min-w-0">
                  <div className="max-w-none break-words">
                    <ReactMarkdown components={markdownComponents} rehypePlugins={[rehypeRaw]}>
                      {displayContent}
                    </ReactMarkdown>
                  </div>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleCopy(message.content, message.id)}
                      className="flex items-center gap-1 text-xs text-gray-500 hover:text-white transition-colors"
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
                    <span className="text-[10px] text-gray-500">{formatTime(message.timestamp)}</span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Loading Indicator — plain dots, no bubble */}
          {isLoading && (
            <div className="flex items-start gap-2.5 sm:gap-3">
              <div className="pt-0.5">
                <NomosAvatar />
              </div>
              <div className="flex items-center gap-1 pt-2">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
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
