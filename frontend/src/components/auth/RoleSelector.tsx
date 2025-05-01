import { Button } from '@/components/ui/button';
import { UserCircle, Building } from 'lucide-react';
import { UserRole } from '@/contexts/UserContext';

interface RoleSelectorProps {
  selectedRole: UserRole;
  setSelectedRole: (role: UserRole) => void;
}

const RoleSelector = ({ selectedRole, setSelectedRole }: RoleSelectorProps) => {
  return (
    <div className="pt-2">
      <p className="text-sm font-medium text-foreground mb-3">Login as:</p>
      <div className="grid grid-cols-2 gap-4">
        <Button
          type="button"
          variant={selectedRole === 'individual' ? 'default' : 'outline'}
          className={`flex items-center justify-center py-6 ${
            selectedRole === 'individual' 
              ? 'bg-green-500 hover:bg-green-600 text-white dark:text-white' 
              : 'border-input hover:bg-accent hover:text-accent-foreground'
          }`}
          onClick={() => setSelectedRole('individual')}
        >
          <UserCircle className="h-5 w-5 mr-2" />
          Individual
        </Button>
        
        <Button
          type="button"
          variant={selectedRole === 'institution' ? 'default' : 'outline'}
          className={`flex items-center justify-center py-6 ${
            selectedRole === 'institution' 
              ? 'bg-green-500 hover:bg-green-600 text-white dark:text-white' 
              : 'border-input hover:bg-accent hover:text-accent-foreground'
          }`}
          onClick={() => setSelectedRole('institution')}
        >
          <Building className="h-5 w-5 mr-2" />
          Institution
        </Button>
      </div>
    </div>
  );
};

export default RoleSelector;
