
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Edit, Trash2, Save, X } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ProjectContextDisplayProps {
  context: string;
  loading: boolean;
  onContextUpdate: (newContext: string) => Promise<boolean>;
  onContextDelete: () => Promise<boolean>;
}

const ProjectContextDisplay = ({ context, loading, onContextUpdate, onContextDelete }: ProjectContextDisplayProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContext, setEditedContext] = useState("");
  const [saving, setSaving] = useState(false);

  const handleEdit = () => {
    setEditedContext(context);
    setIsEditing(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const success = await onContextUpdate(editedContext);
    if (success) {
      setIsEditing(false);
    }
    setSaving(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedContext("");
  };

  const handleDelete = async () => {
    setSaving(true);
    await onContextDelete();
    setSaving(false);
  };

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
        <CardTitle className="flex items-center justify-between text-lg font-semibold text-slate-900">
          <div className="flex items-center">
            <FileText className="w-5 h-5 mr-2 text-blue-600" />
            Project Context
          </div>
          {!isEditing && (
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEdit}
                className="text-slate-600 hover:text-slate-900"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Project Context</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete all project context? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </CardTitle>
        {!isEditing && (
          <CardDescription>
            Additional context and instructions for this project
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-4">
            <Textarea
              value={editedContext}
              onChange={(e) => setEditedContext(e.target.value)}
              className="border-slate-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
              rows={8}
              placeholder="Add any additional context, specific analysis instructions, background information, or other details..."
            />
            <div className="flex items-center space-x-2">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={saving}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 rounded-lg p-4">
            <p className="text-slate-700 whitespace-pre-wrap text-sm leading-relaxed">
              {context}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectContextDisplay;
