import React, { useEffect, useRef, useState } from 'react';
import { Gavel, Bot, FileText, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Message } from '../types/chat';

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
}

// Function to parse and style legal text - SIMPLIFIED VERSION
const parseAndStyleLegalText = (text: string): string => {
  // Pattern for case names: Party v. Party (Year) Citation
  const casePattern = /([A-Z][a-zA-Z\s&.']+\s+v\.?\s+[A-Z][a-zA-Z\s&.']+\s*\(\d{4}\)[^\n.]*(?:NWLR|SC|LPELR|NCLR|All NLR|SCNLR|NMLR)[^\n.]*)/g;
  
  // Pattern for Section references
  const sectionPattern = /(Section\s+\d+[A-Za-z]?(?:\(\d+\))?(?:\([a-z]\))?(?:\s+of\s+(?:the\s+)?[A-Za-z\s\d&]+(?:Act|Constitution|Code|CAMA)(?:\s+\d{4})?)?)/gi;
  
  // Pattern for constitutional provisions
  const constitutionPattern = /(1999\s+Constitution(?:\s+of\s+Nigeria)?(?:\s+\(as\s+amended\))?)/gi;
  
  // Pattern for Acts and Codes
  const actPattern = /((?:Criminal|Penal|Evidence|Land\s+Use|Companies\s+and\s+Allied\s+Matters|Administration\s+of\s+Criminal\s+Justice|Interpretation|Matrimonial\s+Causes|Labour|Arbitration\s+and\s+Conciliation|Sheriffs\s+and\s+Civil\s+Process|Federal\s+High\s+Court|High\s+Court|Magistrate|Customary\s+Court)\s+(?:Code|Act|Law)(?:\s+\d{4})?)/gi;
  
  // Pattern for recognized laws and legal instruments
  const recognizedLawPattern = /\b(Nigerian\s+Constitution|Constitution\s+of\s+the\s+Federal\s+Republic\s+of\s+Nigeria|CAMA|Companies\s+Act|Criminal\s+Code|Penal\s+Code|Evidence\s+Act|Supreme\s+Court\s+Act|Court\s+of\s+Appeal\s+Act|Federal\s+High\s+Court\s+Act|ACJA|Administration\s+of\s+Criminal\s+Justice\s+Act)\b/gi;
  
  // Pattern for headings
  const headingPattern = /^(#{1,6}\s+.+)$/gm;
  const colonHeadingPattern = /^([A-Z][A-Za-z\s]+:)$/gm;
  const titleCasePattern = /^([A-Z][A-Z\s]+)$/gm;
  
  // Pattern for legal maxims
  const maximPattern = /\b(ignorantia juris non excusat|nemo dat quod non habet|actus reus|mens rea|audi alteram partem|res ipsa loquitur|caveat emptor|pacta sunt servanda|ultra vires|in terrorem|ex parte|de facto|de jure|inter alia|ipso facto|per se|vis-à-vis|quantum meruit|sui generis|mutatis mutandis|functus officio|stare decisis|ratio decidendi|obiter dicta|ejusdem generis|expressio unius|noscitur a sociis)\b/gi;

  // Pattern for important legal terms
  const legalTermsPattern = /\b(plaintiff|defendant|appellant|respondent|petitioner|claimant|judgment|ruling|order|decree|injunction|damages|liability|negligence|breach|contract|tort|remedy|precedent|burden of proof|prima facie|res judicata|bona fide|locus standi|certiorari|mandamus|prohibition|habeas corpus|jurisdiction|evidence|testimony|witness|prosecution|defense|conviction|acquittal|sentence|appeal|motion|hearing|trial|court|judge|jury|counsel|barrister|solicitor|attorney|indictment|arraignment|bail|probation|parole|affidavit|deposition|discovery|subpoena|writ|estoppel|consideration|capacity|duress|undue influence|misrepresentation|fraud|statute|ordinance|regulation|directive|proviso|schedule|subsection|paragraph|clause)\b/gi;

  // Pattern for examples marker
  const examplePattern = /\b(For example|For instance|Example|Instance|Illustration|Case in point|Namely|Such as|Including|e\.g\.|i\.e\.)\b/gi;

  let styledText = text;
  
  // Style markdown headings
  styledText = styledText.replace(headingPattern, (match) => {
    return match.replace(/(#{1,6}\s+)(.+)/, '$1<span style="color: #3b82f6; font-weight: 600;">$2</span>');
  });
  
  // Style colon headings
  styledText = styledText.replace(colonHeadingPattern, (match) => {
    return `<span style="color: #3b82f6; font-weight: 600;">${match}</span>`;
  });
  
  // Style ALL CAPS headings
  styledText = styledText.replace(titleCasePattern, (match) => {
    return `<span style="color: #3b82f6; font-weight: 600;">${match}</span>`;
  });
  
  // Style case names
  styledText = styledText.replace(casePattern, (match) => {
    return `<span style="color: #3b82f6; font-weight: 500;">${match}</span>`;
  });
  
  // Style sections
  styledText = styledText.replace(sectionPattern, (match) => {
    return `<span style="color: #3b82f6; font-weight: 500;">${match}</span>`;
  });
  
  // Style constitution references
  styledText = styledText.replace(constitutionPattern, (match) => {
    return `<span style="color: #3b82f6; font-weight: 500;">${match}</span>`;
  });
  
  // Style Acts and Codes
  styledText = styledText.replace(actPattern, (match) => {
    return `<span style="color: #3b82f6; font-weight: 500;">${match}</span>`;
  });
  
  // Style other recognized laws
  styledText = styledText.replace(recognizedLawPattern, (match) => {
    return `<span style="color: #3b82f6; font-weight: 500;">${match}</span>`;
  });

  // Style legal maxims
  styledText = styledText.replace(maximPattern, (match) => {
    return `<span style="color: #3b82f6; font-style: italic;">${match}</span>`;
  });

  // Style examples markers
  styledText = styledText.replace(examplePattern, (match) => {
    return `<span style="color: #3b82f6; font-weight: 500;">${match}</span>`;
  });

  // Style important legal terms
  styledText = styledText.replace(legalTermsPattern, (match) => {
    return `<span style="color: #60a5fa;">${match}</span>`;
  });

  return styledText;
};

// THIS NAME MUST MATCH THE IMPORT IN APP.TSX
export function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-transparent">
      {messages.length === 0 && !isLoading && (
        <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-50">
          <Bot className="h-12 w-12 mb-4" />
          <p>How can Legal Gee assist you today?</p>
        </div>
      )}

      {messages.map((message) => {
        // Apply styling only to assistant messages
        const displayContent = message.role === 'assistant' 
          ? parseAndStyleLegalText(message.content)
          : message.content;

        return (
          <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              message.role === 'user' ? 'bg-blue-600' : 'bg-gradient-to-br from-purple-600 to-blue-600'
            }`}>
              {message.role === 'user' ? <Gavel className="h-5 w-5 text-white" /> : <Bot className="h-5 w-5 text-white" />}
            </div>

            <div className={`flex flex-col flex-1 max-w-[80%] ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
              {/* Text content without box/background */}
              <div className={`w-full ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                <div className={`prose prose-invert prose-sm max-w-none ${
                  message.role === 'user' ? 'text-gray-200' : 'text-gray-100'
                }`}>
                  <ReactMarkdown
                    components={{
                      // Allow HTML in markdown
                      span: ({ node, ...props }) => <span {...props} />,
                      // Normal headings
                      h1: ({ node, ...props }) => <h1 style={{ color: '#3b82f6', fontWeight: 600, fontSize: '1.25rem', marginTop: '0.5rem', marginBottom: '0.5rem' }} {...props} />,
                      h2: ({ node, ...props }) => <h2 style={{ color: '#3b82f6', fontWeight: 600, fontSize: '1.125rem', marginTop: '0.5rem', marginBottom: '0.5rem' }} {...props} />,
                      h3: ({ node, ...props }) => <h3 style={{ color: '#3b82f6', fontWeight: 600, fontSize: '1rem', marginTop: '0.5rem', marginBottom: '0.5rem' }} {...props} />,
                      h4: ({ node, ...props }) => <h4 style={{ color: '#3b82f6', fontWeight: 600, fontSize: '0.95rem', marginTop: '0.5rem', marginBottom: '0.5rem' }} {...props} />,
                      h5: ({ node, ...props }) => <h5 style={{ color: '#3b82f6', fontWeight: 600, fontSize: '0.9rem', marginTop: '0.5rem', marginBottom: '0.5rem' }} {...props} />,
                      h6: ({ node, ...props }) => <h6 style={{ color: '#3b82f6', fontWeight: 600, fontSize: '0.875rem', marginTop: '0.5rem', marginBottom: '0.5rem' }} {...props} />,
                      // Normal paragraph spacing
                      p: ({ node, ...props }) => <p style={{ marginBottom: '0.5rem', lineHeight: '1.6', fontSize: '0.9rem' }} {...props} />,
                      // Normal list spacing
                      ul: ({ node, ...props }) => <ul style={{ marginBottom: '0.5rem', marginTop: '0.25rem', paddingLeft: '1.5rem' }} {...props} />,
                      ol: ({ node, ...props }) => <ol style={{ marginBottom: '0.5rem', marginTop: '0.25rem', paddingLeft: '1.5rem' }} {...props} />,
                      li: ({ node, ...props }) => <li style={{ marginBottom: '0.25rem', lineHeight: '1.6', fontSize: '0.9rem' }} {...props} />,
                    }}
                  >
                    {displayContent}
                  </ReactMarkdown>
                </div>
              </div>
              
              {/* Copy button */}
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
  );
}