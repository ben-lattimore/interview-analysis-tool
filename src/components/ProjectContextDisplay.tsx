
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

interface ProjectContextDisplayProps {
  context: string;
  loading: boolean;
}

const ProjectContextDisplay = ({ context, loading }: ProjectContextDisplayProps) => {
  if (loading) {
    return (
      <Card className="bg-white border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center text-lg font-semibold text-slate-900">
            <FileText className="w-5 h-5 mr-2 text-blue-600" />
            Project Context
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-500 text-sm">Loading context...</p>
        </CardContent>
      </Card>
    );
  }

  if (!context || context.trim() === "") {
    return (
      <Card className="bg-white border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center text-lg font-semibold text-slate-900">
            <FileText className="w-5 h-5 mr-2 text-blue-600" />
            Project Context
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-500 text-sm">No context added yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border-slate-200">
      <CardHeader>
        <CardTitle className="flex items-center text-lg font-semibold text-slate-900">
          <FileText className="w-5 h-5 mr-2 text-blue-600" />
          Project Context
        </CardTitle>
        <CardDescription>
          Additional context and instructions for this project
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-slate-50 rounded-lg p-4">
          <p className="text-slate-700 whitespace-pre-wrap text-sm leading-relaxed">
            {context}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectContextDisplay;
