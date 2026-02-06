// Agent Conversation Feed - Shows A2A messages between agents

'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MessageCircle,
  ArrowRight,
  ArrowLeft,
  Search,
  FileText,
  Code2,
  Megaphone,
  BrainCircuit,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface AgentMessage {
  id: string;
  from: string;
  to: string;
  action: string;
  content: string;
  timestamp: Date;
  status?: 'sent' | 'delivered' | 'read';
}

interface AgentConversationFeedProps {
  messages: AgentMessage[];
  maxMessages?: number;
}

const agentIcons: Record<string, any> = {
  orchestrator: BrainCircuit,
  research: Search,
  spec: FileText,
  build: Code2,
  marketing: Megaphone,
};

const agentLabels: Record<string, string> = {
  orchestrator: 'Orchestrator',
  research: 'Research',
  spec: 'Spec',
  build: 'Build',
  marketing: 'Marketing',
};

const actionColors: Record<string, string> = {
  request: 'bg-blue-100 text-blue-800',
  complete: 'bg-green-100 text-green-800',
  error: 'bg-red-100 text-red-800',
  status: 'bg-yellow-100 text-yellow-800',
};

export function AgentConversationFeed({ 
  messages, 
  maxMessages = 50 
}: AgentConversationFeedProps) {
  const [expanded, setExpanded] = useState(false);
  const [filter, setFilter] = useState<string | null>(null);
  
  // Sort messages by timestamp (newest first)
  const sortedMessages = [...messages]
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, expanded ? messages.length : maxMessages);
  
  // Filter messages
  const filteredMessages = filter 
    ? sortedMessages.filter(m => 
        m.from === filter || m.to === filter || m.action.includes(filter)
      )
    : sortedMessages;
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };
  
  const formatAction = (action: string) => {
    return action
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  return (
    <div className="border rounded-lg bg-card overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b bg-muted/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            <h3 className="font-semibold">Agent Conversation Feed</h3>
            <Badge variant="secondary">{messages.length} messages</Badge>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Filter buttons */}
            <div className="flex gap-1">
              <Button
                size="sm"
                variant={filter === null ? 'default' : 'ghost'}
                onClick={() => setFilter(null)}
              >
                All
              </Button>
              <Button
                size="sm"
                variant={filter === 'research' ? 'default' : 'ghost'}
                onClick={() => setFilter(filter === 'research' ? null : 'research')}
              >
                Research
              </Button>
              <Button
                size="sm"
                variant={filter === 'build' ? 'default' : 'ghost'}
                onClick={() => setFilter(filter === 'build' ? null : 'build')}
              >
                Build
              </Button>
              <Button
                size="sm"
                variant={filter === 'marketing' ? 'default' : 'ghost'}
                onClick={() => setFilter(filter === 'marketing' ? null : 'marketing')}
              >
                Marketing
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Messages */}
      <div className="divide-y max-h-96 overflow-y-auto">
        {filteredMessages.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No messages yet</p>
            <p className="text-sm">Agents will appear here when they communicate</p>
          </div>
        ) : (
          filteredMessages.map((message) => {
            const FromIcon = agentIcons[message.from] || BrainCircuit;
            const ToIcon = agentIcons[message.to] || BrainCircuit;
            
            return (
              <div key={message.id} className="p-4 hover:bg-muted/50 transition-colors">
                {/* Timestamp */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-muted-foreground font-mono">
                    {formatTime(message.timestamp)}
                  </span>
                  
                  <Badge className={`text-xs ${actionColors[message.status || 'status']}`}>
                    {formatAction(message.action)}
                  </Badge>
                </div>
                
                {/* Message content */}
                <div className="flex items-center gap-3 text-sm">
                  {/* From agent */}
                  <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg">
                    <FromIcon className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-blue-900">
                      {agentLabels[message.from] || message.from}
                    </span>
                  </div>
                  
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  
                  {/* To agent */}
                  <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-lg">
                    <ToIcon className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-green-900">
                      {agentLabels[message.to] || message.to}
                    </span>
                  </div>
                </div>
                
                {/* Content preview */}
                <p className="mt-2 text-muted-foreground text-sm line-clamp-2">
                  {message.content}
                </p>
              </div>
            );
          })
        )}
      </div>
      
      {/* Expand/Collapse */}
      {messages.length > maxMessages && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full p-3 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:bg-muted/50 transition-colors border-t"
        >
          {expanded ? (
            <>
              <ChevronUp className="w-4 h-4" />
              Show fewer messages
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              Show {messages.length - maxMessages} more messages
            </>
          )}
        </button>
      )}
    </div>
  );
}

// Agent Timeline (simpler vertical view)
interface AgentTimelineProps {
  events: Array<{
    agent: string;
    action: string;
    message: string;
    timestamp: Date;
    status?: 'success' | 'error' | 'pending';
  }>;
}

export function AgentTimeline({ events }: AgentTimelineProps) {
  return (
    <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-0 before:bottom-0 before:w-0.5 before:bg-border">
      {events.map((event, index) => {
        const AgentIcon = agentIcons[event.agent] || BrainCircuit;
        const statusColors = {
          success: 'bg-green-500',
          error: 'bg-red-500',
          pending: 'bg-yellow-500',
        };
        
        return (
          <div key={index} className="relative">
            {/* Timeline dot */}
            <div 
              className={`absolute -left-5 top-1 w-3 h-3 rounded-full border-2 border-background ${statusColors[event.status || 'pending']}`} 
            />
            
            <div className="flex items-center gap-2 mb-1">
              <AgentIcon className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium capitalize">{event.agent}</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-sm text-muted-foreground">
                {event.timestamp.toLocaleTimeString()}
              </span>
            </div>
            
            <p className="text-sm">
              <span className="font-medium capitalize">{event.action}</span>
              {' '}
              {event.message}
            </p>
          </div>
        );
      })}
    </div>
  );
}
