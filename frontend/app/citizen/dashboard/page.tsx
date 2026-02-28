'use client';

import React, { useState, useEffect } from 'react';
import { 
  Recycle, AlertTriangle, MapPin, Bell, Trash2, Calendar, BarChart, 
  Award, Leaf, TrendingUp, Clock, CheckCircle, Star, Users, 
  Target, Zap, Globe, TreePine, Sparkles, ChevronRight, Share2, Crown, Trophy,
  Facebook, Linkedin, Twitter, Instagram, Gift, Coins
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import DashboardLayout from '@/components/dashboard-layout';

// Custom Social Media Icons
const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const TwitterIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
  </svg>
);

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

export default function CitizenDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [showSocialShare, setShowSocialShare] = useState(false);
  const [newAchievement, setNewAchievement] = useState(null);
  const [showCoinAnimation, setShowCoinAnimation] = useState(false);
  const [recentCoinsEarned, setRecentCoinsEarned] = useState(0);
  const [coinHistory, setCoinHistory] = useState([]);
  
  // Enhanced environmental data with detailed points and achievements
  const environmentalData = {
    co2Saved: 145, // kg this month
    wasteRecycled: 85, // percentage
    pointsEarned: 2750, // Total coins/points
    totalCoins: 2750, // Same as points but emphasizing "coins"
    coinsThisMonth: 450, // New coins this month
    rankInNeighborhood: 3, // Better rank
    streakDays: 45,
    totalReports: 18,
    socialCredits: 850, // New social recognition score
    nextMilestone: 3000, // Next target for social media feature
    currentBadge: 'Eco Champion',
    badgeLevel: 4,
    coinsPerReport: 50, // Base coins per report
    bonusMultiplier: 1.5 // Current bonus multiplier
  };

  // Recent coin transactions/earnings
  const recentEarnings = [
    {
      id: 1,
      action: 'Report Submitted',
      coins: 75,
      time: '2 hours ago',
      type: 'report',
      bonus: 'High Priority Bonus +25'
    },
    {
      id: 2,
      action: 'Streak Bonus',
      coins: 25,
      time: '1 day ago',
      type: 'streak',
      bonus: '45-day streak milestone'
    },
    {
      id: 3,
      action: 'Report Submitted',
      coins: 50,
      time: '3 days ago',
      type: 'report',
      bonus: null
    },
    {
      id: 4,
      action: 'Quality Bonus',
      coins: 30,
      time: '5 days ago',
      type: 'quality',
      bonus: '95% AI Confidence'
    }
  ];

  // Simulate coin earning (this would be called from report submission)
  const simulateCoinsEarned = (amount) => {
    setRecentCoinsEarned(amount);
    setShowCoinAnimation(true);
    
    // Add to coin history
    const newEarning = {
      id: Date.now(),
      action: 'Report Submitted',
      coins: amount,
      time: 'Just now',
      type: 'report',
      bonus: amount > 50 ? `Bonus +${amount - 50}` : null
    };
    
    setCoinHistory(prev => [newEarning, ...prev.slice(0, 4)]);
    
    // Hide animation after 3 seconds
    setTimeout(() => {
      setShowCoinAnimation(false);
      setRecentCoinsEarned(0);
    }, 3000);
  };

  // Achievement system
  const achievements = [
    {
      id: 1,
      title: 'First Reporter',
      description: 'Submitted your first waste report',
      points: 50,
      icon: '🎯',
      unlocked: true,
      unlockedAt: '2026-01-15'
    },
    {
      id: 2,
      title: 'Streak Master',
      description: 'Maintained 30-day activity streak',
      points: 200,
      icon: '🔥',
      unlocked: true,
      unlockedAt: '2026-02-20'
    },
    {
      id: 3,
      title: 'Eco Champion',
      description: 'Earned 2500+ points',
      points: 500,
      icon: '🏆',
      unlocked: true,
      unlockedAt: '2026-02-28',
      socialShare: true
    },
    {
      id: 4,
      title: 'Community Hero',
      description: 'Reach 3000 points for social media recognition',
      points: 750,
      icon: '🌟',
      unlocked: false,
      nextTarget: true
    },
    {
      id: 5,
      title: 'Environmental Ambassador',
      description: 'Reach top 3 in neighborhood ranking',
      points: 1000,
      icon: '👑',
      unlocked: true,
      unlockedAt: '2026-03-01',
      socialShare: true
    }
  ];

  // Social media milestones
  const socialMilestones = [
    {
      title: 'Community Hero Recognition',
      points: 3000,
      platforms: ['Facebook', 'LinkedIn', 'Twitter'],
      completed: false,
      progress: (environmentalData.pointsEarned / 3000) * 100
    },
    {
      title: 'Eco Ambassador Feature',
      points: 5000,
      platforms: ['Facebook', 'LinkedIn', 'Twitter', 'Instagram'],
      completed: false,
      progress: (environmentalData.pointsEarned / 5000) * 100
    }
  ];

  // Handle social media sharing
  const shareOnSocialMedia = (platform: string, achievement: any) => {
    const message = `🌱 Proud to be recognized as an ${achievement.title} by Smart Garbage Management System! Contributing to a cleaner, greener community. #EcoWarrior #SmartCity #EnvironmentalHero`;
    
    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(message)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}&summary=${encodeURIComponent(message)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`
    };

    window.open(urls[platform.toLowerCase()], '_blank', 'width=600,height=400');
  };

  // Auto-trigger social sharing for new achievements
  const checkForNewAchievements = () => {
    const latestAchievement = achievements.find(a => 
      a.unlocked && a.socialShare && a.unlockedAt === '2026-03-01'
    );
    
    if (latestAchievement && !newAchievement) {
      setNewAchievement(latestAchievement);
      setShowSocialShare(true);
    }
  };

  // Check on component mount
  useEffect(() => {
    checkForNewAchievements();
  }, []);

  const weeklyStats = [
    { day: 'Mon', recycled: 85 },
    { day: 'Tue', recycled: 92 },
    { day: 'Wed', recycled: 78 },
    { day: 'Thu', recycled: 96 },
    { day: 'Fri', recycled: 89 },
    { day: 'Sat', recycled: 94 },
    { day: 'Sun', recycled: 87 }
  ];

  return (
    <DashboardLayout userType="citizen" userName="John Citizen">
      <div className="min-h-full bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        
        {/* Hero Welcome Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-[#5770fe] via-[#4f63ee] to-[#320e2f] text-white">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white/10 rounded-full"></div>
          <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-24 h-24 bg-white/10 rounded-full"></div>
          
          <div className="relative p-8 lg:p-12">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col lg:flex-row items-center justify-between">
                <div className="mb-6 lg:mb-0">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4">
                      <Sparkles className="h-6 w-6" />
                    </div>
                    <div>
                      <h1 className="text-3xl lg:text-4xl font-bold">Welcome back, John!</h1>
                      <p className="text-blue-100 text-lg">Keep up the great environmental work 🌱</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="text-center relative">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <span className="text-3xl">🪙</span>
                        <div className="text-3xl font-bold">{environmentalData.totalCoins.toLocaleString()}</div>
                        {showCoinAnimation && (
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 animate-bounce">
                            <span className="text-green-300 font-bold text-lg">+{recentCoinsEarned}</span>
                          </div>
                        )}
                      </div>
                      <div className="text-green-100 text-sm">Eco Coins</div>
                      <Progress 
                        value={(environmentalData.pointsEarned / environmentalData.nextMilestone) * 100} 
                        className="mt-1 h-1 bg-white/20" 
                      />
                      <div className="text-xs text-yellow-200 mt-1">+{environmentalData.coinsThisMonth} this month</div>
                    </div>
                    <Separator orientation="vertical" className="h-16 bg-white/20" />
                    <div className="text-center">
                      <div className="text-2xl font-bold">#{environmentalData.rankInNeighborhood}</div>
                      <div className="text-blue-100 text-sm">Neighborhood Rank</div>
                      <div className="text-xs text-green-200 mt-1">↗ Top 5%</div>
                    </div>
                    <Separator orientation="vertical" className="h-16 bg-white/20" />
                    <div className="text-center">
                      <div className="text-2xl font-bold">{environmentalData.streakDays}</div>
                      <div className="text-blue-100 text-sm">Day Streak</div>
                      <div className="text-xs text-yellow-200 mt-1">🔥 On Fire!</div>
                    </div>
                    <Separator orientation="vertical" className="h-16 bg-white/20" />
                    <div className="text-center">
                      <div className="text-2xl font-bold">{environmentalData.socialCredits}</div>
                      <div className="text-purple-100 text-sm">Social Credits</div>
                      <div className="text-xs text-pink-200 mt-1">📱 Ready to Share!</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                    <CardContent className="p-6">
                      <div className="text-center">
                        <Award className="h-8 w-8 mx-auto mb-2 text-yellow-300" />
                        <div className="text-lg font-semibold">{environmentalData.currentBadge}</div>
                        <div className="text-green-100 text-sm">Level {environmentalData.badgeLevel}</div>
                        <Badge className="mt-2 bg-yellow-400/20 text-yellow-200 border-yellow-400/30">
                          Social Media Ready! 🌟
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          
          {/* Environmental Impact Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-0 bg-gradient-to-br from-[#5770fe] to-[#320e2f] text-white overflow-hidden">
              <CardContent className="p-6 relative">
                <div className="absolute top-2 right-2 opacity-20">
                  <Leaf className="h-16 w-16" />
                </div>
                <div className="relative">
                  <div className="text-3xl font-bold mb-1">{environmentalData.co2Saved}kg</div>
                  <div className="text-blue-100">CO₂ Saved This Month</div>
                  <div className="mt-2 flex items-center text-blue-200">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span className="text-sm">↗ 23% from last month</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-0 bg-gradient-to-br from-blue-500 to-cyan-600 text-white overflow-hidden">
              <CardContent className="p-6 relative">
                <div className="absolute top-2 right-2 opacity-20">
                  <Recycle className="h-16 w-16" />
                </div>
                <div className="relative">
                  <div className="text-3xl font-bold mb-1">{environmentalData.wasteRecycled}%</div>
                  <div className="text-blue-100">Waste Recycled</div>
                  <Progress value={environmentalData.wasteRecycled} className="mt-2 h-2 bg-white/20" />
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-0 bg-gradient-to-br from-yellow-500 to-orange-600 text-white overflow-hidden">
              <CardContent className="p-6 relative">
                <div className="absolute top-2 right-2 opacity-20">
                  <span className="text-6xl">🪙</span>
                </div>
                <div className="relative">
                  <div className="text-3xl font-bold mb-1">{environmentalData.totalCoins.toLocaleString()}</div>
                  <div className="text-yellow-100">Eco Coins Earned</div>
                  <div className="mt-2 flex items-center text-yellow-200">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span className="text-sm">+{environmentalData.coinsThisMonth} this month</span>
                  </div>
                  <div className="mt-2">
                    <Badge className="bg-white/20 text-yellow-100 border-0">
                      💰 {environmentalData.coinsPerReport} per report
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-0 bg-gradient-to-br from-orange-500 to-red-600 text-white overflow-hidden">
              <CardContent className="p-6 relative">
                <div className="absolute top-2 right-2 opacity-20">
                  <Users className="h-16 w-16" />
                </div>
                <div className="relative">
                  <div className="text-3xl font-bold mb-1">2.4k</div>
                  <div className="text-orange-100">Community Impact</div>
                  <div className="mt-2 flex items-center text-orange-200">
                    <Globe className="h-4 w-4 mr-1" />
                    <span className="text-sm">People helped</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Coin Earnings & History */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            
            {/* Coin Wallet */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-yellow-50 via-yellow-100 to-amber-50">
              <CardHeader className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    🪙 Your Eco Wallet
                  </span>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                    onClick={() => simulateCoinsEarned(75)}
                  >
                    Test Earn +75
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="relative">
                    <div className="text-5xl font-bold text-yellow-600 flex items-center justify-center gap-2">
                      <span className="text-6xl">🪙</span>
                      {environmentalData.totalCoins.toLocaleString()}
                    </div>
                    {showCoinAnimation && (
                      <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 animate-ping">
                        <span className="text-green-500 font-bold text-3xl">+{recentCoinsEarned} 🪙</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="p-3 bg-white rounded-lg border border-yellow-200">
                      <div className="font-bold text-yellow-600">This Month</div>
                      <div className="text-2xl font-bold text-yellow-700">+{environmentalData.coinsThisMonth}</div>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-yellow-200">
                      <div className="font-bold text-yellow-600">Per Report</div>
                      <div className="text-2xl font-bold text-yellow-700">{environmentalData.coinsPerReport}</div>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg border border-green-200">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Zap className="h-5 w-5 text-yellow-500" />
                      <span className="font-bold text-green-700">Active Multiplier</span>
                    </div>
                    <div className="text-3xl font-bold text-green-600">{environmentalData.bonusMultiplier}x</div>
                    <div className="text-sm text-green-600">Streak bonus active!</div>
                  </div>

                  <Progress 
                    value={(environmentalData.totalCoins / environmentalData.nextMilestone) * 100} 
                    className="h-3" 
                  />
                  <div className="text-sm text-gray-600">
                    🎯 {environmentalData.nextMilestone - environmentalData.totalCoins} coins to next milestone
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Earnings */}
            <Card className="lg:col-span-2 border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-100 rounded-t-lg">
                <CardTitle className="text-gray-900 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    💰 Recent Earnings
                  </span>
                  <Badge className="bg-green-100 text-green-800 border-0">
                    +{recentEarnings.reduce((sum, earning) => sum + earning.coins, 0)} total
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {(coinHistory.length > 0 ? coinHistory : recentEarnings).map((earning) => (
                    <div key={earning.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200">
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          earning.type === 'report' ? 'bg-blue-100 text-blue-600' :
                          earning.type === 'streak' ? 'bg-orange-100 text-orange-600' :
                          earning.type === 'quality' ? 'bg-purple-100 text-purple-600' :
                          'bg-green-100 text-green-600'
                        }`}>
                          {earning.type === 'report' ? '📋' :
                           earning.type === 'streak' ? '🔥' :
                           earning.type === 'quality' ? '⭐' : '🎁'}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{earning.action}</div>
                          {earning.bonus && (
                            <div className="text-sm text-green-600 font-medium">{earning.bonus}</div>
                          )}
                          <div className="text-xs text-gray-500">{earning.time}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          <span className="text-2xl font-bold text-green-600">+{earning.coins}</span>
                          <span className="text-yellow-500">🪙</span>
                        </div>
                        {earning.time === 'Just now' && (
                          <Badge className="bg-green-100 text-green-800 border-0 text-xs animate-pulse">
                            NEW!
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {coinHistory.length === 0 && (
                    <div className="text-center py-8">
                      <div className="text-6xl mb-4">🎯</div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Start Earning Coins!</h3>
                      <p className="text-gray-600 mb-4">Submit your first waste report to earn 50 coins</p>
                      <Button 
                        className="bg-gradient-to-r from-[#5770fe] to-[#320e2f] text-white"
                        onClick={() => window.location.href = '/dashboard'}
                      >
                        Submit Report Now +50 🪙
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Achievements & Social Recognition */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Trophy className="h-6 w-6 mr-2 text-yellow-500" />
                Achievements & Recognition
              </h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-[#5770fe] to-[#320e2f] text-white">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Success
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Crown className="h-5 w-5 text-yellow-500" />
                      Share Your Environmental Impact!
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                      <Award className="h-12 w-12 mx-auto mb-2 text-yellow-500" />
                      <h3 className="font-bold text-lg">{environmentalData.currentBadge}</h3>
                      <p className="text-sm text-gray-600">Level {environmentalData.badgeLevel} Environmental Champion</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Button 
                        onClick={() => shareOnSocialMedia('facebook', { title: environmentalData.currentBadge })}
                        className="bg-blue-600 text-white"
                      >
                        <FacebookIcon className="h-4 w-4 mr-2" />
                        Facebook
                      </Button>
                      <Button 
                        onClick={() => shareOnSocialMedia('linkedin', { title: environmentalData.currentBadge })}
                        className="bg-blue-700 text-white"
                      >
                        <LinkedinIcon className="h-4 w-4 mr-2" />
                        LinkedIn
                      </Button>
                      <Button 
                        onClick={() => shareOnSocialMedia('twitter', { title: environmentalData.currentBadge })}
                        className="bg-sky-500 text-white"
                      >
                        <TwitterIcon className="h-4 w-4 mr-2" />
                        Twitter
                      </Button>
                      <Button 
                        onClick={() => shareOnSocialMedia('instagram', { title: environmentalData.currentBadge })}
                        className="bg-purple-600 text-white"
                      >
                        <InstagramIcon className="h-4 w-4 mr-2" />
                        Instagram
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              {achievements.map((achievement) => (
                <Card 
                  key={achievement.id} 
                  className={`relative overflow-hidden transition-all duration-300 ${
                    achievement.unlocked 
                      ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1' 
                      : 'bg-gray-50 border-gray-200 opacity-60'
                  }`}
                >
                  <CardContent className="p-4 text-center">
                    {achievement.unlocked && achievement.socialShare && (
                      <div className="absolute top-2 right-2">
                        <Share2 className="h-4 w-4 text-blue-500" />
                      </div>
                    )}
                    <div className="text-3xl mb-2">{achievement.icon}</div>
                    <h3 className="font-bold text-sm mb-1">{achievement.title}</h3>
                    <p className="text-xs text-gray-600 mb-2">{achievement.description}</p>
                    <Badge className={`text-xs ${
                      achievement.unlocked 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      +{achievement.points} points
                    </Badge>
                    {achievement.unlocked && achievement.unlockedAt && (
                      <div className="text-xs text-green-600 mt-1">
                        ✓ {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </div>
                    )}
                    {achievement.nextTarget && (
                      <div className="text-xs text-blue-600 mt-1">
                        🎯 {environmentalData.nextMilestone - environmentalData.pointsEarned} points to go!
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Social Media Milestones */}
            <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🌟 Social Media Recognition Milestones
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {socialMilestones.map((milestone, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{milestone.title}</h4>
                        <p className="text-sm text-gray-600">{milestone.points} points required</p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">
                          {Math.min(100, milestone.progress).toFixed(0)}%
                        </div>
                        {milestone.progress >= 100 && (
                          <Badge className="bg-green-100 text-green-800 ml-2">
                            🎉 Achieved!
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Progress value={Math.min(100, milestone.progress)} className="h-2" />
                    <div className="flex gap-1">
                      {milestone.platforms.map((platform) => (
                        <Badge key={platform} variant="outline" className="text-xs">
                          {platform}
                        </Badge>
                      ))}
                    </div>
                    {milestone.progress >= 100 && (
                      <div className="p-3 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg">
                        <div className="flex items-center gap-2 text-green-700">
                          <Gift className="h-5 w-5" />
                          <span className="font-medium">Ready to be featured on social media!</span>
                        </div>
                        <p className="text-sm text-green-600 mt-1">
                          Your environmental efforts will be highlighted across our social platforms
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions - Enhanced Version */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Zap className="h-6 w-6 mr-2 text-yellow-500" />
              Quick Actions
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: <Trash2 className="h-8 w-8" />,
                  title: "Submit New Report",
                  description: "Report waste & garbage issues",
                  color: "from-red-500 to-pink-600",
                  iconBg: "bg-red-100 text-red-600",
                  button: "Submit Report",
                  action: () => window.location.href = '/dashboard'
                },
                {
                  icon: <MapPin className="h-8 w-8" />,
                  title: "Collection Map",
                  description: "View routes and smart bins",
                  color: "from-blue-500 to-cyan-600",
                  iconBg: "bg-blue-100 text-blue-600",
                  button: "View Map"
                },
                {
                  icon: <Calendar className="h-8 w-8" />,
                  title: "My Schedule",
                  description: "Collection & recycling days",
                  color: "from-teal-500 to-emerald-600",
                  iconBg: "bg-teal-100 text-teal-600",
                  button: "Check Schedule"
                },
                {
                  icon: <TreePine className="h-8 w-8" />,
                  title: "Eco Tips",
                  description: "Sustainable living guides",
                  color: "from-[#5770fe] to-[#320e2f]",
                  iconBg: "bg-[#5770fe]/10 text-[#5770fe]",
                  button: "Learn More"
                }
              ].map((action, index) => (
                <Card key={index} className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border-0 overflow-hidden">
                  <div className={`h-2 bg-gradient-to-r ${action.color}`}></div>
                  <CardContent className="p-6">
                    <div className={`inline-flex p-3 rounded-xl ${action.iconBg} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      {action.icon}
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2 text-lg">{action.title}</h3>
                    <p className="text-gray-600 mb-4">{action.description}</p>
                    <Button 
                      className={`w-full bg-gradient-to-r ${action.color} text-white border-0 group-hover:shadow-lg transition-all duration-300`}
                      onClick={action.action || (() => {})}
                    >
                      {action.button}
                      <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Activity & Insights Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            
            {/* Recent Reports */}
            <Card className="lg:col-span-2 border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-lg">
                <CardTitle className="text-gray-900 flex items-center">
                  <Bell className="h-5 w-5 mr-2 text-blue-500" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {[
                    {
                      title: "Overflowing bin reported",
                      location: "Oak Street & 5th Ave",
                      time: "2 hours ago",
                      status: "Under Review",
                      statusColor: "bg-yellow-100 text-yellow-800",
                      icon: <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    },
                    {
                      title: "Collection completed",
                      location: "Your neighborhood",
                      time: "Yesterday at 9:30 AM",
                      status: "Completed",
                      statusColor: "bg-green-100 text-green-800",
                      icon: <CheckCircle className="h-4 w-4 text-green-600" />
                    },
                    {
                      title: "Recycling tip shared",
                      location: "Community forum",
                      time: "2 days ago",
                      status: "Appreciated",
                      statusColor: "bg-blue-100 text-blue-800",
                      icon: <Star className="h-4 w-4 text-blue-600" />
                    }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex-shrink-0 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                        {activity.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900">{activity.title}</p>
                        <p className="text-sm text-gray-600">{activity.location}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">{activity.time}</span>
                          <Badge className={`${activity.statusColor} border-0`}>
                            {activity.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Weekly Progress Chart */}
            <Card className="border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-100 rounded-t-lg">
                <CardTitle className="text-gray-900 flex items-center">
                  <BarChart className="h-5 w-5 mr-2 text-green-500" />
                  This Week
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {weeklyStats.map((day, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{day.day}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${day.recycled}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 w-8">{day.recycled}%</span>
                      </div>
                    </div>
                  ))}
                  
                  <Separator className="my-4" />
                  
                  <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">89.7%</div>
                    <div className="text-sm text-gray-600">Weekly Average</div>
                    <div className="text-xs text-green-600 mt-1">
                      ↗ +5.2% from last week
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Collection Schedule & Tips */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Upcoming Collections */}
            <Card className="border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-100 rounded-t-lg">
                <CardTitle className="text-gray-900 flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-blue-500" />
                  Upcoming Collections
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="p-4 border-l-4 border-blue-500 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-blue-900">Regular Waste</h4>
                      <Badge className="bg-blue-100 text-blue-800">Tomorrow</Badge>
                    </div>
                    <p className="text-blue-700 text-sm">8:00 AM - 10:00 AM</p>
                    <p className="text-blue-600 text-xs mt-1">Make sure bins are at the curb by 7:30 AM</p>
                  </div>
                  
                  <div className="p-4 border-l-4 border-green-500 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-green-900">Recycling</h4>
                      <Badge className="bg-green-100 text-green-800">Thursday</Badge>
                    </div>
                    <p className="text-green-700 text-sm">9:00 AM - 11:00 AM</p>
                    <p className="text-green-600 text-xs mt-1">Remember to separate materials properly</p>
                  </div>
                  
                  <div className="p-4 border-l-4 border-orange-500 bg-orange-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-orange-900">Organic Waste</h4>
                      <Badge className="bg-orange-100 text-orange-800">Friday</Badge>
                    </div>
                    <p className="text-orange-700 text-sm">7:00 AM - 9:00 AM</p>
                    <p className="text-orange-600 text-xs mt-1">Use compostable bags only</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Eco Tips */}
            <Card className="border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-green-50 to-lime-100 rounded-t-lg">
                <CardTitle className="text-gray-900 flex items-center">
                  <Leaf className="h-5 w-5 mr-2 text-green-500" />
                  Eco Tips of the Day
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm font-bold">1</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-green-900 mb-1">Reduce Food Waste</h4>
                        <p className="text-green-700 text-sm">Plan your meals and use leftovers creatively to reduce organic waste by up to 30%.</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm font-bold">2</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-blue-900 mb-1">Clean Before Recycling</h4>
                        <p className="text-blue-700 text-sm">Rinse containers to prevent contamination and improve recycling efficiency.</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm font-bold">3</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-purple-900 mb-1">Reuse Before Disposal</h4>
                        <p className="text-purple-700 text-sm">Find creative ways to reuse items before throwing them away.</p>
                      </div>
                    </div>
                  </div>
                  
                  <Button className="w-full bg-gradient-to-r from-[#5770fe] to-[#320e2f] text-white mt-4">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Get More Tips
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Achievement Notification Popup */}
        <Dialog open={showSocialShare} onOpenChange={setShowSocialShare}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-center text-2xl flex items-center justify-center gap-2">
                🎉 Congratulations!
              </DialogTitle>
            </DialogHeader>
            
            {newAchievement && (
              <div className="text-center space-y-6">
                <div className="mx-auto w-24 h-24 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-4xl animate-bounce">
                  {newAchievement.icon}
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold text-gray-900">{newAchievement.title}</h2>
                  <p className="text-gray-600">{newAchievement.description}</p>
                  <Badge className="bg-green-100 text-green-800 text-lg px-4 py-2">
                    +{newAchievement.points} Points Earned!
                  </Badge>
                </div>

                <div className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200">
                  <div className="flex items-center gap-3 mb-4">
                    <Crown className="h-8 w-8 text-yellow-500" />
                    <div className="text-left">
                      <h3 className="font-bold text-lg">🌟 You're Ready for Social Recognition!</h3>
                      <p className="text-sm text-gray-600">Share your environmental achievement with the world</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      onClick={() => shareOnSocialMedia('facebook', newAchievement)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <FacebookIcon className="h-4 w-4 mr-2" />
                      Facebook
                    </Button>
                    <Button 
                      onClick={() => shareOnSocialMedia('linkedin', newAchievement)}
                      className="bg-blue-700 hover:bg-blue-800 text-white"
                    >
                      <LinkedinIcon className="h-4 w-4 mr-2" />
                      LinkedIn
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <Button 
                      onClick={() => shareOnSocialMedia('twitter', newAchievement)}
                      className="bg-sky-500 hover:bg-sky-600 text-white"
                    >
                      <TwitterIcon className="h-4 w-4 mr-2" />
                      Twitter
                    </Button>
                    <Button 
                      onClick={() => shareOnSocialMedia('instagram', newAchievement)}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      <InstagramIcon className="h-4 w-4 mr-2" />
                      Instagram
                    </Button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowSocialShare(false)}
                    className="flex-1"
                  >
                    Maybe Later
                  </Button>
                  <Button 
                    onClick={() => {
                      // Share automatically on all platforms
                      ['facebook', 'linkedin', 'twitter'].forEach(platform => 
                        shareOnSocialMedia(platform, newAchievement)
                      );
                      setShowSocialShare(false);
                    }}
                    className="flex-1 bg-gradient-to-r from-[#5770fe] to-[#320e2f] text-white"
                  >
                    🚀 Share Everywhere!
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Floating Coin Earned Notification */}
        {showCoinAnimation && (
          <div className="fixed top-24 right-6 z-50 animate-bounce">
            <Card className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-2xl">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center animate-spin">
                    <span className="text-2xl">🪙</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">Coins Earned!</h4>
                    <p className="text-yellow-100">+{recentCoinsEarned} Eco Coins</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Points Milestone Notification */}
        {environmentalData.pointsEarned >= 2500 && environmentalData.pointsEarned < 3000 && (
          <div className="fixed bottom-6 right-6 max-w-sm z-40">
            <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-2xl animate-pulse">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Target className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold">Almost There! 🎯</h4>
                    <p className="text-sm text-purple-100">
                      Only {3000 - environmentalData.pointsEarned} more coins for social media feature!
                    </p>
                    <Button 
                      size="sm" 
                      className="mt-2 bg-white text-purple-600 hover:bg-gray-100"
                      onClick={() => {
                        simulateCoinsEarned(75);
                        // Also navigate to report page in real app
                        // window.location.href = '/citizen/report';
                      }}
                    >
                      Submit Report +50 🪙
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Coin Earning Incentive for New Users */}
        {environmentalData.totalReports === 0 && (
          <div className="fixed bottom-6 left-6 max-w-sm z-40">
            <Card className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-2xl">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-2xl animate-bounce">🪙</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold">Start Earning Coins! 🚀</h4>
                    <p className="text-sm text-green-100">
                      Get 50 coins for your first waste report
                    </p>
                    <Button 
                      size="sm" 
                      className="mt-2 bg-white text-green-600 hover:bg-gray-100"
                      onClick={() => simulateCoinsEarned(50)}
                    >
                      Earn Your First Coins! 🪙
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}