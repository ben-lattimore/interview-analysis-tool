
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface QuoteCleanupToggleProps {
  originalText: string;
  participant: string;
  context?: string;
}

const QuoteCleanupToggle = ({ originalText, participant, context }: QuoteCleanupToggleProps) => {
  const [cleanedText, setCleanedText] = useState<string | null>(null);
  const [showCleaned, setShowCleaned] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const cleanupQuote = async () => {
    if (cleanedText) {
      setShowCleaned(!showCleaned);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('cleanup-quote', {
        body: { text: originalText }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setCleanedText(data.cleanedText);
      setShowCleaned(true);
      
      toast({
        title: "Quote cleaned up",
        description: "The quote has been made more readable.",
      });

    } catch (error: any) {
      console.error('Error cleaning quote:', error);
      toast({
        title: "Cleanup failed",
        description: error.message,
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
    <div className="border-l-4 border-blue-200 pl-4">
      <div className="flex items-start justify-between mb-2">
        <blockquote className="italic text-slate-700 text-sm mb-2 flex-1">
          "{showCleaned && cleanedText ? cleanedText : originalText}"
        </blockquote>
        <div className="flex items-center space-x-1 ml-2">
          {cleanedText && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleVersion}
              className="text-slate-500 hover:text-slate-700 p-1 h-auto"
              title={showCleaned ? "Show original" : "Show cleaned"}
            >
              <RotateCcw className="w-3 h-3" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={cleanupQuote}
            disabled={loading}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-1 h-auto"
            title="Clean up quote"
          >
            {loading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Sparkles className="w-3 h-3" />
            )}
          </Button>
        </div>
      </div>
      <p className="text-xs text-slate-500 font-medium">
        — {participant}
      </p>
      {context && (
        <p className="text-xs text-slate-400 mt-1">
          {context}
        </p>
      )}
      {showCleaned && cleanedText && (
        <p className="text-xs text-blue-600 mt-1 font-medium">
          ✨ AI-cleaned version
        </p>
      )}
    </div>
  );
};

export default QuoteCleanupToggle;
