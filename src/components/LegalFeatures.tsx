import React from 'react';
import { Scale, BookOpen, Users, Globe, FileText, Gavel } from 'lucide-react';

const LEGAL_FEATURES = [
  {
    icon: Scale,
    title: "IRAC Analysis",
    description: "Comprehensive case analysis using Issue, Rule, Application, Conclusion methodology"
  },
  {
    icon: BookOpen,
    title: "Case Citations",
    description: "Accurate legal citations from Nigerian and international jurisprudence"
  },
  {
    icon: Users,
    title: "Legal Advisory",
    description: "Professional legal advice and strategic recommendations for all parties"
  },
  {
    icon: Globe,
    title: "Constitutional Law",
    description: "Complete constitutional provisions and interpretations for all countries"
  },
  {
    icon: FileText,
    title: "Document Analysis",
    description: "Legal document review, drafting assistance, and clause interpretation"
  },
  {
    icon: Gavel,
    title: "Judgment Writing",
    description: "Case analysis and judgment preparation with proper legal reasoning"
  }
];

export function LegalFeatures() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
      {LEGAL_FEATURES.map((feature, index) => {
        const IconComponent = feature.icon;
        return (
          <div 
            key={index}
            className="p-6 bg-gray-800/40 rounded-xl border border-gray-700/50 hover:border-amber-500/30 transition-all duration-300 hover:transform hover:scale-105"
          >
            <div className="p-3 bg-amber-600/20 rounded-lg w-fit mb-4">
              <IconComponent className="h-6 w-6 text-amber-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
            <p className="text-gray-300 text-sm leading-relaxed">{feature.description}</p>
          </div>
        );
      })}
    </div>
  );
}