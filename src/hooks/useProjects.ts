
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Project {
  id: string;
  name: string;
  description: string;
  transcript_count: number;
  created_at: string;
  last_analyzed?: string;
}

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProjects = async () => {
    try {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setProjects([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching projects:', error);
        toast({
          title: "Error loading projects",
          description: error.message || "Could not load your projects. Please try again.",
        });
      } else {
        setProjects(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Unexpected error",
        description: "An unexpected error occurred while loading projects.",
      });
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (projectData: { name: string; description: string }) => {
    try {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to create projects.",
        });
        return null;
      }

      const { data, error } = await supabase
        .from('projects')
        .insert([{
          name: projectData.name,
          description: projectData.description,
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating project:', error);
        toast({
          title: "Error creating project",
          description: error.message || "Could not create project. Please try again.",
        });
        return null;
      } else {
        setProjects(prev => [data, ...prev]);
        toast({
          title: "Project created successfully",
          description: `${projectData.name} is ready for transcript uploads.`,
        });
        return data;
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Unexpected error",
        description: "An unexpected error occurred. Please try again.",
      });
      return null;
    }
  };

  const updateProject = async (projectId: string, projectData: { name: string; description: string }) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .update({
          name: projectData.name,
          description: projectData.description,
          updated_at: new Date().toISOString(),
        })
        .eq('id', projectId)
        .select()
        .single();

      if (error) {
        console.error('Error updating project:', error);
        toast({
          title: "Error updating project",
          description: "Could not update project. Please try again.",
          variant: "destructive",
        });
        return null;
      } else {
        setProjects(prev => prev.map(p => p.id === projectId ? data : p));
        toast({
          title: "Project updated successfully",
          description: `${projectData.name} has been updated.`,
        });
        return data;
      }
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  };

  const deleteProject = async (projectId: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) {
        console.error('Error deleting project:', error);
        toast({
          title: "Error deleting project",
          description: "Could not delete project. Please try again.",
          variant: "destructive",
        });
        return false;
      } else {
        setProjects(prev => prev.filter(p => p.id !== projectId));
        toast({
          title: "Project deleted successfully",
          description: "The project and all its data have been removed.",
        });
        return true;
      }
    } catch (error) {
      console.error('Error:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return {
    projects,
    loading,
    createProject,
    updateProject,
    deleteProject,
    refetch: fetchProjects,
  };
};
