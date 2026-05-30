import { useState, useRef, useEffect } from 'react';
import { analyzeAudio, API_BASE_URL } from '../api';
import type { AudioScanResponse } from '../types';
import { Radio, Mic, AlertCircle, RefreshCw, CheckCircle, FileAudio, Play, Square } from 'lucide-react';
import RiskScore from '../components/RiskScore';

export default function AudioScanner() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  const [result, setResult] = useState<AudioScanResponse | null>(null);
  const [error, setError] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playbackIntervalRef = useRef<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
      setResult(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      const ext = droppedFile.name.split('.').pop()?.toLowerCase();
      if (['mp3', 'wav', 'm4a'].includes(ext || '')) {
        setFile(droppedFile);
        setError('');
        setResult(null);
      } else {
        setError('Unsupported file type. Please upload MP3, WAV, or M4A.');
      }
    }
  };

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError('');
    setResult(null);
    setShowProgress(true);
    setUploadProgress(0);

    // Simulate active network upload progression
    const interval = setInterval(() => {
      setUploadProgress((p) => {
        if (p >= 90) {
          clearInterval(interval);
          return 90;
        }
        return p + 10;
      });
    }, 100);

    try {
      const data = await analyzeAudio(file);
      setUploadProgress(100);
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze audio. Please ensure the backend is running.');
    } finally {
      clearInterval(interval);
      setLoading(false);
      setTimeout(() => setShowProgress(false), 500);
    }
  };

  // Preset triggers creating fake local files so the user can instantly evaluate the AssemblyAI pipeline.
  const triggerPresetScam = async (presetName: string) => {
    setLoading(true);
    setError('');
    setResult(null);
    
    try {
      // Create a dummy blob representing an audio file with custom naming to guide the backend mock generator
      const blob = new Blob(["mock-audio-data"], { type: "audio/mp3" });
      const mockFile = new File([blob], `mock_scam_${presetName}.mp3`, { type: "audio/mp3" });
      setFile(mockFile);

      const data = await analyzeAudio(mockFile);
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to execute audio presets.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  useEffect(() => {
    // Initialize standard Audio element
    const audioObj = new Audio();
    audioObj.ontimeupdate = () => {
      setCurrentTime(audioObj.currentTime);
    };
    audioObj.onloadedmetadata = () => {
      setDuration(audioObj.duration);
    };
    audioRef.current = audioObj;
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      window.speechSynthesis.cancel();
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current);
      }
    };
  }, []);

  // Whenever file or result changes, reset the playback state
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    window.speechSynthesis.cancel();
    if (playbackIntervalRef.current) {
      clearInterval(playbackIntervalRef.current);
    }
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, [file, result]);

  const togglePlayback = () => {
    if (!result) return;

    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      window.speechSynthesis.cancel();
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current);
      }
      setIsPlaying(false);
    } else {
      const isMock = file && (file.name.startsWith('mock_scam_') || file.size < 100);
      
      if (isMock) {
        setIsPlaying(true);
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(result.transcript);
        
        // Load natural sounding speech voices
        const voices = window.speechSynthesis.getVoices();
        const englishVoice = voices.find(v => v.lang.startsWith('en-') && v.name.includes('Google')) || 
                             voices.find(v => v.lang.startsWith('en-')) || 
                             voices[0];
        if (englishVoice) {
          utterance.voice = englishVoice;
        }
        
        utterance.rate = 0.95; // Slightly slower, more deliberate robocall sound
        
        // Estimate speech duration: roughly 2.5 words per second
        const words = result.transcript.split(/\s+/).length;
        const estDuration = Math.max(5, Math.ceil(words / 2.5));
        
        setCurrentTime(0);
        setDuration(estDuration);
        
        if (playbackIntervalRef.current) clearInterval(playbackIntervalRef.current);
        playbackIntervalRef.current = setInterval(() => {
          setCurrentTime((prev) => {
            if (prev >= estDuration) {
              clearInterval(playbackIntervalRef.current);
              return estDuration;
            }
            return prev + 1;
          });
        }, 1000);
        
        utterance.onend = () => {
          setIsPlaying(false);
          if (playbackIntervalRef.current) clearInterval(playbackIntervalRef.current);
          setCurrentTime(0);
        };
        
        utterance.onerror = () => {
          setIsPlaying(false);
          if (playbackIntervalRef.current) clearInterval(playbackIntervalRef.current);
        };
        
        window.speechSynthesis.speak(utterance);
      } else if (file) {
        if (audioRef.current) {
          setIsPlaying(true);
          const objectUrl = URL.createObjectURL(file);
          audioRef.current.src = objectUrl;
          
          audioRef.current.play().catch((err) => {
            console.error("Audio playback error:", err);
            setIsPlaying(false);
          });
          
          audioRef.current.onended = () => {
            setIsPlaying(false);
            setCurrentTime(0);
          };
        }
      }
    }
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">AI Voice Note Scam Scanner</h1>
        <p className="text-sm font-medium text-slate-500 mt-1">Transcribe voice messages and analyze phone call dialogs for social engineering threat structures using AssemblyAI and Gemini Flash.</p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Upload zone */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-5">
            <h2 className="font-extrabold text-slate-800 tracking-tight">Audio Voice File Upload</h2>
            
            <form onSubmit={handleScan} className="space-y-5">
              <div 
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center space-y-3 ${
                  isDragging 
                    ? 'border-primary bg-primary-light/10 shadow-inner scale-[0.99]' 
                    : 'border-slate-200 hover:border-primary/40 hover:bg-slate-50/50'
                }`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".mp3,.wav,.m4a"
                  className="hidden"
                />
                
                <div className="bg-primary-light text-primary p-4 rounded-full">
                  <FileAudio size={28} />
                </div>
                
                {file ? (
                  <div>
                    <span className="text-sm font-bold text-slate-800 block truncate max-w-[280px]">{file.name}</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-1">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB • Ready
                    </span>
                  </div>
                ) : (
                  <div>
                    <span className="text-sm font-bold text-slate-700 block">Drag & Drop or Click to Browse Audio</span>
                    <span className="text-xs text-slate-400 block mt-1 leading-relaxed">Supports MP3, WAV, or M4A (Max 15MB)</span>
                  </div>
                )}
              </div>

              {showProgress && (
                <div className="w-full space-y-1.5 p-2 bg-slate-50/50 border border-slate-100 rounded-xl animate-fade-in">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <span>Uploading and transcribing voice bytes</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-primary h-full rounded-full transition-all duration-300 ease-out" 
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Radio size={12} className="text-primary animate-pulse" /> Transcription: AssemblyAI Cloud
                </span>
                
                <button
                  type="submit"
                  disabled={loading || !file}
                  className="w-full sm:w-auto bg-primary hover:bg-primary-hover disabled:bg-slate-200 text-white font-bold text-sm px-6 py-3 rounded-xl transition-all duration-200 flex justify-center items-center gap-2 shadow-md shadow-primary/10 hover:translate-y-[-1px]"
                >
                  {loading ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" /> Processing Voice...
                    </>
                  ) : (
                    'Transcribe & Scan Audio'
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Preset Audio Mimics */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
            <div>
              <h3 className="font-extrabold text-slate-700 text-sm tracking-tight">Try Hackathon Simulation Presets:</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Test speech pipelines instantly</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => triggerPresetScam('otp')}
                className="text-left p-3.5 rounded-xl border border-slate-100 hover:border-primary/25 hover:bg-primary-light/10 transition-all duration-200"
              >
                <span className="font-extrabold text-xs text-slate-800 block">📞 Fake OTP Robocall</span>
                <span className="text-[10px] text-slate-400 block mt-1 leading-relaxed">Simulates bank support demanding authentication tokens.</span>
              </button>
              
              <button
                onClick={() => triggerPresetScam('crypto')}
                className="text-left p-3.5 rounded-xl border border-slate-100 hover:border-primary/25 hover:bg-primary-light/10 transition-all duration-200"
              >
                <span className="font-extrabold text-xs text-slate-800 block">🪙 Double Crypto Yield</span>
                <span className="text-[10px] text-slate-400 block mt-1 leading-relaxed">Simulates voice alerts offering eth giveaways.</span>
              </button>

              <button
                onClick={() => triggerPresetScam('job')}
                className="text-left p-3.5 rounded-xl border border-slate-100 hover:border-primary/25 hover:bg-primary-light/10 transition-all duration-200"
              >
                <span className="font-extrabold text-xs text-slate-800 block">💼 Task Consultant Offer</span>
                <span className="text-[10px] text-slate-400 block mt-1 leading-relaxed">Simulates whatsapp high-yield task job bait alerts.</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Visual results diagnostic */}
        <div className="space-y-6">
          
          {loading && (
            <div className="bg-white border border-slate-100 rounded-2xl p-8 shadow-sm text-center flex flex-col items-center justify-center space-y-4 min-h-[350px]">
              <div className="w-12 h-12 border-4 border-slate-100 border-t-primary rounded-full animate-spin"></div>
              <div>
                <span className="text-sm font-bold text-slate-800 block">Transcribing Spoken Dialogs</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold block mt-1">AssemblyAI converting audio waves to text script</span>
              </div>
              {/* Mock audio wave animation */}
              <div className="flex gap-1 justify-center items-center h-8">
                <span className="w-1 bg-primary h-6 rounded-full animate-pulse"></span>
                <span className="w-1 bg-primary h-4 rounded-full animate-pulse delay-75"></span>
                <span className="w-1 bg-primary h-8 rounded-full animate-pulse delay-150"></span>
                <span className="w-1 bg-primary h-5 rounded-full animate-pulse delay-75"></span>
                <span className="w-1 bg-primary h-7 rounded-full animate-pulse"></span>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-danger-light border border-danger/20 rounded-2xl p-6 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-danger font-extrabold text-sm">
                <AlertCircle size={18} /> API Request Blocked
              </div>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                An error occurred during audio dispatch: `{error}`. Verify the server at `{API_BASE_URL}` is online.
              </p>
            </div>
          )}

          {!result && !loading && !error && (
            <div className="bg-slate-50/50 border border-slate-100 border-dashed rounded-2xl p-8 text-center flex flex-col items-center justify-center space-y-4 min-h-[350px]">
              <div className="bg-slate-100 text-slate-400 p-4 rounded-full">
                <Mic size={36} />
              </div>
              <div>
                <span className="text-sm font-bold text-slate-600 block">Idle Audio Scanner</span>
                <span className="text-xs text-slate-400 max-w-[200px] block mt-1 mx-auto leading-relaxed">Upload a recording file or trigger a preset simulation to run diagnostic pipelines.</span>
              </div>
            </div>
          )}

          {result && (
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-5 animate-scale-in">
              
              {/* Head */}
              <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                <div>
                  <h3 className="font-extrabold text-slate-800 tracking-tight">Audio Scan Results</h3>
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold block mt-0.5">Gemini Diagnostic Panel</span>
                </div>
                <RiskScore score={result.risk_score} size="md" />
              </div>

              {/* Player Sim */}
              <div className="bg-slate-50 p-4 rounded-xl flex items-center justify-between gap-4">
                <button
                  onClick={togglePlayback}
                  className="bg-slate-900 hover:bg-slate-800 text-white p-2.5 rounded-full hover:scale-105 transition-all shrink-0"
                >
                  {isPlaying ? <Square size={14} fill="white" /> : <Play size={14} fill="white" />}
                </button>
                <div className="flex-1 flex gap-1 items-center h-6 overflow-hidden">
                  {[...Array(24)].map((_, i) => (
                    <span 
                      key={i} 
                      className={`w-0.5 bg-slate-300 rounded-full transition-all duration-300 ${
                        isPlaying ? 'bg-primary animate-pulse' : ''
                      }`}
                      style={{
                        height: isPlaying ? `${Math.floor(Math.random() * 20) + 4}px` : '8px',
                        animationDelay: `${i * 40}ms`
                      }}
                    />
                  ))}
                </div>
                <span className="text-[10px] font-mono text-slate-400 shrink-0">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              {/* Category */}
              <div className="bg-slate-50/60 border border-slate-50 p-3.5 rounded-xl">
                <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400 block">Classified Category:</span>
                <span className="text-xs font-extrabold text-slate-800 block mt-1">{result.scam_category}</span>
              </div>

              {/* Transcript */}
              <div className="space-y-1.5 border-t border-slate-50 pt-4">
                <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400 block">Speech-to-Text Script:</span>
                <div className="text-xs text-slate-500 font-bold leading-relaxed bg-slate-50 border border-slate-100 p-3.5 rounded-xl max-h-36 overflow-y-auto italic">
                  "{result.transcript}"
                </div>
              </div>

              {/* Heuristics explanations */}
              <div className="space-y-1.5 border-t border-slate-50 pt-4">
                <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400 block">Analysis Core:</span>
                <div className="text-xs text-slate-500 leading-relaxed font-semibold bg-slate-50/60 border border-slate-50 p-3 rounded-xl max-h-36 overflow-y-auto whitespace-pre-line">
                  {result.explanation}
                </div>
              </div>

              {/* Actions suggestions */}
              <div className="space-y-2 border-t border-slate-50 pt-4">
                <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400 block">Safety Recommendations:</span>
                <div className="space-y-1.5">
                  {result.recommended_actions.map((act, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 font-bold leading-relaxed">
                      <CheckCircle size={12} className="text-primary shrink-0 mt-0.5" />
                      <span>{act}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
