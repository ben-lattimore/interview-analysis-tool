
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FileText, Plus } from "lucide-react";

interface TranscriptTextInputProps {
  onTranscriptAdd: (transcript: { filename: string; content: string }) => void;
}

const TranscriptTextInput = ({ onTranscriptAdd }: TranscriptTextInputProps) => {
  const [transcriptText, setTranscriptText] = useState("");
  const [filename, setFilename] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (transcriptText.trim() && filename.trim()) {
      onTranscriptAdd({
        filename: filename.trim(),
        content: transcriptText.trim()
      });
      setTranscriptText("");
      setFilename("");
    }
  };

  return (
    <Card className="bg-white dark:bg-gray-900 border-border">
      <CardHeader>
        <CardTitle className="flex items-center text-lg font-semibold text-card-foreground">
          <FileText className="w-5 h-5 mr-2 text-secondary" />
          Add Transcript Text
        </CardTitle>
        <CardDescription>
          Paste transcript text directly instead of uploading files
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="filename" className="text-sm font-medium text-foreground">
              Transcript Name
            </Label>
            <Input
              id="filename"
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="e.g., Interview with John Doe"
              className="border-input focus:border-secondary focus:ring-secondary"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="transcript-text" className="text-sm font-medium text-foreground">
              Transcript Content
            </Label>
            <Textarea
              id="transcript-text"
              value={transcriptText}
              onChange={(e) => setTranscriptText(e.target.value)}
              placeholder="Paste your transcript text here..."
              className="border-input focus:border-secondary focus:ring-secondary resize-none"
              rows={10}
              required
            />
          </div>
          
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            disabled={!transcriptText.trim() || !filename.trim()}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Transcript
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default TranscriptTextInput;
