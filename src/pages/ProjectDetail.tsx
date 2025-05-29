
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, FileText, Brain, AlertTriangle, TrendingUp, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import FileUpload from "@/components/FileUpload";
import AnalysisResults from "@/components/AnalysisResults";
import { useToast } from "@/hooks/use-toast";

interface Transcript {
  id: string;
  filename: string;
  uploadedAt: Date;
  size: number;
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
  const [hasAnalysis, setHasAnalysis] = useState(false);

  useEffect(() => {
    // Mock project data - in real app this would fetch from API
    const mockProject: Project = {
      id: id || "1",
      name: "AI Leadership Summit 2024",
      description: "Interviews with AI thought leaders on the future of artificial intelligence",
      transcriptCount: 3,
      createdAt: new Date("2024-01-15"),
      lastAnalyzed: new Date("2024-01-20"),
    };
    
    const mockTranscripts: Transcript[] = [
      {
        id: "1",
        filename: "geoffrey-hinton-interview.pdf",
        uploadedAt: new Date("2024-01-15"),
        size: 2.4,
      },
      {
        id: "2",
        filename: "yann-lecun-discussion.pdf",
        uploadedAt: new Date("2024-01-16"),
        size: 1.8,
      },
      {
        id: "3",
        filename: "andrew-ng-insights.pdf",
        uploadedAt: new Date("2024-01-17"),
        size: 3.1,
      },
    ];
    
    setProject(mockProject);
    setTranscripts(mockTranscripts);
    setHasAnalysis(mockTranscripts.length > 0);
  }, [id]);

  const handleFileUpload = (files: File[]) => {
    const newTranscripts = files.map(file => ({
      id: Date.now().toString() + Math.random(),
      filename: file.name,
      uploadedAt: new Date(),
      size: Math.round((file.size / 1024 / 1024) * 10) / 10, // MB
    }));
    
    setTranscripts([...transcripts, ...newTranscripts]);
    
    toast({
      title: "Files uploaded successfully",
      description: `${files.length} transcript(s) have been added to your project.`,
    });
  };

  const handleRunAnalysis = () => {
    setHasAnalysis(true);
    
    toast({
      title: "Analysis started",
      description: "We're processing your transcripts to extract key themes and disagreements.",
    });
    
    // Mock analysis delay
    setTimeout(() => {
      if (project) {
        setProject({ ...project, lastAnalyzed: new Date() });
      }
      
      toast({
        title: "Analysis complete",
        description: "Your transcript analysis is ready for review.",
      });
    }, 2000);
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
          {/* Left Column - Upload & Files */}
          <div className="lg:col-span-1 space-y-6">
            {/* Upload Section */}
            <Card className="bg-white border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center text-lg font-semibold text-slate-900">
                  <Upload className="w-5 h-5 mr-2 text-blue-600" />
                  Upload Transcripts
                </CardTitle>
                <CardDescription>
                  Add PDF transcripts to analyze themes and disagreements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileUpload onFileUpload={handleFileUpload} />
              </CardContent>
            </Card>

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
                  <p className="text-slate-500 text-sm">No transcripts uploaded yet.</p>
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
                              {transcript.size} MB • {transcript.uploadedAt.toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Analysis Button */}
            {transcripts.length > 0 && (
              <Button
                onClick={handleRunAnalysis}
                disabled={hasAnalysis}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Brain className="w-4 h-4 mr-2" />
                {hasAnalysis ? "Analysis Complete" : "Run Analysis"}
              </Button>
            )}
          </div>

          {/* Right Column - Analysis Results */}
          <div className="lg:col-span-2">
            {hasAnalysis ? (
              <AnalysisResults />
            ) : (
              <Card className="bg-white border-slate-200 border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Brain className="w-16 h-16 text-slate-400 mb-4" />
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">
                    Ready for Analysis
                  </h3>
                  <p className="text-slate-600 text-center max-w-md mb-6">
                    Upload transcripts and run analysis to discover key themes and areas of disagreement across your interviews.
                  </p>
                  {transcripts.length === 0 && (
                    <p className="text-sm text-slate-500">
                      Start by uploading your first transcript PDF.
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProjectDetail;
