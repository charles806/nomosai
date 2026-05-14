import React from 'react';
import { X, Scale, Brain, BookOpen, Gavel, Users, Globe, FileText, Award, Zap } from 'lucide-react';

interface AIInfoPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AIInfoPopup({ isOpen, onClose }: AIInfoPopupProps) {
  if (!isOpen) return null;

  const capabilities = [
    {
      icon: Scale,
      title: "IRAC Analysis",
      description: "Comprehensive legal analysis using Issue, Rule, Application, Conclusion methodology with proper case citations"
    },
    {
      icon: Brain,
      title: "Legal Intelligence",
      description: "Advanced AI reasoning for complex legal problems, contract analysis, and strategic legal advice"
    },
    {
      icon: BookOpen,
      title: "Case Law Database",
      description: "Access to Nigerian and international case law with accurate citations and brief explanations"
    },
    {
      icon: Gavel,
      title: "Judgment Writing",
      description: "Professional judgment analysis and legal document preparation with proper legal reasoning"
    },
    {
      icon: Users,
      title: "Legal Advisory",
      description: "Expert legal advice for all parties with strategic recommendations and practical solutions"
    },
    {
      icon: Globe,
      title: "Constitutional Law",
      description: "Complete constitutional provisions and interpretations for all countries with relevant precedents"
    },
    {
      icon: FileText,
      title: "Legal Dictionary",
      description: "Comprehensive legal terminology, maxims, and principles with historical context and applications"
    },
    {
      icon: Award,
      title: "Legal Entities",
      description: "Detailed information about recognized legal entities, jurists, judges, and legal institutions"
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
              <Scale className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">LAWGREEN AI</h2>
              <p className="text-green-400 font-medium">Powered by Greenxchange Tech Lab</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Introduction */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Zap className="h-6 w-6 text-green-400" />
              <h3 className="text-xl font-bold text-white">Advanced Legal Intelligence</h3>
            </div>
            <p className="text-gray-300 text-lg leading-relaxed max-w-3xl mx-auto">
              LAWGREEN AI is your comprehensive legal assistant, designed to provide expert-level legal analysis, 
              case citations, and professional advice. Built with advanced AI technology to serve lawyers, 
              law students, and legal professionals with accurate, fast, and elaborate responses.
            </p>
          </div>

          {/* Key Features */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4 text-center">Core Capabilities</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {capabilities.map((capability, index) => {
                const IconComponent = capability.icon;
                return (
                  <div key={index} className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-green-600/20 rounded-lg flex-shrink-0">
                        <IconComponent className="h-5 w-5 text-green-400" />
                      </div>
                      <div>
                        <h5 className="font-semibold text-white mb-1">{capability.title}</h5>
                        <p className="text-sm text-gray-300 leading-relaxed">{capability.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legal Expertise */}
          <div className="bg-gradient-to-r from-green-900/30 to-green-800/30 rounded-xl p-6 border border-green-700/30">
            <h4 className="text-lg font-semibold text-green-400 mb-4">Legal Expertise Areas</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              {[
                "Constitutional Law", "Criminal Law", "Civil Procedure", "Contract Law",
                "Tort Law", "Property Law", "Family Law", "Commercial Law",
                "Administrative Law", "International Law", "Human Rights", "Evidence Law",
                "Legal Research", "Case Analysis", "Legal Writing", "Court Procedures"
              ].map((area, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-gray-300">{area}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Usage Instructions */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4 text-center">How to Use</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-gray-800/30 rounded-lg">
                <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                <p className="text-gray-300">Ask any legal question or request case analysis</p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gray-800/30 rounded-lg">
                <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                <p className="text-gray-300">Receive detailed analysis with IRAC formula, case citations, and legal maxims</p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gray-800/30 rounded-lg">
                <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                <p className="text-gray-300">Get practical advice, legal arguments, and professional recommendations</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-700 p-6 text-center">
          <p className="text-gray-400 text-sm">
            © 2025 Greenxchange Tech Lab. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}