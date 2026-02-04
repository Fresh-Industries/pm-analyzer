
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export function PriorityMatrix({ items }: PriorityMatrixProps) {
  // Group items by quadrants
  const quadrants = {
    q1: items.filter(i => i.impact === 'high' && i.effort === 'low'), // Quick Wins
    q2: items.filter(i => i.impact === 'high' && i.effort === 'high'), // Major Projects
    q3: items.filter(i => i.impact === 'low' && i.effort === 'low'), // Fillers
    q4: items.filter(i => i.impact === 'low' && i.effort === 'high'), // Thankless Tasks
  };

  const renderQuadrant = (title: string, data: PriorityItem[], colorClass: string) => (
    <div className={`border rounded-lg p-4 flex flex-col h-full ${colorClass}`}>
      <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider opacity-70">{title}</h4>
      <div className="space-y-2 flex-grow overflow-y-auto max-h-[200px]">
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">No items</p>
        ) : (
          data.map(item => (
            <div key={item.id} className="bg-background/80 backdrop-blur-sm p-2 rounded shadow-sm text-sm border">
              {item.title}
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Priority Matrix</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 h-[500px]">
          {/* High Impact */}
          {renderQuadrant("Quick Wins (High Impact, Low Effort)", quadrants.q1, "bg-green-50/50 dark:bg-green-900/10")}
          {renderQuadrant("Major Projects (High Impact, High Effort)", quadrants.q2, "bg-blue-50/50 dark:bg-blue-900/10")}
          
          {/* Low Impact */}
          {renderQuadrant("Fillers (Low Impact, Low Effort)", quadrants.q3, "bg-yellow-50/50 dark:bg-yellow-900/10")}
          {renderQuadrant("Thankless Tasks (Low Impact, High Effort)", quadrants.q4, "bg-red-50/50 dark:bg-red-900/10")}
        </div>
      </CardContent>
    </Card>
  );
}
