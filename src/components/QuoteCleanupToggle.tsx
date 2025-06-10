
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
    <div className="border-l-4 border-primary/30 pl-4">
      <div className="flex items-start justify-between mb-2">
        <blockquote className="italic text-muted-foreground text-sm mb-2 flex-1">
          "{showCleaned && cleanedText ? cleanedText : originalText}"
        </blockquote>
        <div className="flex items-center space-x-1 ml-2">
          {cleanedText && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleVersion}
              className="text-muted-foreground hover:text-foreground p-1 h-auto"
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
            className="text-primary hover:text-primary hover:bg-primary/10 p-1 h-auto"
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
      <p className="text-xs text-muted-foreground font-medium">
        — {participant}
      </p>
      {context && (
        <p className="text-xs text-muted-foreground/80 mt-1">
          {context}
        </p>
      )}
      {showCleaned && cleanedText && (
        <p className="text-xs text-primary mt-1 font-medium">
          ✨ AI-cleaned version
        </p>
      )}
    </div>
  );
};

export default QuoteCleanupToggle;
