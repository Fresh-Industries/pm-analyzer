// Agent Status Badge Component

'use client';

import { Badge } from '@/components/ui/badge';
import { 
  BrainCircuit, 
  FileText, 
  Code2, 
  Megaphone, 
  Search,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';

interface AgentStatusBadgeProps {
  agent: 'orchestrator' | 'research' | 'spec' | 'build' | 'marketing' | 'feedback';
  status: 'idle' | 'running' | 'waiting' | 'completed' | 'failed' | 'paused';
  size?: 'sm' | 'md' | 'lg';
}

const agentConfig = {
  orchestrator: {
    label: 'Orchestrator',
    icon: BrainCircuit,
    color: 'purple',
  },
  research: {
    label: 'Research',
    icon: Search,
    color: 'blue',
  },
  spec: {
    label: 'Spec',
    icon: FileText,
    color: 'green',
  },
  build: {
    label: 'Build',
    icon: Code2,
    color: 'orange',
  },
  marketing: {
    label: 'Marketing',
    icon: Megaphone,
    color: 'pink',
  },
  feedback: {
    label: 'Feedback',
    icon: AlertCircle,
    color: 'cyan',
  },
};

const statusConfig = {
  idle: { icon: null, color: 'gray', pulse: false },
  running: { icon: Loader2, color: 'green', pulse: true },
  waiting: { icon: null, color: 'yellow', pulse: false },
  completed: { icon: CheckCircle, color: 'green', pulse: false },
  failed: { icon: AlertCircle, color: 'red', pulse: false },
  paused: { icon: null, color: 'yellow', pulse: true },
};

export function AgentStatusBadge({ agent, status, size = 'md' }: AgentStatusBadgeProps) {
  const agentInfo = agentConfig[agent];
  const statusInfo = statusConfig[status];
  const Icon = agentInfo.icon;
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2',
  };
  
  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };
  
  const colorVariants: Record<string, string> = {
    gray: 'bg-gray-100 text-gray-800 border-gray-200',
    blue: 'bg-blue-100 text-blue-800 border-blue-200',
    green: 'bg-green-100 text-green-800 border-green-200',
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    red: 'bg-red-100 text-red-800 border-red-200',
    purple: 'bg-purple-100 text-purple-800 border-purple-200',
    orange: 'bg-orange-100 text-orange-800 border-orange-200',
    pink: 'bg-pink-100 text-pink-800 border-pink-200',
    cyan: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  };

  return (
    <Badge
      variant="outline"
      className={`
        ${sizeClasses[size]}
        ${colorVariants[agentInfo.color]}
        ${status === 'running' ? 'animate-pulse' : ''}
        flex items-center gap-1.5 font-medium
      `}
    >
      <Icon className={iconSizes[size]} />
      <span>{agentInfo.label}</span>
      
      {status === 'running' && (
        <Loader2 className={`${iconSizes[size]} animate-spin ml-1`} />
      )}
      
      <span className="opacity-75">•</span>
      
      <span className={status === 'failed' ? 'text-red-600' : ''}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    </Badge>
  );
}

// Agent Status Card (larger version)
interface AgentStatusCardProps {
  agent: 'orchestrator' | 'research' | 'spec' | 'build' | 'marketing' | 'feedback';
  status: 'idle' | 'running' | 'waiting' | 'completed' | 'failed' | 'paused';
  message?: string;
  progress?: number;
  onPause?: () => void;
  onResume?: () => void;
  onStop?: () => void;
}

export function AgentStatusCard({ 
  agent, 
  status, 
  message,
  progress,
  onPause,
  onResume,
  onStop 
}: AgentStatusCardProps) {
  const agentInfo = agentConfig[agent];
  const Icon = agentInfo.icon;
  
  return (
    <div className="border rounded-lg p-4 bg-card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-${agentInfo.color}-100`}>
            <Icon className={`w-5 h-5 text-${agentInfo.color}-600`} />
          </div>
          <div>
            <h4 className="font-medium">{agentInfo.label} Agent</h4>
            <p className="text-sm text-muted-foreground capitalize">{status}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {status === 'running' && onPause && (
            <button
              onClick={onPause}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Pause"
            >
              <span className="text-lg">⏸</span>
            </button>
          )}
          
          {status === 'paused' && onResume && (
            <button
              onClick={onResume}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Resume"
            >
              <span className="text-lg">▶️</span>
            </button>
          )}
          
          {(status === 'running' || status === 'paused') && onStop && (
            <button
              onClick={onStop}
              className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
              title="Stop"
            >
              <span className="text-lg">⏹</span>
            </button>
          )}
        </div>
      </div>
      
      {message && (
        <p className="text-sm text-muted-foreground mb-3">{message}</p>
      )}
      
      {progress !== undefined && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                status === 'failed' 
                  ? 'bg-red-500' 
                  : status === 'completed'
                    ? 'bg-green-500'
                    : 'bg-blue-500'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
