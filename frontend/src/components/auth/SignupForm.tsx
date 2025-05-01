import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { UserRole } from '@/contexts/UserContext';
import { useToaster } from '@/hooks/use-sonner';
import { useUser } from '@/contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import RoleSelector from './RoleSelector';
import { signupUser } from '@/lib/authService';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Check, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
/**
 * Signup Form Component
 * Handles user registration for both individual and institutional users
 * Includes validation, error handling, and institution selection
 */

// Defines the criteria used to validate password strength
interface PasswordValidation {
  hasMinLength: boolean;
  hasUpperCase: boolean;
  hasLowerCase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

const SignupForm = () => {
  const navigate = useNavigate();
  const { login } = useUser();
  const { toast } = useToaster();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('individual');
  const [selectedInstitutionId, setSelectedInstitutionId] = useState('');
  const [institutions, setInstitutions] = useState<{ id: string; name: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState<PasswordValidation>({
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

/**
 * Validates each password rule and returns an object indicating which are met
 */
const validatePassword = (password: string): PasswordValidation => ({
    hasMinLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  });

// Checks that all password validation flags are true
const isPasswordValid = (validation: PasswordValidation): boolean => {
    return Object.values(validation).every(requirement => requirement);
  };

  // Load available institutions from Firestore when component mounts
  useEffect(() => {
    const loadInstitutions = async () => {
      const snap = await getDocs(collection(db, 'institutions'));
      const list: { id: string; name: string }[] = [];
      snap.forEach(doc => {
        list.push({ id: doc.id, ...(doc.data() as { name: string }) });
      });
      setInstitutions(list);
    };
    loadInstitutions();
  }, []);

  // Recalculate password validation state when the password value changes
  useEffect(() => {
    setPasswordValidation(validatePassword(password));
  }, [password]);

  // Validates email format and enforces .ac.uk domain for institutional roles
  const validateEmail = (email: string, role: UserRole): boolean => {
    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return false;
    }
    
    // Institutional accounts must have .ac.uk email
    if (role === 'institution' && !email.toLowerCase().endsWith('.ac.uk')) {
      return false;
    }
    
    return true;
  };

  // Handles form submission: performs validations, attempts signup, and handles responses
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Client-side validation
    if (!email || !password || !name) {
      setError('Please fill in all required fields.');
      setIsLoading(false);
      return;
    }

    if (!isPasswordValid(passwordValidation)) {
      setError('Please ensure your password meets all the requirements.');
      setIsLoading(false);
      return;
    }

    // Email validation for institutional accounts
    if (selectedRole === 'institution' && !email.toLowerCase().endsWith('@ac.uk')) {
      setError('Institutional accounts require a valid .ac.uk email address.');
      setIsLoading(false);
      return;
    }

    try {
      const uid = await signupUser(email, password, selectedRole, name, selectedInstitutionId || undefined);
      login(selectedRole);
      toast({ 
        title: 'Success', 
        description: `Successfully signed up as ${selectedRole}`, 
        variant: 'success' 
      });
      navigate(selectedRole === 'individual' ? '/dashboard/individual' : '/dashboard/institution');
    } catch (err: any) {
      const errorMessage = (() => {
        switch (err.code) {
          case 'auth/email-already-in-use':
            return 'This email address is already registered. Please try logging in instead.';
          case 'auth/invalid-email':
            return 'Please enter a valid email address.';
          case 'auth/weak-password':
            return 'Password is too weak. Please ensure it meets all the requirements.';
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

  // Component to display an individual password requirement with status icon
  const PasswordRequirement = ({ label, isValid }: { label: string; isValid: boolean }) => (
    <div className="flex items-start gap-2 text-sm">
      {isValid ? (
        <Check className="h-4 w-4 flex-shrink-0 text-green-500" />
      ) : (
        <X className="h-4 w-4 flex-shrink-0 text-red-500" />
      )}
      <span className={isValid ? 'text-green-500' : 'text-red-500'}>{label}</span>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Display error alert if submission fails */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Name or Institution Name input based on selected role */}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-foreground">
          {selectedRole === 'individual' ? 'Full Name' : 'Institution Name'}
          <span className="text-red-500 ml-1" aria-hidden="true">*</span>
        </Label>
        <Input
          id="name"
          type="text"
          placeholder={selectedRole === 'individual' ? 'John Doe' : 'University of X'}
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isLoading}
          required
        />
      </div>

      {/* Email input; requires .ac.uk for institutions */}
      <div className="space-y-2">
        <Label htmlFor="signup-email" className="text-foreground">
          Email{selectedRole === 'institution' && ' (.ac.uk required)'}
          <span className="text-red-500 ml-1" aria-hidden="true">*</span>
        </Label>
        <Input
          id="signup-email"
          type="email"
          placeholder={selectedRole === 'institution' ? 'admin@university.ac.uk' : 'your@email.com'}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          required
        />
      </div>

      {/* Password input and real-time validation feedback */}
      <div className="space-y-2">
        <Label htmlFor="signup-password" className="text-foreground">
          Password
          <span className="text-red-500 ml-1" aria-hidden="true">*</span>
        </Label>
        <Input
          id="signup-password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          required
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 max-w-lg">
          <PasswordRequirement 
            label="At least 8 characters" 
            isValid={passwordValidation.hasMinLength} 
          />
          <PasswordRequirement 
            label="At least one uppercase letter" 
            isValid={passwordValidation.hasUpperCase} 
          />
          <PasswordRequirement 
            label="At least one lowercase letter" 
            isValid={passwordValidation.hasLowerCase} 
          />
          <PasswordRequirement 
            label="At least one number" 
            isValid={passwordValidation.hasNumber} 
          />
          <PasswordRequirement 
            label="At least one special character" 
            isValid={passwordValidation.hasSpecialChar} 
          />
        </div>
      </div>

      {/* Optional institution selector for individuals */}
      {selectedRole === 'individual' && (
        <div className="space-y-2">
          <Label htmlFor="institution" className="text-foreground">
            Select Institution (optional)
          </Label>
          <Select
            value={selectedInstitutionId}
            onValueChange={(val) => {
              setSelectedInstitutionId(val === 'none' ? '' : val);
            }}
          >
            <SelectTrigger id="institution" className="w-full">
              <SelectValue placeholder="Select institution" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {institutions.map((inst) => (
                <SelectItem key={inst.id} value={inst.id}>
                  {inst.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Role selector toggles between individual and institution signup */}
      <RoleSelector selectedRole={selectedRole} setSelectedRole={setSelectedRole} />

      {/* Submit button (disabled while loading) */}
      <Button
        type="submit"
        className="w-full bg-green-500 hover:bg-green-600 text-white mt-6"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating account...
          </>
        ) : (
          'Create Account'
        )}
      </Button>
    </form>
  );
};

export default SignupForm;