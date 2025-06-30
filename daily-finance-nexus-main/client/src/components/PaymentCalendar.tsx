
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  TrendingUp
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
}

interface Payment {
  id: string;
  loanId: string;
  date: string;
  status: 'paid' | 'missed';
}

interface PaymentCalendarProps {
  loan: Loan;
  payments: Payment[];
}

const PaymentCalendar = ({ loan, payments }: PaymentCalendarProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const daysPerPage = 28; // 4 weeks view

  const generatePaymentSchedule = () => {
    const schedule = [];
    const startDate = new Date(loan.startDate);
    const today = new Date().toISOString().split('T')[0];
    
    for (let i = 0; i < loan.duration; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      const dateStr = currentDate.toISOString().split('T')[0];
      
      const payment = payments.find(p => p.loanId === loan.id && p.date === dateStr);
      
      let status = 'upcoming';
      if (payment) {
        status = payment.status;
      } else if (dateStr < today) {
        status = 'overdue';
      } else if (dateStr === today) {
        status = 'due-today';
      }
      
      schedule.push({
        date: dateStr,
        day: i + 1,
        status,
        amount: loan.dailyEmi,
        dayOfWeek: currentDate.getDay(),
        displayDate: currentDate.getDate(),
        month: currentDate.getMonth(),
        year: currentDate.getFullYear()
      });
    }
    
    return schedule;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'missed': return 'bg-red-100 text-red-800 border-red-200';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
      case 'due-today': return 'bg-yellow-100 text-yellow-800 border-yellow-200 ring-2 ring-yellow-400';
      case 'upcoming': return 'bg-gray-100 text-gray-600 border-gray-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle2 className="h-3 w-3" />;
      case 'missed': return <XCircle className="h-3 w-3" />;
      case 'overdue': return <AlertCircle className="h-3 w-3" />;
      case 'due-today': return <Clock className="h-3 w-3" />;
      case 'upcoming': return <Calendar className="h-3 w-3" />;
      default: return <Calendar className="h-3 w-3" />;
    }
  };

  const paymentSchedule = generatePaymentSchedule();
  const totalPages = Math.ceil(paymentSchedule.length / daysPerPage);
  const currentPageData = paymentSchedule.slice(
    currentPage * daysPerPage,
    (currentPage + 1) * daysPerPage
  );

  const getStats = () => {
    const paidDays = paymentSchedule.filter(day => day.status === 'paid').length;
    const missedDays = paymentSchedule.filter(day => day.status === 'overdue' || day.status === 'missed').length;
    const upcomingDays = paymentSchedule.filter(day => day.status === 'upcoming' || day.status === 'due-today').length;
    const completionRate = (paidDays / loan.duration) * 100;
    
    return {
      paidDays,
      missedDays,
      upcomingDays,
      completionRate,
      paidAmount: paidDays * loan.dailyEmi,
      remainingAmount: loan.amount - (paidDays * loan.dailyEmi)
    };
  };

  const stats = getStats();

  return (
    <div className="space-y-6">
      {/* Progress Summary */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Payment Progress</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.paidDays}</p>
              <p className="text-sm text-gray-600">Paid Days</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{stats.missedDays}</p>
              <p className="text-sm text-gray-600">Missed Days</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.upcomingDays}</p>
              <p className="text-sm text-gray-600">Remaining</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{stats.completionRate.toFixed(1)}%</p>
              <p className="text-sm text-gray-600">Complete</p>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{stats.completionRate.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-green-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(stats.completionRate, 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-lg font-bold text-green-600">₹{stats.paidAmount.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Amount Paid</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <p className="text-lg font-bold text-orange-600">₹{stats.remainingAmount.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Remaining</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Calendar */}
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Payment Calendar</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-gray-600">
                Page {currentPage + 1} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                disabled={currentPage === totalPages - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 p-2">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {currentPageData.map((day, index) => (
              <div
                key={index}
                className={`p-3 text-center rounded-lg text-sm border transition-all hover:shadow-md ${getStatusColor(day.status)}`}
              >
                <div className="font-medium mb-1">Day {day.day}</div>
                <div className="text-xs mb-1">{day.displayDate}</div>
                <div className="flex justify-center mb-1">
                  {getStatusIcon(day.status)}
                </div>
                <div className="text-xs">₹{day.amount}</div>
              </div>
            ))}
            
            {/* Fill empty cells for last page */}
            {currentPageData.length < daysPerPage && 
              Array.from({ length: daysPerPage - currentPageData.length }).map((_, index) => (
                <div key={`empty-${index}`} className="p-3"></div>
              ))
            }
          </div>

          <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-100 border border-green-200 rounded flex items-center justify-center">
                <CheckCircle2 className="h-2 w-2 text-green-600" />
              </div>
              <span>Paid</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-100 border border-red-200 rounded flex items-center justify-center">
                <XCircle className="h-2 w-2 text-red-600" />
              </div>
              <span>Missed/Overdue</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-yellow-100 border border-yellow-200 rounded ring-1 ring-yellow-400 flex items-center justify-center">
                <Clock className="h-2 w-2 text-yellow-600" />
              </div>
              <span>Due Today</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-100 border border-gray-200 rounded flex items-center justify-center">
                <Calendar className="h-2 w-2 text-gray-600" />
              </div>
              <span>Upcoming</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentCalendar;
