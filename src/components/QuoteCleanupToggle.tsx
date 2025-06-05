
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface QuoteCleanupToggleProps {
  originalQuote: string;
  participant: string;
  context?: string;
}

const QuoteCleanupToggle = ({ originalQuote, participant, context }: QuoteCleanupToggleProps) => {
  const [cleanedQuote, setCleanedQuote] = useState<string | null>(null);
  const [showCleaned, setShowCleaned] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const cleanupQuote = async () => {
    if (cleanedQuote) {
      setShowCleaned(!showCleaned);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('cleanup-quote', {
        body: {
          quote: originalQuote,
          participant,
          context
        }
      });

      if (error) throw error;

      setCleanedQuote(data.cleanedQuote);
      setShowCleaned(true);
      
      toast({
        title: "Quote cleaned up",
        description: "The quote has been made more readable while preserving its meaning.",
      });
    } catch (error: any) {
      console.error('Quote cleanup error:', error);
      toast({
        title: "Cleanup failed",
        description: "Could not clean up the quote. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleVersion = () => {
    setShowCleaned(!showCleaned);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Button
          onClick={cleanupQuote}
          variant="outline"
          size="sm"
          disabled={loading}
          className="flex items-center space-x-2"
        >
          {loading ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Sparkles className="w-3 h-3" />
          )}
          <span>{cleanedQuote ? (showCleaned ? 'Show Original' : 'Show Cleaned') : 'Clean Up Quote'}</span>
        </Button>
        
        {cleanedQuote && (
          <Button
            onClick={toggleVersion}
            variant="ghost"
            size="sm"
            className="flex items-center space-x-1 text-xs"
          >
            <RotateCcw className="w-3 h-3" />
            <span>{showCleaned ? 'Original' : 'Cleaned'}</span>
          </Button>
        )}
      </div>

      <div className="border-l-4 border-blue-200 pl-4">
        <blockquote className="italic text-slate-700 text-sm mb-2">
          "{showCleaned && cleanedQuote ? cleanedQuote : originalQuote}"
        </blockquote>
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500 font-medium">
            — {participant}
          </p>
          {cleanedQuote && (
            <span className="text-xs text-slate-400">
              {showCleaned ? 'AI Cleaned' : 'Original'}
            </span>
          )}
        </div>
        {context && (
          <p className="text-xs text-slate-400 mt-1">
            {context}
          </p>
        )}
      </div>
    </div>
  );
};

export default QuoteCleanupToggle;
