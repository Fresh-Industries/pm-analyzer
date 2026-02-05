
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

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

const sentimentClasses = {
  positive: "bg-green-50 text-green-700 border-green-100 dark:bg-green-950 dark:text-green-300 dark:border-green-900",
  neutral: "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-900",
  negative: "bg-red-50 text-red-700 border-red-100 dark:bg-red-950 dark:text-red-300 dark:border-red-900",
};

const sentimentIcons = {
  positive: <TrendingUp className="w-4 h-4" />,
  neutral: <Minus className="w-4 h-4" />,
  negative: <TrendingDown className="w-4 h-4" />,
};

export function ThemeCluster({ themes }: ThemeClusterProps) {
  if (themes.length === 0) {
    return (
      <Card className="p-6">
        <CardContent className="pt-0 text-center text-zinc-400">
          No theme data available.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {themes.map((theme) => {
        const classes = sentimentClasses[theme.sentiment] || sentimentClasses.neutral;
        const Icon = sentimentIcons[theme.sentiment] || sentimentIcons.neutral;

        return (
          <div
            key={theme.id}
            className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer ${classes} hover:shadow-lg`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-full bg-white dark:bg-zinc-900 shadow-inner">
                  {Icon}
                </span>
                <h4 className="font-semibold text-lg">{theme.name}</h4>
              </div>
              <Badge className="bg-white/50 dark:bg-zinc-800/50 hover:bg-white/70 dark:hover:bg-zinc-800/70 text-zinc-900 dark:text-zinc-50 font-medium">
                {theme.count} Feedback
              </Badge>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-300 mb-3">
              Most frequent sentiment: <span className="capitalize font-medium">{theme.sentiment}</span>
            </p>
            <div className="flex flex-wrap gap-2 pt-2 border-t border-current/30">
              {theme.keywords.map(k => (
                <Badge
                  key={k}
                  variant="secondary"
                  className="text-xs bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  {k}
                </Badge>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
