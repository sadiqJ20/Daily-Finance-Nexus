
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  IndianRupee, 
  Users, 
  AlertTriangle, 
  CheckCircle2,
  Calendar,
  Download,
  Clock
} from 'lucide-react';

interface Loan {
  id: string;
  shopkeeperName: string;
  shopkeeperPhone: string;
  amount: number;
  startDate: string;
  duration: number;
  dailyEmi: number;
  status: 'active' | 'completed' | 'defaulted';
  createdBy: string;
}

interface Payment {
  id: string;
  loanId: string;
  date: string;
  status: 'paid' | 'missed';
  paidBy?: string;
}

interface AnalyticsDashboardProps {
  loans: Loan[];
  payments: Payment[];
  onExportReport: (type: 'csv' | 'pdf') => void;
}

const AnalyticsDashboard = ({ loans, payments, onExportReport }: AnalyticsDashboardProps) => {
  const calculateStats = () => {
    const totalLent = loans.reduce((sum, loan) => sum + loan.amount, 0);
    const totalCollected = payments
      .filter(p => p.status === 'paid')
      .reduce((sum, payment) => {
        const loan = loans.find(l => l.id === payment.loanId);
        return sum + (loan?.dailyEmi || 0);
      }, 0);

    const activeLoanIds = loans.filter(l => l.status === 'active').map(l => l.id);
    const overduePayments = getOverduePayments();
    const totalOverdue = overduePayments.reduce((sum, payment) => {
      const loan = loans.find(l => l.id === payment.loanId);
      return sum + (loan?.dailyEmi || 0);
    }, 0);

    const todaysCollections = getTodaysCollections();
    const todaysExpected = todaysCollections.length * (todaysCollections[0]?.dailyEmi || 0);
    const todaysCollected = todaysCollections
      .filter(c => c.todayStatus === 'paid')
      .reduce((sum, c) => sum + c.dailyEmi, 0);

    return {
      totalLent,
      totalCollected,
      totalRemaining: totalLent - totalCollected,
      totalOverdue,
      activeLoans: loans.filter(l => l.status === 'active').length,
      completedLoans: loans.filter(l => l.status === 'completed').length,
      defaultedLoans: loans.filter(l => l.status === 'defaulted').length,
      todaysExpected,
      todaysCollected,
      collectionRate: totalLent > 0 ? (totalCollected / totalLent) * 100 : 0,
      overdueCount: overduePayments.length
    };
  };

  const getOverduePayments = () => {
    const today = new Date().toISOString().split('T')[0];
    const overdue: any[] = [];

    loans.filter(l => l.status === 'active').forEach(loan => {
      const startDate = new Date(loan.startDate);
      const currentDate = new Date(today);
      
      for (let i = 0; i < loan.duration; i++) {
        const checkDate = new Date(startDate);
        checkDate.setDate(startDate.getDate() + i);
        const dateStr = checkDate.toISOString().split('T')[0];
        
        if (dateStr < today) {
          const payment = payments.find(p => p.loanId === loan.id && p.date === dateStr);
          if (!payment || payment.status === 'missed') {
            overdue.push({
              ...loan,
              missedDate: dateStr,
              dayNumber: i + 1
            });
          }
        }
      }
    });

    return overdue;
  };

  const getTodaysCollections = () => {
    const today = new Date().toISOString().split('T')[0];
    return loans.filter(loan => {
      if (loan.status !== 'active') return false;
      
      const startDate = new Date(loan.startDate);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + loan.duration);
      
      const todayDate = new Date(today);
      return todayDate >= startDate && todayDate <= endDate;
    }).map(loan => {
      const todayPayment = payments.find(p => p.loanId === loan.id && p.date === today);
      return {
        ...loan,
        todayStatus: todayPayment?.status || 'pending'
      };
    });
  };

  const getDefaulters = () => {
    const overduePayments = getOverduePayments();
    const defaulterMap = new Map();
    
    overduePayments.forEach(payment => {
      const key = payment.shopkeeperPhone;
      if (!defaulterMap.has(key)) {
        defaulterMap.set(key, {
          shopkeeperName: payment.shopkeeperName,
          shopkeeperPhone: payment.shopkeeperPhone,
          missedDays: 0,
          overdueAmount: 0
        });
      }
      const defaulter = defaulterMap.get(key);
      defaulter.missedDays += 1;
      defaulter.overdueAmount += payment.dailyEmi;
    });

    return Array.from(defaulterMap.values()).sort((a, b) => b.overdueAmount - a.overdueAmount);
  };

  const stats = calculateStats();
  const defaulters = getDefaulters();
  const overduePayments = getOverduePayments();

  return (
    <div className="space-y-6">
      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Lent</p>
                <p className="text-2xl font-bold text-blue-600">₹{stats.totalLent.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Collected</p>
                <p className="text-2xl font-bold text-green-600">₹{stats.totalCollected.toLocaleString()}</p>
                <p className="text-xs text-gray-500">{stats.collectionRate.toFixed(1)}% collected</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Overdue</p>
                <p className="text-2xl font-bold text-red-600">₹{stats.totalOverdue.toLocaleString()}</p>
                <p className="text-xs text-gray-500">{stats.overdueCount} missed payments</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Loans</p>
                <p className="text-2xl font-bold text-purple-600">{stats.activeLoans}</p>
                <p className="text-xs text-gray-500">{stats.completedLoans} completed</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Performance */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Today's Collection Performance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">₹{stats.todaysExpected.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Expected Today</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">₹{stats.todaysCollected.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Collected Today</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                ₹{(stats.todaysExpected - stats.todaysCollected).toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Pending Today</p>
            </div>
          </div>
          
          {stats.todaysExpected > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Collection Progress</span>
                <span>{((stats.todaysCollected / stats.todaysExpected) * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-green-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((stats.todaysCollected / stats.todaysExpected) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Defaulters Report */}
      {defaulters.length > 0 && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              <span>Defaulters Report</span>
              <Badge variant="destructive">{defaulters.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {defaulters.slice(0, 5).map((defaulter, index) => (
                <div key={defaulter.shopkeeperPhone} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <p className="font-medium">{defaulter.shopkeeperName}</p>
                    <p className="text-sm text-gray-600">{defaulter.shopkeeperPhone}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600">₹{defaulter.overdueAmount.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">{defaulter.missedDays} missed days</p>
                  </div>
                </div>
              ))}
              {defaulters.length > 5 && (
                <p className="text-sm text-gray-500 text-center">
                  +{defaulters.length - 5} more defaulters
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Export Reports */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Download className="h-5 w-5" />
            <span>Export Reports</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              onClick={() => onExportReport('csv')} 
              variant="outline"
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Export as CSV
            </Button>
            <Button 
              onClick={() => onExportReport('pdf')} 
              variant="outline"
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Export as PDF
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-2 text-center">
            Export includes loan details, payment history, and analytics
          </p>
        </CardContent>
      </Card>

      {/* Loan Status Overview */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Loan Status Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-3xl font-bold text-green-600">{stats.activeLoans}</p>
              <p className="text-sm text-gray-600">Active Loans</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-3xl font-bold text-blue-600">{stats.completedLoans}</p>
              <p className="text-sm text-gray-600">Completed Loans</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-3xl font-bold text-red-600">{stats.defaultedLoans}</p>
              <p className="text-sm text-gray-600">Defaulted Loans</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;
