import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { LogOut, Sparkles } from 'lucide-react';
import LoanManagement from '@/components/LoanManagement';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import NotificationCenter from '@/components/NotificationCenter';
import QuickActions from '@/components/QuickActions';
import StatsOverview from '@/components/StatsOverview';
import TodaysCollections from '@/components/TodaysCollections';
import PaymentHistory from '@/components/PaymentHistory';
import { useDashboardData } from '@/hooks/useDashboardData';
import { loansAPI, paymentsAPI } from '@/lib/api';

const FinanceDashboard = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  const {
    loans,
    payments,
    filteredLoans,
    handleAddLoan,
    handleUpdateLoan,
    handleDeleteLoan,
    handleQuickSearch,
    markPayment,
    getTodaysCollections,
    handleExportReport
  } = useDashboardData(currentUser);

  useEffect(() => {
    const savedUser = localStorage.getItem('dfcs_user');
    if (!savedUser) {
      navigate('/');
      return;
    }
    
    const user = JSON.parse(savedUser);
    if (user.role !== 'finance') {
      navigate('/');
      return;
    }
    
    setCurrentUser(user);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('dfcs_user');
    navigate('/');
  };

  const handleAddLoanWithTab = () => {
    setActiveTab('loans');
  };

  const todaysCollections = getTodaysCollections();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto p-4">
        {/* Enhanced Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-blue-600 to-green-600 p-2 rounded-lg">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Modern DFCS Dashboard</h1>
              <p className="text-gray-600">Welcome back, {currentUser?.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <NotificationCenter loans={loans} payments={payments} />
            <Button onClick={handleLogout} variant="outline" className="flex items-center space-x-2">
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>

        {/* Enhanced Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-3xl grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="today">Collections</TabsTrigger>
            <TabsTrigger value="loans">Loans</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <StatsOverview loans={loans} payments={payments} />
            <QuickActions 
              onAddLoan={handleAddLoanWithTab}
              onExportReport={handleExportReport}
              onQuickSearch={handleQuickSearch}
            />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsDashboard 
              loans={loans} 
              payments={payments}
              onExportReport={handleExportReport}
            />
          </TabsContent>

          <TabsContent value="today">
            <TodaysCollections 
              collections={todaysCollections}
              onMarkPayment={markPayment}
            />
          </TabsContent>

          <TabsContent value="loans">
            <LoanManagement
              loans={filteredLoans}
              onAddLoan={handleAddLoan}
              onUpdateLoan={handleUpdateLoan}
              onDeleteLoan={handleDeleteLoan}
              currentUser={currentUser}
            />
          </TabsContent>

          <TabsContent value="history">
            <PaymentHistory 
              payments={payments}
              loans={loans}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FinanceDashboard;
