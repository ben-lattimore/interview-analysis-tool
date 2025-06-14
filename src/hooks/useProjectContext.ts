
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useProjectContext = (projectId: string) => {
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchContext = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('context')
        .eq('id', projectId)
        .single();

      if (error) {
        console.error('Error fetching project context:', error);
        toast({
          title: "Error loading context",
          description: "Could not load project context. Please try again.",
          variant: "destructive",
        });
      } else {
        // Handle the case where context might not exist in the type yet
        setContext((data as any)?.context || "");
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveContext = async (newContext: string) => {
    try {
      // Append the new context to existing context
      const updatedContext = context ? `${context}\n\n---\n\n${newContext}` : newContext;
      
      const { error } = await supabase
        .from('projects')
        .update({ context: updatedContext } as any)
        .eq('id', projectId);

      if (error) {
        console.error('Error saving context:', error);
        toast({
          title: "Error saving context",
          description: "Could not save project context. Please try again.",
          variant: "destructive",
        });
        return false;
      } else {
        setContext(updatedContext);
        toast({
          title: "Context saved successfully",
          description: "Your project context has been updated.",
        });
        return true;
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error saving context",
        description: "Could not save project context. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateContext = async (newContext: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ context: newContext } as any)
        .eq('id', projectId);

      if (error) {
        console.error('Error updating context:', error);
        toast({
          title: "Error updating context",
          description: "Could not update project context. Please try again.",
          variant: "destructive",
        });
        return false;
      } else {
        setContext(newContext);
        toast({
          title: "Context updated successfully",
          description: "Your project context has been updated.",
        });
        return true;
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error updating context",
        description: "Could not update project context. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteContext = async () => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ context: '' } as any)
        .eq('id', projectId);

      if (error) {
        console.error('Error deleting context:', error);
        toast({
          title: "Error deleting context",
          description: "Could not delete project context. Please try again.",
          variant: "destructive",
        });
        return false;
      } else {
        setContext('');
        toast({
          title: "Context deleted successfully",
          description: "Your project context has been deleted.",
        });
        return true;
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error deleting context",
        description: "Could not delete project context. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchContext();
    }
  }, [projectId]);

  return {
    context,
    loading,
    saveContext,
    updateContext,
    deleteContext,
    refetch: fetchContext,
  };
};
