
import { useState, useRef, useEffect } from "react";
import { Send, MessageCircle, User, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useChatConversations } from "@/hooks/useChatConversations";

interface TranscriptChatInterfaceProps {
  projectId: string;
}

const TranscriptChatInterface = ({ projectId }: TranscriptChatInterfaceProps) => {
  const [currentMessage, setCurrentMessage] = useState("");
  const { conversations, loading, sending, sendMessage } = useChatConversations(projectId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversations]);

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || sending) return;
    
    const success = await sendMessage(currentMessage.trim());
    if (success) {
      setCurrentMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (loading) {
    return (
      <Card className="bg-white border-slate-200">
        <CardContent className="p-6">
          <div className="text-slate-500 text-center">Loading chat history...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border-slate-200 h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center text-lg font-semibold text-slate-900">
          <MessageCircle className="w-5 h-5 mr-2 text-slate-600" />
          Chat with Transcripts
        </CardTitle>
        <CardDescription>
          Ask questions about the transcript content and get insights with supporting quotes
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {conversations.length === 0 ? (
            <div className="text-center text-slate-500 py-8">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <p className="text-lg font-medium mb-2">Start a conversation</p>
              <p className="text-sm">Ask questions about your transcripts like:</p>
              <div className="mt-3 space-y-1 text-xs">
                <p>"What does Susan Cook say about climate change?"</p>
                <p>"Which participants mentioned governance?"</p>
                <p>"Tell me about disagreements on SRM"</p>
              </div>
            </div>
          ) : (
            conversations.map((conversation) => (
              <div key={conversation.id} className="space-y-3">
                {/* User Message */}
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-slate-900">{conversation.user_message}</p>
                    </div>
                  </div>
                </div>

                {/* AI Response */}
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="bg-green-50 rounded-lg p-3">
                      <p className="text-slate-900 mb-3">{conversation.ai_response}</p>
                      
                      {/* Quotes */}
                      {conversation.response_quotes && conversation.response_quotes.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-slate-700">Supporting quotes:</p>
                          {conversation.response_quotes.map((quote, index) => (
                            <div key={index} className="bg-white border border-slate-200 rounded p-3">
                              <blockquote className="text-sm text-slate-800 italic mb-2">
                                "{quote.text}"
                              </blockquote>
                              <div className="flex items-center justify-between">
                                <Badge variant="secondary" className="text-xs">
                                  {quote.participant}
                                </Badge>
                                {quote.context && (
                                  <span className="text-xs text-slate-500">{quote.context}</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {new Date(conversation.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
          
          {sending && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1">
                <div className="bg-green-50 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <div className="animate-pulse">Thinking...</div>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-slate-200 p-4">
          <div className="flex space-x-2">
            <Textarea
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask a question about your transcripts..."
              className="flex-1 min-h-[40px] max-h-[120px]"
              disabled={sending}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!currentMessage.trim() || sending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TranscriptChatInterface;
