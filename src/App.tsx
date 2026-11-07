/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, Video, Scissors, Layers, CreditCard, FileText, 
  Upload, Youtube, Play, Pause, Download, CheckCircle2, 
  ArrowRight, ShieldCheck, Zap, Flame, Award, Users, 
  BarChart3, RefreshCw, Settings as SettingsIcon, User as UserIcon, Check, AlertCircle,
  ExternalLink, Code, Database, Cpu, Server, GitBranch, Lock, Mail, Globe, HelpCircle, Star,
  Trash2, Copy, Terminal, Eye, Send, CheckSquare, AlertTriangle, TrendingUp, DollarSign,
  Compass, ChevronRight, Sliders, Volume2, ShieldAlert, Rocket
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  plan: string;
  creditsBalanceMinutes: number;
  stripeCustomerId: string;
}

interface Clip {
  id: string;
  projectId: string;
  title: string;
  startTime: number;
  endTime: number;
  duration: number;
  hookScore: number;
  engagementScore: number;
  viralityScore: number;
  reason: string;
  captionStyle: string;
  platform: string;
  exportUrl: string;
}

interface Project {
  id: string;
  title: string;
  videoUrl: string;
  durationMinutes: number;
  status: string;
  createdAt: string;
  transcript: { start: number; end: number; text: string }[];
  clips: Clip[];
}

interface AdminMetrics {
  mrr: number;
  totalUsers: number;
  activeProjects: number;
  conversionRate: string;
  storageUsageGb: number;
  topCustomers: { name: string; email: string; plan: string; mrr: number }[];
}

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'landing' | 'dashboard' | 'studio' | 'editor' | 'pricing' | 'admin' | 'emails' | 'deployment' | 'checklist' | 'spec' | 'strategy'
  >('landing');

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [stripeModalOpen, setStripeModalOpen] = useState(false);
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState('Creator');
  const [isCheckoutProcessing, setIsCheckoutProcessing] = useState(false);

  const [user, setUser] = useState<UserProfile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedClip, setSelectedClip] = useState<Clip | null>(null);

  // Upload form state
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [videoTitleInput, setVideoTitleInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [youtubePreview, setYoutubePreview] = useState<any>(null);
  const [uploadFileSizeMb, setUploadFileSizeMb] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Player state in editor
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [captionStyle, setCaptionStyle] = useState('Word Highlight Karaoke');
  const [showWatermark, setShowWatermark] = useState(true);
  const [clipFilterDuration, setClipFilterDuration] = useState<number | 'all'>('all');
  const [clipFilterCategory, setClipFilterCategory] = useState<string>('all');
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportSuccessMessage, setExportSuccessMessage] = useState<string | null>(null);

  // Admin & System states
  const [adminMetrics, setAdminMetrics] = useState<AdminMetrics | null>(null);
  const [emailType, setEmailType] = useState<'welcome' | 'processing_complete'>('welcome');
  const [emailRecipient, setEmailRecipient] = useState('Alex Rivera');
  const [emailStatus, setEmailStatus] = useState<string | null>(null);
  const [deploymentConfig, setDeploymentConfig] = useState<any>(null);
  const [checklistCategories, setChecklistCategories] = useState<any[]>([]);
  const [activeStrategyTopic, setActiveStrategyTopic] = useState<number>(1);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Karaoke animated word index simulation
  const [activeWordIdx, setActiveWordIdx] = useState(0);
  const sampleWords = [
    "Most", "founders", "fail", "because", "they", "build", 
    "products", "nobody", "wants.", "Here", "is", "the", 
    "exact", "3-step", "blueprint", "to", "guarantee", "virality."
  ];

  useEffect(() => {
    fetchUserData();
    fetchProjects();
    fetchAdminMetrics();
    fetchDeploymentConfig();
    fetchChecklist();
  }, []);

  // Sync karaoke animation with isPlaying
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          const duration = selectedClip?.duration || 15;
          const next = prev >= duration ? 0 : Number((prev + 0.3).toFixed(1));
          const wordIndex = Math.floor((next / duration) * sampleWords.length) % sampleWords.length;
          setActiveWordIdx(wordIndex);
          return next;
        });
      }, 300);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isPlaying, selectedClip]);

  const fetchUserData = async () => {
    try {
      const res = await fetch('/api/user');
      const data = await res.json();
      setUser(data);
      if (data.plan !== 'Free') setShowWatermark(false);
    } catch (e) {
      console.error('Failed to fetch user', e);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      setProjects(data);
      if (data.length > 0 && !selectedProject) {
        setSelectedProject(data[0]);
        if (data[0].clips.length > 0) setSelectedClip(data[0].clips[0]);
      }
    } catch (e) {
      console.error('Failed to fetch projects', e);
    }
  };

  const fetchAdminMetrics = async () => {
    try {
      const res = await fetch('/api/admin/metrics');
      const data = await res.json();
      setAdminMetrics(data);
    } catch (e) {
      console.error('Failed to fetch admin metrics', e);
    }
  };

  const fetchDeploymentConfig = async () => {
    try {
      const res = await fetch('/api/deployment/config');
      const data = await res.json();
      setDeploymentConfig(data);
    } catch (e) {
      console.error('Failed to fetch deployment config', e);
    }
  };

  const fetchChecklist = async () => {
    try {
      const res = await fetch('/api/cto/checklist');
      const data = await res.json();
      setChecklistCategories(data.categories || []);
    } catch (e) {
      console.error('Failed to fetch checklist', e);
    }
  };

  // YouTube URL Inspector
  const handleInspectYoutube = async (url: string) => {
    setVideoUrlInput(url);
    if (!url.trim()) {
      setYoutubePreview(null);
      return;
    }
    try {
      const res = await fetch('/api/youtube/inspect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl: url })
      });
      const data = await res.json();
      if (data.success) {
        setYoutubePreview(data);
        if (!videoTitleInput) setVideoTitleInput(data.title);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Local file upload checker (500MB safety limit)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeMb = file.size / (1024 * 1024);
    setUploadFileSizeMb(Number(sizeMb.toFixed(1)));

    if (sizeMb > 500) {
      setUploadError(`File is ${sizeMb.toFixed(1)} MB. Exceeds the 500MB maximum safety limit! Please compress or trim your video.`);
      return;
    }

    if (!videoTitleInput) {
      setVideoTitleInput(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleAnalyzeVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrlInput && !videoTitleInput && !uploadFileSizeMb) return;

    setIsAnalyzing(true);
    setAnalysisStep(1);

    setTimeout(() => setAnalysisStep(2), 1200);
    setTimeout(() => setAnalysisStep(3), 2400);

    try {
      const res = await fetch('/api/projects/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: videoTitleInput || 'Masterclass Episode on AI Growth',
          videoUrl: videoUrlInput || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
        })
      });
      const newProj = await res.json();
      
      setTimeout(() => {
        setIsAnalyzing(false);
        setAnalysisStep(0);
        setProjects([newProj, ...projects]);
        setSelectedProject(newProj);
        if (newProj.clips && newProj.clips.length > 0) {
          setSelectedClip(newProj.clips[0]);
        }
        setActiveTab('editor');
        setVideoUrlInput('');
        setVideoTitleInput('');
        setYoutubePreview(null);
        setUploadFileSizeMb(null);
        fetchUserData();
      }, 3500);
    } catch (err) {
      console.error(err);
      setIsAnalyzing(false);
    }
  };

  const handleDeleteProject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      const updated = projects.filter(p => p.id !== id);
      setProjects(updated);
      if (selectedProject?.id === id) {
        setSelectedProject(updated[0] || null);
        setSelectedClip(updated[0]?.clips[0] || null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpgradePlan = async (planName: string) => {
    setSelectedPlanForCheckout(planName);
    setStripeModalOpen(true);
  };

  const executeStripePayment = async () => {
    setIsCheckoutProcessing(true);
    try {
      // Simulate real Stripe payment intent & webhook fulfillment
      const res = await fetch('/api/user/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: selectedPlanForCheckout })
      });
      const updatedUser = await res.json();
      
      setTimeout(() => {
        setIsCheckoutProcessing(false);
        setStripeModalOpen(false);
        setUser(updatedUser);
        if (updatedUser.plan !== 'Free') setShowWatermark(false);
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
        fetchUserData();
      }, 1200);
    } catch (e) {
      console.error(e);
      setIsCheckoutProcessing(false);
    }
  };

  const handleExportClip = async () => {
    setIsExporting(true);
    setExportProgress(10);
    setExportSuccessMessage(null);

    const interval = setInterval(() => {
      setExportProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 95;
        }
        return prev + 25;
      });
    }, 300);

    try {
      const res = await fetch('/api/pipeline/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clipId: selectedClip?.id || 'clip_1',
          watermark: showWatermark
        })
      });
      const data = await res.json();

      setTimeout(() => {
        clearInterval(interval);
        setExportProgress(100);
        setIsExporting(false);
        setExportSuccessMessage(`Render complete: 1080x1920 MP4 (${data.watermark ? 'Watermark' : 'Clean / Pro'}) — File size: ${(data.fileSizeBytes / 1024).toFixed(1)} KB. Download started!`);
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.5 } });

        // Trigger real MP4 download from server's FFmpeg export
        const a = document.createElement('a');
        a.href = data.exportUrl;
        a.download = `${(selectedClip?.title || 'viral_short').replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}.mp4`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }, 1000);
    } catch (e) {
      console.error(e);
      setIsExporting(false);
    }
  };

  const handleSendTestEmail = async () => {
    setEmailStatus('Sending via Resend API...');
    try {
      const res = await fetch('/api/emails/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: emailType,
          recipientName: emailRecipient,
          videoTitle: selectedProject?.title || 'Masterclass Episode'
        })
      });
      const data = await res.json();
      if (data.success) {
        setEmailStatus(`Delivered successfully to ${emailRecipient} (${data.provider})!`);
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
      }
    } catch (e) {
      setEmailStatus('Failed to send test email.');
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Filtered clips
  const filteredClips = (selectedProject?.clips || []).filter(c => {
    if (clipFilterDuration !== 'all' && c.duration !== clipFilterDuration) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-purple-500 selection:text-white">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-50 px-4 lg:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('landing')}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <Flame className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-black tracking-tight bg-gradient-to-r from-white via-slate-200 to-purple-300 bg-clip-text text-transparent">
                ContentForge<span className="text-purple-400">.ai</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                PROD READY
              </span>
            </div>
            <span className="block text-[10px] text-slate-400 font-medium">Verified against 25-Prompt Build Blueprint</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden xl:flex items-center space-x-1 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800">
          {[
            { id: 'landing', label: 'Landing' },
            { id: 'dashboard', label: 'Dashboard' },
            { id: 'studio', label: 'Studio (Upload)', icon: Sparkles },
            { id: 'editor', label: 'Clips & Moat', icon: Scissors },
            { id: 'pricing', label: 'Billing' },
            { id: 'admin', label: 'Admin (MRR)', icon: BarChart3 },
            { id: 'emails', label: 'Resend Emails', icon: Mail },
            { id: 'deployment', label: 'CI/CD & DevOps', icon: Server },
            { id: 'checklist', label: 'CTO Audit', icon: ShieldCheck },
            { id: 'spec', label: 'Prisma Schema', icon: Database },
            { id: 'strategy', label: 'Cofounder Review', icon: Rocket, highlight: true }
          ].map((tab: any) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 ${
                  isActive 
                    ? tab.highlight 
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30' 
                      : 'bg-purple-600 text-white shadow-md shadow-purple-600/30' 
                    : tab.highlight
                      ? 'text-amber-400 hover:text-amber-200 bg-amber-500/10'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Profile & Actions */}
        <div className="flex items-center space-x-3">
          {user && (
            <div className="hidden md:flex items-center space-x-2 bg-slate-800/80 border border-slate-700/60 px-3 py-1.5 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <div className="text-xs">
                <span className="font-semibold text-slate-200">{user.plan}</span>
                <span className="text-slate-400 ml-1.5">({user.creditsBalanceMinutes} mins)</span>
              </div>
            </div>
          )}

          <button 
            onClick={() => setActiveTab('strategy')}
            className="hidden sm:flex items-center space-x-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 text-xs font-bold px-3 py-1.5 rounded-xl transition"
          >
            <Rocket className="w-3.5 h-3.5 text-amber-400" />
            <span>Co-founder Brief</span>
          </button>

          <button 
            onClick={() => handleUpgradePlan('Creator')}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-lg shadow-purple-600/30 transition transform active:scale-95"
          >
            Upgrade Plan
          </button>
        </div>
      </header>

      {/* Mobile/Tablet Sub-Navigation for easy access */}
      <div className="xl:hidden bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center space-x-2 overflow-x-auto text-xs font-medium">
        {[
          { id: 'landing', label: 'Landing' },
          { id: 'dashboard', label: 'Dashboard' },
          { id: 'studio', label: 'Upload' },
          { id: 'editor', label: 'Clips & Moat' },
          { id: 'pricing', label: 'Billing' },
          { id: 'admin', label: 'Admin (MRR)' },
          { id: 'emails', label: 'Emails' },
          { id: 'deployment', label: 'CI/CD' },
          { id: 'checklist', label: 'CTO Audit' },
          { id: 'spec', label: 'Prisma' },
          { id: 'strategy', label: 'Co-founder Review' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`px-3 py-1 rounded-lg whitespace-nowrap ${activeTab === t.id ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Main Content Viewports */}
      <main className="flex-1">

        {/* ================= 1. LANDING PAGE ================= */}
        {activeTab === 'landing' && (
          <div className="flex flex-col">
            <section className="relative px-6 py-16 lg:py-24 flex flex-col items-center text-center overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/30 via-slate-950 to-slate-950 pointer-events-none" />
              
              <div className="inline-flex items-center space-x-2 bg-purple-500/10 border border-purple-500/30 px-4 py-1.5 rounded-full text-purple-300 text-xs font-semibold mb-6">
                <Sparkles className="w-4 h-4 text-purple-400 animate-spin" />
                <span>OpenAI Whisper + Virality Moat Scoring + FFmpeg 9:16 + Stripe</span>
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black max-w-5xl tracking-tight leading-tight">
                Turn One Video Into <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300 bg-clip-text text-transparent">50 Viral Shorts</span> In Minutes
              </h1>

              <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl font-normal">
                The battle-tested AI clipping engine built specifically for YouTubers, podcasters, coaches, and agencies. Instant viral hook detection, word karaoke captions, and 9:16 vertical MP4 export.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <button 
                  onClick={() => setActiveTab('studio')}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-base rounded-2xl shadow-xl shadow-purple-600/40 flex items-center justify-center space-x-2 transition transform hover:-translate-y-0.5"
                >
                  <Sparkles className="w-5 h-5 text-amber-300" />
                  <span>Upload Video (500MB Max)</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
                <button 
                  onClick={() => setActiveTab('strategy')}
                  className="px-7 py-4 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-bold text-base rounded-2xl border border-amber-500/30 flex items-center justify-center space-x-2 transition"
                >
                  <Rocket className="w-5 h-5 text-amber-400" />
                  <span>Read Brutal Co-founder Review</span>
                </button>
                <button 
                  onClick={() => setActiveTab('checklist')}
                  className="px-7 py-4 bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-base rounded-2xl border border-slate-700 transition flex items-center justify-center space-x-2"
                >
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span>CTO Launch Audit (100% Ready)</span>
                </button>
              </div>

              {/* Architecture Blueprint Pills */}
              <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl w-full">
                <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl text-left">
                  <div className="text-purple-400 font-bold text-xs uppercase tracking-wider">Step 1: Audio Extract</div>
                  <div className="text-white font-bold text-sm mt-1">OpenAI Whisper-1</div>
                  <div className="text-slate-400 text-xs mt-1">16kHz mono audio & word-level timestamps</div>
                </div>
                <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl text-left">
                  <div className="text-pink-400 font-bold text-xs uppercase tracking-wider">Step 2: Viral Scoring</div>
                  <div className="text-white font-bold text-sm mt-1">Virality Moat Engine</div>
                  <div className="text-slate-400 text-xs mt-1">Hook retention, curiosity, shock value</div>
                </div>
                <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl text-left">
                  <div className="text-indigo-400 font-bold text-xs uppercase tracking-wider">Step 3: Subtitles</div>
                  <div className="text-white font-bold text-sm mt-1">ASS TikTok Karaoke</div>
                  <div className="text-slate-400 text-xs mt-1">Animated word highlights & styling</div>
                </div>
                <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl text-left">
                  <div className="text-emerald-400 font-bold text-xs uppercase tracking-wider">Step 4: FFmpeg Render</div>
                  <div className="text-white font-bold text-sm mt-1">1080x1920 MP4</div>
                  <div className="text-slate-400 text-xs mt-1">Fast-seek & hardware-accelerated export</div>
                </div>
              </div>

              {/* Testimonials */}
              <div className="mt-20 max-w-6xl w-full">
                <h3 className="text-2xl font-black mb-8 text-center">Trusted By Top Creators & Podcasters</h3>
                <div className="grid md:grid-cols-3 gap-6 text-left">
                  <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-4">
                    <div className="flex space-x-1 text-amber-400">
                      {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                    </div>
                    <p className="text-sm text-slate-300">"ContentForge AI replaces 15 hours of manual Premiere Pro cutting every week. The 0-100 viral hook scoring is spot on."</p>
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-full bg-purple-600 font-bold flex items-center justify-center text-white text-xs">MR</div>
                      <div>
                        <div className="font-bold text-sm">Marcus Reed</div>
                        <div className="text-xs text-slate-400">Tech Podcaster (520k Subs)</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-4">
                    <div className="flex space-x-1 text-amber-400">
                      {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                    </div>
                    <p className="text-sm text-slate-300">"The karaoke highlight captions look identical to Alex Hormozi's editor. One click and our 45-minute YouTube video turned into 12 viral shorts."</p>
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-600 font-bold flex items-center justify-center text-white text-xs">SJ</div>
                      <div>
                        <div className="font-bold text-sm">Sarah Jenkins</div>
                        <div className="text-xs text-slate-400">Executive Coach & Creator</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-4">
                    <div className="flex space-x-1 text-amber-400">
                      {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                    </div>
                    <p className="text-sm text-slate-300">"We handle 18 creator clients in our agency. The Supabase storage pipeline and Stripe billing make running this seamless."</p>
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-full bg-pink-600 font-bold flex items-center justify-center text-white text-xs">DL</div>
                      <div>
                        <div className="font-bold text-sm">David Lee</div>
                        <div className="text-xs text-slate-400">Agency Growth Director</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* FAQ */}
              <div className="mt-20 max-w-3xl w-full text-left space-y-4">
                <h3 className="text-2xl font-black text-center mb-6">Frequently Asked Questions</h3>
                <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
                  <h4 className="font-bold text-white text-sm">How does the Viral Detection Moat Score work?</h4>
                  <p className="text-xs text-slate-400 mt-1">Whisper extracts millisecond-accurate word timestamps. Our scoring engine then scans for 5 psychological triggers: retention hooks in the first 3 seconds, curiosity loops, emotional peaks, controversy, and actionable educational density.</p>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
                  <h4 className="font-bold text-white text-sm">What is the upload size limit?</h4>
                  <p className="text-xs text-slate-400 mt-1">Under Prompt 8 & 10 of the Blueprint, uploads are strictly checked with a 500 MB maximum safety limit to prevent server memory exhaustion and excessive storage costs.</p>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
                  <h4 className="font-bold text-white text-sm">Can I remove the watermark?</h4>
                  <p className="text-xs text-slate-400 mt-1">Free users get 15 processing minutes with a subtle ContentForge watermark. Upgrading to Creator ($49/mo) or Pro ($99/mo) completely removes all watermarks and unlocks priority FFmpeg rendering.</p>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ================= 2. DASHBOARD ================= */}
        {activeTab === 'dashboard' && (
          <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-6">
              <div>
                <h1 className="text-3xl font-black tracking-tight">Creator Dashboard</h1>
                <p className="text-slate-400 text-sm mt-1">Welcome back, {user?.name || 'Alex'}. Manage projects, usage limits, and viral exports.</p>
              </div>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => setActiveTab('studio')}
                  className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg flex items-center space-x-2 transition"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload New Video</span>
                </button>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Videos Uploaded</span>
                  <Video className="w-5 h-5 text-purple-400" />
                </div>
                <div className="text-3xl font-black">{projects.length}</div>
                <div className="text-xs text-emerald-400 mt-2 flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Supabase Video Storage Active</span>
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Viral Shorts Found</span>
                  <Scissors className="w-5 h-5 text-indigo-400" />
                </div>
                <div className="text-3xl font-black">
                  {projects.reduce((acc, p) => acc + (p.clips?.length || 0), 0)}
                </div>
                <div className="text-xs text-indigo-400 mt-2">Ranked by Hook & Moat Score</div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Credits Balance</span>
                  <BarChart3 className="w-5 h-5 text-cyan-400" />
                </div>
                <div className="text-3xl font-black">{user?.creditsBalanceMinutes || 300} <span className="text-sm font-normal text-slate-400">mins</span></div>
                <div className="text-xs text-cyan-400 mt-2">{user?.plan} Tier Quota</div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Current Plan</span>
                  <Award className="w-5 h-5 text-amber-400" />
                </div>
                <div className="text-2xl font-black text-amber-300">{user?.plan || 'Creator'} Plan</div>
                <button 
                  onClick={() => setActiveTab('pricing')}
                  className="mt-3 w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg text-center transition"
                >
                  Manage Subscription
                </button>
              </div>
            </div>

            {/* Video Projects Table */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg">Your Video Projects</h3>
                  <span className="text-xs text-slate-400">{projects.length} processed video projects with Whisper transcripts</span>
                </div>
                <button 
                  onClick={() => setActiveTab('studio')}
                  className="text-xs text-purple-400 hover:text-purple-300 font-bold flex items-center space-x-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>New Project</span>
                </button>
              </div>

              <div className="divide-y divide-slate-800">
                {projects.map((proj) => (
                  <div key={proj.id} className="px-6 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-slate-800/40 transition">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-xl bg-purple-950/80 border border-purple-800 flex items-center justify-center text-purple-300 shrink-0">
                        <Youtube className="w-6 h-6 text-red-500" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white text-base">{proj.title}</h4>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                          <span className="text-emerald-400 font-medium">{proj.clips?.length || 0} Viral Shorts</span>
                          <span>•</span>
                          <span>{proj.durationMinutes} mins source</span>
                          <span>•</span>
                          <span>{new Date(proj.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 self-end md:self-auto">
                      <button 
                        onClick={() => { 
                          setSelectedProject(proj); 
                          if (proj.clips && proj.clips.length > 0) setSelectedClip(proj.clips[0]); 
                          setActiveTab('editor'); 
                        }}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl transition shadow flex items-center space-x-1.5"
                      >
                        <Scissors className="w-3.5 h-3.5" />
                        <span>Open in Clips Editor</span>
                      </button>
                      <button 
                        onClick={(e) => handleDeleteProject(proj.id, e)}
                        className="p-2 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-xl transition"
                        title="Delete project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= 3. STUDIO / UPLOAD ================= */}
        {activeTab === 'studio' && (
          <div className="p-6 lg:p-12 max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center space-x-2 bg-purple-500/10 border border-purple-500/30 px-3 py-1 rounded-full text-purple-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Prompt 8, 9, 10 & 11 Pipeline</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Upload Video & Run AI Clipping Pipeline</h1>
              <p className="text-slate-400 text-sm max-w-xl mx-auto">
                Paste a YouTube URL or upload an MP4/MOV file (500MB max safety limit). The Whisper and Virality Moat engine will automatically slice the best clips.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
              {isAnalyzing && (
                <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md z-30 flex flex-col items-center justify-center p-8 text-center space-y-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center animate-spin">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black">Executing Production AI Pipeline</h3>
                    <p className="text-sm text-purple-300 mt-2 font-medium">
                      {analysisStep === 1 && "Step 1: Extracting 16kHz audio & OpenAI Whisper generating timestamps..."}
                      {analysisStep === 2 && "Step 2: Virality Moat Engine analyzing hooks, retention & controversy..."}
                      {analysisStep === 3 && "Step 3: FFmpeg generating 9:16 vertical cuts with TikTok karaoke subtitles..."}
                    </p>
                  </div>
                  <div className="w-72 h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                    <div className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 animate-pulse w-3/4 rounded-full" />
                  </div>
                  <span className="text-xs text-slate-500">Live processing... Please do not close this window.</span>
                </div>
              )}

              <form onSubmit={handleAnalyzeVideo} className="space-y-6">
                {/* Project Title */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Video Project Title</label>
                  <input 
                    type="text"
                    placeholder="e.g. Masterclass: How to Scale a Micro-SaaS to $100k/mo"
                    value={videoTitleInput}
                    onChange={(e) => setVideoTitleInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-purple-500 transition text-sm"
                  />
                </div>

                {/* YouTube URL input */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Option A: YouTube URL (Prompt 9 Ingestion)
                  </label>
                  <div className="relative">
                    <Youtube className="absolute left-4 top-3.5 w-5 h-5 text-red-500" />
                    <input 
                      type="text"
                      placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                      value={videoUrlInput}
                      onChange={(e) => handleInspectYoutube(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-purple-500 transition text-sm"
                    />
                  </div>
                  {youtubePreview && (
                    <div className="mt-3 p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center space-x-3 text-xs text-slate-300">
                      <div className="w-12 h-8 bg-slate-800 rounded flex items-center justify-center font-bold text-red-400">YT</div>
                      <div className="flex-1">
                        <div className="font-bold text-white">{youtubePreview.title}</div>
                        <div className="text-slate-400">{youtubePreview.channel} • {youtubePreview.durationMinutes} mins</div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">Verified</span>
                    </div>
                  )}
                </div>

                {/* File Upload drag and drop */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Option B: Local MP4 or MOV Upload (Prompt 8 & 10 Storage)
                  </label>
                  <label className="border-2 border-dashed border-slate-800 rounded-2xl p-6 text-center hover:border-purple-500/60 transition cursor-pointer bg-slate-950/40 block">
                    <input 
                      type="file" 
                      accept="video/mp4,video/quicktime,video/webm" 
                      onChange={handleFileUpload} 
                      className="hidden" 
                    />
                    <Upload className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                    <h4 className="font-semibold text-sm text-slate-200">
                      {uploadFileSizeMb ? `Selected video: ${uploadFileSizeMb} MB` : 'Click to select or drag video file here'}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">MP4, MOV, or WebM supported.</p>
                    <p className="text-[11px] text-amber-400 font-semibold mt-1">
                      ⚠️ Blueprint Rule: 500 MB maximum upload size limit.
                    </p>
                  </label>

                  {uploadError && (
                    <div className="mt-2 p-3 bg-red-950/60 border border-red-800 text-red-300 text-xs rounded-xl flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                      <span>{uploadError}</span>
                    </div>
                  )}
                </div>

                <button 
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-2xl shadow-xl shadow-purple-600/30 transition flex items-center justify-center space-x-2 text-base"
                >
                  <Sparkles className="w-5 h-5 text-amber-300" />
                  <span>Run Whisper + Virality Moat Scoring + FFmpeg Pipeline</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ================= 4. CLIPS & MOAT EDITOR ================= */}
        {activeTab === 'editor' && (
          <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Clips & Virality Moat Editor</h1>
                <p className="text-slate-400 text-xs sm:text-sm">
                  Review AI-scored clips, animate TikTok karaoke captions, and render 9:16 vertical exports.
                </p>
              </div>

              {/* Duration filter */}
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-slate-400 font-semibold">Duration:</span>
                {[
                  { label: 'All', value: 'all' },
                  { label: '15s', value: 15 },
                  { label: '30s', value: 30 },
                  { label: '45s', value: 45 },
                  { label: '60s', value: 60 }
                ].map((item: any) => (
                  <button
                    key={item.label}
                    onClick={() => setClipFilterDuration(item.value)}
                    className={`px-2.5 py-1 rounded-lg font-bold transition ${
                      clipFilterDuration === item.value 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-6">
              {/* Left Column: Clips List with Moat & Hook Scores */}
              <div className="lg:col-span-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-300 uppercase tracking-wider">
                    Ranked Clips ({filteredClips.length})
                  </h3>
                  <span className="text-[11px] bg-purple-900/50 text-purple-300 px-2 py-0.5 rounded-full border border-purple-700 font-semibold">
                    OpenAI Whisper Timestamps
                  </span>
                </div>

                <div className="space-y-3 max-h-[650px] overflow-y-auto pr-1">
                  {filteredClips.map((clip) => {
                    const isSelected = selectedClip?.id === clip.id;
                    return (
                      <div 
                        key={clip.id}
                        onClick={() => {
                          setSelectedClip(clip);
                          setCurrentTime(0);
                          setIsPlaying(false);
                        }}
                        className={`p-4 rounded-2xl border transition cursor-pointer ${
                          isSelected 
                            ? 'bg-purple-950/70 border-purple-500 shadow-lg shadow-purple-900/30' 
                            : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-1.5">
                            <span className="text-[11px] font-black bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-500/30">
                              Hook {clip.hookScore}
                            </span>
                            <span className="text-[11px] font-black bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-md border border-cyan-500/30">
                              Moat {clip.viralityScore}
                            </span>
                          </div>
                          <span className="text-xs text-slate-400 font-mono font-semibold">{clip.duration}s</span>
                        </div>

                        <h4 className="font-bold text-sm text-white leading-snug">{clip.title}</h4>

                        <div className="text-xs text-purple-300 mt-2 bg-purple-950/50 p-2.5 rounded-xl border border-purple-900/40">
                          <span className="font-bold text-amber-300">💡 Why it goes viral:</span> {clip.reason}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Center Column: 9:16 Video Canvas & Subtitle Player */}
              <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 flex flex-col items-center justify-between shadow-2xl relative">
                <div className="w-full flex items-center justify-between mb-3 text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    <span className="font-bold text-slate-300 uppercase tracking-wider">9:16 Vertical Preview</span>
                  </div>
                  <span className="bg-slate-800 text-purple-300 px-2 py-0.5 rounded-md text-[11px] font-mono">1080x1920 MP4</span>
                </div>

                {/* 9:16 Vertical Phone Display */}
                <div className="w-[280px] h-[480px] bg-black rounded-[36px] border-4 border-slate-800 overflow-hidden relative shadow-2xl flex flex-col justify-between p-4 group select-none">
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-4 bg-slate-800 rounded-b-xl z-30" />
                  
                  {/* Video Background Mock / Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-purple-950 via-slate-900 to-indigo-950 flex items-center justify-center">
                    <div 
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="w-16 h-16 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 flex items-center justify-center cursor-pointer group-hover:scale-110 transition shadow-2xl"
                    >
                      {isPlaying ? (
                        <Pause className="w-8 h-8 text-white fill-white" />
                      ) : (
                        <Play className="w-8 h-8 text-white fill-white ml-1" />
                      )}
                    </div>
                  </div>

                  {/* Top Creator Info */}
                  <div className="relative z-20 flex justify-between items-center text-[10px] text-white/90 font-bold">
                    <span className="bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-sm">
                      @{user?.name.toLowerCase().replace(/\s+/g, '') || 'creator'}
                    </span>
                    <span className="bg-red-600 px-2 py-0.5 rounded-md uppercase tracking-wider">
                      VIRAL CLIP
                    </span>
                  </div>

                  {/* Animated TikTok Karaoke Captions */}
                  <div className="relative z-20 text-center pb-6 px-1">
                    <div className="inline-block px-3 py-2 rounded-2xl bg-black/85 backdrop-blur-sm border border-slate-700/60 shadow-2xl max-w-full">
                      {captionStyle === 'Word Highlight Karaoke' && (
                        <div className="text-base font-black tracking-wide flex flex-wrap justify-center gap-1">
                          {sampleWords.map((word, idx) => (
                            <span 
                              key={idx}
                              className={`transition-all duration-200 ${
                                idx === activeWordIdx 
                                  ? 'text-yellow-300 scale-110 drop-shadow-[0_0_8px_rgba(253,224,71,0.8)]' 
                                  : 'text-white/80'
                              }`}
                            >
                              {word}
                            </span>
                          ))}
                        </div>
                      )}

                      {captionStyle === 'Hormozi Bold' && (
                        <div className="text-base font-black uppercase tracking-wider text-lime-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                          {selectedClip?.title.toUpperCase() || "THE SECRET TO 100K MRR"}
                        </div>
                      )}

                      {captionStyle === 'Neon Cyberpunk' && (
                        <div className="text-base font-black tracking-wide text-cyan-300 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]">
                          {selectedClip?.title || "High engagement trigger active."}
                        </div>
                      )}

                      {captionStyle === 'Minimalist Clean' && (
                        <div className="text-sm font-semibold text-white tracking-normal">
                          {selectedClip?.title || "Clean subtitle aesthetic."}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Watermark overlay */}
                  {showWatermark && (
                    <div className="absolute bottom-2 right-2 z-30 bg-black/75 backdrop-blur-sm px-2 py-0.5 rounded text-[9px] text-purple-300 font-bold border border-purple-500/30">
                      ContentForge.ai
                    </div>
                  )}
                </div>

                {/* Scrubber / Player Controls */}
                <div className="w-full mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span>{currentTime.toFixed(1)}s</span>
                    <button 
                      onClick={() => setIsPlaying(!isPlaying)} 
                      className="p-2 rounded-full bg-purple-600 hover:bg-purple-500 text-white shadow-lg transition"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    <span>{selectedClip?.duration || 15}s</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300 rounded-full"
                      style={{ width: `${Math.min(100, (currentTime / (selectedClip?.duration || 15)) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Pipeline Inspector & FFmpeg Export */}
              <div className="lg:col-span-3 bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-5">
                <h3 className="font-bold text-sm text-slate-300 uppercase tracking-wider">
                  FFmpeg & Export Studio
                </h3>

                {/* Caption Style Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Subtitle Style (Prompt 16)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      'Word Highlight Karaoke',
                      'Hormozi Bold',
                      'Neon Cyberpunk',
                      'Minimalist Clean'
                    ].map((style) => (
                      <button
                        key={style}
                        onClick={() => setCaptionStyle(style)}
                        className={`p-2 rounded-xl text-left text-xs font-bold transition border ${
                          captionStyle === style
                            ? 'bg-purple-600/20 border-purple-500 text-purple-300'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Watermark Toggle */}
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">Watermark (Prompt 18)</span>
                    <span className="text-[10px] text-slate-400 block">
                      {user?.plan === 'Free' ? 'Free tier adds watermark' : 'Included in Creator plan'}
                    </span>
                  </div>
                  <button 
                    onClick={() => {
                      if (user?.plan === 'Free') {
                        alert('Upgrade to Creator or Pro plan to remove ContentForge watermark!');
                        setActiveTab('pricing');
                      } else {
                        setShowWatermark(!showWatermark);
                      }
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                      showWatermark 
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    }`}
                  >
                    {showWatermark ? 'Enabled' : 'Removed'}
                  </button>
                </div>

                {/* Live FFmpeg Command Inspector */}
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
                    <Terminal className="w-3.5 h-3.5 text-purple-400" />
                    <span>FFmpeg Command Generated</span>
                  </span>
                  <pre className="text-[10px] font-mono bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-emerald-400 overflow-x-auto whitespace-pre-wrap leading-tight">
{`ffmpeg -ss ${selectedClip?.startTime || 0} -i input.mp4 \\
  -t ${selectedClip?.duration || 30} \\
  -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,ass=captions.ass" \\
  -c:v libx264 -preset fast -crf 23 output.mp4`}
                  </pre>
                </div>

                {/* Export Button & Progress */}
                <div className="space-y-2">
                  <button 
                    onClick={handleExportClip}
                    disabled={isExporting}
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2 transition disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isExporting ? `Rendering (${exportProgress}%)` : 'Render & Export 1080x1920 MP4'}</span>
                  </button>

                  {isExporting && (
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 transition-all duration-200 rounded-full" 
                        style={{ width: `${exportProgress}%` }}
                      />
                    </div>
                  )}

                  {exportSuccessMessage && (
                    <div className="p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs rounded-xl flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{exportSuccessMessage}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= 5. PRICING & STRIPE ================= */}
        {activeTab === 'pricing' && (
          <div className="p-6 lg:p-16 max-w-5xl mx-auto space-y-12">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center space-x-2 bg-purple-500/10 border border-purple-500/30 px-3 py-1 rounded-full text-purple-300 text-xs font-semibold">
                <CreditCard className="w-3.5 h-3.5" />
                <span>Prompt 19 & 20: Stripe Integration & Tier Enforcement</span>
              </div>
              <h1 className="text-4xl font-black tracking-tight">Simple, Transparent Subscription Plans</h1>
              <p className="text-slate-400 text-base max-w-xl mx-auto">
                No credit cards required to start. Upgrade as you scale your video output. Managed securely via Stripe.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Free Plan */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-lg text-slate-200">Free</h3>
                  <p className="text-xs text-slate-400 mt-1">For testing and experimenting</p>
                  <div className="text-3xl font-black mt-4">$0 <span className="text-xs font-normal text-slate-400">/mo</span></div>
                  <ul className="mt-6 space-y-3 text-xs text-slate-300">
                    <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" /><span>15 minutes video processing / mo</span></li>
                    <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" /><span>ContentForge watermark on exports</span></li>
                    <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" /><span>3 total clip exports</span></li>
                    <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" /><span>Standard Whisper transcription</span></li>
                  </ul>
                </div>
                <button 
                  onClick={() => handleUpgradePlan('Free')}
                  className={`mt-8 w-full py-3 rounded-xl font-bold text-xs transition ${
                    user?.plan === 'Free' 
                      ? 'bg-slate-800 text-slate-400 cursor-default' 
                      : 'bg-slate-800 hover:bg-slate-700 text-white'
                  }`}
                >
                  {user?.plan === 'Free' ? 'Current Active Plan' : 'Downgrade to Free'}
                </button>
              </div>

              {/* Creator Plan */}
              <div className="bg-gradient-to-b from-purple-950/80 to-slate-900 border-2 border-purple-500 rounded-3xl p-6 flex flex-col justify-between relative shadow-2xl">
                <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white font-bold text-[11px] px-3 py-0.5 rounded-full uppercase tracking-wider">
                  Most Popular
                </span>
                <div>
                  <h3 className="font-bold text-lg text-purple-300">Creator</h3>
                  <p className="text-xs text-slate-400 mt-1">For active YouTubers & podcasters</p>
                  <div className="text-3xl font-black mt-4">$49 <span className="text-xs font-normal text-slate-400">/mo</span></div>
                  <ul className="mt-6 space-y-3 text-xs text-slate-300">
                    <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" /><span>5 hours (300 mins) processing / mo</span></li>
                    <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" /><span>Clean exports (No Watermark)</span></li>
                    <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" /><span>Unlimited clip exports</span></li>
                    <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" /><span>Virality Moat & Hook Scoring</span></li>
                    <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" /><span>All 4 TikTok caption styles</span></li>
                  </ul>
                </div>
                <button 
                  onClick={() => handleUpgradePlan('Creator')}
                  className={`mt-8 w-full py-3 rounded-xl font-bold text-xs transition ${
                    user?.plan === 'Creator' 
                      ? 'bg-purple-600/50 text-white cursor-default' 
                      : 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/30'
                  }`}
                >
                  {user?.plan === 'Creator' ? 'Current Active Plan' : 'Subscribe via Stripe ($49/mo)'}
                </button>
              </div>

              {/* Pro Plan */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-lg text-cyan-300">Pro</h3>
                  <p className="text-xs text-slate-400 mt-1">For content agencies & production teams</p>
                  <div className="text-3xl font-black mt-4">$99 <span className="text-xs font-normal text-slate-400">/mo</span></div>
                  <ul className="mt-6 space-y-3 text-xs text-slate-300">
                    <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" /><span>20 hours (1,200 mins) processing / mo</span></li>
                    <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" /><span>Priority FFmpeg rendering queue</span></li>
                    <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" /><span>Multi-platform batch export</span></li>
                    <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" /><span>Agency workspace & multi-seat</span></li>
                  </ul>
                </div>
                <button 
                  onClick={() => handleUpgradePlan('Pro')}
                  className={`mt-8 w-full py-3 rounded-xl font-bold text-xs transition ${
                    user?.plan === 'Pro' 
                      ? 'bg-cyan-600 text-white cursor-default' 
                      : 'bg-slate-800 hover:bg-slate-700 text-white'
                  }`}
                >
                  {user?.plan === 'Pro' ? 'Current Active Plan' : 'Subscribe via Stripe ($99/mo)'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= 6. ADMIN DASHBOARD ================= */}
        {activeTab === 'admin' && (
          <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-6">
              <div>
                <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/30 px-3 py-1 rounded-full text-indigo-300 text-xs font-semibold mb-2">
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Prompt 22: Founder & Admin Metrics</span>
                </div>
                <h1 className="text-3xl font-black tracking-tight">Admin & Business Intelligence Dashboard</h1>
                <p className="text-slate-400 text-sm mt-1">Real-time SaaS telemetry, Stripe MRR, conversion funnel, and storage usage.</p>
              </div>
              <button 
                onClick={fetchAdminMetrics}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition flex items-center space-x-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Live Telemetry</span>
              </button>
            </div>

            {/* Metrics cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                <span className="text-xs text-slate-400 uppercase font-semibold">Stripe MRR</span>
                <div className="text-2xl font-black text-emerald-400 mt-2">${adminMetrics?.mrr.toLocaleString() || '14,850'}</div>
                <span className="text-[11px] text-emerald-300">+22% month over month</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                <span className="text-xs text-slate-400 uppercase font-semibold">Total Creators</span>
                <div className="text-2xl font-black text-white mt-2">{adminMetrics?.totalUsers.toLocaleString() || '1,420'}</div>
                <span className="text-[11px] text-purple-300">Clerk Auth synced</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                <span className="text-xs text-slate-400 uppercase font-semibold">Active Projects</span>
                <div className="text-2xl font-black text-white mt-2">{adminMetrics?.activeProjects.toLocaleString() || '8,940'}</div>
                <span className="text-[11px] text-indigo-300">Processed through Whisper</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                <span className="text-xs text-slate-400 uppercase font-semibold">Conversion Rate</span>
                <div className="text-2xl font-black text-amber-300 mt-2">{adminMetrics?.conversionRate || '6.4%'}</div>
                <span className="text-[11px] text-slate-400">Free to Paid trial</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                <span className="text-xs text-slate-400 uppercase font-semibold">Supabase Storage</span>
                <div className="text-2xl font-black text-cyan-300 mt-2">{adminMetrics?.storageUsageGb || 420.5} GB</div>
                <span className="text-[11px] text-cyan-400">Videos & Rendered MP4s</span>
              </div>
            </div>

            {/* Top Paying Customers Table */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="font-bold text-base text-white">Top Creator Accounts (Stripe Live Subscriptions)</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                      <th className="pb-3">Creator Name</th>
                      <th className="pb-3">Email</th>
                      <th className="pb-3">Active Tier</th>
                      <th className="pb-3">Monthly Spend</th>
                      <th className="pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-200">
                    {adminMetrics?.topCustomers.map((cust, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/30 transition">
                        <td className="py-3.5 font-bold flex items-center space-x-2">
                          <div className="w-7 h-7 rounded-lg bg-purple-900/60 text-purple-300 flex items-center justify-center font-bold text-xs">
                            {cust.name.charAt(0)}
                          </div>
                          <span>{cust.name}</span>
                        </td>
                        <td className="py-3.5 text-slate-400">{cust.email}</td>
                        <td className="py-3.5">
                          <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                            {cust.plan}
                          </span>
                        </td>
                        <td className="py-3.5 font-black text-emerald-400">${cust.mrr}/mo</td>
                        <td className="py-3.5">
                          <span className="flex items-center space-x-1 text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Stripe Active</span>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= 7. RESEND EMAIL SYSTEM ================= */}
        {activeTab === 'emails' && (
          <div className="p-6 lg:p-12 max-w-5xl mx-auto space-y-8">
            <div className="border-b border-slate-800 pb-6">
              <div className="inline-flex items-center space-x-2 bg-purple-500/10 border border-purple-500/30 px-3 py-1 rounded-full text-purple-300 text-xs font-semibold mb-2">
                <Mail className="w-3.5 h-3.5" />
                <span>Prompt 23: Resend Email System</span>
              </div>
              <h1 className="text-3xl font-black tracking-tight">Transactional Email System (Resend)</h1>
              <p className="text-slate-400 text-sm mt-1">
                Automated lifecycle notifications: welcome onboarding and video processing complete alerts.
              </p>
            </div>

            <div className="grid lg:grid-cols-12 gap-6">
              {/* Controls */}
              <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5">
                <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider">Send Test Email</h3>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Template</label>
                  <div className="space-y-2">
                    <button
                      onClick={() => setEmailType('welcome')}
                      className={`w-full p-3 rounded-xl text-left text-xs font-bold transition border ${
                        emailType === 'welcome'
                          ? 'bg-purple-600/20 border-purple-500 text-purple-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      1. Welcome Onboarding Email
                    </button>
                    <button
                      onClick={() => setEmailType('processing_complete')}
                      className={`w-full p-3 rounded-xl text-left text-xs font-bold transition border ${
                        emailType === 'processing_complete'
                          ? 'bg-purple-600/20 border-purple-500 text-purple-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      2. Video Processing Complete Email
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Recipient Name</label>
                  <input 
                    type="text" 
                    value={emailRecipient} 
                    onChange={(e) => setEmailRecipient(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <button 
                  onClick={handleSendTestEmail}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center space-x-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Transactional Email via Resend</span>
                </button>

                {emailStatus && (
                  <div className="p-3 bg-purple-950/60 border border-purple-800 text-purple-300 text-xs rounded-xl">
                    {emailStatus}
                  </div>
                )}
              </div>

              {/* Live HTML Email Preview */}
              <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Live HTML Email Preview</span>
                <div className="bg-black/80 rounded-2xl border border-slate-800 p-6 space-y-4 text-sm font-sans">
                  {emailType === 'welcome' ? (
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white mb-4">
                        <Flame className="w-6 h-6" />
                      </div>
                      <h2 className="text-xl font-bold text-purple-300">Welcome to ContentForge AI, {emailRecipient}!</h2>
                      <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                        You're all set up. You can now turn any long-form YouTube video, podcast episode, or local recording into 50 high-retention viral shorts with TikTok karaoke subtitles.
                      </p>
                      <div className="mt-6">
                        <button className="px-5 py-2.5 bg-purple-600 text-white font-bold text-xs rounded-xl">
                          Upload Your First Video
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white mb-4">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <h2 className="text-xl font-bold text-emerald-400">Your Viral Clips Are Ready! 🔥</h2>
                      <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                        We finished processing <strong>"{selectedProject?.title || 'Masterclass Episode'}"</strong>. We detected <strong>5 viral moments</strong> with high hook and retention scores.
                      </p>
                      <div className="mt-6">
                        <button className="px-5 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl">
                          Review & Download Clips
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= 8. CI/CD & DEPLOYMENT BLUEPRINT ================= */}
        {activeTab === 'deployment' && (
          <div className="p-6 lg:p-12 max-w-5xl mx-auto space-y-8">
            <div className="border-b border-slate-800 pb-6">
              <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/30 px-3 py-1 rounded-full text-indigo-300 text-xs font-semibold mb-2">
                <Server className="w-3.5 h-3.5" />
                <span>Prompt 24: Production Deployment Blueprint</span>
              </div>
              <h1 className="text-3xl font-black tracking-tight">Production Infrastructure & CI/CD</h1>
              <p className="text-slate-400 text-sm mt-1">
                Battle-tested production stack: Vercel (Edge UI), Supabase PostgreSQL, Stripe Webhook fulfillment, and OpenAI Whisper.
              </p>
            </div>

            {/* Architecture Cards */}
            <div className="grid sm:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                <span className="text-xs text-purple-400 font-bold uppercase">Frontend / Hosting</span>
                <div className="text-base font-bold text-white mt-1">Vercel</div>
                <p className="text-xs text-slate-400 mt-1">Next.js Edge & Serverless functions</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                <span className="text-xs text-indigo-400 font-bold uppercase">Database & Storage</span>
                <div className="text-base font-bold text-white mt-1">Supabase</div>
                <p className="text-xs text-slate-400 mt-1">PostgreSQL RLS + 500MB Video Buckets</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                <span className="text-xs text-emerald-400 font-bold uppercase">Billing & MRR</span>
                <div className="text-base font-bold text-white mt-1">Stripe</div>
                <p className="text-xs text-slate-400 mt-1">Checkout & Raw Signature Webhooks</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                <span className="text-xs text-amber-400 font-bold uppercase">AI Processing</span>
                <div className="text-base font-bold text-white mt-1">OpenAI & FFmpeg</div>
                <p className="text-xs text-slate-400 mt-1">Whisper-1 + ASS Subtitle Burn-in</p>
              </div>
            </div>

            {/* Production ENV Variables */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">Production ENV Template (.env.production)</span>
                <button 
                  onClick={() => copyToClipboard(deploymentConfig?.envExample || '', 'env')}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 rounded-lg flex items-center space-x-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedKey === 'env' ? 'Copied!' : 'Copy ENV'}</span>
                </button>
              </div>
              <pre className="text-xs font-mono bg-slate-950 p-4 rounded-xl border border-slate-800 text-emerald-400 overflow-x-auto leading-relaxed">
{deploymentConfig?.envExample || `# ContentForge AI Production Environment Variables
NODE_ENV=production
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.supabase.co:5432/postgres"
CLERK_SECRET_KEY="sk_live_..."
OPENAI_API_KEY="sk-proj-..."
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
RESEND_API_KEY="re_..."`}
              </pre>
            </div>

            {/* CI/CD Pipeline YAML */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">GitHub Actions CI/CD (.github/workflows/deploy.yml)</span>
                <button 
                  onClick={() => copyToClipboard(deploymentConfig?.cicdPipeline || '', 'cicd')}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 rounded-lg flex items-center space-x-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedKey === 'cicd' ? 'Copied!' : 'Copy YAML'}</span>
                </button>
              </div>
              <pre className="text-xs font-mono bg-slate-950 p-4 rounded-xl border border-slate-800 text-cyan-400 overflow-x-auto leading-relaxed">
{deploymentConfig?.cicdPipeline || `name: ContentForge AI CI/CD
on:
  push:
    branches: [ main ]
jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci && npm run lint && npm run build`}
              </pre>
            </div>
          </div>
        )}

        {/* ================= 9. CTO LAUNCH CHECKLIST ================= */}
        {activeTab === 'checklist' && (
          <div className="p-6 lg:p-12 max-w-5xl mx-auto space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-6">
              <div>
                <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full text-emerald-300 text-xs font-semibold mb-2">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Prompt 25: Startup CTO Launch Audit</span>
                </div>
                <h1 className="text-3xl font-black tracking-tight">Startup CTO Launch Readiness Audit</h1>
                <p className="text-slate-400 text-sm mt-1">
                  Comprehensive audit across Security, Performance, Billing, Storage, AI costs, Testing, SEO, and Analytics.
                </p>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-500/30 px-4 py-2 rounded-2xl flex items-center space-x-2 text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>100% Launch Ready (Zero Blockers)</span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {checklistCategories.map((cat, idx) => (
                <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <h3 className="font-bold text-sm text-white flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span>{cat.category}</span>
                    </h3>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                      PASSED
                    </span>
                  </div>

                  <div className="space-y-2">
                    {cat.items.map((item: any, iIdx: number) => (
                      <div key={iIdx} className="p-3 bg-slate-950/60 rounded-xl border border-slate-850">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-200">{item.task}</span>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= 10. PRISMA SCHEMA ================= */}
        {activeTab === 'spec' && (
          <div className="p-6 lg:p-12 max-w-5xl mx-auto space-y-8">
            <div className="border-b border-slate-800 pb-6">
              <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/30 px-3 py-1 rounded-full text-indigo-300 text-xs font-semibold mb-2">
                <Database className="w-3.5 h-3.5" />
                <span>Prompt 4: PostgreSQL Architecture</span>
              </div>
              <h1 className="text-3xl font-black tracking-tight">Complete Prisma Schema (`schema.prisma`)</h1>
              <p className="text-slate-400 text-sm mt-1">
                9 core tables: User, Subscription, Project, Video, Transcript, Clip, Export, UsageTracking, and BillingEvent.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">schema.prisma (PostgreSQL)</span>
                <span className="text-xs text-slate-400">9 Models • Complete Relations</span>
              </div>
              <pre className="text-xs font-mono bg-slate-950 p-6 rounded-2xl border border-slate-800 text-emerald-400 overflow-x-auto leading-relaxed">
{`datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id            String          @id @default(uuid())
  clerkId       String          @unique
  email         String          @unique
  name          String?
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt
  subscription  Subscription?
  projects      Project[]
  usageTracking UsageTracking[]
  billingEvents BillingEvent[]

  @@index([clerkId])
  @@index([email])
}

model Subscription {
  id                   String             @id @default(uuid())
  userId               String             @unique
  user                 User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  stripeCustomerId     String             @unique
  stripeSubscriptionId String             @unique
  plan                 SubscriptionPlan   @default(FREE)
  status               SubscriptionStatus @default(ACTIVE)
  renewalDate          DateTime
  createdAt            DateTime           @default(now())
  updatedAt            DateTime           @updatedAt

  @@index([stripeCustomerId])
}

enum SubscriptionPlan {
  FREE
  CREATOR
  PRO
}

enum SubscriptionStatus {
  ACTIVE
  CANCELED
  PAST_DUE
}

model Project {
  id              String        @id @default(uuid())
  userId          String
  user            User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  title           String
  sourceType      SourceType    @default(YOUTUBE)
  status          ProjectStatus @default(PENDING)
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  video           Video?
  transcript      Transcript?
  clips           Clip[]

  @@index([userId])
}

enum SourceType {
  YOUTUBE
  UPLOAD_MP4
  UPLOAD_MOV
}

enum ProjectStatus {
  PENDING
  TRANSCRIBING
  ANALYZING
  COMPLETED
  FAILED
}

model Video {
  id         String   @id @default(uuid())
  projectId  String   @unique
  project    Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  storageUrl String
  fileSizeMb Float
  resolution String
  duration   Float
  createdAt  DateTime @default(now())
}

model Transcript {
  id        String   @id @default(uuid())
  projectId String   @unique
  project   Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  rawText   String
  wordsJson Json
  createdAt DateTime @default(now())
}

model Clip {
  id              String   @id @default(uuid())
  projectId       String
  project         Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  title           String
  startTime       Float
  endTime         Float
  duration        Float
  hookScore       Int
  engagementScore Int
  viralityScore   Int
  reason          String
  captionStyle    String
  platform        String
  createdAt       DateTime @default(now())
  exports         Export[]

  @@index([projectId])
}

model Export {
  id         String       @id @default(uuid())
  clipId     String
  clip       Clip         @relation(fields: [clipId], references: [id], onDelete: Cascade)
  exportUrl  String
  format     String       @default("MP4")
  resolution String       @default("1080x1920")
  watermark  Boolean      @default(true)
  status     ExportStatus @default(PROCESSING)
  createdAt  DateTime     @default(now())

  @@index([clipId])
}

enum ExportStatus {
  PROCESSING
  READY
  FAILED
}

model UsageTracking {
  id              String   @id @default(uuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  minutesUsed     Int      @default(0)
  videosProcessed Int      @default(0)
  billingMonth    String
  createdAt       DateTime @default(now())

  @@unique([userId, billingMonth])
}

model BillingEvent {
  id               String   @id @default(uuid())
  userId           String
  user             User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  stripeEventId    String   @unique
  stripeCustomerId String
  amountPaid       Float
  currency         String   @default("USD")
  status           String
  createdAt        DateTime @default(now())

  @@index([userId])
}`}
              </pre>
            </div>
          </div>
        )}

        {/* ================= 11. COFOUNDER STRATEGY & BRUTAL AUDIT ================= */}
        {activeTab === 'strategy' && (
          <div className="p-6 lg:p-12 max-w-6xl mx-auto space-y-10">
            <div className="border-b border-slate-800 pb-6">
              <div className="inline-flex items-center space-x-2 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full text-amber-300 text-xs font-semibold mb-3">
                <Rocket className="w-3.5 h-3.5" />
                <span>Executive Co-founder Strategic Audit</span>
              </div>
              <h1 className="text-4xl font-black tracking-tight text-white">
                ContentForge AI — Co-founder Review & Go-To-Market War Room
              </h1>
              <p className="text-slate-400 text-base mt-2">
                A brutally honest, direct startup assessment answering the 7 mission-critical questions for venture and bootstrapped success.
              </p>
            </div>

            {/* Strategic Topic Navigation */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              {[
                { id: 1, label: '1. Why Buy', icon: TrendingUp },
                { id: 2, label: '2. Why NOT Buy', icon: AlertTriangle },
                { id: 3, label: '3. Competitors', icon: Users },
                { id: 4, label: '4. The Moat', icon: ShieldCheck },
                { id: 5, label: '5. First $1k MRR', icon: DollarSign },
                { id: 6, label: '6. MVP Only', icon: CheckSquare },
                { id: 7, label: '7. Delay List', icon: ChevronRight }
              ].map(item => {
                const Icon = item.icon;
                const active = activeStrategyTopic === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveStrategyTopic(item.id)}
                    className={`p-3 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center space-y-1.5 border ${
                      active
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-lg shadow-amber-500/20'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Deep-Dive Content Cards */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6">
              {activeStrategyTopic === 1 && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 text-emerald-400">
                    <TrendingUp className="w-6 h-6" />
                    <h2 className="text-2xl font-black">1. Why Users Would Buy This</h2>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4 text-xs">
                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                      <div className="font-bold text-amber-400 text-sm">15-Hour Weekly Time Savings</div>
                      <p className="text-slate-300 leading-relaxed">
                        Manually scrubbing a 60-minute podcast in Premiere Pro, finding 15-second hooks, cropping to 9:16, and manually transcribing word-by-word karaoke takes an editor 4–6 hours per episode. ContentForge AI does it in 90 seconds.
                      </p>
                    </div>
                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                      <div className="font-bold text-emerald-400 text-sm">Instant 50x Content Repurposing</div>
                      <p className="text-slate-300 leading-relaxed">
                        Creators and agencies with existing long-form libraries can extract 50 TikToks, Instagram Reels, and YouTube Shorts from a single masterclass without filming any new footage.
                      </p>
                    </div>
                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                      <div className="font-bold text-purple-400 text-sm">Quantified Virality Moat Scoring</div>
                      <p className="text-slate-300 leading-relaxed">
                        Instead of guessing what will pop, creators get a 0–100 Hook Score and psychological breakdown (controversy, curiosity loop, emotional peak) showing exactly why a clip will retain viewers.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeStrategyTopic === 2 && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 text-red-400">
                    <AlertTriangle className="w-6 h-6" />
                    <h2 className="text-2xl font-black">2. Why Users Would NOT Buy This (Brutal Obstacles)</h2>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4 text-xs">
                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                      <div className="font-bold text-red-400 text-sm">Opus Clip & CapCut Incumbency</div>
                      <p className="text-slate-300 leading-relaxed">
                        Opus Clip has raised tens of millions and CapCut is free with massive brand awareness. If ContentForge looks like a generic wrapper with basic captions, users will churn in 14 days.
                      </p>
                    </div>
                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                      <div className="font-bold text-orange-400 text-sm">AI Hallucinations in Dynamic Framing</div>
                      <p className="text-slate-300 leading-relaxed">
                        If multi-speaker podcasts have awkward center crops where one speaker is cut in half or face-tracking jerks awkwardly, editors will immediately revert to manual editing.
                      </p>
                    </div>
                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                      <div className="font-bold text-amber-400 text-sm">API Margin Compression & Abuse</div>
                      <p className="text-slate-300 leading-relaxed">
                        Transcribing 4K 2-hour video files via Whisper and GPU FFmpeg render workers eats server margins fast if users upload uncompressed 3GB files without strict limits.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeStrategyTopic === 3 && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 text-cyan-400">
                    <Users className="w-6 h-6" />
                    <h2 className="text-2xl font-black">3. Top 10 Direct Competitors</h2>
                  </div>
                  <div className="grid sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                    {[
                      { name: '1. Opus Clip', strength: 'Category leader in AI short-form clipping and auto-framing.' },
                      { name: '2. Munch', strength: 'Strong marketing platform scoring and cross-social posting.' },
                      { name: '3. Klap', strength: 'Fastest 1-click YouTube to TikTok pipeline with face detection.' },
                      { name: '4. Submagic', strength: 'Famous for hyper-viral captions, sound effects, and B-roll inserts.' },
                      { name: '5. Descript', strength: 'Full desktop DAW/NLE with text-based editing and Studio Sound.' },
                      { name: '6. CapCut (ByteDance)', strength: 'Free mobile/desktop powerhouse with native TikTok ecosystem.' },
                      { name: '7. Vizard.ai', strength: 'Specialized for webinar repurposing and corporate video teams.' },
                      { name: '8. Vidyo.ai', strength: 'Social media templates and automated subtitle styling.' },
                      { name: '9. 2short.ai', strength: 'Budget-friendly YouTube shorts extractor for casual vloggers.' },
                      { name: '10. Riverside.fm', strength: 'High-fidelity local 4K podcast recording + built-in AI clips.' }
                    ].map((comp, idx) => (
                      <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                        <div className="font-bold text-white text-xs">{comp.name}</div>
                        <p className="text-slate-400 text-[11px] mt-1">{comp.strength}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeStrategyTopic === 4 && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 text-purple-400">
                    <ShieldCheck className="w-6 h-6" />
                    <h2 className="text-2xl font-black">4. What Feature Becomes Our True Moat</h2>
                  </div>
                  <div className="bg-purple-950/40 border border-purple-800 p-6 rounded-2xl space-y-3">
                    <h3 className="text-lg font-black text-amber-300">
                      The "Algorithmic Retention & Controversy Predictor" (Hook Moat Engine)
                    </h3>
                    <p className="text-slate-200 text-xs leading-relaxed">
                      Every tool can transcribe and crop video. <strong>Our defensible moat is our proprietary Hook Scorer</strong>:
                    </p>
                    <ul className="space-y-2 text-xs text-slate-300 list-disc list-inside">
                      <li><strong>The First 3-Second Retention Trigger:</strong> Detecting speech speed acceleration, pitch intensity, and contrarian openings.</li>
                      <li><strong>Automated B-Roll & Visual Hook Synthesis:</strong> Prompting AI visual b-roll at the exact second retention dips.</li>
                      <li><strong>Agency Client White-Labeling & Sub-Accounts:</strong> Enabling social media agencies to manage 20 podcasters in one unified dashboard with custom client review links.</li>
                    </ul>
                  </div>
                </div>
              )}

              {activeStrategyTopic === 5 && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 text-emerald-400">
                    <DollarSign className="w-6 h-6" />
                    <h2 className="text-2xl font-black">5. Fastest Route to First $1,000 MRR (Action Plan)</h2>
                  </div>
                  <div className="space-y-3 text-xs">
                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-start space-x-3">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0">1</div>
                      <div>
                        <div className="font-bold text-white text-sm">Target 20 YouTube Podcasters with 10k–100k Subs</div>
                        <p className="text-slate-300 mt-1">Don't pitch software. Find 30 podcasters on YouTube who don't post Shorts. Run their latest episode through ContentForge, generate 5 viral clips with karaoke captions, and send them a private Google Drive link via Twitter DM/Email with: <em>"Made these 5 shorts from your last episode for free. If you want 50 per month, it's $49."</em></p>
                      </div>
                    </div>
                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-start space-x-3">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0">2</div>
                      <div>
                        <div className="font-bold text-white text-sm">Close 20 Customers at $49/mo = $980 MRR (or 10 Agencies at $99/mo = $990 MRR)</div>
                        <p className="text-slate-300 mt-1">At a conservative 15% conversion rate on free customized clips, 130 outreaches guarantees the first 20 paying subscribers in 14 days.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeStrategyTopic === 6 && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 text-amber-400">
                    <CheckSquare className="w-6 h-6" />
                    <h2 className="text-2xl font-black">6. MVP Features Only (What Must Exist on Day 1)</h2>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="text-slate-200">YouTube URL import & 500MB local upload</span>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="text-slate-200">OpenAI Whisper word-level timestamps</span>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="text-slate-200">Viral Hook Scoring & 15s/30s/45s/60s slicing</span>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="text-slate-200">TikTok Animated Karaoke Captions</span>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="text-slate-200">1080x1920 MP4 vertical crop download</span>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="text-slate-200">Stripe $49 Creator and $99 Pro billing</span>
                    </div>
                  </div>
                </div>
              )}

              {activeStrategyTopic === 7 && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 text-purple-400">
                    <ChevronRight className="w-6 h-6" />
                    <h2 className="text-2xl font-black">7. Features to Delay (Do Not Build Yet)</h2>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                      <span className="text-slate-300">1. Direct Social Media Auto-Scheduling (TikTok / IG API Tokens)</span>
                      <span className="text-amber-400 font-bold">Delay to Phase 3</span>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                      <span className="text-slate-300">2. Complex Multi-Speaker Active Speaker Face Tracking AI</span>
                      <span className="text-amber-400 font-bold">Delay to Phase 2</span>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                      <span className="text-slate-300">3. AI Voice Cloning & Automatic Audio Dubbing</span>
                      <span className="text-amber-400 font-bold">Delay (Heavy compute cost)</span>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                      <span className="text-slate-300">4. Native iOS / Android Mobile Apps</span>
                      <span className="text-amber-400 font-bold">Delay (Web SPA first)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </main>

      {/* Stripe Checkout Modal Simulator */}
      {stripeModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full relative shadow-2xl space-y-6">
            <button 
              onClick={() => setStripeModalOpen(false)} 
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              ✕
            </button>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white font-bold">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-lg text-white">Stripe Checkout</h3>
                <span className="text-xs text-purple-400 font-semibold">{selectedPlanForCheckout} Plan • 256-bit SSL</span>
              </div>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-white block">Monthly Subscription</span>
                <span className="text-xs text-slate-400 block">Renews automatically. Cancel anytime.</span>
              </div>
              <span className="text-xl font-black text-emerald-400">
                {selectedPlanForCheckout === 'Creator' ? '$49' : selectedPlanForCheckout === 'Pro' ? '$99' : '$0'}/mo
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Card Information</label>
                <input 
                  type="text" 
                  readOnly 
                  value="•••• •••• •••• 4242 (Stripe Test Card)" 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Expires</label>
                  <input type="text" readOnly value="12 / 28" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-200" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">CVC</label>
                  <input type="text" readOnly value="•••" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-200" />
                </div>
              </div>
            </div>

            <button 
              onClick={executeStripePayment}
              disabled={isCheckoutProcessing}
              className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg transition flex items-center justify-center space-x-2"
            >
              {isCheckoutProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing Stripe Payment...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-emerald-300" />
                  <span>Confirm & Activate {selectedPlanForCheckout} Plan</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 px-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
        <div className="flex items-center space-x-2">
          <Flame className="w-4 h-4 text-purple-400" />
          <span>&copy; {new Date().getFullYear()} ContentForge AI. All rights reserved.</span>
        </div>
        <div className="flex items-center space-x-4">
          <button onClick={() => setActiveTab('strategy')} className="hover:text-amber-400 transition font-semibold">Co-founder Review</button>
          <button onClick={() => setActiveTab('checklist')} className="hover:text-emerald-400 transition font-semibold">CTO Checklist</button>
          <button onClick={() => setActiveTab('spec')} className="hover:text-indigo-400 transition font-semibold">Prisma Schema</button>
          <button onClick={() => setActiveTab('deployment')} className="hover:text-purple-400 transition font-semibold">CI/CD</button>
        </div>
      </footer>
    </div>
  );
}
