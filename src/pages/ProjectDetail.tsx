import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, AlertTriangle, MessageCircle, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AIAnalysisResults from "@/components/AIAnalysisResults";
import TranscriptChatInterface from "@/components/TranscriptChatInterface";
import { useToast } from "@/hooks/use-toast";
import TranscriptTextInput from "@/components/TranscriptTextInput";
import { useTranscripts } from "@/hooks/useTranscripts";
import { supabase } from "@/integrations/supabase/client";

interface Project {
  id: string;
  name: string;
  description: string;
  transcript_count: number;
  created_at: string;
  last_analyzed?: string;
}

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [project, setProject] = useState<Project | null>(null);
  const [projectLoading, setProjectLoading] = useState(true);
  const { transcripts, loading: transcriptsLoading, addTranscript, deleteTranscript } = useTranscripts(id || "");

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;
      
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          console.error('Error fetching project:', error);
          toast({
            title: "Error loading project",
            description: "Could not load project details. Please try again.",
            variant: "destructive",
          });
          navigate('/');
        } else {
          setProject(data);
        }
      } catch (error) {
        console.error('Error:', error);
        navigate('/');
      } finally {
        setProjectLoading(false);
      }
    };

    fetchProject();
  }, [id, navigate, toast]);

  const handleTranscriptAdd = async (transcriptData: { filename: string; content: string }) => {
    const success = await addTranscript(transcriptData);
    if (success && project) {
      // Update local project state to reflect new transcript count
      setProject(prev => prev ? { ...prev, transcript_count: prev.transcript_count + 1 } : null);
    }
  };

  const handleTranscriptDelete = async (transcriptId: string) => {
    await deleteTranscript(transcriptId);
    if (project) {
      // Update local project state to reflect reduced transcript count
      setProject(prev => prev ? { ...prev, transcript_count: Math.max(0, prev.transcript_count - 1) } : null);
    }
  };

  if (projectLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div>Loading project...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div>Project not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate("/")}
                className="text-slate-600 hover:text-slate-900"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Projects
              </Button>
              <div className="h-6 w-px bg-slate-300" />
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{project.name}</h1>
                <p className="text-slate-600">{project.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {project.last_analyzed && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Last analyzed {new Date(project.last_analyzed).toLocaleDateString()}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Text Input & Files */}
          <div className="lg:col-span-1 space-y-6">
            {/* Text Input Section */}
            <TranscriptTextInput onTranscriptAdd={handleTranscriptAdd} />

            {/* Files List */}
            <Card className="bg-white border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center text-lg font-semibold text-slate-900">
                  <FileText className="w-5 h-5 mr-2 text-slate-600" />
                  Transcripts ({transcripts.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {transcriptsLoading ? (
                  <p className="text-slate-500 text-sm">Loading transcripts...</p>
                ) : transcripts.length === 0 ? (
                  <p className="text-slate-500 text-sm">No transcripts added yet.</p>
                ) : (
                  <div className="space-y-3">
                    {transcripts.map((transcript) => (
                      <div
                        key={transcript.id}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-slate-900 truncate" title={transcript.filename}>
                              {transcript.filename}
                            </p>
                            <p className="text-xs text-slate-500">
                              {transcript.size_kb} KB • {new Date(transcript.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTranscriptDelete(transcript.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                        >
                          <AlertTriangle className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Analysis Results and Chat */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="analysis" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="analysis" className="flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4" />
                  <span>Analysis Results</span>
                </TabsTrigger>
                <TabsTrigger value="chat" className="flex items-center space-x-2">
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat with Transcripts</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="analysis">
                <AIAnalysisResults transcripts={transcripts} projectId={id || ""} />
              </TabsContent>
              
              <TabsContent value="chat">
                <TranscriptChatInterface projectId={id || ""} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProjectDetail;
