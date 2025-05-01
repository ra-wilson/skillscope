import { Link } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { useTheme } from '../contexts/ThemeContext';

const Footer = () => {
  const { theme } = useTheme();
  const { isAuthenticated, userRole } = useUser();
  const isDarkMode = theme === 'dark';

  return (
    <footer className={`border-t py-12 mt-20 ${isDarkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-black border-gray-200'}`}>
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${isDarkMode ? 'bg-green-400 text-gray-800' : 'bg-green-500 text-white'}`}>S</div>
              <span className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>SkillScope</span>
            </div>
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Bridging the gap between individual skills and market demands through data-driven insights.
            </p>
          </div>
          
          <div className="space-y-4">
            <h4 className={`font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Navigation</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className={`transition-colors ${isDarkMode ? 'text-gray-300 hover:text-green-400' : 'text-gray-600 hover:text-green-500'}`}>Home</Link></li>
              <li>
                {!isAuthenticated ? (
                  <Link to="/auth" className={`transition-colors ${isDarkMode ? 'text-gray-300 hover:text-green-400' : 'text-gray-600 hover:text-green-500'}`}>
                    Login
                  </Link>
                ) : (
                  <Link
                    to={userRole === 'institution' ? '/dashboard/institution' : '/dashboard/individual'}
                    className={`transition-colors ${isDarkMode ? 'text-gray-300 hover:text-green-400' : 'text-gray-600 hover:text-green-500'}`}
                  >
                    Dashboard
                  </Link>
                )}
              </li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h4 className={`font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="https://rapidapi.com/Pat92/api/jobs-api14" className={`transition-colors ${isDarkMode ? 'text-gray-300 hover:text-green-400' : 'text-gray-600 hover:text-green-500'}`}>API Reference</a></li>
            </ul>
          </div>
          
          
        </div>
      </div>
    </footer>
  );
};

export default Footer;
