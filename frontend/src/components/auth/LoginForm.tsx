import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToaster } from '@/hooks/use-sonner';
import { useUser, UserRole } from '@/contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import RoleSelector from './RoleSelector';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';

const LoginForm = () => {
  const navigate = useNavigate();
  const { login } = useUser();
  const { toast } = useToaster();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('individual');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    // Validate email domain for institutions
    if (selectedRole === 'institution' && !email.toLowerCase().endsWith('.ac.uk')) {
      setError("Institution accounts must use an academic email address (ending in .ac.uk)");
      return;
    }

    setIsLoading(true);

    try {
      // Firebase login
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      login(selectedRole);

      toast({ 
        title: "Welcome back!", 
        description: `Successfully logged in as ${selectedRole}`, 
        variant: "success" 
      });

      // Redirect
      if (selectedRole === 'individual') {
        navigate('/dashboard/individual');
      } else {
        navigate('/dashboard/institution');
      }
    } catch (error: any) {
      // Handle specific Firebase auth errors
      const errorMessage = (() => {
        switch (error.code) {
          case 'auth/invalid-credential':
            return 'Invalid email or password. Please check your credentials and try again.';
          case 'auth/user-not-found':
            return 'No account found with this email address.';
          case 'auth/wrong-password':
            return 'Incorrect password. Please try again.';
          case 'auth/too-many-requests':
            return 'Too many failed attempts. Please try again later.';
          case 'auth/network-request-failed':
            return 'Network error. Please check your connection and try again.';
          default:
            return 'An unexpected error occurred. Please try again.';
        }
      })();

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="email" className="text-foreground">
          Email
          <span className="text-red-500 ml-1" aria-hidden="true">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          placeholder={selectedRole === 'institution' ? "university@university.ac.uk" : "your@email.com"}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password" className="text-foreground">
          Password
          <span className="text-red-500 ml-1" aria-hidden="true">*</span>
        </Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          required
        />
      </div>
      
      <RoleSelector selectedRole={selectedRole} setSelectedRole={setSelectedRole} />

      <Button 
        type="submit" 
        className="w-full bg-green-500 hover:bg-green-600 text-white mt-6"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          'Login'
        )}
      </Button>
    </form>
  );
};

export default LoginForm;