export const LEGAL_PROMPT_TEMPLATES = {
  PROFESSIONAL: {
    CASE_ANALYSIS: `
      Please provide a comprehensive case analysis using the IRAC method with detailed explanations:

      1. **Issue**: Clearly identify all legal issues presented
      2. **Rule**: Provide detailed legal rules, citing relevant:
         - Applicable statutes and sections
         - Leading precedents and case law
         - Legal maxims and principles
         - Both Nigerian and comparative law where relevant
      3. **Application**: Thoroughly apply the rules to the facts, considering:
         - How each rule applies to specific facts
         - Counterarguments and alternative interpretations
         - Potential judicial reasoning
      4. **Conclusion**: Provide a well-reasoned conclusion with:
         - Likely legal outcome
         - Supporting case citations
         - Practical implications

      Case: {case}

      Please provide an elaborate, well-cited response with specific case names, sections, and legal reasoning.
    `,

    CONTRACT_REVIEW: `
      Please conduct a comprehensive legal review of this contract clause and provide:

      1. **Detailed Legal Interpretation**: Explain what the clause means, considering:
         - Plain language meaning
         - Legal interpretation principles
         - Contractual context
         - Relevant case law

      2. **Risks and Issues**: Identify and explain:
         - Potential disputes or ambiguities
         - Unfavorable implications for either party
         - Enforceability concerns
         - Relevant statutes or case law that could affect interpretation

      3. **Specific Recommendations**: Provide practical suggestions with:
         - Revised wording with rationale
         - Alternative clauses with pros and cons
         - Relevant precedents supporting recommendations

      4. **Case Law Citations**: Reference leading Nigerian and international cases

      Clause: {clause}

      Provide a detailed, practical analysis with specific legal citations and examples.
    `,

    LEGAL_RESEARCH: `
      Please conduct a comprehensive legal research on this topic and provide:

      1. **Comprehensive Legal Overview**: Include:
         - Definition and scope of the topic
         - Historical development
         - Current state of the law
         - Key legal principles and maxims

      2. **Relevant Cases**: Cite and explain:
         - Leading Nigerian Supreme Court decisions
         - Court of Appeal precedents
         - Federal High Court rulings
         - International comparative cases where applicable
         - With case citations (names, year, law report)

      3. **Applicable Statutes and Regulations**: Discuss:
         - Relevant sections with full citations
         - Constitutional provisions
         - Statutory definitions
         - Regulations and subsidiary legislation

      4. **Practical Implications**: Explain:
         - Real-world applications
         - Common legal scenarios
         - Rights and obligations
         - Remedies available

      5. **Latest Developments**: Include any recent amendments or judicial pronouncements

      Topic: {topic}

      Provide an authoritative, well-researched response with specific citations and detailed explanations.
    `,

    CONSTITUTIONAL_QUERY: `
      Please provide a detailed constitutional analysis covering:

      1. **Relevant Constitutional Sections**: Specify:
         - Exact sections of the 1999 Constitution (as amended)
         - Full text of relevant provisions
         - Scope and application

      2. **Judicial Interpretations**: Cite:
         - How courts have interpreted these provisions
         - Specific Supreme Court rulings
         - Leading precedents establishing legal principles
         - Evolution of interpretation over time

      3. **Leading Cases**: Provide detailed analysis of:
         - Landmark Supreme Court decisions
         - Court of Appeal pronouncements
         - Case facts, holdings, and reasoning
         - With full case citations

      4. **Practical Applications**: Explain:
         - How the provisions apply in practice
         - Rights and duties they create
         - Limitations and exceptions
         - Common legal issues arising

      5. **Comparative Perspective**: Reference relevant international constitutional law where applicable

      Query: {query}

      Provide a scholarly, comprehensive response with extensive case citations and legal analysis.
    `
  },

  COMPANION: {
    CASE_ANALYSIS: `
      Tell me about this case in a conversational way:

      Case: {case}

      Just explain what happened, what the legal issues were, and what the court decided. Keep it natural and easy to understand!
    `,

    CONTRACT_REVIEW: `
      Help me understand this contract clause:

      Clause: {clause}

      What does it mean in simple terms? Is there anything I should be worried about? Give me practical advice.
    `,

    LEGAL_RESEARCH: `
      Tell me about this legal topic:

      Topic: {topic}

      I'd like to understand it in practical terms. What does it mean for everyday situations? What should people know about it?
    `,

    CONSTITUTIONAL_QUERY: `
      I have a question about the constitution:

      Query: {query}

      Can you explain this in a way that makes sense? Give me some real examples if you can.
    `
  }
};

export const LEGAL_MAXIMS = [
  "Ignorantia juris non excusat - Ignorance of the law is no excuse",
  "Nemo dat quod non habet - No one can give what he does not have",
  "Actus reus non facit reum nisi mens sit rea - The act is not culpable unless the mind is guilty",
  "Audi alteram partem - Hear the other side",
  "Res ipsa loquitur - The thing speaks for itself",
  "Caveat emptor - Let the buyer beware",
  "Pacta sunt servanda - Agreements must be kept",
  "Ultra vires - Beyond the powers",
  "In terrorem - By way of threat or warning",
  "Ex parte - From one side only",
  "De facto - In fact, in reality",
  "De jure - In law, by right",
  "Inter alia - Among other things",
  "Ipso facto - By that very fact",
  "Per se - By itself, inherently",
  "Quantum meruit - As much as earned",
  "Sui generis - Of its own kind, unique",
  "Stare decisis - To stand by decided cases",
  "Ratio decidendi - The reason for the decision",
  "Obiter dicta - Things said in passing"
];

export const NIGERIAN_LEGAL_TOPICS = [
  "Nigerian Constitution 1999",
  "Fundamental Rights",
  "Criminal Code Act",
  "Penal Code",
  "Evidence Act",
  "Land Use Act",
  "Companies and Allied Matters Act",
  "Labour Act",
  "Marriage Act",
  "Administration of Criminal Justice Act"
];