
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

interface AnalysisResult {
  id: string;
  project_id: string;
  key_themes: any;
  disagreements: any;
  transcript_count: number;
  created_at: string;
  updated_at: string;
}

export const useAnalysisResults = (projectId: string) => {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAnalysisResult = async () => {
    try {
      const { data, error } = await supabase
        .from('analysis_results')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching analysis result:', error);
        toast({
          title: "Error loading analysis",
          description: "Could not load analysis results. Please try again.",
          variant: "destructive",
        });
      } else {
        setAnalysisResult(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveAnalysisResult = async (analysisData: AnalysisData, transcriptCount: number) => {
    try {
      const { data, error } = await supabase
        .from('analysis_results')
        .insert([{
          project_id: projectId,
          key_themes: analysisData.keyThemes,
          disagreements: analysisData.disagreements,
          transcript_count: transcriptCount,
        }])
        .select()
        .single();

      if (error) {
        console.error('Error saving analysis result:', error);
        toast({
          title: "Error saving analysis",
          description: "Analysis completed but could not be saved. Please try again.",
          variant: "destructive",
        });
        return false;
      } else {
        setAnalysisResult(data);
        return true;
      }
    } catch (error) {
      console.error('Error:', error);
      return false;
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchAnalysisResult();
    }
  }, [projectId]);

  return {
    analysisResult,
    loading,
    saveAnalysisResult,
    refetch: fetchAnalysisResult,
  };
};
