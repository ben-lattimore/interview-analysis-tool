
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ChatQuote {
  text: string;
  participant: string;
  context?: string;
}

interface ChatConversation {
  id: string;
  project_id: string;
  user_message: string;
  ai_response: string;
  response_quotes: ChatQuote[];
  created_at: string;
  session_id?: string;
}

// Type for database response
interface ChatConversationDB {
  id: string;
  project_id: string;
  user_message: string;
  ai_response: string;
  response_quotes: any; // Json type from database
  created_at: string;
  session_id?: string;
}

export const useChatConversations = (projectId: string) => {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const fetchConversations = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching conversations:', error);
        toast({
          title: "Error loading chat history",
          description: "Could not load previous conversations. Please try again.",
          variant: "destructive",
        });
      } else {
        // Transform the database response to match our interface
        const transformedData: ChatConversation[] = (data || []).map((item: ChatConversationDB) => ({
          ...item,
          response_quotes: Array.isArray(item.response_quotes) ? item.response_quotes : []
        }));
        setConversations(transformedData);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (question: string) => {
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('chat-with-transcripts', {
        body: { question, projectId }
      });

      if (error) {
        console.error('Error sending message:', error);
        toast({
          title: "Error sending message",
          description: "Could not send your message. Please try again.",
          variant: "destructive",
        });
        return false;
      } else {
        // Refresh conversations to include the new one
        await fetchConversations();
        return true;
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error sending message",
        description: "Could not send your message. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setSending(false);
    }
  };

  const clearConversations = async () => {
    try {
      const { error } = await supabase
        .from('chat_conversations')
        .delete()
        .eq('project_id', projectId);

      if (error) {
        console.error('Error clearing conversations:', error);
        toast({
          title: "Error clearing conversations",
          description: "Could not delete conversations. Please try again.",
          variant: "destructive",
        });
      } else {
        setConversations([]);
        toast({
          title: "Conversations cleared",
          description: "All conversations have been deleted.",
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error clearing conversations",
        description: "Could not delete conversations. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchConversations();
    }
  }, [projectId]);

  return {
    conversations,
    loading,
    sending,
    sendMessage,
    clearConversations,
    refetch: fetchConversations,
  };
};
