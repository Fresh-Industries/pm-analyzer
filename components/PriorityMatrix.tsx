
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface PriorityItem {
  id: string;
  title: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
}

interface PriorityMatrixProps {
  items: PriorityItem[];
}

const quadrantConfig = {
  // High Impact
  q1: { 
    title: "Quick Wins", 
    color: "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300",
    description: "High ROI: Must-do projects with minimal engineering effort."
  },
  q2: { 
    title: "Major Projects", 
    color: "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300",
    description: "Strategic Bets: High ROI, but require significant time investment."
  },
  // Low Impact
  q3: { 
    title: "Fillers", 
    color: "bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300",
    description: "Low Priority: Nice-to-haves that can be tackled during downtime."
  },
  q4: { 
    title: "Thankless Tasks", 
    color: "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300",
    description: "Avoid: Low ROI, high resource drain. Revisit later."
  },
};

// Helper to determine quadrant based on impact and effort
function getQuadrantKey(item: PriorityItem): 'q1' | 'q2' | 'q3' | 'q4' {
  const highImpact = item.impact === 'high';
  const lowEffort = item.effort === 'low';
  
  if (highImpact && lowEffort) return 'q1'; // Quick Wins
  if (highImpact && item.effort === 'high') return 'q2'; // Major Projects
  if (!highImpact && lowEffort) return 'q3'; // Fillers
  return 'q4'; // Thankless Tasks (low impact + high effort)
}

// Score item for sorting within quadrant (higher = more important)
function getPriorityScore(item: PriorityItem): number {
  const impactScore = item.impact === 'high' ? 3 : item.impact === 'medium' ? 2 : 1;
  const effortScore = item.effort === 'low' ? 3 : item.effort === 'medium' ? 2 : 1;
  return impactScore + effortScore;
}

export function PriorityMatrix({ items }: PriorityMatrixProps) {
  // Group items by quadrants
  const quadrants = {
    q1: [] as PriorityItem[],
    q2: [] as PriorityItem[],
    q3: [] as PriorityItem[],
    q4: [] as PriorityItem[],
  };

  // Categorize all items into quadrants
  items.forEach((item) => {
    const key = getQuadrantKey(item);
    quadrants[key].push(item);
  });

  // Sort items within each quadrant by priority score (highest first)
  Object.keys(quadrants).forEach((key) => {
    quadrants[key as keyof typeof quadrants].sort((a, b) => 
      getPriorityScore(b) - getPriorityScore(a)
    );
  });

  const renderQuadrant = (key: keyof typeof quadrants) => {
    const config = quadrantConfig[key];
    const data = quadrants[key];
    
    return (
      <div className={cn(
        "border rounded-xl p-4 flex flex-col h-full shadow-sm",
        config.color
      )}>
        <h4 className="font-bold mb-1 text-sm uppercase tracking-wider">{config.title}</h4>
        <p className="text-xs mb-3 opacity-80">{config.description}</p>
        <div className="space-y-2 flex-grow overflow-y-auto max-h-[200px] pr-2">
          {data.length === 0 ? (
            <p className="text-xs italic text-current/70">No items in this quadrant.</p>
          ) : (
            data.map(item => (
              <div 
                key={item.id} 
                className="bg-white dark:bg-zinc-800 border border-current/20 p-2 rounded-lg shadow-sm text-sm font-medium hover:ring-2 ring-current/50 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate">{item.title}</span>
                  <div className="flex gap-1 flex-shrink-0">
                    <Badge variant="outline" className="text-xs px-1 py-0 h-5">
                      {item.impact[0].toUpperCase()}
                    </Badge>
                    <Badge variant="outline" className="text-xs px-1 py-0 h-5">
                      {item.effort[0].toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        {data.length > 0 && (
          <div className="text-xs text-center mt-2 pt-2 border-t border-current/10">
            {data.length} item{data.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    );
  };

  // Calculate matrix balance
  const totalItems = items.length;
  const actionableCount = quadrants.q1.length + quadrants.q2.length;
  const actionablePercent = totalItems > 0 ? Math.round((actionableCount / totalItems) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Balance indicator */}
      {totalItems > 0 && (
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            <strong>{actionablePercent}%</strong> of opportunities are actionable (Quick Wins + Major Projects)
          </span>
          <Badge variant={actionablePercent >= 50 ? 'default' : 'secondary'}>
            {totalItems} total items
          </Badge>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 h-[450px]">
        {/* Row 1: High Impact */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-700 dark:text-green-400">HIGH IMPACT</span>
          </div>
          {renderQuadrant("q1")}
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-400">HIGH IMPACT</span>
          </div>
          {renderQuadrant("q2")}
        </div>
        
        {/* Row 2: Low Impact */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-700 dark:text-yellow-400">LOW IMPACT</span>
          </div>
          {renderQuadrant("q3")}
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-red-600" />
            <span className="text-sm font-medium text-red-700 dark:text-red-400">LOW IMPACT</span>
          </div>
          {renderQuadrant("q4")}
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-green-500"></span>
          Quick Wins (Do First)
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-blue-500"></span>
          Major Projects (Plan & Execute)
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
          Fillers (Nice to Have)
        </div>
        <div className="flex items-center gap-2">
          <span class="w-3 h-3 rounded-full bg-red-500"></span>
          Thankless Tasks (Avoid)
        </div>
      </div>
    </div>
  );
}