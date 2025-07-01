import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Building2, User, UserPlus } from 'lucide-react';

interface User {
  id: string;
  name: string;
  phone: string;
  password: string;
  role: 'finance' | 'shopkeeper';
  uniqueId?: string;
  loanId?: string;
}

interface FinanceUser {
  id: string;
  name: string;
  financeName: string;
  uniqueId: string;
}

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
  status: 'active' | 'completed' | 'defaulted';
}

const Index = () => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loginMode, setLoginMode] = useState<'finance' | 'shopkeeper'>('finance');
  const [registerRole, setRegisterRole] = useState<'finance' | 'shopkeeper'>('finance');
  
  const [loginData, setLoginData] = useState({
    uniqueId: '',
    loanId: ''
  });

  const [registerData, setRegisterData] = useState({
    name: '',
    financeName: '',
    uniqueId: '',
    loanId: ''
  });

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const savedUser = localStorage.getItem('dfcs_user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
      if (user.role === 'finance') {
        navigate('/finance-dashboard');
      } else {
        navigate('/shopkeeper-dashboard');
      }
    }
  }, [navigate]);

  const handleLoginInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegisterInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegisterData({
      ...registerData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Attempt to login via API
      const response = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: loginMode,
          uniqueId: loginData.uniqueId.trim(),
          loanId: loginData.loanId.trim(),
        }),
      });
      
      if (response.ok) {
        const userData = await response.json();
        localStorage.setItem('dfcs_user', JSON.stringify(userData));
        setCurrentUser(userData);
        
        if (userData.role === 'finance') {
          navigate('/finance-dashboard');
        } else {
          navigate('/shopkeeper-dashboard');
        }
        return;
      }
      
      // Fallback to localStorage if API fails
      if (loginMode === 'finance') {
        // Finance Person Login
        const financeUsers = JSON.parse(localStorage.getItem('dfcs_finance_users') || '[]');
        const financeUser = financeUsers.find((user: FinanceUser) => user.uniqueId === loginData.uniqueId.trim());
        
        if (financeUser) {
          const user = {
            id: financeUser.id,
            name: financeUser.name,
            phone: '',
            password: '',
            role: 'finance' as const,
            uniqueId: financeUser.uniqueId
          };
        
          localStorage.setItem('dfcs_user', JSON.stringify(user));
          setCurrentUser(user);
        
          toast({
            title: "Login Successful",
            description: `Welcome back, ${financeUser.name}!`,
          });
        
          navigate('/finance-dashboard');
        } else {
          toast({
            title: "Login Failed",
            description: "Invalid Unique ID. Please check your credentials.",
            variant: "destructive",
          });
        }
      } else {
        // Shopkeeper Login
        if (!loginData.loanId.trim()) {
          toast({
            title: "Login Failed",
            description: "Please enter your Loan ID",
            variant: "destructive",
          });
          return;
        }

        const loans = JSON.parse(localStorage.getItem('dfcs_loans') || '[]');
        const loan = loans.find((l: Loan) => l.loanId === loginData.loanId.trim());
      
        if (loan) {
          const shopkeeperUser = {
            id: 'shopkeeper_' + Date.now(),
            name: loan.shopkeeperName,
            phone: loan.shopkeeperPhone,
            password: '',
            role: 'shopkeeper' as const,
            loanId: loan.loanId
          };
        
          localStorage.setItem('dfcs_user', JSON.stringify(shopkeeperUser));
          setCurrentUser(shopkeeperUser);
        
          toast({
            title: "Login Successful",
            description: `Welcome back, ${loan.shopkeeperName}!`,
          });
        
          navigate('/shopkeeper-dashboard');
        } else {
          toast({
            title: "Login Failed",
            description: "Invalid Loan ID. Please check your Loan ID and try again.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login Failed",
        description: "An error occurred during login. Please try again.",
        variant: "destructive",
      });
    }
  }; // Added semicolon here

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();

    if (registerRole === 'finance') {
      // Finance Person Registration
      if (!registerData.name.trim() || !registerData.financeName.trim() || !registerData.uniqueId.trim()) {
        toast({
          title: "Registration Failed",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        return;
      }

      const financeUsers = JSON.parse(localStorage.getItem('dfcs_finance_users') || '[]');
      
      // Check if unique ID already exists
      if (financeUsers.some((user: FinanceUser) => user.uniqueId === registerData.uniqueId.trim())) {
        toast({
          title: "Registration Failed",
          description: "This Unique ID is already taken. Please choose another one.",
          variant: "destructive",
        });
        return;
      }

      const newFinanceUser: FinanceUser = {
        id: 'finance_' + Date.now(),
        name: registerData.name.trim(),
        financeName: registerData.financeName.trim(),
        uniqueId: registerData.uniqueId.trim()
      };

      const updatedFinanceUsers = [...financeUsers, newFinanceUser];
      localStorage.setItem('dfcs_finance_users', JSON.stringify(updatedFinanceUsers));

      toast({
        title: "Registration Successful",
        description: `Finance account created successfully! You can now login with Unique ID: ${newFinanceUser.uniqueId}`,
      });

      // Switch to login mode
      setMode('login');
      setRegisterData({ name: '', financeName: '', uniqueId: '', loanId: '' });

    } else {
      // Shopkeeper Registration
      if (!registerData.loanId.trim()) {
        toast({
          title: "Registration Failed",
          description: "Please enter your assigned Loan ID.",
          variant: "destructive",
        });
        return;
      }

      const loans = JSON.parse(localStorage.getItem('dfcs_loans') || '[]');
      const loan = loans.find((l: Loan) => l.loanId === registerData.loanId.trim());

      if (loan) {
        toast({
          title: "Registration Successful",
          description: `Shopkeeper account verified! You can now login with Loan ID: ${loan.loanId}`,
        });

        // Switch to login mode and set shopkeeper mode
        setMode('login');
        setLoginMode('shopkeeper');
        setRegisterData({ name: '', financeName: '', uniqueId: '', loanId: '' });
      } else {
        toast({
          title: "Registration Failed",
          description: "Invalid Loan ID. Please contact your finance person for the correct Loan ID.",
          variant: "destructive",
        });
      }
    }
  };

  const switchLoginMode = (newMode: 'finance' | 'shopkeeper') => {
    setLoginMode(newMode);
    setLoginData({ uniqueId: '', loanId: '' });
  };

  const switchMode = (newMode: 'login' | 'register') => {
    setMode(newMode);
    setLoginData({ uniqueId: '', loanId: '' });
    setRegisterData({ name: '', financeName: '', uniqueId: '', loanId: '' });
  };

  if (currentUser) {
    return <div className="min-h-screen flex items-center justify-center">Redirecting...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Building2 className="h-12 w-12 text-blue-600 mr-2" />
            <h1 className="text-3xl font-bold text-gray-900">DFCS</h1>
          </div>
          <p className="text-gray-600">Daily Finance Collection System</p>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-center">
              {mode === 'login' ? 'Login' : 'Register'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Mode Selection */}
            <div className="mb-6">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={mode === 'login' ? 'default' : 'outline'}
                  onClick={() => switchMode('login')}
                  className="w-full"
                >
                  <User className="mr-2 h-4 w-4" />
                  Login
                </Button>
                <Button
                  type="button"
                  variant={mode === 'register' ? 'default' : 'outline'}
                  onClick={() => switchMode('register')}
                  className="w-full"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Register
                </Button>
              </div>
            </div>

            {mode === 'login' ? (
              <>
                {/* Login Mode Selection */}
                <div className="mb-6">
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">Login As</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant={loginMode === 'finance' ? 'default' : 'outline'}
                      onClick={() => switchLoginMode('finance')}
                      className="w-full"
                    >
                      Finance Person
                    </Button>
                    <Button
                      type="button"
                      variant={loginMode === 'shopkeeper' ? 'default' : 'outline'}
                      onClick={() => switchLoginMode('shopkeeper')}
                      className="w-full"
                    >
                      Shopkeeper
                    </Button>
                  </div>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  {loginMode === 'finance' ? (
                    <div className="space-y-2">
                      <Label htmlFor="uniqueId">Unique ID</Label>
                      <Input
                        id="uniqueId"
                        name="uniqueId"
                        type="text"
                        value={loginData.uniqueId}
                        onChange={handleLoginInputChange}
                        placeholder="Enter your registered Unique ID"
                        required
                      />
                      <p className="text-xs text-gray-500">Enter the Unique ID you registered with</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="loanId">Loan ID</Label>
                      <Input
                        id="loanId"
                        name="loanId"
                        type="text"
                        value={loginData.loanId}
                        onChange={handleLoginInputChange}
                        placeholder="Enter your assigned Loan ID (e.g., SHKP2341)"
                        required
                      />
                      <p className="text-xs text-gray-500">Enter the Loan ID provided by your finance person</p>
                    </div>
                  )}

                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                    {loginMode === 'finance' ? 'Access Finance Dashboard' : 'Access My Loan Details'}
                  </Button>
                </form>
              </>
            ) : (
              <>
                {/* Registration Role Selection */}
                <div className="mb-6">
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">Register As</Label>
                  <RadioGroup
                    value={registerRole}
                    onValueChange={(value: 'finance' | 'shopkeeper') => setRegisterRole(value)}
                    className="grid grid-cols-2 gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="finance" id="finance" />
                      <Label htmlFor="finance">Finance Person</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="shopkeeper" id="shopkeeper" />
                      <Label htmlFor="shopkeeper">Shopkeeper</Label>
                    </div>
                  </RadioGroup>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                  {registerRole === 'finance' ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          value={registerData.name}
                          onChange={handleRegisterInputChange}
                          placeholder="Enter your full name"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="financeName">Finance Name</Label>
                        <Input
                          id="financeName"
                          name="financeName"
                          type="text"
                          value={registerData.financeName}
                          onChange={handleRegisterInputChange}
                          placeholder="Enter your finance company name"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="uniqueId">Unique ID</Label>
                        <Input
                          id="uniqueId"
                          name="uniqueId"
                          type="text"
                          value={registerData.uniqueId}
                          onChange={handleRegisterInputChange}
                          placeholder="Create a unique ID for login (e.g., FIN001)"
                          required
                        />
                        <p className="text-xs text-gray-500">This will be used to log in to your account</p>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="loanId">Loan ID</Label>
                      <Input
                        id="loanId"
                        name="loanId"
                        type="text"
                        value={registerData.loanId}
                        onChange={handleRegisterInputChange}
                        placeholder="Enter your assigned Loan ID (e.g., SHKP2341)"
                        required
                      />
                      <p className="text-xs text-gray-500">Enter the Loan ID provided by your finance person</p>
                    </div>
                  )}

                  <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                    Register {registerRole === 'finance' ? 'Finance Account' : 'Shopkeeper Account'}
                  </Button>
                </form>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
