
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AIAnalysisResults from "@/components/AIAnalysisResults";
import { useToast } from "@/hooks/use-toast";
import TranscriptTextInput from "@/components/TranscriptTextInput";

interface Transcript {
  id: string;
  filename: string;
  uploadedAt: Date;
  size: number;
  content: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  transcriptCount: number;
  createdAt: Date;
  lastAnalyzed?: Date;
}

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [project, setProject] = useState<Project | null>(null);
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);

  useEffect(() => {
    // Mock project data - in real app this would fetch from API
    const mockProject: Project = {
      id: id || "1",
      name: "New Project",
      description: "Add transcripts to analyze themes and disagreements",
      transcriptCount: 0,
      createdAt: new Date(),
    };
    
    setProject(mockProject);
    setTranscripts([]);
  }, [id]);

  const handleTranscriptAdd = (transcriptData: { filename: string; content: string }) => {
    const newTranscript = {
      id: Date.now().toString() + Math.random(),
      filename: transcriptData.filename,
      uploadedAt: new Date(),
      size: Math.round((transcriptData.content.length / 1024) * 10) / 10, // KB approximation
      content: transcriptData.content
    };
    
    setTranscripts([...transcripts, newTranscript]);
    
    // Update project transcript count
    if (project) {
      setProject({
        ...project,
        transcriptCount: transcripts.length + 1
      });
    }
    
    toast({
      title: "Transcript added successfully",
      description: `"${transcriptData.filename}" has been added to your project.`,
    });
  };

  if (!project) {
    return <div>Loading...</div>;
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
              {project.lastAnalyzed && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Last analyzed {project.lastAnalyzed.toLocaleDateString()}
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
                {transcripts.length === 0 ? (
                  <p className="text-slate-500 text-sm">No transcripts added yet.</p>
                ) : (
                  <div className="space-y-3">
                    {transcripts.map((transcript) => (
                      <div
                        key={transcript.id}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <FileText className="w-4 h-4 text-slate-400" />
                          <div>
                            <p className="font-medium text-sm text-slate-900">
                              {transcript.filename}
                            </p>
                            <p className="text-xs text-slate-500">
                              {transcript.size} KB • {transcript.uploadedAt.toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - AI Analysis Results */}
          <div className="lg:col-span-2">
            <AIAnalysisResults transcripts={transcripts} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProjectDetail;
