
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface Project {
  id: string;
  name: string;
  description: string;
  transcript_count: number;
  created_at: string;
  last_analyzed?: string;
}

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (projectId: string, data: { name: string; description: string }) => void;
  project: Project | null;
}

const EditProjectModal = ({ isOpen, onClose, onSubmit, project }: EditProjectModalProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description);
    }
  }, [project]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && project) {
      onSubmit(project.id, { 
        name: name.trim(), 
        description: description.trim()
      });
      handleClose();
    }
  };

  const handleClose = () => {
    setName("");
    setDescription("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-slate-900">
            Edit Project
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name" className="text-sm font-medium text-slate-700">
              Project Name
            </Label>
            <Input
              id="edit-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., AI Leadership Summit 2024"
              className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-description" className="text-sm font-medium text-slate-700">
              Description
            </Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of your research project..."
              className="border-slate-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
              rows={3}
            />
          </div>
          
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Update Project
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProjectModal;
