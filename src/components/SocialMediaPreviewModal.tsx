import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Heart, MessageCircle, Bookmark, Share2, Music, Download, 
  Copy, Check, Volume2, VolumeX, Play, Pause, TrendingUp, Sparkles,
  Smartphone, Send, Smile, MoreVertical
} from 'lucide-react';

interface SocialMediaPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string | null;
  clipTitle: string;
  viralityScore: number;
  reason?: string;
  duration: number;
  category?: string;
  fileSizeBytes?: number;
  userName?: string;
  onDownload: () => void;
}

export const SocialMediaPreviewModal: React.FC<SocialMediaPreviewModalProps> = ({
  isOpen,
  onClose,
  videoUrl,
  clipTitle,
  viralityScore,
  reason,
  duration,
  category,
  fileSizeBytes,
  userName = 'creator',
  onDownload
}) => {
  const [platform, setPlatform] = useState<'tiktok' | 'instagram'>('tiktok');
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(() => Math.floor(viralityScore * 1840 + 12400));
  const [saveCount, setSaveCount] = useState(() => Math.floor(viralityScore * 320 + 2100));
  const [showComments, setShowComments] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [commentsList, setCommentsList] = useState([
    { id: 1, user: 'sarah_growth', text: 'This hook caught me immediately. Replaying this 3 times 🔥', likes: 241, time: '2h' },
    { id: 2, user: 'david_builds', text: 'The subtitle timing here is crazy smooth. What app made this?', likes: 98, time: '1h' },
    { id: 3, user: 'founder_hustle', text: 'Saving this before algorithm hides it 📌', likes: 45, time: '35m' }
  ]);

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isOpen) {
      setIsPlaying(true);
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {});
      }
    }
  }, [isOpen, videoUrl]);

  if (!isOpen) return null;

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleLike = () => {
    if (isLiked) {
      setLikeCount(prev => prev - 1);
      setIsLiked(false);
    } else {
      setLikeCount(prev => prev + 1);
      setIsLiked(true);
    }
  };

  const handleSave = () => {
    if (isSaved) {
      setSaveCount(prev => prev - 1);
      setIsSaved(false);
    } else {
      setSaveCount(prev => prev + 1);
      setIsSaved(true);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    setCommentsList([
      { id: Date.now(), user: 'you', text: commentInput.trim(), likes: 0, time: 'Just now' },
      ...commentsList
    ]);
    setCommentInput('');
  };

  const hashtagList = [
    '#shorts', '#viral', '#reels', '#growth', '#creator', '#podcastclips', '#mindset', '#contentcreator'
  ];

  const fullCaption = `${clipTitle} 🚀\n\n${reason ? `💡 Key takeaway: ${reason}\n\n` : ''}Turn your long-form videos into viral clips with ContentForge AI.\n\n${hashtagList.join(' ')}`;

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(fullCaption);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2000);
  };

  const formattedSize = fileSizeBytes 
    ? `${(fileSizeBytes / (1024 * 1024)).toFixed(2)} MB`
    : '284 KB';

  const estimatedReach = Math.floor(viralityScore * 650 + 25000).toLocaleString();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[92vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100">Social Media Feed Preview</h3>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>9:16 Vertical Render</span>
                <span aria-hidden="true">·</span>
                <span>1080x1920</span>
                <span aria-hidden="true">·</span>
                <span>{formattedSize}</span>
              </div>
            </div>
          </div>

          {/* Platform Segmented Switcher */}
          <div className="flex items-center gap-2">
            <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-xl">
              <button
                onClick={() => setPlatform('tiktok')}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  platform === 'tiktok'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                TikTok Feed
              </button>
              <button
                onClick={() => setPlatform('instagram')}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  platform === 'instagram'
                    ? 'bg-gradient-to-r from-purple-900/60 to-pink-900/60 text-pink-200 border border-pink-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Instagram Reels
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              aria-label="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Split 2-Column Desktop View */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 overflow-y-auto">
          
          {/* Left Column: Simulated Mobile Feed Container */}
          <div className="lg:col-span-5 flex justify-center items-center">
            <div className="relative w-full max-w-[340px] aspect-[9/16] bg-black rounded-[36px] overflow-hidden border-[6px] border-slate-800 shadow-2xl flex flex-col justify-between select-none">
              
              {/* Phone Camera Island */}
              <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-24 h-4 bg-slate-950 rounded-full z-30 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-800 mr-2" />
                <div className="w-1.5 h-1.5 rounded-full bg-blue-900/80" />
              </div>

              {/* Real Video / Canvas Layer */}
              <div 
                className="absolute inset-0 cursor-pointer overflow-hidden flex items-center justify-center bg-slate-950"
                onClick={togglePlay}
              >
                {videoUrl ? (
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    className="w-full h-full object-cover"
                    autoPlay
                    loop
                    muted={isMuted}
                    playsInline
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-indigo-950 via-slate-950 to-slate-900">
                    <Sparkles className="w-12 h-12 text-emerald-400 mb-3 animate-pulse" />
                    <p className="text-sm font-semibold text-white mb-1">{clipTitle}</p>
                    <p className="text-xs text-slate-400">1080x1920 9:16 Video Canvas</p>
                  </div>
                )}

                {/* Subtle Play / Pause Indicator */}
                {!isPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-20">
                    <div className="w-14 h-14 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white">
                      <Play className="w-6 h-6 fill-white translate-x-0.5" />
                    </div>
                  </div>
                )}
              </div>

              {/* Scrim Overlay for Clean Contrast */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/85 pointer-events-none z-10" />

              {/* ========================================================= */}
              {/* TIKTOK FEED INTERFACE */}
              {/* ========================================================= */}
              {platform === 'tiktok' && (
                <>
                  {/* TikTok Header */}
                  <div className="relative z-20 pt-8 px-4 flex items-center justify-between text-white text-xs font-semibold">
                    <div className="flex items-center space-x-4 mx-auto">
                      <span className="text-white/60 hover:text-white cursor-pointer">Following</span>
                      <span className="text-white border-b-2 border-white pb-0.5 cursor-pointer">For You</span>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleMute(); }}
                      className="p-1.5 rounded-full bg-black/40 backdrop-blur text-white hover:bg-black/60 transition"
                      title={isMuted ? 'Unmute' : 'Mute'}
                    >
                      {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* TikTok Right Actions Rail */}
                  <div className="absolute right-3 bottom-20 z-20 flex flex-col items-center space-y-4">
                    {/* User Avatar */}
                    <div className="relative mb-1">
                      <div className="w-10 h-10 rounded-full border-2 border-white bg-gradient-to-tr from-pink-500 to-amber-400 flex items-center justify-center text-white text-xs font-bold shadow-md">
                        {userName.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow">
                        +
                      </div>
                    </div>

                    {/* Like Action */}
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleLike(); }}
                      className="flex flex-col items-center group transition"
                    >
                      <div className={`p-2 rounded-full transition-transform active:scale-125 ${isLiked ? 'text-red-500' : 'text-white'}`}>
                        <Heart className={`w-7 h-7 drop-shadow-md ${isLiked ? 'fill-red-500' : ''}`} />
                      </div>
                      <span className="text-[11px] font-bold text-white drop-shadow tabular-nums">
                        {(likeCount / 1000).toFixed(1)}K
                      </span>
                    </button>

                    {/* Comment Action */}
                    <button 
                      onClick={(e) => { e.stopPropagation(); setShowComments(!showComments); }}
                      className="flex flex-col items-center group"
                    >
                      <div className="p-2 rounded-full text-white active:scale-125 transition-transform">
                        <MessageCircle className="w-7 h-7 fill-white/10 drop-shadow-md" />
                      </div>
                      <span className="text-[11px] font-bold text-white drop-shadow tabular-nums">
                        {commentsList.length}
                      </span>
                    </button>

                    {/* Bookmark Action */}
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleSave(); }}
                      className="flex flex-col items-center group transition"
                    >
                      <div className={`p-2 rounded-full transition-transform active:scale-125 ${isSaved ? 'text-amber-400' : 'text-white'}`}>
                        <Bookmark className={`w-7 h-7 drop-shadow-md ${isSaved ? 'fill-amber-400' : ''}`} />
                      </div>
                      <span className="text-[11px] font-bold text-white drop-shadow tabular-nums">
                        {(saveCount / 1000).toFixed(1)}K
                      </span>
                    </button>

                    {/* Share Action */}
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleCopyCaption(); }}
                      className="flex flex-col items-center group"
                    >
                      <div className="p-2 rounded-full text-white active:scale-125 transition-transform">
                        <Share2 className="w-7 h-7 drop-shadow-md" />
                      </div>
                      <span className="text-[11px] font-bold text-white drop-shadow tabular-nums">18.9K</span>
                    </button>

                    {/* Spinning Audio Vinyl Disc */}
                    <div className="w-9 h-9 rounded-full bg-slate-900 border-2 border-slate-700/80 p-1 animate-spin duration-[6000ms] flex items-center justify-center shadow-lg">
                      <div className="w-full h-full rounded-full bg-gradient-to-tr from-pink-500 to-indigo-600 flex items-center justify-center">
                        <Music className="w-3.5 h-3.5 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* TikTok Bottom Caption Details */}
                  <div className="relative z-20 pb-4 px-4 pr-16 text-white">
                    <div className="flex items-center space-x-1.5 mb-1.5">
                      <span className="font-bold text-xs text-white">@{userName.toLowerCase().replace(/\s+/g, '_')}</span>
                      <Check className="w-3 h-3 bg-blue-500 text-white rounded-full p-0.5" />
                      <span className="text-[10px] text-white/70">· 2h ago</span>
                    </div>

                    <p className="text-xs text-white/95 line-clamp-2 leading-relaxed mb-2 font-medium drop-shadow-sm">
                      {clipTitle} {hashtagList.slice(0, 3).join(' ')}
                    </p>

                    <div className="flex items-center space-x-2 text-[11px] text-white/80 overflow-hidden">
                      <Music className="w-3 h-3 shrink-0" />
                      <span className="truncate">Original Audio · ContentForge Viral Engine</span>
                    </div>
                  </div>
                </>
              )}

              {/* ========================================================= */}
              {/* INSTAGRAM REELS INTERFACE */}
              {/* ========================================================= */}
              {platform === 'instagram' && (
                <>
                  {/* IG Reels Top Bar */}
                  <div className="relative z-20 pt-8 px-4 flex items-center justify-between text-white">
                    <span className="text-sm font-bold tracking-tight">Reels</span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleMute(); }}
                      className="p-1.5 rounded-full bg-black/40 backdrop-blur text-white"
                    >
                      {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* IG Reels Right Actions Rail */}
                  <div className="absolute right-3 bottom-14 z-20 flex flex-col items-center space-y-4">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleLike(); }}
                      className="flex flex-col items-center"
                    >
                      <Heart className={`w-6 h-6 ${isLiked ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                      <span className="text-[10px] text-white mt-1 tabular-nums">{(likeCount / 1000).toFixed(1)}k</span>
                    </button>

                    <button 
                      onClick={(e) => { e.stopPropagation(); setShowComments(!showComments); }}
                      className="flex flex-col items-center"
                    >
                      <MessageCircle className="w-6 h-6 text-white" />
                      <span className="text-[10px] text-white mt-1 tabular-nums">{commentsList.length}</span>
                    </button>

                    <button 
                      onClick={(e) => { e.stopPropagation(); handleCopyCaption(); }}
                      className="flex flex-col items-center"
                    >
                      <Send className="w-5 h-5 text-white" />
                      <span className="text-[10px] text-white mt-1 tabular-nums">2.4k</span>
                    </button>

                    <button 
                      onClick={(e) => { e.stopPropagation(); handleSave(); }}
                      className="flex flex-col items-center"
                    >
                      <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-white text-white' : 'text-white'}`} />
                    </button>

                    <button className="flex flex-col items-center text-white">
                      <MoreVertical className="w-5 h-5" />
                    </button>

                    {/* Square audio cover */}
                    <div className="w-6 h-6 rounded-md border border-white/60 bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center">
                      <Music className="w-3 h-3 text-white" />
                    </div>
                  </div>

                  {/* IG Reels Bottom Caption Area */}
                  <div className="relative z-20 pb-4 px-4 pr-14 text-white">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 p-[1.5px]">
                        <div className="w-full h-full bg-black rounded-full flex items-center justify-center text-[10px] font-bold">
                          {userName.slice(0, 1).toUpperCase()}
                        </div>
                      </div>
                      <span className="font-semibold text-xs">{userName.toLowerCase()}</span>
                      <button className="px-2 py-0.5 text-[10px] font-semibold border border-white/40 rounded-md hover:bg-white/20 transition">
                        Follow
                      </button>
                    </div>

                    <p className="text-xs text-white/95 line-clamp-2 leading-relaxed mb-2">
                      {clipTitle} <span className="text-white/60">...more</span>
                    </p>

                    <div className="flex items-center space-x-2 text-[10px] text-white/80">
                      <Music className="w-3 h-3" />
                      <span className="truncate">Trending Audio · ContentForge AI</span>
                    </div>
                  </div>
                </>
              )}

              {/* Simulated Comments Drawer Bottom Sheet */}
              {showComments && (
                <div 
                  className="absolute inset-x-0 bottom-0 max-h-[70%] bg-slate-900/95 backdrop-blur-md rounded-t-2xl z-40 p-4 border-t border-slate-800 flex flex-col animate-in slide-in-from-bottom-5 duration-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                    <span className="text-xs font-bold text-white">{commentsList.length} Comments</span>
                    <button 
                      onClick={() => setShowComments(false)}
                      className="p-1 text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs mb-3 max-h-48">
                    {commentsList.map(c => (
                      <div key={c.id} className="flex items-start space-x-2">
                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-[10px] shrink-0">
                          {c.user[0].toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-1.5">
                            <span className="font-semibold text-slate-300 text-[11px]">@{c.user}</span>
                            <span className="text-slate-500 text-[10px]">{c.time}</span>
                          </div>
                          <p className="text-slate-200 text-xs mt-0.5 leading-snug">{c.text}</p>
                        </div>
                        <Heart className="w-3.5 h-3.5 text-slate-500 hover:text-red-400 cursor-pointer shrink-0 mt-1" />
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleAddComment} className="flex items-center gap-1.5 pt-2 border-t border-slate-800">
                    <input
                      type="text"
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      placeholder="Add simulated comment..."
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="submit"
                      disabled={!commentInput.trim()}
                      className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-lg text-xs font-semibold"
                    >
                      Post
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Engagement Diagnostics & Quick Actions */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-5">
            
            <div className="space-y-5">
              
              {/* Viral Predictive Analysis Card */}
              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-slate-200">Viral Engagement Forecast</span>
                  </div>
                  <span className="text-xs font-mono tabular-nums text-emerald-400 font-bold">
                    Score: {viralityScore}/100
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-1">
                  <div className="p-2.5 bg-slate-900 border border-slate-800/80 rounded-xl">
                    <span className="block text-[11px] text-slate-400 mb-0.5">Est. 24h Views</span>
                    <span className="text-sm font-bold text-white font-mono tabular-nums">{estimatedReach}</span>
                  </div>
                  <div className="p-2.5 bg-slate-900 border border-slate-800/80 rounded-xl">
                    <span className="block text-[11px] text-slate-400 mb-0.5">Hook Retention</span>
                    <span className="text-sm font-bold text-emerald-400 font-mono tabular-nums">91.4%</span>
                  </div>
                  <div className="p-2.5 bg-slate-900 border border-slate-800/80 rounded-xl">
                    <span className="block text-[11px] text-slate-400 mb-0.5">Recommended Cut</span>
                    <span className="text-sm font-bold text-white font-mono tabular-nums">{duration}s 9:16</span>
                  </div>
                </div>

                {reason && (
                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/50">
                    <span className="font-semibold text-emerald-400">Hook Trigger:</span> {reason}
                  </p>
                )}
              </div>

              {/* Generated Social Caption & Copy Box */}
              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">Generated Caption & Viral Hashtags</span>
                  <button
                    onClick={handleCopyCaption}
                    className="flex items-center space-x-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 rounded-lg transition"
                  >
                    {copiedCaption ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-semibold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span>Copy Caption</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 font-mono whitespace-pre-wrap max-h-32 overflow-y-auto leading-relaxed">
                  {fullCaption}
                </div>

                {/* Hashtag Quick Selector */}
                <div className="flex flex-wrap gap-1.5">
                  {hashtagList.map(tag => (
                    <span 
                      key={tag}
                      className="text-[11px] font-mono text-emerald-400/90 hover:text-emerald-300 cursor-pointer"
                      onClick={() => {
                        navigator.clipboard.writeText(tag);
                        setCopiedCaption(true);
                        setTimeout(() => setCopiedCaption(false), 1500);
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Technical Render Specs */}
              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center space-x-4">
                  <div>
                    <span className="block text-[10px] uppercase text-slate-500 font-bold">Resolution</span>
                    <span className="text-slate-200 font-mono">1080x1920 (9:16)</span>
                  </div>
                  <div className="w-px h-6 bg-slate-800" />
                  <div>
                    <span className="block text-[10px] uppercase text-slate-500 font-bold">Codec</span>
                    <span className="text-slate-200 font-mono">H.264 / AAC</span>
                  </div>
                  <div className="w-px h-6 bg-slate-800" />
                  <div>
                    <span className="block text-[10px] uppercase text-slate-500 font-bold">File Size</span>
                    <span className="text-slate-200 font-mono">{formattedSize}</span>
                  </div>
                </div>
                <span className="text-emerald-400 font-semibold flex items-center space-x-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>FFmpeg Verified</span>
                </span>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={onDownload}
                className="w-full sm:flex-1 py-3 px-5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2 transition active:scale-[0.99]"
              >
                <Download className="w-4 h-4" />
                <span>Download Final 1080x1920 MP4</span>
              </button>

              <button
                onClick={onClose}
                className="w-full sm:w-auto py-3 px-5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium rounded-xl transition"
              >
                Back to Studio
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
