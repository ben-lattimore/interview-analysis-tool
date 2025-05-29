
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Transcript {
  id: string;
  filename: string;
  content: string;
  size_kb: number | null;
  created_at: string;
  updated_at: string;
}

export const useTranscripts = (projectId: string) => {
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTranscripts = async () => {
    try {
      const { data, error } = await supabase
        .from('transcripts')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching transcripts:', error);
        toast({
          title: "Error loading transcripts",
          description: "Could not load transcripts. Please try again.",
          variant: "destructive",
        });
      } else {
        setTranscripts(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTranscript = async (transcriptData: { filename: string; content: string }) => {
    try {
      const sizeKb = Math.round((transcriptData.content.length / 1024) * 10) / 10;
      
      const { data, error } = await supabase
        .from('transcripts')
        .insert([{
          project_id: projectId,
          filename: transcriptData.filename,
          content: transcriptData.content,
          size_kb: sizeKb,
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding transcript:', error);
        toast({
          title: "Error adding transcript",
          description: "Could not add transcript. Please try again.",
          variant: "destructive",
        });
        return false;
      } else {
        setTranscripts(prev => [data, ...prev]);
        toast({
          title: "Transcript added successfully",
          description: `"${transcriptData.filename}" has been added to your project.`,
        });
        return true;
      }
    } catch (error) {
      console.error('Error:', error);
      return false;
    }
  };

  const deleteTranscript = async (transcriptId: string) => {
    try {
      const { error } = await supabase
        .from('transcripts')
        .delete()
        .eq('id', transcriptId);

      if (error) {
        console.error('Error deleting transcript:', error);
        toast({
          title: "Error deleting transcript",
          description: "Could not delete transcript. Please try again.",
          variant: "destructive",
        });
      } else {
        setTranscripts(prev => prev.filter(t => t.id !== transcriptId));
        toast({
          title: "Transcript deleted",
          description: "Transcript has been removed from your project.",
        });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchTranscripts();
    }
  }, [projectId]);

  return {
    transcripts,
    loading,
    addTranscript,
    deleteTranscript,
    refetch: fetchTranscripts,
  };
};
