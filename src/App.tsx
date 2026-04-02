/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
  Upload, 
  Image as ImageIcon, 
  Send, 
  Loader2, 
  AlertCircle, 
  X, 
  Sparkles, 
  Trash2, 
  Zap,
  Info,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/src/lib/utils';

// Initialize the Gemini API
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

const EXAMPLE_PROMPTS = [
  "What's in this image?",
  "Extract text from this image as JSON",
  "Write a creative story based on this scene",
  "Identify the objects and their colors",
  "Explain the mood of this photo"
];

export default function App() {
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please upload a valid image file (JPG, PNG, etc.)');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const clearAll = () => {
    setImage(null);
    setImageFile(null);
    setPrompt('');
    setResponse('');
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const analyzeImage = async () => {
    if (!imageFile || !prompt.trim()) return;

    setIsLoading(true);
    setError(null);
    setResponse('');

    try {
      const base64Data = image?.split(',')[1];
      if (!base64Data) throw new Error("Failed to process image data");

      const model = "gemini-3-flash-preview";
      
      const result = await genAI.models.generateContent({
        model,
        contents: {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: imageFile.type,
                data: base64Data
              }
            }
          ]
        }
      });

      setResponse(result.text || "No response received from the AI.");
    } catch (err: any) {
      console.error("Analysis error:", err);
      setError(err.message || "An unexpected error occurred during analysis.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] bg-purple-500/10 blur-[100px] rounded-full" />
      </div>

      <header className="sticky top-0 z-20 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-xl shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
              Multimodal AI Explorer
            </h1>
          </div>
          <button 
            onClick={clearAll}
            className="text-xs font-medium text-zinc-500 hover:text-zinc-300 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-zinc-800/50 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear All
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-16 relative z-10">
        <div className="space-y-12">
          {/* Hero Section */}
          <section className="text-center space-y-4 max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-4">
                <Zap className="w-3 h-3" /> Powered by Gemini
              </span>
              <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-tight">
                Analyze images with <span className="text-indigo-500">intelligence.</span>
              </h2>
              <p className="text-zinc-400 text-lg md:text-xl mt-4 leading-relaxed">
                Upload any visual and let AI extract insights, describe details, or solve complex tasks in seconds.
              </p>
            </motion.div>
          </section>

          {/* Main Interface Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Upload & Prompt */}
            <div className="lg:col-span-7 space-y-8">
              {/* Step 1: Upload */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-300">01</span>
                    Upload Image
                  </h3>
                </div>
                
                <motion.div 
                  whileHover={{ scale: 1.005 }}
                  className={cn(
                    "relative group aspect-video rounded-3xl border-2 border-dashed transition-all duration-500 overflow-hidden flex flex-col items-center justify-center bg-zinc-900/40 backdrop-blur-sm",
                    image ? "border-indigo-500/50 ring-4 ring-indigo-500/5" : "border-zinc-800 hover:border-indigo-500/40 hover:bg-zinc-900/60"
                  )}
                >
                  {image ? (
                    <>
                      <img 
                        src={image} 
                        alt="Uploaded" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          className="bg-white text-black px-4 py-2 rounded-full font-bold text-sm shadow-xl transform translate-y-2 group-hover:translate-y-0 transition-all"
                        >
                          Change Image
                        </button>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); clearAll(); }}
                        className="absolute top-4 right-4 p-2 bg-zinc-950/80 hover:bg-red-500 text-white rounded-full backdrop-blur-md transition-all z-10"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <div 
                      className="cursor-pointer flex flex-col items-center gap-4 p-12 text-center w-full h-full"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="p-5 bg-zinc-800 rounded-2xl group-hover:bg-indigo-500/20 group-hover:text-indigo-400 transition-all duration-300">
                        <Upload className="w-10 h-10 text-zinc-500 group-hover:text-indigo-400" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-bold text-zinc-200 text-lg">Drop your image here</p>
                        <p className="text-sm text-zinc-500">or click to browse files</p>
                      </div>
                    </div>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </motion.div>
              </div>

              {/* Step 2: Prompt */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-300">02</span>
                  Ask Anything
                </h3>
                
                <div className="relative group">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe this image in detail..."
                    className="w-full p-6 rounded-3xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none resize-none transition-all placeholder:text-zinc-600 min-h-[160px] text-lg leading-relaxed"
                  />
                  
                  {/* Example Prompts */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {EXAMPLE_PROMPTS.map((ex, i) => (
                      <button
                        key={i}
                        onClick={() => setPrompt(ex)}
                        className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500 hover:border-indigo-500/50 hover:text-indigo-400 transition-all"
                      >
                        {ex}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={analyzeImage}
                  disabled={!image || !prompt.trim() || isLoading}
                  className={cn(
                    "w-full py-5 px-8 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all duration-500 shadow-2xl",
                    !image || !prompt.trim() || isLoading
                      ? "bg-zinc-900 text-zinc-700 cursor-not-allowed border border-zinc-800"
                      : "bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-500/20 hover:shadow-indigo-500/40 active:scale-[0.99]"
                  )}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Run Analysis</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right Column: Results */}
            <div className="lg:col-span-5 space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-300">03</span>
                Insights
              </h3>

              <AnimatePresence mode="wait">
                {error ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-6 bg-red-500/10 border border-red-500/20 rounded-3xl flex items-start gap-4 text-red-400"
                  >
                    <AlertCircle className="w-6 h-6 flex-shrink-0" />
                    <div className="space-y-1">
                      <p className="font-bold">Something went wrong</p>
                      <p className="text-sm opacity-80">{error}</p>
                    </div>
                  </motion.div>
                ) : response || isLoading ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-zinc-900/40 backdrop-blur-xl rounded-3xl border border-zinc-800 shadow-2xl overflow-hidden min-h-[300px]"
                  >
                    <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-900/60 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-indigo-400" />
                        <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">AI Response</span>
                      </div>
                      {isLoading && <div className="flex gap-1"><div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" /><div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]" /><div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]" /></div>}
                    </div>
                    <div className="p-6 md:p-8">
                      {isLoading && !response ? (
                        <div className="space-y-6">
                          <div className="h-4 bg-zinc-800 rounded-full w-3/4 animate-pulse" />
                          <div className="h-4 bg-zinc-800 rounded-full w-full animate-pulse" />
                          <div className="h-4 bg-zinc-800 rounded-full w-5/6 animate-pulse" />
                          <div className="h-4 bg-zinc-800 rounded-full w-2/3 animate-pulse" />
                        </div>
                      ) : (
                        <div className="prose prose-invert prose-slate max-w-none prose-headings:text-white prose-headings:font-black prose-p:text-zinc-300 prose-p:leading-relaxed prose-strong:text-indigo-400 prose-code:text-indigo-300 prose-code:bg-indigo-500/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-zinc-950 prose-pre:border prose-pre:border-zinc-800">
                          <ReactMarkdown>{response}</ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  <div className="h-[400px] rounded-3xl border border-zinc-800 border-dashed flex flex-col items-center justify-center text-center p-12 space-y-4 bg-zinc-900/20">
                    <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center">
                      <Info className="w-8 h-8 text-zinc-700" />
                    </div>
                    <div className="space-y-2">
                      <p className="font-bold text-zinc-500">No results yet</p>
                      <p className="text-sm text-zinc-600 max-w-[200px] mx-auto">Complete steps 1 and 2 to see the AI's analysis here.</p>
                    </div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>

      <footer className="max-w-5xl mx-auto px-4 py-16 border-t border-zinc-900/50 flex flex-col md:flex-row items-center justify-between gap-6 text-zinc-600 text-xs font-medium uppercase tracking-widest">
        <div className="flex items-center gap-6">
          <span className="hover:text-zinc-400 transition-colors cursor-default">Privacy</span>
          <span className="hover:text-zinc-400 transition-colors cursor-default">Terms</span>
          <span className="hover:text-zinc-400 transition-colors cursor-default">Docs</span>
        </div>
        <p>© 2026 Multimodal AI Explorer • Built with Gemini</p>
      </footer>
    </div>
  );
}
