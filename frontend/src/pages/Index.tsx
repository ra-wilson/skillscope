import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ArrowRight, BarChart, BookOpen, User, Building } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative w-full pb-20 md:pt-40 md:pb-28">
       
        
        <div className="container mx-auto relative">
          <div className="max-w-4xl mx-auto text-center animate-in from-top">
            <h1 className="text-4xl font-bold text-foreground sm:text-5xl md:text-6xl tracking-tight mb-6">
              Bridge Your <span className="text-green-500">Skills Gap</span> with Market Insights
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
              SkillScope helps individuals evaluate their software engineering skills against real market demand, and guides institutions with data-driven insights.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button 
                onClick={() => navigate('/auth')}
                size="lg"
                className="bg-green-500 hover:bg-green-600 text-white px-8 py-6 h-auto rounded-md"
              >
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline"
                size="lg"
                className="border-green-500 text-green-500 hover:bg-green-50 dark:hover:bg-green-950 px-8 py-6 h-auto rounded-md"
                onClick={() => {
                  const featuresSection = document.getElementById('features');
                  featuresSection?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section id="features" className="py-20 bg-muted">
        <div className="container px-6 mx-auto">
          <div className="text-center mb-16 animate-in from-bottom">
            <h2 className="text-3xl font-bold text-foreground mb-4">How SkillScope Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our platform connects individuals with market data to provide actionable insights for skill development.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="glass p-8 rounded-xl animate-in from-left animate-delay-100">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
                <User className="h-6 w-6 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Individual Assessment</h3>
              <p className="text-muted-foreground">
                Evaluate your engineering skills across different domains and get personalised insights on areas to improve.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="glass p-8 rounded-xl animate-in from-bottom animate-delay-300">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
                <BarChart className="h-6 w-6 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Market Analytics</h3>
              <p className="text-muted-foreground">
                Access real-time data visualisations showing demand, growth, and salary trends for software engineering skills.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="glass p-8 rounded-xl animate-in from-right animate-delay-500">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Learning Recommendations</h3>
              <p className="text-muted-foreground">
                Receive tailored course recommendations to help you bridge your skills gap with market demands.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Who Benefits Section */}
      <section className="py-20 bg-background">
        <div className="container px-6 mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">Who Benefits from SkillScope?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our platform serves both individuals seeking career growth and institutions looking for data-driven insights.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 justify-items-center">
            {/* Individual Reasons */}
            <div className="space-y-4 max-w-md">
              <div className="flex items-center space-x-3">
                <User className="h-8 w-8 text-green-500" />
                <h3 className="text-2xl font-semibold">For Individuals</h3>
              </div>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 rounded-full bg-green-500 flex items-center justify-center mt-1">
                    <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="ml-3">Evaluate your current skill levels</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 rounded-full bg-green-500 flex items-center justify-center mt-1">
                    <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="ml-3">Compare your skills with market demand</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 rounded-full bg-green-500 flex items-center justify-center mt-1">
                    <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="ml-3">Get personalised course recommendations</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 rounded-full bg-green-500 flex items-center justify-center mt-1">
                    <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="ml-3">Track your progress over time</span>
                </li>
              </ul>
            </div>
            {/* Institutional Reasons */}
            <div className="space-y-4 max-w-md">
              <div className="flex items-center space-x-3">
                <Building className="h-8 w-8 text-green-500" />
                <h3 className="text-2xl font-semibold">For Institutions</h3>
              </div>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 rounded-full bg-green-500 flex items-center justify-center mt-1">
                    <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="ml-3">Access comprehensive skill demand data</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 rounded-full bg-green-500 flex items-center justify-center mt-1">
                    <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="ml-3">Visualise market trends with interactive charts</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 rounded-full bg-green-500 flex items-center justify-center mt-1">
                    <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="ml-3">Analyse skill gaps in the industry</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 rounded-full bg-green-500 flex items-center justify-center mt-1">
                    <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="ml-3">Make data-driven curriculum decisions</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-green-500 text-white">
        <div className="container px-6 mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Bridge the Skills Gap?</h2>
            <p className="text-xl mb-10 opacity-90">
              Join SkillScope today and take the first step towards aligning your skills with market demands.
            </p>
            <Button 
              onClick={() => navigate('/auth')}
              size="lg"
              className="bg-white text-green-500 hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-800 dark:text-white px-8 py-6 h-auto rounded-md"
            >
              Get Started Now
            </Button>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;
