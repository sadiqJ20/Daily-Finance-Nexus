import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PaymentCalendar from '@/components/PaymentCalendar';
import { 
  IndianRupee, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Clock,
  TrendingDown,
  LogOut,
  User,
  Phone,
  AlertCircle,
  MessageCircle,
  Copy
} from 'lucide-react';

interface Loan {
  id: string;
  loanId: string;
  shopkeeperName: string;
  shopkeeperPhone: string;
  amount: number;
  startDate: string;
  duration: number;
  dailyEmi: number;
  createdBy: string;
  status?: 'active' | 'completed' | 'defaulted';
}

interface Payment {
  id: string;
  loanId: string;
  date: string;
  status: 'paid' | 'missed';
  paidBy?: string;
}

const ShopkeeperDashboard = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [myLoan, setMyLoan] = useState<Loan | null>(null);
  const [myPayments, setMyPayments] = useState<Payment[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const savedUser = localStorage.getItem('dfcs_user');
    if (!savedUser) {
      navigate('/');
      return;
    }
    
    const user = JSON.parse(savedUser);
    if (user.role !== 'shopkeeper') {
      navigate('/');
      return;
    }
    
    setCurrentUser(user);
    loadMyData(user);
  }, [navigate]);

  const loadMyData = async (user: any) => {
    try {
      // Fetch loans from API
      const response = await fetch(`http://localhost:4000/api/loans`);
      if (!response.ok) throw new Error('Failed to fetch loans');
      const allLoans = await response.json();
      
      // Find loan by loanId
      const userLoan = allLoans.find((loan: any) => loan.loanId === user.loanId);
      
      if (userLoan) {
        // If finance details missing, attempt to fetch
        let financeInfo = userLoan.createdBy;
        if (financeInfo && typeof financeInfo === 'string') {
          try {
            const uRes = await fetch(`http://localhost:4000/api/users/${financeInfo}`);
            if (uRes.ok) financeInfo = await uRes.json();
          } catch (_) {}
        }

        // Format loan to match our interface
        const formattedLoan = {
          ...userLoan,
          createdBy: financeInfo,
          id: userLoan._id // Ensure we have an id property for compatibility
        };
        setMyLoan(formattedLoan);
        
        // Fetch payments for this loan
        const paymentsResponse = await fetch(`http://localhost:4000/api/payments?loanId=${userLoan._id}`);
        if (!paymentsResponse.ok) throw new Error('Failed to fetch payments');
        const loanPayments = await paymentsResponse.json();
        
        // Format payments to match our interface
        const formattedPayments = loanPayments.map((payment: any) => ({
          ...payment,
          id: payment._id,
          loanId: String(payment.loanId),
          date: String(payment.date).split('T')[0],
        }));
        
        setMyPayments(formattedPayments);
      } else {
        setMyLoan(null);
        setMyPayments([]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Connection Error",
        description: "Failed to load data from server. Using local data instead.",
        variant: "destructive",
      });
      
      // Fallback to localStorage if API fails
      const allLoans = JSON.parse(localStorage.getItem('dfcs_loans') || '[]');
      const allPayments = JSON.parse(localStorage.getItem('dfcs_payments') || '[]');
      
      // Find loan by loanId
      const userLoan = allLoans.find((loan: Loan) => loan.loanId === user.loanId);
      setMyLoan(userLoan || null);
      
      // Filter payments for this loan
      if (userLoan) {
        const loanPayments = allPayments.filter((payment: Payment) => payment.loanId === userLoan.id);
        setMyPayments(loanPayments);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('dfcs_user');
    navigate('/');
  };

  const handleCopyLoanId = () => {
    if (myLoan) {
      navigator.clipboard.writeText(myLoan.loanId);
      toast({
        title: "Copied!",
        description: "Loan ID copied to clipboard",
      });
    }
  };

  const handleRaiseDispute = () => {
    toast({
      title: "Dispute Raised",
      description: "Your dispute has been submitted to the finance person",
    });
  };

  const getActiveLoanData = () => {
    if (!myLoan) return null;
    
    const paidAmount = myPayments.filter(p => p.status === 'paid').length * myLoan.dailyEmi;
    const remainingAmount = myLoan.amount - paidAmount;
    const paidDays = myPayments.filter(p => p.status === 'paid').length;
    const missedDays = myPayments.filter(p => p.status === 'missed').length;
    
    return {
      ...myLoan,
      paidAmount,
      remainingAmount,
      paidDays,
      missedDays,
      totalDays: myPayments.length,
      status: myLoan.status || 'active'
    };
  };

  const getPaymentCalendar = () => {
    if (!myLoan) return [];

    const calendar = [];
    const startDate = new Date(myLoan.startDate);
    
    for (let i = 0; i < myLoan.duration; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      const dateStr = currentDate.toISOString().split('T')[0];
      
      const payment = myPayments.find(p => p.loanId === myLoan.id && p.date === dateStr);
      const today = new Date().toISOString().split('T')[0];
      
      let status = 'pending';
      if (payment) {
        status = payment.status;
      } else if (dateStr < today) {
        status = 'overdue';
      } else if (dateStr === today) {
        status = 'due-today';
      }
      
      calendar.push({
        date: dateStr,
        day: i + 1,
        status,
        amount: myLoan.dailyEmi
      });
    }
    
    return calendar;
  };

  const getTodaysStatus = () => {
    const today = new Date().toISOString().split('T')[0];
    const calendar = getPaymentCalendar();
    return calendar.find(day => day.date === today);
  };

  const activeLoan = getActiveLoanData();
  const todaysStatus = getTodaysStatus();

  if (!currentUser) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="container mx-auto p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
            <p className="text-gray-600">Welcome, {currentUser?.name}</p>
          </div>
          <Button onClick={handleLogout} variant="outline" className="flex items-center space-x-2">
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </Button>
        </div>

        {activeLoan ? (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="calendar">Payment Calendar</TabsTrigger>
              <TabsTrigger value="support">Support</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              {/* Loan ID Card */}
              <Card className="mb-6 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">Your Loan ID</h3>
                      <p className="text-2xl font-bold text-blue-600">{activeLoan.loanId}</p>
                    </div>
                    <Button onClick={handleCopyLoanId} variant="outline" size="sm">
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Today's Status */}
              {todaysStatus && (
                <Card className="mb-6 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-3 rounded-full ${
                          todaysStatus.status === 'paid' ? 'bg-green-100' :
                          todaysStatus.status === 'due-today' ? 'bg-yellow-100' :
                          todaysStatus.status === 'overdue' ? 'bg-red-100' : 'bg-gray-100'
                        }`}>
                          {todaysStatus.status === 'paid' ? (
                            <CheckCircle2 className="h-6 w-6 text-green-600" />
                          ) : todaysStatus.status === 'due-today' ? (
                            <Clock className="h-6 w-6 text-yellow-600" />
                          ) : todaysStatus.status === 'overdue' ? (
                            <AlertCircle className="h-6 w-6 text-red-600" />
                          ) : (
                            <Calendar className="h-6 w-6 text-gray-600" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">
                            {todaysStatus.status === 'paid' ? 'Payment Completed' :
                             todaysStatus.status === 'due-today' ? 'Payment Due Today' :
                             todaysStatus.status === 'overdue' ? 'Payment Overdue' : 'Upcoming Payment'}
                          </h3>
                          <p className="text-gray-600">₹{todaysStatus.amount} - Day {todaysStatus.day}</p>
                        </div>
                      </div>
                      <Badge 
                        variant={
                          todaysStatus.status === 'paid' ? 'default' :
                          todaysStatus.status === 'due-today' ? 'outline' :
                          todaysStatus.status === 'overdue' ? 'destructive' : 'secondary'
                        }
                      >
                        {todaysStatus.status === 'paid' ? 'Paid' :
                         todaysStatus.status === 'due-today' ? 'Due Today' :
                         todaysStatus.status === 'overdue' ? 'Overdue' : 'Upcoming'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Loan Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <IndianRupee className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">Total Loan</p>
                        <p className="text-xl font-bold text-blue-600">₹{activeLoan.amount.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-sm text-gray-600">Paid Amount</p>
                        <p className="text-xl font-bold text-green-600">₹{activeLoan.paidAmount.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <TrendingDown className="h-5 w-5 text-orange-600" />
                      <div>
                        <p className="text-sm text-gray-600">Remaining</p>
                        <p className="text-xl font-bold text-orange-600">₹{activeLoan.remainingAmount.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="text-sm text-gray-600">Days Completed</p>
                        <p className="text-xl font-bold text-purple-600">{activeLoan.paidDays}/{activeLoan.duration}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Payment Progress */}
              <Card className="mb-6 shadow-lg">
                <CardHeader>
                  <CardTitle>Payment Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Progress</span>
                      <span>{((activeLoan.paidDays / activeLoan.duration) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${(activeLoan.paidDays / activeLoan.duration) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-green-600">{activeLoan.paidDays}</p>
                      <p className="text-sm text-gray-600">Paid Days</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-red-600">{activeLoan.missedDays}</p>
                      <p className="text-sm text-gray-600">Missed Days</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-600">{activeLoan.duration - activeLoan.totalDays}</p>
                      <p className="text-sm text-gray-600">Remaining Days</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="calendar">
              <PaymentCalendar loan={activeLoan} payments={myPayments} />
            </TabsContent>

            <TabsContent value="support">
              <div className="space-y-6">
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <MessageCircle className="h-5 w-5" />
                      <span>Raise a Dispute</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      If you have any concerns about your payment status or need assistance, 
                      you can raise a dispute with the finance person.
                    </p>
                    <Button onClick={handleRaiseDispute} className="w-full">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Raise Dispute
                    </Button>
                  </CardContent>
                </Card>

                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle>Loan Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Loan ID:</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">{activeLoan.loanId}</span>
                          <Button onClick={handleCopyLoanId} variant="ghost" size="sm">
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">Name: {currentUser?.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">Phone: {currentUser?.phone}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Finance Person Details */}
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle>Finance Person</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">
                          Name: {typeof myLoan?.createdBy === 'object' ? (myLoan?.createdBy as any)?.name : 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">
                          Contact: {typeof myLoan?.createdBy === 'object' ? (myLoan?.createdBy as any)?.phone || (myLoan?.createdBy as any)?.uniqueId : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <Card className="shadow-lg">
            <CardContent className="p-12 text-center">
              <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Loan Found</h3>
              <p className="text-gray-600 mb-4">
                No loan was found for your Loan ID. Please contact your finance person 
                to verify your Loan ID.
              </p>
              <div className="text-sm text-gray-500">
                <p className="flex items-center justify-center space-x-1">
                  <span>Your Loan ID: {currentUser?.loanId}</span>
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ShopkeeperDashboard;
