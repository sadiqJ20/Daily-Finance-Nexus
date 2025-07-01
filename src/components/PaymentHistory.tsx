
import { Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Payment {
  id: string;
  loanId: string;
  date: string;
  status: 'paid' | 'missed';
  paidBy?: string;
}

interface Loan {
  id: string;
  shopkeeperName: string;
  dailyEmi: number;
}

interface PaymentHistoryProps {
  payments: Payment[];
  loans: Loan[];
}

const PaymentHistory = ({ payments, loans }: PaymentHistoryProps) => {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="h-5 w-5" />
          <span>Payment History</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {payments.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No payment history yet</p>
        ) : (
          <div className="space-y-3">
            {payments
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .slice(0, 50)
              .map((payment) => {
                const loan = loans.find(l => l.id === payment.loanId);
                return (
                  <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg hover:shadow-sm transition-shadow">
                    <div>
                      <p className="font-medium">{loan?.shopkeeperName}</p>
                      <p className="text-sm text-gray-500">{payment.date}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={payment.status === 'paid' ? 'default' : 'destructive'}>
                        {payment.status === 'paid' ? 'Paid' : 'Missed'}
                      </Badge>
                      {payment.status === 'paid' && (
                        <p className="text-sm text-gray-500 mt-1">₹{loan?.dailyEmi}</p>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentHistory;
