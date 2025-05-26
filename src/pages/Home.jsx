import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Code, Users, Zap, Shield, Globe, Sparkles } from 'lucide-react';

const Home = () => {
  const features = [
    {
      icon: Code,
      title: 'Real-time Collaboration',
      description: 'Code together with your team in real-time with instant synchronization.'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Optimized performance for smooth coding experience even with large files.'
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Bank-level security with end-to-end encryption for your code.'
    },
    {
      icon: Globe,
      title: 'Global Access',
      description: 'Access your code from anywhere in the world with cloud synchronization.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
              Code
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {" "}Together
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Professional real-time collaborative code editor designed for enterprise teams. 
              Experience seamless development with advanced features and enterprise-grade security.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/editor"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <span>Start Coding</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/demo"
                className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-semibold hover:border-blue-600 hover:text-blue-600 transition-all duration-200"
              >
                Watch Demo
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Enterprise-Grade Features
            </h2>
            <p className="text-xl text-gray-600">
              Built for teams that demand the best in collaborative development
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="text-center p-6 rounded-xl hover:shadow-lg transition-shadow duration-200"
              >
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Transform Your Development Workflow?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of developers and teams already using CodeSync Pro
          </p>
          <Link
            to="/signup"
            className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 inline-flex items-center space-x-2"
          >
            <span>Get Started Free</span>
            <Sparkles className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
