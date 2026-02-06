// Project Agent Hub - Unified Agent Dashboard

'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  BrainCircuit, 
  Search, 
  FileText, 
  Code2, 
  Megaphone,
  MessageSquare,
  ChevronRight,
  Play,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AgentStatusBadge } from '@/components/agents/AgentStatusBadge';

const agents = [
  {
    id: 'research',
    name: 'Research Agent',
    description: 'Analyze markets, competitors, and opportunities',
    icon: Search,
    color: 'blue',
    href: 'research',
    status: 'idle',
  },
  {
    id: 'spec',
    name: 'Spec Agent',
    description: 'Create product specs and architecture',
    icon: FileText,
    color: 'green',
    href: 'spec',
    status: 'idle',
  },
  {
    id: 'build',
    name: 'Build Agent',
    description: 'Build products with OpenHands',
    icon: Code2,
    color: 'orange',
    href: 'build',
    status: 'idle',
  },
  {
    id: 'marketing',
    name: 'Marketing Agent',
    description: 'Create landing pages and campaigns',
    icon: Megaphone,
    color: 'pink',
    href: 'marketing',
    status: 'idle',
  },
  {
    id: 'feedback',
    name: 'Feedback Agent',
    description: 'Analyze user feedback and suggest improvements',
    icon: MessageSquare,
    color: 'cyan',
    href: 'feedback',
    status: 'idle',
  },
];

export default function ProjectAgentsPage() {
  const params = useParams();
  const projectId = params.id as string;
  
  const [activeTab, setActiveTab] = useState('overview');
  
  // Mock project data - replace with actual data fetching
  const project = {
    name: 'My Project',
    status: 'active',
    agents: {
      research: { status: 'idle', progress: 0 },
      spec: { status: 'idle', progress: 0 },
      build: { status: 'idle', progress: 0 },
      marketing: { status: 'idle', progress: 0 },
      feedback: { status: 'idle', progress: 0 },
    },
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BrainCircuit className="w-8 h-8 text-purple-600" />
            Agent Hub
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your AI agents and workflows
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button asChild variant="outline">
            <Link href={`/projects/${projectId}/agents/dashboard`}>
              <ChevronRight className="w-4 h-4 mr-2" />
              Full Dashboard
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Quick Start */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Sparkles className="w-8 h-8 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">Ready to build something?</h3>
              <p className="text-muted-foreground">
                Start with Research to analyze your market, then let agents build and market your product.
              </p>
            </div>
            <Button asChild className="bg-purple-600 hover:bg-purple-700">
              <Link href={`/projects/${projectId}/agents/research`}>
                Start Research
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Agent Grid */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {agents.map((agent) => (
            <TabsTrigger key={agent.id} value={agent.id}>
              {agent.name.split(' ')[0]}
            </TabsTrigger>
          ))}
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent) => {
              const Icon = agent.icon;
              const status = project.agents[agent.id as keyof typeof project.agents];
              
              return (
                <Card key={agent.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className={`p-2 bg-${agent.color}-100 rounded-lg`}>
                        <Icon className={`w-5 h-5 text-${agent.color}-600`} />
                      </div>
                      <Badge variant={status.status === 'idle' ? 'secondary' : 'default'}>
                        {status.status}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg mt-3">{agent.name}</CardTitle>
                    <CardDescription>{agent.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {status.status !== 'idle' && (
                      <div className="mb-4">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>Progress</span>
                          <span>{status.progress}%</span>
                        </div>
                        <Progress value={status.progress} />
                      </div>
                    )}
                    
                    <Button asChild className="w-full" variant={status.status === 'idle' ? 'default' : 'outline'}>
                      <Link href={`/projects/${projectId}/agents/${agent.href}`}>
                        {status.status === 'idle' ? (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Start
                          </>
                        ) : (
                          <>
                            View
                            <ChevronRight className="w-4 h-4 ml-2" />
                          </>
                        )}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
        
        {/* Individual Agent Tabs */}
        {agents.map((agent) => (
          <TabsContent key={agent.id} value={agent.id} className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`p-2 bg-${agent.color}-100 rounded-lg`}>
                    <agent.icon className={`w-6 h-6 text-${agent.color}-600`} />
                  </div>
                  <div>
                    <CardTitle>{agent.name}</CardTitle>
                    <CardDescription>{agent.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center py-12">
                  <Button asChild size="lg" className="bg-purple-600 hover:bg-purple-700">
                    <Link href={`/projects/${projectId}/agents/${agent.href}`}>
                      Open {agent.name}
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
