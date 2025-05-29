
import { Calendar, FileText, BarChart3, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface Project {
  id: string;
  name: string;
  description: string;
  transcriptCount: number;
  createdAt: Date;
  lastAnalyzed?: Date;
}

interface ProjectCardProps {
  project: Project;
}

const ProjectCard = ({ project }: ProjectCardProps) => {
  const navigate = useNavigate();

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const handleViewProject = () => {
    navigate(`/project/${project.id}`);
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
          {project.lastAnalyzed && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Analyzed
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-center justify-between text-sm text-slate-600 mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <FileText className="w-4 h-4 mr-1" />
              <span>{project.transcriptCount} transcripts</span>
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              <span>{formatDate(project.createdAt)}</span>
            </div>
          </div>
        </div>
        
        {project.lastAnalyzed && (
          <div className="flex items-center text-xs text-green-600 mb-4">
            <BarChart3 className="w-3 h-3 mr-1" />
            <span>Last analyzed {formatDate(project.lastAnalyzed)}</span>
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
