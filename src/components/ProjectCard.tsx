
import { useState } from "react";
import { Calendar, FileText, BarChart3, ArrowRight, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";

interface Project {
  id: string;
  name: string;
  description: string;
  transcript_count: number;
  created_at: string;
  last_analyzed?: string;
}

interface ProjectCardProps {
  project: Project;
  onEdit?: (project: Project) => void;
  onDelete?: (projectId: string) => void;
}

const ProjectCard = ({ project, onEdit, onDelete }: ProjectCardProps) => {
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const handleViewProject = () => {
    navigate(`/project/${project.id}`);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(project);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    const success = await onDelete?.(project.id);
    if (!success) {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="bg-white border-slate-200 hover:shadow-lg transition-all duration-200 hover:border-blue-300 group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
              {project.name}
            </CardTitle>
            <CardDescription className="text-slate-600 mt-1 line-clamp-2">
              {project.description}
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            {project.last_analyzed && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Analyzed
              </Badge>
            )}
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleEdit}
                className="h-8 w-8 text-slate-400 hover:text-blue-600"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Project</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{project.name}"? This action cannot be undone and will permanently remove all transcripts and analysis data associated with this project.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {isDeleting ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-center justify-between text-sm text-slate-600 mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <FileText className="w-4 h-4 mr-1" />
              <span>{project.transcript_count} transcripts</span>
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              <span>{formatDate(project.created_at)}</span>
            </div>
          </div>
        </div>
        
        {project.last_analyzed && (
          <div className="flex items-center text-xs text-green-600 mb-4">
            <BarChart3 className="w-3 h-3 mr-1" />
            <span>Last analyzed {formatDate(project.last_analyzed)}</span>
          </div>
        )}
        
        <Button 
          onClick={handleViewProject}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white group-hover:bg-blue-600 group-hover:hover:bg-blue-700 transition-colors"
        >
          View Analysis
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;
