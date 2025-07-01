import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { loansAPI, paymentsAPI, apiFetch } from '@/lib/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface Loan {
  id: string;
  _id?: string; // MongoDB ID
  loanId: string;
  shopkeeperName: string;
  shopkeeperPhone: string;
  amount: number;
  startDate: string;
  duration: number;
  dailyEmi: number;
  createdBy: string;
  status: 'active' | 'completed' | 'defaulted';
}

interface Payment {
  id: string;
  _id?: string; // MongoDB ID
  loanId: string;
  date: string;
  status: 'paid' | 'missed';
  paidBy?: string;
}

export const useDashboardData = (currentUser: any) => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredLoans, setFilteredLoans] = useState<Loan[]>([]);
  const { toast } = useToast();

  const queryClient = useQueryClient();

  const {
    data: loansRaw,
    isLoading: loansLoading,
    isError: loansError,
  } = useQuery({
    queryKey: ['loans'],
    queryFn: () => apiFetch('/loans'),
  });

  const {
    data: paymentsRaw,
    isLoading: paymentsLoading,
    isError: paymentsError,
  } = useQuery({
    queryKey: ['payments'],
    queryFn: () => apiFetch('/payments'),
  });

  const fetchedLoans    = loansRaw    ?? [];
  const fetchedPayments = paymentsRaw ?? [];

  useEffect(() => {
    const normalised = (fetchedLoans as Loan[]).map((l: any) => ({
      ...l,
      id: l._id ?? l.id ?? '',
    }));
    setLoans(normalised);
  }, [fetchedLoans]);

  useEffect(() => {
    const norm = (fetchedPayments as Payment[]).map((p: any) => ({
      ...p,
      id: p._id ?? p.id ?? '',
      loanId: String(p.loanId),
      date: String(p.date).split('T')[0],
    }));
    setPayments(norm);
  }, [fetchedPayments]);

  useEffect(() => {
    setFilteredLoans(loans);
  }, [loans]);

  const generateLoanId = (): string => {
    const prefix = 'SHKP';
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}${randomNum}`;
  };

  const handleAddLoan = async (loanData: Omit<Loan, 'id'>) => {
    try {
      // Check if loan ID already exists
      if (loans.some((loan: Loan) => loan.loanId === loanData.loanId)) {
        toast({
          title: "Error",
          description: "This Loan ID already exists. Please use a different Loan ID.",
          variant: "destructive",
        });
        return;
      }

      // Only include `createdBy` if we have a valid MongoDB ObjectId (24-char hex string)
      const maybeCreator = currentUser?._id;
      // Start with a copy _without_ the incoming createdBy (may be a pseudo-id)
      const { createdBy: _discarded, ...rest } = loanData as any;

      const loanDataToSend = {
        ...rest,
        ...(maybeCreator && /^[a-fA-F0-9]{24}$/.test(maybeCreator)
          ? { createdBy: maybeCreator }
          : {}),
      } as any;

      // Send to API using the loansAPI helper
      const response = await loansAPI.create(loanDataToSend);
      
      // Update state with the response from API
      const formattedLoan = {
        ...loanDataToSend,
        ...response, // Include all fields from the response
        id: response._id // Ensure we have an id property for compatibility
      };
      
      const updatedLoans = [...loans, formattedLoan];
      setLoans(updatedLoans);
      
      // Also update localStorage for backward compatibility
      localStorage.setItem('dfcs_loans', JSON.stringify(updatedLoans));
      
      toast({
        title: "Loan Added Successfully",
        description: `Loan ID: ${loanData.loanId} - Share this ID with the shopkeeper for registration and login`,
      });
    } catch (error) {
      console.error('Failed to add loan:', error);
      toast({
        title: "Error",
        description: "Failed to add loan. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateLoan = async (id: string, updates: Partial<Loan>) => {
    try {
      // Send to API
      await loansAPI.update(id, updates);
      
      // Update local state
      const updatedLoans = loans.map(loan => 
        loan.id === id ? { ...loan, ...updates } : loan
      );
      setLoans(updatedLoans);
      
      // Also update localStorage for backward compatibility
      localStorage.setItem('dfcs_loans', JSON.stringify(updatedLoans));
      
      toast({
        title: "Loan Updated",
        description: "Loan details have been updated successfully",
      });
    } catch (error) {
      console.error('Failed to update loan:', error);
      toast({
        title: "Error",
        description: "Failed to update loan. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteLoan = async (id: string) => {
    try {
      // Send to API
      await loansAPI.delete(id);
      
      // Update local state
      const updatedLoans = loans.filter(loan => loan.id !== id);
      setLoans(updatedLoans);
      
      // Also update localStorage for backward compatibility
      localStorage.setItem('dfcs_loans', JSON.stringify(updatedLoans));
      
      // We don't need to delete payments separately as they should cascade delete on the server
      // But we'll update our local state
      const updatedPayments = payments.filter(payment => payment.loanId !== id);
      setPayments(updatedPayments);
      localStorage.setItem('dfcs_payments', JSON.stringify(updatedPayments));
      
      toast({
        title: "Loan Deleted",
        description: "Loan and associated payments have been deleted",
      });
    } catch (error) {
      console.error('Failed to delete loan:', error);
      toast({
        title: "Error",
        description: "Failed to delete loan. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleQuickSearch = (query: string) => {
    const filtered = loans.filter(loan => 
      loan.shopkeeperName.toLowerCase().includes(query.toLowerCase()) ||
      loan.shopkeeperPhone.includes(query) ||
      loan.loanId.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredLoans(filtered);
  };

  const markPayment = async (loanId: string, status: 'paid' | 'missed') => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const existingPayment = payments.find(
        (p) => String(p.loanId) === String(loanId) && p.date === today
      );
      
      if (existingPayment) {
        toast({
          title: "Already Recorded",
          description: "Payment for today has already been recorded",
          variant: "destructive",
        });
        return;
      }

      const isValidObjectId = /^[a-fA-F0-9]{24}$/.test(String(loanId));
      const maybePaidBy = currentUser?._id;
      const paymentData = {
        loanId,
        date: today,
        status,
        ...(status === 'paid' && maybePaidBy && /^[a-fA-F0-9]{24}$/.test(maybePaidBy)
          ? { paidBy: maybePaidBy }
          : {}),
      } as any;

      let newPayment: any;
      if (isValidObjectId) {
        try {
          newPayment = await paymentsAPI.create(paymentData);
        } catch (err: any) {
          if (err?.message?.includes('already recorded')) {
            const latest = await paymentsAPI.getAll();
            const normalised = (latest as Payment[]).map((p: any) => ({
              ...p,
              id: p._id ?? p.id ?? '',
              loanId: String(p.loanId),
              date: String(p.date).split('T')[0],
            }));
            setPayments(normalised);
            toast({
              title: 'Already Recorded',
              description: 'Payment for today has already been recorded',
              variant: 'destructive',
            });
            return;
          }
          throw err;
        }
      } else {
        newPayment = {
          ...paymentData,
          _id: 'local_' + Date.now(),
        };
      }
      
      const formattedPayment = {
        ...newPayment,
        id: newPayment._id,
        loanId: String(newPayment.loanId),
        date: String(newPayment.date).split('T')[0],
      };
      
      const updatedPayments = [...payments, formattedPayment];
      setPayments(updatedPayments);
      
      // Also update localStorage for backward compatibility
      localStorage.setItem('dfcs_payments', JSON.stringify(updatedPayments));

      const loan = loans.find(l => l.id === loanId);
      toast({
        title: status === 'paid' ? "Payment Recorded" : "Missed Payment Recorded",
        description: `${loan?.shopkeeperName}'s payment marked as ${status}`,
      });
    } catch (error) {
      console.error('Failed to record payment:', error);
      toast({
        title: "Error",
        description: "Failed to record payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getTodaysCollections = () => {
    const today = new Date().toISOString().split('T')[0];
    return loans.filter(loan => {
      const startDate = new Date(loan.startDate);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + loan.duration);
      
      const todayDate = new Date(today);
      return todayDate >= startDate && todayDate <= endDate;
    }).map(loan => {
      const todayPayment = payments.find(
        (p) => String(p.loanId) === String(loan.id) && p.date === today
      );
      return {
        ...loan,
        todayStatus: todayPayment?.status || 'pending'
      };
    });
  };

  const handleExportReport = (type: 'csv' | 'pdf') => {
    if (type === 'csv') {
      const csvData = loans.map(loan => {
        const loanPayments = payments.filter(p => p.loanId === loan.id);
        const paidDays = loanPayments.filter(p => p.status === 'paid').length;
        const missedDays = loanPayments.filter(p => p.status === 'missed').length;
        
        return {
          'Loan ID': loan.loanId,
          'Shopkeeper Name': loan.shopkeeperName,
          'Phone': loan.shopkeeperPhone,
          'Loan Amount': loan.amount,
          'Daily EMI': loan.dailyEmi,
          'Duration': loan.duration,
          'Start Date': loan.startDate,
          'Status': loan.status,
          'Paid Days': paidDays,
          'Missed Days': missedDays,
          'Completion %': ((paidDays / loan.duration) * 100).toFixed(1)
        };
      });
      
      const csvContent = [
        Object.keys(csvData[0] || {}).join(','),
        ...csvData.map(row => Object.values(row).join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dfcs-report-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Report Exported",
        description: "CSV report has been downloaded successfully",
      });
    } else {
      toast({
        title: "PDF Export",
        description: "PDF export feature coming soon!",
      });
    }
  };

  return {
    loans,
    payments,
    loading: loansLoading || paymentsLoading,
    error:   loansError   || paymentsError,
    handleAddLoan,
    handleUpdateLoan,
    handleDeleteLoan,
    handleQuickSearch,
    markPayment,
    getTodaysCollections,
    handleExportReport,
    filteredLoans,
    setFilteredLoans
  };
};
