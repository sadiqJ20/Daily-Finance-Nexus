
import { useState } from 'react';
import { Plus, Users, TrendingUp, Download, Search, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface QuickActionsProps {
  onAddLoan: () => void;
  onExportReport: (type: 'csv' | 'pdf') => void;
  onQuickSearch: (query: string) => void;
}

const QuickActions = ({ onAddLoan, onExportReport, onQuickSearch }: QuickActionsProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onQuickSearch(query);
  };

  const quickActions = [
    {
      title: 'New Loan',
      description: 'Create a new loan quickly',
      icon: Plus,
      action: onAddLoan,
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: 'Export CSV',
      description: 'Download collection report',
      icon: Download,
      action: () => onExportReport('csv'),
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'View Analytics',
      description: 'Check performance metrics',
      icon: TrendingUp,
      action: () => console.log('Analytics'),
      color: 'bg-purple-500 hover:bg-purple-600'
    }
  ];

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          <span>Quick Actions</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Quick search shopkeepers..."
            value={searchQuery}
            onChange={handleSearch}
            className="pl-10"
          />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              onClick={action.action}
              className={`${action.color} text-white h-20 flex flex-col items-center justify-center space-y-2 hover:transform hover:scale-105 transition-all duration-200`}
            >
              <action.icon className="h-6 w-6" />
              <div className="text-center">
                <div className="font-semibold text-sm">{action.title}</div>
                <div className="text-xs opacity-90">{action.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
