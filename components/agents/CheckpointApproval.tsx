// Checkpoint Approval Component - Human-in-the-loop controls

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Edit3,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Clock
} from 'lucide-react';

interface Checkpoint {
  id: string;
  agent: string;
  checkpointId: string;
  question: string;
  context?: {
    previousDecision?: string;
    evidence?: string[];
    options?: Array<{
      id: string;
      label: string;
      description: string;
    }>;
  };
  createdAt: Date;
}

interface CheckpointApprovalProps {
  checkpoint: Checkpoint;
  onApprove: (feedback?: string) => void;
  onReject: (feedback?: string) => void;
  onModify?: (modifiedDecision: string) => void;
}

export function CheckpointApproval({ 
  checkpoint, 
  onApprove, 
  onReject,
  onModify 
}: CheckpointApprovalProps) {
  const [feedback, setFeedback] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [modifiedDecision, setModifiedDecision] = useState('');
  const [showModify, setShowModify] = useState(false);
  
  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };
  
  return (
    <Card className="border-yellow-200 bg-yellow-50/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Checkpoint Requires Approval</CardTitle>
              <p className="text-sm text-muted-foreground">
                {checkpoint.agent} agent • {formatTime(checkpoint.createdAt)}
              </p>
            </div>
          </div>
          
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
            Pending
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Question */}
        <div className="p-4 bg-white rounded-lg border border-yellow-200">
          <p className="font-medium">{checkpoint.question}</p>
        </div>
        
        {/* Context */}
        {checkpoint.context && (
          <div className="space-y-3">
            {checkpoint.context.previousDecision && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Proposed Decision
                </p>
                <p className="text-sm p-3 bg-gray-50 rounded-lg">
                  {checkpoint.context.previousDecision}
                </p>
              </div>
            )}
            
            {checkpoint.context.evidence && checkpoint.context.evidence.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Evidence
                </p>
                <ul className="space-y-1">
                  {checkpoint.context.evidence.map((evidence, index) => (
                    <li key={index} className="text-sm flex items-start gap-2">
                      <span className="text-yellow-600 mt-0.5">•</span>
                      {evidence}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {checkpoint.context.options && checkpoint.context.options.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Options
                </p>
                <div className="space-y-2">
                  {checkpoint.context.options.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => {
                        setModifiedDecision(option.label);
                        setShowModify(true);
                      }}
                      className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                    >
                      <p className="font-medium">{option.label}</p>
                      {option.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {option.description}
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Actions */}
        <div className="flex flex-wrap gap-3 pt-2">
          <Button
            onClick={() => onApprove(feedback || undefined)}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Approve
          </Button>
          
          <Button
            variant="destructive"
            onClick={() => onReject(feedback || undefined)}
          >
            <XCircle className="w-4 h-4 mr-2" />
            Reject
          </Button>
          
          {onModify && (
            <Button
              variant="outline"
              onClick={() => {
                setShowModify(!showModify);
                setModifiedDecision(checkpoint.context?.previousDecision || '');
              }}
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Modify
            </Button>
          )}
          
          <Button
            variant="ghost"
            onClick={() => setShowFeedback(!showFeedback)}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Add Feedback
          </Button>
        </div>
        
        {/* Modify input */}
        {showModify && (
          <div className="p-4 bg-gray-50 rounded-lg space-y-3">
            <p className="text-sm font-medium">Modified Decision</p>
            <Textarea
              value={modifiedDecision}
              onChange={(e) => setModifiedDecision(e.target.value)}
              placeholder="Enter your modified decision..."
              className="min-h-[80px]"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => onModify?.(modifiedDecision)}
              >
                Submit Modified
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowModify(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
        
        {/* Feedback input */}
        {showFeedback && (
          <div className="p-4 bg-gray-50 rounded-lg space-y-3">
            <p className="text-sm font-medium">Your Feedback (optional)</p>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Add feedback for the agent..."
              className="min-h-[80px]"
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowFeedback(false)}
            >
              Done
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Checkpoint List
interface CheckpointListProps {
  checkpoints: Checkpoint[];
  onApprove: (id: string, feedback?: string) => void;
  onReject: (id: string, feedback?: string) => void;
  onModify?: (id: string, decision: string) => void;
}

export function CheckpointList({ 
  checkpoints, 
  onApprove, 
  onReject,
  onModify 
}: CheckpointListProps) {
  const [expanded, setExpanded] = useState<string | null>(null);
  
  const pendingCheckpoints = checkpoints.filter(c => !c.approved);
  const completedCheckpoints = checkpoints.filter(c => c.approved !== null);
  
  return (
    <div className="space-y-4">
      {/* Pending Checkpoints */}
      {pendingCheckpoints.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{pendingCheckpoints.length} pending</Badge>
            <h4 className="font-semibold">Requires Your Attention</h4>
          </div>
          
          {pendingCheckpoints.map((checkpoint) => (
            <div key={checkpoint.id}>
              <button
                onClick={() => setExpanded(expanded === checkpoint.id ? null : checkpoint.id)}
                className="w-full p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center justify-between text-left hover:bg-yellow-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-yellow-600" />
                  <div>
                    <p className="font-medium">{checkpoint.agent}</p>
                    <p className="text-sm text-muted-foreground truncate max-w-md">
                      {checkpoint.question}
                    </p>
                  </div>
                </div>
                {expanded === checkpoint.id ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
              
              {expanded === checkpoint.id && (
                <div className="mt-2">
                  <CheckpointApproval
                    checkpoint={checkpoint}
                    onApprove={(fb) => onApprove(checkpoint.id, fb)}
                    onReject={(fb) => onReject(checkpoint.id, fb)}
                    onModify={onModify ? (d) => onModify(checkpoint.id, d) : undefined}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Completed Checkpoints */}
      {completedCheckpoints.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-muted-foreground">
            Completed ({completedCheckpoints.length})
          </h4>
          
          {completedCheckpoints.map((checkpoint) => (
            <div 
              key={checkpoint.id}
              className={`p-3 rounded-lg border ${
                checkpoint.approved 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {checkpoint.approved ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span className="font-medium">{checkpoint.agent}</span>
                </div>
                <Badge variant="secondary">
                  {checkpoint.approved ? 'Approved' : 'Rejected'}
                </Badge>
              </div>
              {checkpoint.feedback && (
                <p className="text-sm text-muted-foreground mt-2">
                  "{checkpoint.feedback}"
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
