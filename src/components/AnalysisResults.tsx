
import { TrendingUp, AlertTriangle, Users, BookOpen, Quote } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const AnalysisResults = () => {
  const keyThemes = [
    {
      title: "Artificial General Intelligence Timeline",
      confidence: 0.92,
      mentions: 15,
      description: "Discussions around when AGI might be achieved, with estimates ranging from 5-20 years.",
      quotes: [
        "We're closer than most people think, but the final steps will be the hardest.",
        "The timeline depends heavily on breakthrough moments we can't predict."
      ]
    },
    {
      title: "AI Safety and Alignment",
      confidence: 0.88,
      mentions: 22,
      description: "Concerns about ensuring AI systems remain beneficial and aligned with human values.",
      quotes: [
        "Safety isn't just a technical problem - it's a coordination problem.",
        "We need to solve alignment before we achieve superintelligence."
      ]
    },
    {
      title: "Economic Disruption from AI",
      confidence: 0.85,
      mentions: 18,
      description: "Impact of AI on jobs, productivity, and economic structures.",
      quotes: [
        "The economic transformation will be faster than previous technological revolutions.",
        "We need new models for distributing the benefits of AI productivity gains."
      ]
    },
    {
      title: "AI Governance and Regulation",
      confidence: 0.79,
      mentions: 12,
      description: "Need for regulatory frameworks and international cooperation on AI development.",
      quotes: [
        "Regulation needs to be adaptive - we can't predict all the challenges ahead.",
        "International cooperation is essential for managing existential risks."
      ]
    }
  ];

  const disagreements = [
    {
      title: "Speed of AI Development",
      intensity: "High",
      participants: ["Geoffrey Hinton", "Yann LeCun"],
      description: "Significant disagreement on whether current AI development is too fast or appropriately paced.",
      positions: [
        {
          stance: "Development is too rapid",
          supporter: "Geoffrey Hinton",
          reasoning: "We need to slow down and focus more on safety research before pushing capabilities further."
        },
        {
          stance: "Current pace is necessary",
          supporter: "Yann LeCun", 
          reasoning: "Competition drives innovation, and slowing down could mean missing crucial breakthroughs."
        }
      ]
    },
    {
      title: "Existential Risk from AI",
      intensity: "Medium",
      participants: ["Multiple speakers"],
      description: "Varying views on the likelihood and severity of existential risks posed by AI.",
      positions: [
        {
          stance: "High existential risk",
          supporter: "Safety-focused researchers",
          reasoning: "Superintelligent AI could pose an existential threat if not properly aligned."
        },
        {
          stance: "Manageable risks",
          supporter: "Industry leaders",
          reasoning: "Risks are real but manageable with proper research and gradual development."
        }
      ]
    },
    {
      title: "Role of Open Source in AI",
      intensity: "Medium",
      participants: ["Tech leaders", "Academic researchers"],
      description: "Debate over whether AI models should be open source or kept proprietary for safety.",
      positions: [
        {
          stance: "Open source benefits",
          supporter: "Academic community",
          reasoning: "Open development allows for better scrutiny and democratic participation in AI progress."
        },
        {
          stance: "Controlled development",
          supporter: "Safety researchers",
          reasoning: "Some capabilities are too dangerous to release openly without proper safeguards."
        }
      ]
    }
  ];

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return "bg-green-100 text-green-800";
    if (confidence >= 0.8) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getIntensityColor = (intensity: string) => {
    switch (intensity.toLowerCase()) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-8">
      {/* Key Themes Section */}
      <div>
        <div className="flex items-center space-x-3 mb-6">
          <TrendingUp className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-slate-900">Key Themes</h2>
        </div>
        
        <div className="grid gap-6">
          {keyThemes.map((theme, index) => (
            <Card key={index} className="bg-white border-slate-200">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-slate-900 mb-2">
                      {theme.title}
                    </CardTitle>
                    <CardDescription className="text-slate-600">
                      {theme.description}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <Badge className={getConfidenceColor(theme.confidence)}>
                      {Math.round(theme.confidence * 100)}% confidence
                    </Badge>
                    <Badge variant="outline" className="border-slate-300">
                      {theme.mentions} mentions
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <h4 className="font-medium text-slate-900 flex items-center">
                    <Quote className="w-4 h-4 mr-2 text-slate-400" />
                    Key Quotes
                  </h4>
                  {theme.quotes.map((quote, quoteIndex) => (
                    <blockquote
                      key={quoteIndex}
                      className="border-l-4 border-blue-200 pl-4 italic text-slate-700 text-sm"
                    >
                      "{quote}"
                    </blockquote>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Disagreements Section */}
      <div>
        <div className="flex items-center space-x-3 mb-6">
          <AlertTriangle className="w-6 h-6 text-red-600" />
          <h2 className="text-2xl font-bold text-slate-900">Areas of Disagreement</h2>
        </div>
        
        <div className="grid gap-6">
          {disagreements.map((disagreement, index) => (
            <Card key={index} className="bg-white border-slate-200">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-slate-900 mb-2">
                      {disagreement.title}
                    </CardTitle>
                    <CardDescription className="text-slate-600">
                      {disagreement.description}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <Badge className={getIntensityColor(disagreement.intensity)}>
                      {disagreement.intensity} intensity
                    </Badge>
                    <Badge variant="outline" className="border-slate-300">
                      <Users className="w-3 h-3 mr-1" />
                      {disagreement.participants.length} participants
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {disagreement.positions.map((position, posIndex) => (
                    <div key={posIndex} className="border-l-4 border-slate-200 pl-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-slate-900">{position.stance}</h4>
                        <Badge variant="secondary" className="text-xs">
                          {position.supporter}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600">{position.reasoning}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalysisResults;
