export const LEGAL_PROMPT_TEMPLATES = {
  CASE_ANALYSIS: `
    Please analyze this case using the IRAC method:
    - Issue: What legal issues are presented?
    - Rule: What legal rules/statutes/precedents apply?
    - Application: How do the rules apply to these facts?
    - Conclusion: What is the likely outcome?
    
    Case: {case}
  `,
  
  CONTRACT_REVIEW: `
    Please review this contract clause and provide:
    - Legal interpretation
    - Potential risks and issues
    - Recommendations for improvement
    - Relevant case law citations
    
    Clause: {clause}
  `,
  
  LEGAL_RESEARCH: `
    Please research the following legal topic and provide:
    - Comprehensive legal overview
    - Relevant Nigerian and international cases
    - Applicable statutes and regulations
    - Practical implications
    
    Topic: {topic}
  `,
  
  CONSTITUTIONAL_QUERY: `
    Please explain the constitutional provisions regarding:
    - Relevant constitutional sections
    - Judicial interpretations
    - Leading cases
    - Practical applications
    
    Query: {query}
  `
};

export const LEGAL_MAXIMS = [
  "Ignorantia juris non excusat - Ignorance of the law is no excuse",
  "Nemo dat quod non habet - No one can give what he does not have",
  "Actus reus non facit reum nisi mens sit rea - The act is not culpable unless the mind is guilty",
  "Audi alteram partem - Hear the other side",
  "Res ipsa loquitur - The thing speaks for itself",
  "Caveat emptor - Let the buyer beware",
  "Pacta sunt servanda - Agreements must be kept",
  "Ultra vires - Beyond the powers"
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