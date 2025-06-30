import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, Edit2, Trash2, Calendar, User, Phone, IndianRupee } from 'lucide-react';

interface Loan {
  id: string;
  loanId: string;
  shopkeeperName: string;
  shopkeeperPhone: string;
  amount: number;
  startDate: string;
  duration: number;
  dailyEmi: number;
  status: 'active' | 'completed' | 'defaulted';
  createdBy: string;
}

interface LoanManagementProps {
  loans: Loan[];
  onAddLoan: (loan: Omit<Loan, 'id'>) => void;
  onUpdateLoan: (id: string, loan: Partial<Loan>) => void;
  onDeleteLoan: (id: string) => void;
  currentUser: any;
}

const LoanManagement = ({ loans, onAddLoan, onUpdateLoan, onDeleteLoan, currentUser }: LoanManagementProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);
  const [formData, setFormData] = useState({
    loanId: '',
    shopkeeperName: '',
    shopkeeperPhone: '',
    amount: '',
    startDate: '',
    duration: '',
    dailyEmi: ''
  });
  const { toast } = useToast();

  const resetForm = () => {
    setFormData({
      loanId: '',
      shopkeeperName: '',
      shopkeeperPhone: '',
      amount: '',
      startDate: '',
      duration: '',
      dailyEmi: ''
    });
  };

  const validateForm = () => {
    if (!formData.loanId.trim()) {
      toast({
        title: "Validation Error",
        description: "Loan ID is required",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.shopkeeperName.trim()) {
      toast({
        title: "Validation Error",
        description: "Shopkeeper name is required",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.shopkeeperPhone.trim() || formData.shopkeeperPhone.length < 10) {
      toast({
        title: "Validation Error",
        description: "Valid phone number (10 digits) is required",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast({
        title: "Validation Error",
        description: "Valid loan amount is required",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.startDate) {
      toast({
        title: "Validation Error",
        description: "Start date is required",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.duration || parseInt(formData.duration) <= 0) {
      toast({
        title: "Validation Error",
        description: "Valid duration is required",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const loanData = {
      loanId: formData.loanId.trim(),
      shopkeeperName: formData.shopkeeperName.trim(),
      shopkeeperPhone: formData.shopkeeperPhone.trim(),
      amount: parseFloat(formData.amount),
      startDate: formData.startDate,
      duration: parseInt(formData.duration),
      dailyEmi: formData.dailyEmi ? parseFloat(formData.dailyEmi) : parseFloat(formData.amount) / parseInt(formData.duration),
      status: 'active' as const,
      createdBy: currentUser.id
    };

    if (editingLoan) {
      onUpdateLoan(editingLoan.id, loanData);
      setEditingLoan(null);
      toast({
        title: "Loan Updated",
        description: `Loan for ${formData.shopkeeperName} updated successfully`,
      });
    } else {
      onAddLoan(loanData);
    }

    resetForm();
    setIsAddDialogOpen(false);
  };

  const handleEdit = (loan: Loan) => {
    setFormData({
      loanId: loan.loanId,
      shopkeeperName: loan.shopkeeperName,
      shopkeeperPhone: loan.shopkeeperPhone,
      amount: loan.amount.toString(),
      startDate: loan.startDate,
      duration: loan.duration.toString(),
      dailyEmi: loan.dailyEmi.toString()
    });
    setEditingLoan(loan);
    setIsAddDialogOpen(true);
  };

  const handleDelete = (loan: Loan) => {
    if (window.confirm(`Are you sure you want to delete the loan for ${loan.shopkeeperName}?`)) {
      onDeleteLoan(loan.id);
      toast({
        title: "Loan Deleted",
        description: `Loan for ${loan.shopkeeperName} has been deleted`,
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'defaulted': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Loan Management</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setEditingLoan(null); }}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add New Loan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingLoan ? 'Edit Loan' : 'Add New Loan'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="loanId">Loan ID *</Label>
                <Input
                  id="loanId"
                  value={formData.loanId}
                  onChange={(e) => setFormData({...formData, loanId: e.target.value})}
                  placeholder="Enter unique loan ID (e.g., SHKP1001)"
                  required
                />
                <p className="text-xs text-gray-500">This ID will be used by shopkeeper to register and login</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="shopkeeperName">Shopkeeper Name *</Label>
                <Input
                  id="shopkeeperName"
                  value={formData.shopkeeperName}
                  onChange={(e) => setFormData({...formData, shopkeeperName: e.target.value})}
                  placeholder="Enter shopkeeper name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="shopkeeperPhone">Phone Number *</Label>
                <Input
                  id="shopkeeperPhone"
                  value={formData.shopkeeperPhone}
                  onChange={(e) => setFormData({...formData, shopkeeperPhone: e.target.value})}
                  placeholder="Enter 10-digit phone number"
                  maxLength={10}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="amount">Loan Amount (₹) *</Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  placeholder="Enter loan amount"
                  min="1"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (Days) *</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: e.target.value})}
                  placeholder="Enter duration in days"
                  min="1"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dailyEmi">Daily EMI (₹) - Optional</Label>
                <Input
                  id="dailyEmi"
                  type="number"
                  value={formData.dailyEmi}
                  onChange={(e) => setFormData({...formData, dailyEmi: e.target.value})}
                  placeholder="Auto-calculated if empty"
                  min="1"
                />
                {formData.amount && formData.duration && !formData.dailyEmi && (
                  <p className="text-sm text-gray-500">
                    Auto EMI: ₹{(parseFloat(formData.amount) / parseInt(formData.duration)).toFixed(2)}
                  </p>
                )}
              </div>
              
              <Button type="submit" className="w-full">
                {editingLoan ? 'Update Loan' : 'Add Loan'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">Active Loans</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="defaulted">Defaulted</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <div className="grid gap-4">
            {loans.filter(loan => loan.status === 'active').map((loan) => (
              <Card key={loan.id} className="shadow-md">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-3">
                      <User className="h-8 w-8 text-gray-400" />
                      <div>
                        <h3 className="font-semibold text-lg">{loan.shopkeeperName}</h3>
                        <p className="text-sm text-gray-500 flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {loan.shopkeeperPhone}
                        </p>
                        <p className="text-xs text-blue-600 font-medium">ID: {loan.loanId}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(loan.status)}>
                        {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                      </Badge>
                      <Button size="sm" variant="outline" onClick={() => handleEdit(loan)}>
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(loan)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <IndianRupee className="h-3 w-3" />
                      <div>
                        <p className="text-gray-500">Amount</p>
                        <p className="font-medium">₹{loan.amount.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <div>
                        <p className="text-gray-500">Start Date</p>
                        <p className="font-medium">{new Date(loan.startDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-500">Duration</p>
                      <p className="font-medium">{loan.duration} days</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Daily EMI</p>
                      <p className="font-medium">₹{loan.dailyEmi}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {loans.filter(loan => loan.status === 'active').length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-gray-500">No active loans found</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="completed">
          <div className="grid gap-4">
            {loans.filter(loan => loan.status === 'completed').map((loan) => (
              <Card key={loan.id} className="shadow-md opacity-75">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      <User className="h-8 w-8 text-gray-400" />
                      <div>
                        <h3 className="font-semibold">{loan.shopkeeperName}</h3>
                        <p className="text-sm text-gray-500">{loan.shopkeeperPhone}</p>
                        <p className="text-xs text-blue-600 font-medium">ID: {loan.loanId}</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(loan.status)}>Completed</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
            {loans.filter(loan => loan.status === 'completed').length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-gray-500">No completed loans found</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="defaulted">
          <div className="grid gap-4">
            {loans.filter(loan => loan.status === 'defaulted').map((loan) => (
              <Card key={loan.id} className="shadow-md border-red-200">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      <User className="h-8 w-8 text-red-400" />
                      <div>
                        <h3 className="font-semibold">{loan.shopkeeperName}</h3>
                        <p className="text-sm text-gray-500">{loan.shopkeeperPhone}</p>
                        <p className="text-xs text-blue-600 font-medium">ID: {loan.loanId}</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(loan.status)}>Defaulted</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
            {loans.filter(loan => loan.status === 'defaulted').length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-gray-500">No defaulted loans found</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LoanManagement;
