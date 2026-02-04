
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Theme {
  id: string;
  name: string;
  count: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  keywords: string[];
}

interface ThemeClusterProps {
  themes: Theme[];
}

export function ThemeCluster({ themes }: ThemeClusterProps) {
  const getMaxCount = () => Math.max(...themes.map(t => t.count), 1);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Theme Clusters</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4">
          {themes.map((theme) => {
            const size = 1 + (theme.count / getMaxCount()); // Scale 1 to 2
            
            return (
              <div 
                key={theme.id} 
                className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-lg">{theme.name}</h4>
                  <Badge variant={
                    theme.sentiment === 'positive' ? 'default' : 
                    theme.sentiment === 'negative' ? 'destructive' : 'secondary'
                  }>
                    {theme.count}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-1">
                  {theme.keywords.map(k => (
                    <span key={k} className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
