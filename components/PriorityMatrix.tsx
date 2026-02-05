
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PriorityItem {
  id: string;
  title: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
}

interface PriorityMatrixProps {
  items: PriorityItem[];
}

const quadrantStyles = {
  // High Impact
  q1: { title: "Quick Wins", color: "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300" }, // High Impact, Low Effort
  q2: { title: "Major Projects", color: "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300" }, // High Impact, High Effort

  // Low Impact
  q3: { title: "Fillers", color: "bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300" }, // Low Impact, Low Effort
  q4: { title: "Thankless Tasks", color: "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300" }, // Low Impact, High Effort
};

export function PriorityMatrix({ items }: PriorityMatrixProps) {
  // Group items by quadrants
  const quadrants = {
    q1: items.filter(i => i.impact === 'high' && i.effort === 'low'), // Quick Wins
    q2: items.filter(i => i.impact === 'high' && i.effort === 'high'), // Major Projects
    q3: items.filter(i => i.impact === 'low' && i.effort === 'low'), // Fillers
    q4: items.filter(i => i.impact === 'low' && i.effort === 'high'), // Thankless Tasks
  };
  
  // Also handle items that fall into the 'Medium' band
  const mediumImpactItems = items.filter(i => i.impact === 'medium' || i.effort === 'medium');


  const renderQuadrant = (key: keyof typeof quadrants, description: string) => {
    const { title, color } = quadrantStyles[key];
    const data = quadrants[key];
    
    return (
      <div className={`border rounded-xl p-4 flex flex-col h-full shadow-inner ${color}`}>
        <h4 className="font-bold mb-1 text-sm uppercase tracking-wider">{title}</h4>
        <p className="text-xs mb-3 opacity-80">{description}</p>
        <div className="space-y-2 flex-grow overflow-y-auto max-h-[160px] pr-2">
          {data.length === 0 ? (
            <p className="text-xs italic text-current/80">No items categorized here.</p>
          ) : (
            data.map(item => (
              <div 
                key={item.id} 
                className="bg-white dark:bg-zinc-800 border border-current/20 p-2 rounded-lg shadow-sm text-sm font-medium hover:ring-2 ring-current/50 transition-all cursor-pointer"
              >
                {item.title}
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 h-[400px]">
        {/* Row 1: High Impact */}
        {renderQuadrant("q1", "High ROI: Must-do projects with minimal engineering effort.")}
        {renderQuadrant("q2", "Strategic Bets: High ROI, but require significant time investment.")}
        
        {/* Row 2: Low Impact */}
        {renderQuadrant("q3", "Low Priority: Nice-to-haves that can be tackled during downtime.")}
        {renderQuadrant("q4", "Avoid: Low ROI, high resource drain. Revisit later.")}
      </div>
      
      {mediumImpactItems.length > 0 && (
        <Card className="p-4">
          <CardTitle className="text-base font-semibold mb-2">Medium Priority / Uncategorized</CardTitle>
          <CardDescription className="text-sm">
            These items fall in the middle of the matrix and require careful consideration.
          </CardDescription>
          <div className="flex flex-wrap gap-2 mt-3">
            {mediumImpactItems.map(item => (
               <Badge 
                 key={item.id} 
                 variant="outline" 
                 className="text-xs bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"
               >
                 {item.title}
               </Badge>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}