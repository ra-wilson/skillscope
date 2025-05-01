import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { UserCircle, Building, Home, LogOut, BookOpen } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

const Navbar = () => {
  const { isAuthenticated, userRole, logout } = useUser();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [displayName, setDisplayName] = useState<string | null>(null);
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch the current user doc to get name or institutionName
  useEffect(() => {
    const fetchUserDisplayName = async () => {
      if (!isAuthenticated || !auth.currentUser) return;

      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.role === 'individual' && data.name) {
          setDisplayName(data.name);
        } else if (data.role === 'institution' && data.institutionName) {
          setDisplayName(data.institutionName);
        }
      }
    };

    fetchUserDisplayName();
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const goToProfile = () => {
    navigate('/profile');
  };


  return (
    <header 
      className={`navbar fixed top-0 left-0 right-0 z-10 transition-all duration-300 px-6 py-3 ${
        scrolled ? 'shadow-md bg-background/90' : 'bg-background/70'
      }`}
    >
      <div className="container mx-auto flex items-center justify-between">
        <Link 
          to="/" 
          className="flex items-center space-x-2"
        >
          <span className="text-xl font-semibold text-foreground">SkillScope</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <Link 
            to="/" 
            className={`text-muted-foreground hover:text-green-500 transition-colors ${location.pathname === '/' ? 'text-green-500 font-medium' : ''}`}
          >
            Home
          </Link>

          {isAuthenticated && userRole === 'individual' && (
            <>
              <Link 
                to="/dashboard/individual" 
                className={`text-muted-foreground hover:text-green-500 transition-colors ${location.pathname === '/dashboard/individual' ? 'text-green-500 font-medium' : ''}`}
              >
                Dashboard
              </Link>
              <Link 
                to="/recommendations" 
                className={`text-muted-foreground hover:text-green-500 transition-colors ${location.pathname === '/recommendations' ? 'text-green-500 font-medium' : ''}`}
              >
                Recommendations
              </Link>
            </>
          )}

          {isAuthenticated && userRole === 'institution' && (
            <Link 
              to="/dashboard/institution" 
              className={`text-muted-foreground hover:text-green-500 transition-colors ${location.pathname === '/dashboard/institution' ? 'text-green-500 font-medium' : ''}`}
            >
              Dashboard
            </Link>
          )}
        </nav>

        <div className="flex items-center space-x-3">
          {isAuthenticated ? (
            <>
              <div className="hidden md:block text-sm text-muted-foreground mr-2">
                {userRole === 'individual' ? (
                  <span className="flex items-center"><UserCircle size={16} className="mr-1" /> Individual</span>
                ) : (
                  <span className="flex items-center"><Building size={16} className="mr-1" /> Institution</span>
                )}
              </div>
              {displayName && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goToProfile}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {displayName}
                </Button>
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
              >
                <LogOut size={16} className="mr-1" /> 
                <span className="hidden md:inline">Logout</span>
              </Button>
            </>
          ) : (
            <Button 
              onClick={() => navigate('/auth')}
              size="sm"
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
