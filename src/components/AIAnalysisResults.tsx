import { useState, useEffect } from "react";
import { TrendingUp, AlertTriangle, Users, BookOpen, Quote, Loader2, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAnalysisResults } from "@/hooks/useAnalysisResults";
import QuoteCleanupToggle from "./QuoteCleanupToggle";

interface QuoteObject {
  text: string;
  participant: string;
  context?: string;
}

interface KeyTheme {
  title: string;
  confidence: number;
  mentions: number;
  description: string;
  quotes: QuoteObject[];
}

interface Position {
  stance: string;
  supporter: string;
  reasoning: string;
  quote: QuoteObject;
}

interface Disagreement {
  title: string;
  intensity: string;
  participants: string[];
  description: string;
  positions: Position[];
}

interface AnalysisData {
  keyThemes: KeyTheme[];
  disagreements: Disagreement[];
}

interface AIAnalysisResultsProps {
  transcripts: Array<{
    id: string;
    filename: string;
    content?: string;
  }>;
  projectId: string;
}

const AIAnalysisResults = ({ transcripts, projectId }: AIAnalysisResultsProps) => {
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { analysisResult, saveAnalysisResult } = useAnalysisResults(projectId);

  // Load existing analysis from database on component mount
  useEffect(() => {
    if (analysisResult && analysisResult.key_themes && analysisResult.disagreements) {
      setCurrentAnalysis({
        keyThemes: analysisResult.key_themes,
        disagreements: analysisResult.disagreements,
      });
    }
  }, [analysisResult]);

  const runAnalysis = async () => {
    if (!transcripts || transcripts.length === 0) {
      setError("No transcripts available for analysis");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Starting AI analysis with transcripts:', transcripts.length);
      
      const { data, error: functionError } = await supabase.functions.invoke('analyze-transcripts', {
        body: { transcripts }
      });

      if (functionError) {
        throw new Error(functionError.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setCurrentAnalysis(data);
      
      // Save to database
      const saved = await saveAnalysisResult(data, transcripts.length);
      
      if (saved) {
        toast({
          title: "Analysis Complete",
          description: "AI analysis has been successfully generated and saved.",
        });
      }

    } catch (error: any) {
      console.error('Analysis error:', error);
      setError(error.message);
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <Card className="bg-white border-slate-200">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            Analyzing Transcripts...
          </h3>
          <p className="text-slate-600 text-center">
            Our AI is processing your transcripts to identify key themes and disagreements.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (error && !currentAnalysis) {
    return (
      <Card className="bg-white border-slate-200">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <AlertTriangle className="w-16 h-16 text-red-400 mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            Analysis Failed
          </h3>
          <p className="text-slate-600 text-center mb-4">{error}</p>
          <Button
            onClick={runAnalysis}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!currentAnalysis) {
    return (
      <Card className="bg-white border-slate-200 border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <TrendingUp className="w-16 h-16 text-slate-400 mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            Ready for AI Analysis
          </h3>
          <p className="text-slate-600 text-center max-w-md mb-6">
            Click the button below to analyze your transcripts with AI and discover key themes and areas of disagreement.
          </p>
          <Button
            onClick={runAnalysis}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
            disabled={transcripts.length === 0}
          >
            Start AI Analysis
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Analysis Header with Re-analyze Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <TrendingUp className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-slate-900">AI Analysis Results</h2>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            AI Generated
          </Badge>
          {analysisResult && (
            <Badge variant="outline" className="text-xs">
              Saved {new Date(analysisResult.created_at).toLocaleDateString()}
            </Badge>
          )}
        </div>
        <Button
          onClick={runAnalysis}
          variant="outline"
          className="flex items-center space-x-2"
          disabled={loading || transcripts.length === 0}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Re-analyze</span>
        </Button>
      </div>

      {/* Key Themes Section */}
      <div>
        <div className="flex items-center space-x-3 mb-6">
          <TrendingUp className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-slate-900">Key Themes</h2>
        </div>
        
        <div className="grid gap-6">
          {currentAnalysis.keyThemes?.map((theme, index) => (
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
                  {theme.quotes?.map((quote, quoteIndex) => (
                    <QuoteCleanupToggle
                      key={quoteIndex}
                      originalText={quote.text}
                      participant={quote.participant}
                      context={quote.context}
                    />
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
          {currentAnalysis.disagreements?.map((disagreement, index) => (
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
                      {disagreement.participants?.length || 0} participants
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {disagreement.positions?.map((position, posIndex) => (
                    <div key={posIndex} className="border-l-4 border-slate-200 pl-4">

                      <p className="text-sm text-slate-600 mb-3">{position.reasoning}</p>
                      {position.quote && (
                        <div className="bg-slate-50 p-3 rounded">
                          <QuoteCleanupToggle
                            originalText={position.quote.text}
                            participant={position.quote.participant}
                            context={position.quote.context}
                          />
                        </div>
                      )}
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

export default AIAnalysisResults;
