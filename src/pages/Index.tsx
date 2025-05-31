
import { useState } from "react";
import { Plus, FileText, Users, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ProjectCard from "@/components/ProjectCard";
import CreateProjectModal from "@/components/CreateProjectModal";
import EditProjectModal from "@/components/EditProjectModal";
import { useProjects } from "@/hooks/useProjects";

interface Project {
  id: string;
  name: string;
  description: string;
  transcript_count: number;
  created_at: string;
  last_analyzed?: string;
}

const Index = () => {
  const { projects, loading, createProject, updateProject, deleteProject } = useProjects();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const handleCreateProject = async (projectData: { name: string; description: string }) => {
    const result = await createProject(projectData);
    if (result) {
      setIsCreateModalOpen(false);
    }
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setIsEditModalOpen(true);
  };

  const handleUpdateProject = async (projectId: string, projectData: { name: string; description: string }) => {
    const result = await updateProject(projectId, projectData);
    if (result) {
      setIsEditModalOpen(false);
      setEditingProject(null);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    return await deleteProject(projectId);
  };

  const totalTranscripts = projects.reduce((sum, project) => sum + project.transcript_count, 0);
  const analyzedProjects = projects.filter(p => p.last_analyzed).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-slate-600">Loading projects...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">TranscriptIQ</h1>
                <p className="text-slate-600 text-sm">Interview Analysis Platform</p>
              </div>
            </div>
            <Button 
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Projects</CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{projects.length}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Transcripts</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{totalTranscripts}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Insights Generated</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{analyzedProjects * 2}</div>
            </CardContent>
          </Card>
        </div>

        {/* Projects Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Your Projects</h2>
              <p className="text-slate-600">Manage and analyze your interview transcripts</p>
            </div>
          </div>
          
          {projects.length === 0 ? (
            <Card className="bg-white border-slate-200 border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="w-12 h-12 text-slate-400 mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No projects yet</h3>
                <p className="text-slate-600 text-center mb-6 max-w-md">
                  Create your first project to start uploading and analyzing interview transcripts.
                </p>
                <Button 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Project
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <ProjectCard 
                  key={project.id} 
                  project={project}
                  onEdit={handleEditProject}
                  onDelete={handleDeleteProject}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateProject}
      />

      <EditProjectModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingProject(null);
        }}
        onSubmit={handleUpdateProject}
        project={editingProject}
      />
    </div>
  );
};

export default Index;
