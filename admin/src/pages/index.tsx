/**
 * Admin Dashboard - Main Page
 */

import { useEffect, useState } from 'react';
import Head from 'next/head';
import {
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  UsersIcon,
  BellIcon,
  ArrowTrendingUpIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { adminApi, DashboardStats } from '@/lib/api';
import toast from 'react-hot-toast';

const navigation = [
  { name: 'Dashboard', icon: ChartBarIcon, href: '/', current: true },
  { name: 'Prompts', icon: DocumentTextIcon, href: '/prompts', current: false },
  { name: 'Viral Chats', icon: ChatBubbleLeftRightIcon, href: '/viral-chats', current: false },
  { name: 'Users', icon: UsersIcon, href: '/users', current: false },
  { name: 'Notifications', icon: BellIcon, href: '/notifications', current: false },
];

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await adminApi.getDashboard();
      setStats(data);
    } catch (error) {
      // Use mock data for demo
      setStats({
        totals: {
          prompts: 1250,
          viralChats: 48,
          users: 3420,
        },
        today: {
          prompts: 23,
          users: 156,
        },
        topPlatforms: [
          { name: 'Reddit', count: 420 },
          { name: 'Twitter', count: 380 },
          { name: 'YouTube', count: 250 },
          { name: 'Pinterest', count: 120 },
          { name: 'TikTok', count: 80 },
        ],
        topAiTools: [
          { name: 'Midjourney', count: 520 },
          { name: 'DALL-E', count: 340 },
          { name: 'Stable Diffusion', count: 220 },
          { name: 'Runway', count: 100 },
          { name: 'Leonardo', count: 70 },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Viral Prompt Admin</title>
        <meta name="description" content="Admin dashboard for Viral Prompt Discovery" />
      </Head>

      <div className="min-h-screen">
        {/* Sidebar */}
        <aside className="fixed inset-y-0 left-0 w-64 glass border-r border-white/10">
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center gap-3 p-6 border-b border-white/10">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <ArrowTrendingUpIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold gradient-text">Viral Prompt</h1>
                <p className="text-xs text-white/50">Admin Dashboard</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    item.current
                      ? 'bg-primary-500/20 text-primary-400'
                      : 'text-white/60 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </a>
              ))}
            </nav>

            {/* User */}
            <div className="p-4 border-t border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500" />
                <div>
                  <p className="text-sm font-medium">Admin User</p>
                  <p className="text-xs text-white/50">admin@viralprompt.app</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="ml-64 p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold">Dashboard</h2>
              <p className="text-white/60">Welcome back! Here&apos;s what&apos;s happening.</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 transition-colors">
              <PlusIcon className="w-5 h-5" />
              Add Prompt
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                  title="Total Prompts"
                  value={stats?.totals.prompts || 0}
                  change={stats?.today.prompts || 0}
                  icon={DocumentTextIcon}
                  color="primary"
                />
                <StatCard
                  title="Viral Chats"
                  value={stats?.totals.viralChats || 0}
                  change={5}
                  icon={ChatBubbleLeftRightIcon}
                  color="accent"
                />
                <StatCard
                  title="Total Users"
                  value={stats?.totals.users || 0}
                  change={stats?.today.users || 0}
                  icon={UsersIcon}
                  color="green"
                />
                <StatCard
                  title="Trending Today"
                  value={12}
                  change={3}
                  icon={ArrowTrendingUpIcon}
                  color="blue"
                />
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Platforms */}
                <div className="glass rounded-2xl p-6">
                  <h3 className="text-lg font-semibold mb-4">Top Platforms</h3>
                  <div className="space-y-4">
                    {stats?.topPlatforms.map((platform, index) => (
                      <div key={platform.name} className="flex items-center gap-4">
                        <span className="w-6 text-white/50">{index + 1}</span>
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <span className="font-medium">{platform.name}</span>
                            <span className="text-white/60">{platform.count}</span>
                          </div>
                          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
                              style={{
                                width: `${(platform.count / (stats?.topPlatforms[0]?.count || 1)) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top AI Tools */}
                <div className="glass rounded-2xl p-6">
                  <h3 className="text-lg font-semibold mb-4">Top AI Tools</h3>
                  <div className="space-y-4">
                    {stats?.topAiTools.map((tool, index) => (
                      <div key={tool.name} className="flex items-center gap-4">
                        <span className="w-6 text-white/50">{index + 1}</span>
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <span className="font-medium">{tool.name}</span>
                            <span className="text-white/60">{tool.count}</span>
                          </div>
                          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-accent-500 to-primary-500 rounded-full"
                              style={{
                                width: `${(tool.count / (stats?.topAiTools[0]?.count || 1)) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  change: number;
  icon: React.ElementType;
  color: 'primary' | 'accent' | 'green' | 'blue';
}

function StatCard({ title, value, change, icon: Icon, color }: StatCardProps) {
  const colors = {
    primary: 'from-primary-500 to-primary-600',
    accent: 'from-accent-500 to-accent-600',
    green: 'from-green-500 to-green-600',
    blue: 'from-blue-500 to-blue-600',
  };

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${colors[color]}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <span className="text-sm text-green-400">+{change} today</span>
      </div>
      <h3 className="text-white/60 text-sm mb-1">{title}</h3>
      <p className="text-3xl font-bold">{value.toLocaleString()}</p>
    </div>
  );
}
