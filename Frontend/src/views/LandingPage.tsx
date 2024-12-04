import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, ResponsiveContainer, CartesianGrid, XAxis, YAxis } from 'recharts';
import { ArrowRight, LayoutDashboard, Mail, Clock } from 'lucide-react';

const useIntersectionObserver = (options: IntersectionObserverInit) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, options);

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (observer && observer.disconnect) observer.disconnect();
    };
  }, [ref, options]);

  return [ref, isVisible];
};


const Input = ({ className, ...props }: { className?: string; [key: string]: any }) => (
  <input
    {...props}
    className={`p-2.5 sm:p-3 bg-gray-800/50 border border-gray-700/50 text-gray-300 placeholder-gray-500 text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500/30 ${className}`}
  />
);

const Button = ({ className, ...props }: { className?: string; [key: string]: any }) => (
  <button
    {...props}
    className={`px-3 sm:px-4 py-2.5 text-sm font-medium rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500/30 ${className}`}
  />
);

const LandingPage = () => {
  const [email, setEmail] = useState('');
  const [animatedData, setAnimatedData] = useState<{ value: number }[]>([]);

  // Intersection Observer for StatsCard
  const [statsRef, statsVisible] = useIntersectionObserver({
    threshold: 0.1,
  }) as [React.MutableRefObject<HTMLDivElement | null>, boolean];

  // Initial Data Sets
  const lineData = [
    { value: 10 }, { value: 40 }, { value: 30 },
    { value: 50 }, { value: 45 }, { value: 60 }
  ];
  
  const areaData = [
    { value: 20 }, { value: 45 }, { value: 35 },
    { value: 55 }, { value: 40 }, { value: 65 }
  ];
  
  const barData = [
    { value: 15 }, { value: 35 }, { value: 25 },
    { value: 45 }, { value: 35 }, { value: 55 }
  ];

  // Animation effect for Line Chart data
  useEffect(() => {
    const animateData = () => {
      const newData = lineData.map(item => ({
        value: Math.max(0, Math.min(100, item.value + (Math.random() * 10 - 5)))
      }));
      setAnimatedData(newData);
    };

    // Initial animation
    animateData();

    const interval = setInterval(animateData, 1500);
    return () => clearInterval(interval);
  }, []);

  // Custom Cursor Effect
  useEffect(() => {
    const cursor = document.createElement('div');
    cursor.classList.add('custom-cursor');
    document.body.appendChild(cursor);

    const moveCursor = (e: { clientX: any; clientY: any; }) => {
      cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    };

    window.addEventListener('mousemove', moveCursor);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      cursor.remove();
    };
  }, []);

  return (
    <>      
      <div
        className="min-h-screen w-full bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 bg-grid-white relative"
        onTouchStart={() => { /* Handle touch start */ }}
        onTouchMove={() => { /* Handle touch move */ }}
      >
        {/* Grain Overlay */}
        <div className="grain-overlay"></div>
        
        {/* Navbar with Glassmorphism */}
        <nav className="sticky top-0 z-50 backdrop-blur-md bg-gray-950/60 border-b border-gray-800/50">
          <div className="w-full mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
                  <div className="relative bg-gray-900 rounded-xl p-2">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400 font-bold text-lg">TW</span>
                  </div>
                </div>
                <span className="text-white font-medium text-xl">TrackWise</span>
              </div>
              {/* Additional Navbar Items (if any) can be added here */}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="relative max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-16 sm:py-24 flex flex-col items-center justify-center">
          {/* Hero Section with Bold Typography */}
          <div className="max-w-3xl text-center">
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-cabinet-grotesk font-bold text-white mb-6 leading-tight fade-in-up">
              Track Your
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400 mt-2">
                Career Journey
              </span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-300 mb-8 leading-relaxed mx-auto max-w-2xl font-cabinet-grotesk fade-in-up">
              Intelligent tracking and analytics to help you land your dream job faster
            </p>

            {/* Waitlist Form with Glassmorphism & Neumorphism */}
            <div className="max-w-md mx-auto relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-lg blur opacity-20 clip-path-blob"></div>
              <div className="relative flex flex-col sm:flex-row gap-2 p-1.5 sm:p-2 backdrop-blur-xl bg-gray-900/80 rounded-md">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e: { target: { value: React.SetStateAction<string>; }; }) => setEmail(e.target.value)}
                  className="flex-1 h-10 px-3 bg-gray-800/50 border border-gray-700/50 text-gray-300 placeholder:text-gray-500 text-sm rounded-md focus-visible:ring-emerald-500/30"
                />
                <Button className="h-10 px-4 sm:w-auto text-sm font-medium bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-md transition-all duration-300 hover:scale-105">
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Join Waitlist
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Grid with Different Chart Types */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8 mt-24 mb-24 px-2 sm:px-6 mx-auto w-full max-w-6xl">
            <StatsCard 
              title="Application Trends" 
              description="Real-time view of your application progress"
              data={animatedData.length ? animatedData : lineData}
              type="line"
              ref={statsRef}
              isVisible={statsVisible}
            />
            <StatsCard 
              title="Success Rate" 
              description="Track your application success over time"
              data={areaData}
              type="area"
              ref={statsRef}
              isVisible={statsVisible}
            />
            <StatsCard 
              title="Weekly Progress" 
              description="Applications submitted per week"
              data={barData}
              type="bar"
              ref={statsRef}
              isVisible={statsVisible}
            />
          </div>

          {/* Features Grid with Material Design Influence */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-12 sm:mt-16 w-full px-2 sm:px-6">
            <FeatureCard
              title="Smart Dashboard"
              description="Visual overview of your entire job search process"
            />
            <FeatureCard
              title="Email Integration"
              description="Automatically import applications from your inbox"
            />
            <FeatureCard
              title="Progress Tracking"
              description="Never miss an important application deadline"
            />
          </div>
        </div>

        {/* Floating Action Button */}
        <button className="fixed bottom-6 right-6 p-4 rounded-full bg-gradient-to-r from-emerald-500 to-blue-500 shadow-lg shadow-emerald-500/20 hover:scale-110 transition-transform">
          <LayoutDashboard className="w-6 h-6 text-white" />
        </button>
      </div>
    </>
  );
};


// Define the shape of your data points
interface DataPoint {
  value: number;
}

// Define the props for the StatsCard component
interface StatsCardProps {
  title: string;
  description: string;
  data: DataPoint[];
  type: 'line' | 'area' | 'bar';
  isVisible: boolean;
}

// ForwardRef is used if you need to pass refs to the component
const StatsCard = React.forwardRef<HTMLDivElement, StatsCardProps>(
  ({ title, description, data, type, isVisible }, ref) => {
    let ChartComponent: React.ReactElement = <div />;

    if (type === 'line') {
      ChartComponent = (
        <LineChart data={data}>
          <defs>
            <linearGradient id="gradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
          <Line
            type="monotone"
            dataKey="value"
            stroke="url(#gradient)"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      );
    } else if (type === 'area') {
      ChartComponent = (
        <AreaChart data={data}>
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34d399" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke="url(#gradient)"
            fill="url(#areaGradient)"
            strokeWidth={2}
            isAnimationActive={false}
          />
        </AreaChart>
      );
    } else if (type === 'bar') {
      ChartComponent = (
        <BarChart data={data}>
          <defs>
            <linearGradient id="gradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
          <Bar
            dataKey="value"
            fill="url(#gradient)"
            radius={[4, 4, 0, 0]}
            isAnimationActive={false}
          />
        </BarChart>
      );
    }

    return (
      <div
        ref={ref}
        className={`group relative w-full fade-in-up ${
          isVisible ? 'visible' : ''
        } stats-card`}
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/50 to-blue-500/50 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
        <div className="relative p-4 backdrop-blur-xl bg-gray-900/80 rounded-3xl border border-gray-800/50 transition duration-300 hover:translate-y-[-2px] w-full">
          <div className="flex flex-col space-y-2 mb-2">
            <h3 className="font-semibold text-white">{title}</h3>
            <p className="text-gray-400 text-sm">{description}</p>
          </div>

          <div className="w-full h-[100px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              {ChartComponent}
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  }
);

interface FeatureCardProps {
  title: string;
  description: string;
}

const FeatureCard = ({ title, description }: FeatureCardProps) => {
  const getIcon = () => {
    switch (title) {
      case 'Smart Dashboard':
        return <LayoutDashboard className="w-6 h-6 text-emerald-400" strokeWidth={1.5} aria-label="Smart Dashboard Icon" />;
      case 'Email Integration':
        return <Mail className="w-6 h-6 text-emerald-400" strokeWidth={1.5} aria-label="Email Integration Icon" />;
      case 'Progress Tracking':
        return <Clock className="w-6 h-6 text-emerald-400" strokeWidth={1.5} aria-label="Progress Tracking Icon" />;
      default:
        return null;
    }
  };

  return (
    <div className="group relative w-full">
      <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/50 to-blue-500/50 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
      <div className="relative p-6 sm:p-4 backdrop-blur-xl bg-gray-900/80 rounded-3xl border border-gray-800/50 transition duration-300 hover:translate-y-[-2px] w-full group">
        {/* Icon Container */}
        <div className="flex items-center mb-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r from-emerald-500/10 to-blue-500/10 group-hover:from-emerald-500/20 group-hover:to-blue-500/20 transition-colors">
            {getIcon()}
          </div>
          <h3 className="font-semibold text-white ml-4">{title}</h3>
        </div>
        <p className="text-gray-400 text-sm">{description}</p>
      </div>
    </div>
  );
};

export default LandingPage;
