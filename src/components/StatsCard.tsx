import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface StatsCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  trend: string;
}

export const StatsCard = ({ label, value, icon: Icon, trend }: StatsCardProps) => {
  const isPositiveTrend = trend.startsWith('+');
  const TrendIcon = isPositiveTrend ? TrendingUp : TrendingDown;

  return (
    <Card className="hover:shadow-md transition-all duration-300 gradient-card border-0">
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              {label}
            </p>
            <p className="text-2xl font-bold text-foreground">
              {value}
            </p>
          </div>
          <div className="p-2 rounded-full gradient-primary">
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
        <div className="flex items-center space-x-1 mt-2">
          <Badge 
            variant="secondary" 
            className={`${isPositiveTrend ? 'text-success bg-success/10 border-success/20' : 'text-destructive bg-destructive/10 border-destructive/20'}`}
          >
            <TrendIcon className="h-3 w-3 mr-1" />
            {trend}
          </Badge>
          <span className="text-xs text-muted-foreground">vs last month</span>
        </div>
      </CardContent>
    </Card>
  );
};