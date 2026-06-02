import React, { useEffect, useRef, useState } from 'react';
import { Gavel, Bot, Copy, Check, Search, FileText } from 'lucide-react';
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

export function ChatMessages({ messages, isLoading, onPromptSelect }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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

  // Extract first name from email or display name
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
    <div className="flex-1 overflow-y-auto bg-transparent">
      {messages.length === 0 && !isLoading && (
        <div
          className="h-full flex flex-col items-center justify-center px-6"
          style={{
            background: 'linear-gradient(160deg, #0f1b2d 0%, #1a2a4a 50%, #0d1f3c 100%)',
          }}
        >
          {/* Welcome heading */}
          <h1 className="text-3xl font-bold text-white mb-10 text-center">
            welcome back{' '}
            <span className="text-white">{getUserFirstName()}</span>
          </h1>

          {/* Floating prompt cards */}
          <div className="relative w-full max-w-sm h-64 mb-8">
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

      {/* Messages */}
      {messages.length > 0 && (
        <div className="p-6 space-y-4">
          {messages.map((message) => {
            const displayContent =
              message.role === 'assistant'
                ? parseAndStyleLegalText(message.content)
                : message.content;

            return (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.role === 'user'
                      ? 'bg-blue-600'
                      : 'bg-gradient-to-br from-purple-600 to-blue-600'
                  }`}
                >
                  {message.role === 'user' ? (
                    <Gavel className="h-5 w-5 text-white" />
                  ) : (
                    <Bot className="h-5 w-5 text-white" />
                  )}
                </div>

                <div
                  className={`flex flex-col flex-1 max-w-[80%] ${
                    message.role === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`w-full ${
                      message.role === 'user' ? 'text-right' : 'text-left'
                    }`}
                  >
                    <div
                      className={`prose prose-invert prose-sm max-w-none ${
                        message.role === 'user' ? 'text-gray-200' : 'text-gray-100'
                      }`}
                    >
                      <ReactMarkdown
                        components={{
                          span: ({ node, ...props }) => <span {...props} />,
                          h1: ({ node, ...props }) => <h1 style={{ color: '#3b82f6', fontWeight: 600, fontSize: '1.25rem', marginTop: '0.5rem', marginBottom: '0.5rem' }} {...props} />,
                          h2: ({ node, ...props }) => <h2 style={{ color: '#3b82f6', fontWeight: 600, fontSize: '1.125rem', marginTop: '0.5rem', marginBottom: '0.5rem' }} {...props} />,
                          h3: ({ node, ...props }) => <h3 style={{ color: '#3b82f6', fontWeight: 600, fontSize: '1rem', marginTop: '0.5rem', marginBottom: '0.5rem' }} {...props} />,
                          h4: ({ node, ...props }) => <h4 style={{ color: '#3b82f6', fontWeight: 600, fontSize: '0.95rem', marginTop: '0.5rem', marginBottom: '0.5rem' }} {...props} />,
                          h5: ({ node, ...props }) => <h5 style={{ color: '#3b82f6', fontWeight: 600, fontSize: '0.9rem', marginTop: '0.5rem', marginBottom: '0.5rem' }} {...props} />,
                          h6: ({ node, ...props }) => <h6 style={{ color: '#3b82f6', fontWeight: 600, fontSize: '0.875rem', marginTop: '0.5rem', marginBottom: '0.5rem' }} {...props} />,
                          p: ({ node, ...props }) => <p style={{ marginBottom: '0.5rem', lineHeight: '1.6', fontSize: '0.9rem' }} {...props} />,
                          ul: ({ node, ...props }) => <ul style={{ marginBottom: '0.5rem', marginTop: '0.25rem', paddingLeft: '1.5rem' }} {...props} />,
                          ol: ({ node, ...props }) => <ol style={{ marginBottom: '0.5rem', marginTop: '0.25rem', paddingLeft: '1.5rem' }} {...props} />,
                          li: ({ node, ...props }) => <li style={{ marginBottom: '0.25rem', lineHeight: '1.6', fontSize: '0.9rem' }} {...props} />,
                        }}
                      >
                        {displayContent}
                      </ReactMarkdown>
                    </div>
                  </div>

                  <button
                    onClick={() => handleCopy(message.content, message.id)}
                    className="mt-1 flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-gray-200 transition-colors rounded-md hover:bg-gray-800"
                    title="Copy to clipboard"
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
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 items-center text-gray-400 animate-pulse">
              <Bot className="h-5 w-5" />
              <span className="text-xs">Legal Gee is thinking...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      {messages.length === 0 && <div ref={messagesEndRef} />}
    </div>
  );
}