
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FileText, Save } from "lucide-react";

interface ProjectContextInputProps {
  projectId: string;
  initialContext?: string;
  onContextSave: (context: string) => Promise<boolean>;
}

const ProjectContextInput = ({ projectId, initialContext = "", onContextSave }: ProjectContextInputProps) => {
  const [context, setContext] = useState(initialContext);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const success = await onContextSave(context.trim());
    if (success) {
      setContext(""); // Clear the textarea after successful save
    }
    setSaving(false);
  };

  return (
    <Card className="bg-white border-slate-200">
      <CardHeader>
        <CardTitle className="flex items-center text-lg font-semibold text-slate-900">
          <FileText className="w-5 h-5 mr-2 text-blue-600" />
          Add Context
        </CardTitle>
        <CardDescription>
          Add additional information, specific prompts, emails, or other context that will help the AI better understand your project
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project-context" className="text-sm font-medium text-slate-700">
              Project Context & Instructions
            </Label>
            <Textarea
              id="project-context"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Add any additional context, specific analysis instructions, background information, or other details that will help the AI understand your project better..."
              className="border-slate-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
              rows={8}
            />
          </div>
          
          <Button
            onClick={handleSave}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            disabled={saving}
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Save Context"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectContextInput;
