
import { TrendingUp, TrendingDown, DollarSign, Users, Calendar, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface StatsOverviewProps {
  loans: any[];
  payments: any[];
}

const StatsOverview = ({ loans, payments }: StatsOverviewProps) => {
  const calculateStats = () => {
    const totalLent = loans.reduce((sum, loan) => sum + loan.amount, 0);
    const totalCollected = payments
      .filter(p => p.status === 'paid')
      .reduce((sum, payment) => {
        const loan = loans.find(l => l.id === payment.loanId);
        return sum + (loan?.dailyEmi || 0);
      }, 0);

    const activeLoanCount = loans.filter(l => l.status === 'active').length;
    const completedLoanCount = loans.filter(l => l.status === 'completed').length;
    
    const today = new Date().toISOString().split('T')[0];
    const todayCollection = payments
      .filter(p => p.date === today && p.status === 'paid')
      .reduce((sum, payment) => {
        const loan = loans.find(l => l.id === payment.loanId);
        return sum + (loan?.dailyEmi || 0);
      }, 0);

    const overdueCount = loans.filter(loan => {
      const startDate = new Date(loan.startDate);
      const todayDate = new Date(today);
      const daysDiff = Math.floor((todayDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff >= 0 && daysDiff < loan.duration) {
        const todayPayment = payments.find(p => p.loanId === loan.id && p.date === today);
        return !todayPayment;
      }
      return false;
    }).length;

    const collectionRate = totalLent > 0 ? (totalCollected / totalLent) * 100 : 0;

    return {
      totalLent,
      totalCollected,
      activeLoanCount,
      completedLoanCount,
      todayCollection,
      overdueCount,
      collectionRate,
      remaining: totalLent - totalCollected
    };
  };

  const stats = calculateStats();

  const statCards = [
    {
      title: 'Total Lent',
      value: `₹${stats.totalLent.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      trend: null
    },
    {
      title: 'Total Collected',
      value: `₹${stats.totalCollected.toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      trend: `${stats.collectionRate.toFixed(1)}%`
    },
    {
      title: "Today's Collection",
      value: `₹${stats.todayCollection.toLocaleString()}`,
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      trend: null
    },
    {
      title: 'Active Loans',
      value: stats.activeLoanCount.toString(),
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      trend: `${stats.completedLoanCount} completed`
    },
    {
      title: 'Pending Today',
      value: stats.overdueCount.toString(),
      icon: AlertTriangle,
      color: stats.overdueCount > 0 ? 'text-red-600' : 'text-gray-600',
      bgColor: stats.overdueCount > 0 ? 'bg-red-50' : 'bg-gray-50',
      trend: stats.overdueCount > 0 ? 'Needs attention' : 'All clear'
    },
    {
      title: 'Outstanding',
      value: `₹${stats.remaining.toLocaleString()}`,
      icon: TrendingDown,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      trend: null
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {statCards.map((stat, index) => (
        <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                {stat.trend && (
                  <Badge variant="outline" className="mt-2 text-xs">
                    {stat.trend}
                  </Badge>
                )}
              </div>
              <div className={`${stat.bgColor} p-3 rounded-full`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StatsOverview;
