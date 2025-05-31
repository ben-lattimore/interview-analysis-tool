import { useState, useRef, useEffect } from "react";
import { Send, MessageCircle, User, Bot, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChatConversations } from "@/hooks/useChatConversations";

interface TranscriptChatInterfaceProps {
  projectId: string;
}

const TranscriptChatInterface = ({ projectId }: TranscriptChatInterfaceProps) => {
  const [currentMessage, setCurrentMessage] = useState("");
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [isNewConversation, setIsNewConversation] = useState(true);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const { conversations, loading, sending, sendMessage, clearConversations } = useChatConversations(projectId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Create conversation sessions based on session_id
  const conversationSessions = conversations.reduce((sessions, conv) => {
    const sessionId = conv.session_id || conv.id;
    
    if (!sessions[sessionId]) {
      sessions[sessionId] = [];
    }
    sessions[sessionId].push(conv);
    return sessions;
  }, {} as Record<string, typeof conversations>);

  // Convert to array and sort by latest message
  const sortedSessions = Object.entries(conversationSessions)
    .map(([sessionId, messages]) => ({
      sessionId,
      messages: messages.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
      latestTime: Math.max(...messages.map(m => new Date(m.created_at).getTime()))
    }))
    .sort((a, b) => b.latestTime - a.latestTime);

  // Get selected conversation messages
  const selectedConversation = isNewConversation 
    ? [] 
    : (selectedConversationId 
        ? conversationSessions[selectedConversationId] || []
        : []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedConversation]);

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || sending) return;
    
    const success = await sendMessage(currentMessage.trim());
    if (success) {
      setCurrentMessage("");
      
      // If we were in a new conversation, find the newest conversation and select it
      if (isNewConversation) {
        setIsNewConversation(false);
        // Wait a moment for the conversations to update, then select the newest one
        setTimeout(() => {
          if (conversations.length > 0) {
            const newestConversation = conversations.reduce((newest, conv) => 
              new Date(conv.created_at) > new Date(newest.created_at) ? conv : newest
            );
            const sessionId = newestConversation.session_id || newestConversation.id;
            setSelectedConversationId(sessionId);
          }
        }, 100);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const startNewConversation = () => {
    setSelectedConversationId(null);
    setIsNewConversation(true);
    setCurrentSessionId(null);
  };

  const selectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    setIsNewConversation(false);
    setCurrentSessionId(null);
  };

  const handleClearAllChats = async () => {
    if (window.confirm("Are you sure you want to delete all conversations? This action cannot be undone.")) {
      await clearConversations();
      setSelectedConversationId(null);
      setIsNewConversation(true);
      setCurrentSessionId(null);
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
    <div className="flex h-[600px] gap-4">
      {/* Conversation List Sidebar */}
      <Card className="w-80 bg-white border-slate-200 flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-slate-900">Conversations</CardTitle>
            <div className="flex space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={startNewConversation}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                <Plus className="w-4 h-4" />
              </Button>
              {sortedSessions.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAllChats}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 p-0">
          <ScrollArea className="h-full">
            <div className="p-3 space-y-2">
              {/* New Chat Option */}
              <button
                onClick={startNewConversation}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  isNewConversation 
                    ? 'bg-blue-100 border border-blue-200' 
                    : 'hover:bg-slate-50 border border-transparent'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Plus className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-slate-900">New Conversation</span>
                </div>
              </button>

              {/* Existing Conversations */}
              {sortedSessions.map((session, index) => {
                const firstMessage = session.messages[0];
                const isSelected = !isNewConversation && selectedConversationId === session.sessionId;
                
                return (
                  <button
                    key={session.sessionId}
                    onClick={() => selectConversation(session.sessionId)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      isSelected 
                        ? 'bg-blue-100 border border-blue-200' 
                        : 'hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {firstMessage.user_message.length > 40 
                          ? firstMessage.user_message.substring(0, 40) + "..." 
                          : firstMessage.user_message}
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-slate-500">
                          {session.messages.length} message{session.messages.length > 1 ? 's' : ''}
                        </p>
                        <p className="text-xs text-slate-400">
                          {new Date(firstMessage.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}

              {sortedSessions.length === 0 && (
                <div className="text-center py-8 text-slate-400">
                  <MessageCircle className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">No conversations yet</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Main Chat Area */}
      <Card className="flex-1 bg-white border-slate-200 flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center text-lg font-semibold text-slate-900">
            <MessageCircle className="w-5 h-5 mr-2 text-slate-600" />
            {isNewConversation ? "New Conversation" : "Conversation"}
          </CardTitle>
          <CardDescription>
            Ask questions about the transcript content and get insights with supporting quotes
          </CardDescription>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0">
          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {selectedConversation.length === 0 && !sending ? (
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
                selectedConversation
                  .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                  .map((conversation) => (
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
          </ScrollArea>

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
    </div>
  );
};

export default TranscriptChatInterface;
