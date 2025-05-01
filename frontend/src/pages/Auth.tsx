import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser, UserRole } from '../contexts/UserContext';
import { Card } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LoginForm from '../components/auth/LoginForm';
import SignupForm from '../components/auth/SignupForm';

// Component that renders the login/signup interface and manages navigation logic
const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, userRole } = useUser();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');

  // Extract 'role' query parameter to pre-select the corresponding tab (individual or institution)
  // Check URL params for role
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const roleParam = params.get('role') as UserRole;
    if (roleParam && (roleParam === 'individual' || roleParam === 'institution')) {
      // This was setting a local state that's now moved to child components
      // Can pass this as a prop to the forms 
    }
  }, [location.search]);

  // Redirect authenticated users to their respective dashboard based on userRole
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      if (userRole === 'individual') {
        navigate('/dashboard/individual');
      } else if (userRole === 'institution') {
        navigate('/dashboard/institution');
      }
    }
  }, [isAuthenticated, userRole, navigate]);

  // Render the page layout: navigation, authentication card with tabs, and footer
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Site navigation bar */}
      <Navbar />
      
      <div className="flex-grow flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-md animate-in from-bottom">
          <Card className="glass p-8 rounded-xl border-border">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-foreground">Welcome to SkillScope</h1>
              <p className="text-muted-foreground mt-2">Sign in or create an account to continue</p>
            </div>
            
            {/* Tabs to switch between Login and Sign Up views */}
            <Tabs defaultValue={activeTab} onValueChange={(value) => setActiveTab(value as 'login' | 'signup')} className="w-full">
              {/* Tab triggers for selecting login or signup */}
              <TabsList className="grid grid-cols-2 mb-6">
                <TabsTrigger value="login" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">Login</TabsTrigger>
                <TabsTrigger value="signup" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">Sign Up</TabsTrigger>
              </TabsList>
              
              {/* Display Login form */}
              <TabsContent value="login">
                <LoginForm />
              </TabsContent>
              
              {/* Display Sign Up form */}
              <TabsContent value="signup">
                <SignupForm />
              </TabsContent>
            </Tabs>

          </Card>
        </div>
      </div>
      
      {/* Site footer */}
      <Footer />
    </div>
  );
};

export default Auth;