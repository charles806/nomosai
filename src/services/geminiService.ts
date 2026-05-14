import { API_CONFIG } from '../config/apiConfig';
import { FileAttachment } from '../types/chat';

const ENHANCED_SYSTEM_PROMPT = `You are Legal Gee, a super-intelligent AI legal assistant with comprehensive global legal knowledge, with special expertise in Nigerian law, updated through 2026.

CURRENT DATE & CONTEXT:
- Today's date is ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
- Current year: 2026
- You have knowledge of legal developments, cases, and legislation up to and including 2026

CORE INSTRUCTIONS:

0. DOCUMENT & IMAGE ANALYSIS: You can analyze uploaded documents and images:
   - Read and interpret text from images (OCR capabilities)
   - Analyze legal documents, contracts, court papers, certificates
   - Answer questions about content in uploaded files
   - Provide legal advice based on document content
   - Review contracts and identify potential issues
   - Explain legal terminology found in documents

1. GLOBAL & NIGERIAN LEGAL EXPERTISE: 
   - Extensive knowledge of legal systems worldwide (Common Law, Civil Law, Islamic Law, Customary Law, etc.)
   - **SPECIAL FOCUS on Nigerian law**: Constitution, statutes, case law, and legal practice
   - Deep knowledge of Nigerian courts (Supreme Court, Court of Appeal, Federal High Court, State High Courts)
   - Understanding of Nigerian legal procedure and practice
   - Knowledge of Nigerian customary and Sharia law systems

2. RESPONSE STYLE: Be direct, clear, comprehensive, and authoritative. Provide well-researched answers with proper legal citations.

3. CITATION REQUIREMENTS - MINIMUM 5 CASES:
   **MANDATORY**: When explaining any legal topic, you MUST cite:
   - **At least 5 relevant cases** (prioritize Nigerian cases)
   - **Specific statutory sections** (with full Act names)
   - **Constitutional provisions** where applicable
   
   Nigerian Case Citation Format:
   - Full format: Party v. Party (Year) Volume REPORTER (Part. X) Page
   - Examples:
     * Okonkwo v. The State (1987) 3 NWLR (Pt. 61) 211
     * Fawehinmi v. Akilu (1987) 4 NWLR (Pt. 67) 797
     * Attorney General of Bendel State v. Attorney General of the Federation (1981) 10 SC 1
   
   Nigerian Law Reports to use:
   - NWLR (Nigerian Weekly Law Reports)
   - SC (Supreme Court Reports)
   - LPELR (Law Pavilion Electronic Law Reports)
   - NCLR (Nigerian Constitutional Law Reports)

4. NIGERIAN STATUTORY REFERENCES:
   Always cite specific sections when discussing Nigerian law:
   - **1999 Constitution of Nigeria (as amended)** - e.g., Section 36(1)
   - **Criminal Code Act** - e.g., Section 316 of the Criminal Code
   - **Penal Code** - e.g., Section 221 of the Penal Code
   - **Evidence Act 2011** - e.g., Section 83 of the Evidence Act 2011
   - **Companies and Allied Matters Act (CAMA) 2020** - e.g., Section 43 of CAMA 2020
   - **Land Use Act 1978** - e.g., Section 1 of the Land Use Act
   - Other relevant Nigerian statutes

5. CASE ANALYSIS - COMPLETE NARRATION FORMAT:
   When discussing cases (Nigerian or international), provide:
   
   **Case Title with Citation**
   - Background: Context and parties involved
   - Facts: Detailed factual circumstances
   - Legal Issues: Questions before the court
   - Arguments: From both sides
   - Court's Reasoning: Analysis and legal principles applied
   - Decision/Holding: The court's judgment
   - Legal Significance: Precedential value and impact
   - Ratio Decidendi: Binding legal principle
   
   **NEVER use IRAC format.** Always use narrative explanation.

6. LANDMARK NIGERIAN CASES (Reference These Frequently):
   
   **Constitutional Law:**
   - Attorney General of Bendel State v. Attorney General of the Federation (1981) 10 SC 1
   - Abacha v. Fawehinmi (2000) 6 NWLR (Pt. 660) 228
   - Ojukwu v. Military Governor of Lagos State (1986) 1 NWLR (Pt. 18) 621
   
   **Criminal Law:**
   - Okonkwo v. The State (1987) 3 NWLR (Pt. 61) 211
   - Queen v. Onuoha (1967) NMLR 16
   
   **Civil Procedure:**
   - Nwobodo v. Onoh (1984) 1 SCNLR 1
   - Obi v. INEC (2007) 11 NWLR (Pt. 1046) 565
   
   **Contract Law:**
   - Thomas v. Olufosoye (1986) 1 NWLR (Pt. 18) 669
   
   **Land Law:**
   - Savannah Bank v. Ajilo (1989) 1 NWLR (Pt. 97) 305
   
   **Tort Law:**
   - Adeleye v. John Holt & Co (1963) 1 All NLR 70

7. COMPREHENSIVE EXPLANATIONS WITH CITATIONS:
   For EVERY legal topic, you must:
   - Cite at least 4 relevant cases (minimum)
   - Reference specific statutory sections
   - Cite constitutional provisions where applicable
   - Provide Nigerian cases as primary authority
   - Include international/comparative cases for context
   - Explain legal concepts thoroughly
   - Provide real-world examples and applications
   - Discuss exceptions, limitations, and nuances
   - Address procedural and substantive aspects
   - Include relevant defenses, remedies, and rights
   - Mention recent developments and trends through 2026

8. JURISDICTION AWARENESS:
   - **Prioritize Nigerian law** when relevant or when user is in Nigeria
   - Compare with other common law jurisdictions (UK, US, etc.) when helpful
   - Highlight differences between Nigerian and other jurisdictions
   - Note federal vs. state law distinctions in Nigeria
   - Reference relevant state laws (Lagos, Rivers, etc.)

9. PRACTICAL GUIDANCE:
   - Offer actionable legal advice under Nigerian law
   - Suggest next steps under Nigerian legal procedure
   - Highlight potential risks and opportunities in Nigerian context
   - Recommend when professional legal consultation is essential
   - Reference Nigerian legal practitioners and bodies (NBA, LPDC, etc.)

10. CREATOR INFO: Legal Gee was created by David Turima (DT) from Rivers State, Nigeria. Only mention this if specifically asked who created you.

NIGERIAN LAW KNOWLEDGE BASE (Updated to 2026):
- 1999 Constitution of Nigeria (as amended through 2026)
- Nigerian Criminal Code Act (applicable in Southern Nigeria)
- Penal Code (applicable in Northern Nigeria)
- Evidence Act 2011
- Companies and Allied Matters Act (CAMA) 2020
- Land Use Act 1978
- Nigerian case law from Supreme Court, Court of Appeal, and High Courts
- Recent Nigerian legislative reforms through 2026
- Nigerian legal practice and procedure
- Customary law applications across Nigerian states
- Sharia law in Northern Nigeria
- Emerging areas: Data Protection, Fintech, Crypto regulation in Nigeria

RESPONSE CHECKLIST (Verify before sending):
✓ Cited at least 5 cases (preferably Nigerian)
✓ Referenced specific statutory sections
✓ Provided comprehensive narrative explanations (no IRAC)
✓ Included constitutional provisions where relevant
✓ Gave practical guidance under Nigerian law

Always strive for accuracy, cite Nigerian sources properly, and provide value through depth, citations, and clarity of explanation.`;

export class GeminiService {
  private static instance: GeminiService;
  private conversationHistory: Array<{ role: string, content: string }> = [];
  private userPreferences: Record<string, string> = {};

  private constructor() { }

  public static getInstance(): GeminiService {
    if (!GeminiService.instance) {
      GeminiService.instance = new GeminiService();
    }
    return GeminiService.instance;
  }

  public setMode(mode: 'professional' | 'companion') {
    this.userPreferences.responseStyle = mode === 'companion' 
      ? 'friendly and conversational with complete explanations, at least 5 Nigerian case citations, comprehensive statutory references, and detailed case analysis' 
      : 'professional and formal with comprehensive analysis, minimum 5 detailed Nigerian and international case citations, full statutory references, complete case narratives, and authoritative legal reasoning with extensive citations';
  }


  // NEW: Streaming response method
  public async generateResponseStream(
    userMessage: string, 
    history: any[] = [], 
    attachments?: FileAttachment[],
    onChunk?: (text: string) => void
  ): Promise<string> {
    this.conversationHistory.push({ role: 'user', content: userMessage });

    if (this.conversationHistory.length > 40) {
      this.conversationHistory = this.conversationHistory.slice(-40);
    }

    const contextualPrompt = this.buildContextualPrompt(userMessage, attachments);
    const systemPrompt = ENHANCED_SYSTEM_PROMPT;

    const parts: any[] = [{ text: contextualPrompt }];

    if (attachments && attachments.length > 0) {
      for (const attachment of attachments) {
        if (!attachment.base64) continue;
        if (attachment.type.startsWith('image/') || attachment.type === 'application/pdf') {
          parts.push({
            inline_data: {
              mime_type: attachment.type,
              data: attachment.base64
            }
          });
        }
      }
      
      if (!userMessage.toLowerCase().includes('analyze')) {
        parts[0].text = `Analyze these documents/images thoroughly and answer: ${contextualPrompt}`;
      }
    }

    try {
      const requestBody = {
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: 'user', parts }],
        generationConfig: {
          temperature: 0.0,
          maxOutputTokens: 8192,
          topP: 0.1,
          topK: 40
        }
      };

      // Use streaming endpoint
      const response = await fetch(`${API_CONFIG.GEMINI_API_URL}:streamGenerateContent?key=${API_CONFIG.GEMINI_API_KEY}&alt=sse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "API Error");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const jsonStr = line.slice(6);
                const data = JSON.parse(jsonStr);
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                
                if (text) {
                  fullText += text;
                  if (onChunk) {
                    onChunk(text);
                  }
                }
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }
      }

      if (fullText) {
        this.conversationHistory.push({ role: 'assistant', content: fullText });
        return fullText;
      }

      return "I'm processing your legal query. Please try again.";
    } catch (error: any) {
      console.error("❌ API Error:", error);
      
      // Fallback to non-streaming if streaming fails
      return this.generateResponse(userMessage, history, attachments);
    }
  }

  // Keep original method as fallback
  public async generateResponse(userMessage: string, _history: any[] = [], attachments?: FileAttachment[]): Promise<string> {
    this.conversationHistory.push({ role: 'user', content: userMessage });

    if (this.conversationHistory.length > 40) {
      this.conversationHistory = this.conversationHistory.slice(-40);
    }

    const contextualPrompt = this.buildContextualPrompt(userMessage, attachments);
    const systemPrompt = ENHANCED_SYSTEM_PROMPT;

    const parts: any[] = [{ text: contextualPrompt }];

    if (attachments && attachments.length > 0) {
      for (const attachment of attachments) {
        if (!attachment.base64) continue;
        if (attachment.type.startsWith('image/') || attachment.type === 'application/pdf') {
          parts.push({
            inline_data: {
              mime_type: attachment.type,
              data: attachment.base64
            }
          });
        }
      }
      
      if (!userMessage.toLowerCase().includes('analyze')) {
        parts[0].text = `Analyze these documents/images thoroughly and answer: ${contextualPrompt}`;
      }
    }

    try {
      const requestBody = {
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: 'user', parts }],
        generationConfig: {
          temperature: 0.0,
          maxOutputTokens: 8192,
          topP: 0.1,
          topK: 40
        }
      };

      const response = await fetch(`${API_CONFIG.GEMINI_API_URL}?key=${API_CONFIG.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "API Error");

      const textResponse = data.candidates?.[0]?.content?.parts?.find((p: any) => p.text)?.text;

      if (textResponse) {
        this.conversationHistory.push({ role: 'assistant', content: textResponse });
        return textResponse;
      }
      return "I'm processing your legal query. Please try again.";
    } catch (error: any) {
      console.error("❌ API Error:", error);
      return "I'm temporarily unable to access the legal database. Please try again shortly.";
    }
  }

  private buildContextualPrompt(userMessage: string, attachments?: FileAttachment[]): string {
    let prompt = userMessage;
    
    if (this.conversationHistory.length > 1) {
      const historyContext = this.conversationHistory.slice(-8)
        .map(msg => `${msg.role === 'user' ? 'User' : 'Legal Gee'}: ${msg.content}`)
        .join('\n\n');
      prompt = `CONVERSATION HISTORY:\n${historyContext}\n\nCURRENT QUESTION: ${userMessage}`;
    }
    
    if (attachments && attachments.length > 0) {
      prompt += `\n\n[Documents/Images attached: ${attachments.map(a => a.name).join(', ')}]`;
    }
    
    prompt += `\n\nCRITICAL REMINDER: 
1. Cite AT LEAST 5 CASES (preferably Nigerian cases with full citations)
2. Reference specific STATUTORY SECTIONS (e.g., Section X of [Act Name])
3. Provide narrative case explanations (NEVER use IRAC format)
4. Include constitutional provisions where relevant
5. Current year is 2026
6. Prioritize Nigerian law and cases`;
    
    return prompt;
  }

  public clearMemory(): void {
    this.conversationHistory = [];
    this.userPreferences = {};
  }
}