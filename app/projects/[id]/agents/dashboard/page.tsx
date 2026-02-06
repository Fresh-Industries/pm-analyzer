// Agent Dashboard - Main orchestrator view

'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  Settings,
  BrainCircuit,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { AgentStatusBadge, AgentStatusCard } from './AgentStatusBadge';
import { AgentConversationFeed, AgentTimeline } from './AgentConversationFeed';
import { CheckpointList } from './CheckpointApproval';

// Mock data for demonstration
const mockAgents = [
  { id: 'orchestrator', name: 'Orchestrator', status: 'running' as const, message: 'Managing workflow', progress: 45 },
  { id: 'research', name: 'Research', status: 'running' as const, message: 'Analyzing competitors...', progress: 60 },
  { id: 'spec', name: 'Spec', status: 'waiting' as const, message: 'Waiting for research', progress: 0 },
  { id: 'build', name: 'Build', status: 'idle' as const, message: 'Ready to start', progress: 0 },
  { id: 'marketing', name: 'Marketing', status: 'idle' as const, message: 'Ready to start', progress: 0 },
];

const mockMessages = [
  { id: '1', from: 'orchestrator', to: 'research', action: 'request', content: 'Get market insights for dog walker SaaS', timestamp: new Date(Date.now() - 300000) },
  { id: '2', from: 'research', to: 'orchestrator', action: 'complete', content: 'Found 5 competitors, 3 opportunities', timestamp: new Date(Date.now() - 240000) },
  { id: '3', from: 'orchestrator', to: 'marketing', action: 'request', content: 'Create marketing strategy', timestamp: new Date.now() - 180000 },
  { id: '4', from: 'marketing', to: 'orchestrator', action: 'status', content: 'Researching positioning options...', timestamp: new Date.now() - 120000 },
  { id: '5', from: 'orchestrator', to: 'spec', action: 'request', content: 'Create product spec', timestamp: new Date.now() - 60000 },
];

const mockCheckpoints = [
  {
    id: '1',
    agent: 'Marketing',
    checkpointId: 'publish_approval',
    question: 'Marketing wants to publish landing page to dogwalker.com. Approve?',
    context: {
      evidence: ['Landing page generated', 'Hero image created', 'All features listed'],
    },
    createdAt: new Date(Date.now() - 60000),
    approved: null as boolean | null,
    feedback: null,
  },
];

const mockTimeline = [
  { agent: 'orchestrator', action: 'Started', message: 'Workflow "Create Landing Page"', timestamp: new Date(Date.now() - 300000), status: 'success' as const },
  { agent: 'research', action: 'Analyzing', message: 'Found 5 competitors', timestamp: new Date(Date.now() - 240000), status: 'success' as const },
  { agent: 'marketing', action: 'Researching', message: 'Positioning strategy', timestamp: new Date.now() - 180000), status: 'pending' as const },
];

export default function AgentDashboard() {
  const params = useParams();
  const projectId = params.id as string;
  
  const [agents, setAgents] = useState(mockAgents);
  const [workflowStatus, setWorkflowStatus] = useState<'idle' | 'running' | 'paused' | 'completed'>('running');
  const [progress, setProgress] = useState(45);
  const [activeTab, setActiveTab] = useState('overview');
  
  const handleStart = () => {
    setWorkflowStatus('running');
    setAgents(agents.map(a => ({ ...a, status: 'idle' as const })));
  };
  
  const handlePause = () => {
    setWorkflowStatus('paused');
    setAgents(agents.map(a => ({ ...a, status: 'paused' as const })));
  };
  
  const handleResume = () => {
    setWorkflowStatus('running');
    setAgents(agents.map(a => a.status === 'paused' ? { ...a, status: 'running' as const } : a));
  };
  
  const handleStop = () => {
    setWorkflowStatus('idle');
    setAgents(agents.map(a => ({ ...a, status: 'idle' as const, progress: 0 })));
    setProgress(0);
  };
  
  const handleApprove = (id: string) => {
    console.log('Approved checkpoint:', id);
  };
  
  const handleReject = (id: string) => {
    console.log('Rejected checkpoint:', id);
  };
  
  const runningCount = agents.filter(a => a.status === 'running').length;
  const waitingCount = agents.filter(a => a.status === 'waiting').length;
  
  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BrainCircuit className="w-8 h-8 text-purple-600" />
            Agent Orchestrator
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage and monitor your multi-agent workflow
          </p>
        </div>
        
        {/* Controls */}
        <div className="flex items-center gap-3">
          {workflowStatus === 'idle' && (
            <Button onClick={handleStart} className="bg-green-600 hover:bg-green-700">
              <Play className="w-4 h-4 mr-2" />
              Start Workflow
            </Button>
          )}
          
          {workflowStatus === 'running' && (
            <>
              <Button onClick={handlePause} variant="outline">
                <Pause className="w-4 h-4 mr-2" />
                Pause All
              </Button>
              <Button onClick={handleStop} variant="destructive">
                <Square className="w-4 h-4 mr-2" />
                Stop
              </Button>
            </>
          )}
          
          {workflowStatus === 'paused' && (
            <>
              <Button onClick={handleResume} className="bg-green-600 hover:bg-green-700">
                <Play className="w-4 h-4 mr-2" />
                Resume
              </Button>
              <Button onClick={handleStop} variant="destructive">
                <Square className="w-4 h-4 mr-2" />
                Stop
              </Button>
            </>
          )}
          
          {workflowStatus === 'completed' && (
            <Button onClick={handleStart}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Restart
            </Button>
          )}
          
          <Button variant="outline" size="icon">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      {/* Status Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Workflow Status</p>
                <p className="text-2xl font-bold capitalize">{workflowStatus}</p>
              </div>
              {workflowStatus === 'running' ? (
                <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
              ) : workflowStatus === 'paused' ? (
                <Pause className="w-8 h-8 text-yellow-500" />
              ) : workflowStatus === 'completed' ? (
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              ) : (
                <AlertCircle className="w-8 h-8 text-gray-400" />
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overall Progress</p>
                <p className="text-2xl font-bold">{progress}%</p>
              </div>
              <Progress value={progress} className="w-16" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Agents</p>
                <p className="text-2xl font-bold text-green-600">{runningCount}</p>
              </div>
              <Badge variant="secondary">{agents.length} total</Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Actions</p>
                <p className="text-2xl font-bold text-yellow-600">{waitingCount + mockCheckpoints.length}</p>
              </div>
              <Badge variant="outline">Checkpoints</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Dashboard */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="agents">Agents</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="checkpoints">Checkpoints</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Agent Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent) => (
              <AgentStatusCard
                key={agent.id}
                agent={agent.id as any}
                status={agent.status}
                message={agent.message}
                progress={agent.progress}
              />
            ))}
          </div>
          
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <AgentTimeline events={mockTimeline} />
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Agents Tab */}
        <TabsContent value="agents" className="space-y-6 mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            {agents.map((agent) => (
              <AgentStatusCard
                key={agent.id}
                agent={agent.id as any}
                status={agent.status}
                message={agent.message}
                progress={agent.progress}
                onPause={workflowStatus === 'running' ? () => {} : undefined}
                onResume={workflowStatus === 'paused' ? () => {} : undefined}
                onStop={workflowStatus !== 'idle' ? () => {} : undefined}
              />
            ))}
          </div>
        </TabsContent>
        
        {/* Messages Tab */}
        <TabsContent value="messages" className="mt-6">
          <AgentConversationFeed messages={mockMessages} />
        </TabsContent>
        
        {/* Checkpoints Tab */}
        <TabsContent value="checkpoints" className="mt-6">
          <div className="space-y-6">
            {mockCheckpoints.map((checkpoint) => (
              <CheckpointApproval
                key={checkpoint.id}
                checkpoint={checkpoint as any}
                onApprove={() => handleApprove(checkpoint.id)}
                onReject={() => handleReject(checkpoint.id)}
              />
            ))}
          </div>
        </TabsContent>
        
        {/* Timeline Tab */}
        <TabsContent value="timeline" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Timeline</CardTitle>
              <CardDescription>
                Chronological view of all agent activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AgentTimeline events={mockTimeline} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
