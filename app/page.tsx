"use client";

import { useEffect, useState } from "react";
import { signInWithGoogle, auth, logout, getAccessToken } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { addEventToCalendar } from "@/lib/calendar";
import { Loader2 } from "lucide-react";

type Plan = {
  planName: string;
  estimatedTimeHours: number;
  tags: string[];
  action: string;
  message: string;
};

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const [budget, setBudget] = useState<string>("無料");
  const [location, setLocation] = useState<string>("近所");
  const [mood, setMood] = useState<string>("アクティブ");

  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAddingToCalendar, setIsAddingToCalendar] = useState(false);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsInitializing(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Sign in failed", error);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    setCurrentPlan(null);
    setMessages([]);
  };

  const generatePlan = async () => {
    setIsGenerating(true);
    
    const userMessage = `予算は${budget}、場所は${location}、気分は${mood}です。おすすめのプランを教えてください。`;
    const newMessages = [...messages, { role: "user", content: userMessage }];
    setMessages(newMessages);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!response.ok) throw new Error("Failed to generate plan");
      
      const plan: Plan = await response.json();
      setCurrentPlan(plan);
      setMessages([...newMessages, { role: "assistant", content: JSON.stringify(plan) }]);
    } catch (error) {
      console.error(error);
      alert("エラーが発生しました。");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddToCalendar = async () => {
    if (!currentPlan) return;
    const token = getAccessToken();
    if (!token) {
      alert("Google Calendarへのアクセス権限がありません。再度ログインをお試しください。");
      return;
    }

    setIsAddingToCalendar(true);
    try {
      await addEventToCalendar(
        token,
        currentPlan.planName,
        `${currentPlan.action}\n\n${currentPlan.message}`,
        currentPlan.estimatedTimeHours
      );
      alert("✅ カレンダーに予定を登録しました！");
    } catch (error) {
      console.error(error);
      alert("カレンダーへの登録に失敗しました。");
    } finally {
      setIsAddingToCalendar(false);
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50 text-slate-900">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-amber-50 p-6 text-slate-900 font-sans">
        <div className="max-w-md w-full space-y-8 text-center bg-white border-2 border-slate-900 rounded-3xl p-10 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
          <div className="text-6xl mb-4">🌞</div>
          <div className="space-y-4">
            <h1 className="text-4xl font-black tracking-tight text-orange-600 leading-tight">
              SUMMER RESCUE
            </h1>
            <p className="text-lg text-slate-500 font-bold">
              夏休みのダラダラ防止エージェント
            </p>
          </div>
          <button
            onClick={handleSignIn}
            disabled={isSigningIn}
            className="mt-8 w-full flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 text-white font-black rounded-2xl hover:-translate-y-1 hover:shadow-lg transition-transform focus:outline-none disabled:opacity-70 disabled:hover:translate-y-0"
          >
            {isSigningIn ? <Loader2 className="w-6 h-6 animate-spin" /> : "Googleでログイン 🚀"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50 text-slate-900 font-sans p-4 sm:p-8 flex justify-center items-center overflow-auto">
      <div className="w-full max-w-[1024px] min-h-[768px] flex flex-col gap-6">
        {/* Header Section */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-4">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-orange-600">
              SUMMER RESCUE <span className="text-slate-400 font-light italic">v1.0</span>
            </h1>
            <p className="text-lg text-slate-500 font-medium">夏休みのダラダラ防止エージェント</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white border-2 border-slate-900 px-6 py-3 rounded-2xl shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
              <span className="block text-xs uppercase font-bold text-slate-400 tracking-widest">Logged In</span>
              <span className="text-xl font-bold truncate max-w-[200px] block">{user.displayName}</span>
            </div>
            <button 
              onClick={handleSignOut}
              className="bg-white border-2 border-slate-900 p-4 rounded-2xl shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:bg-slate-100 font-bold"
              title="ログアウト"
            >
              🚪
            </button>
          </div>
        </header>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 grid-rows-none md:grid-rows-6 gap-4 md:gap-6 min-h-0">
          {/* Step 1: Input Dashboard (Left Column) */}
          <div className="md:col-span-4 md:row-span-6 flex flex-col gap-4 min-h-[500px]">
            <div className="flex-1 bg-orange-400 border-2 border-slate-900 rounded-3xl p-6 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] flex flex-col">
              <div className="text-4xl mb-4">🌞</div>
              <h2 className="text-2xl font-black text-white leading-tight mb-4">
                お疲れ様です！<br />せっかくなので何かアクションを起こしませんか？
              </h2>
              <p className="text-orange-100 mb-8 font-medium">条件を選択して最適なプランを生成しましょう。おまかせも可能です。</p>
              
              <div className="space-y-4 mb-8">
                <div className="bg-white/20 border border-white/30 p-4 rounded-xl">
                  <p className="text-xs font-bold text-white uppercase mb-2">💰 予算を選択</p>
                  <div className="flex flex-wrap gap-2">
                    {["無料", "1000円以内", "贅沢"].map(opt => (
                      <button 
                        key={opt}
                        onClick={() => setBudget(opt)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${budget === opt ? "bg-white text-orange-600 shadow-sm scale-105" : "bg-white/40 text-white hover:bg-white/60"}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="bg-white/20 border border-white/30 p-4 rounded-xl">
                  <p className="text-xs font-bold text-white uppercase mb-2">🗺️ 移動を選択</p>
                  <div className="flex flex-wrap gap-2">
                    {["自宅", "近所", "遠出"].map(opt => (
                      <button 
                        key={opt}
                        onClick={() => setLocation(opt)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${location === opt ? "bg-white text-orange-600 shadow-sm scale-105" : "bg-white/40 text-white hover:bg-white/60"}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="bg-white/20 border border-white/30 p-4 rounded-xl">
                  <p className="text-xs font-bold text-white uppercase mb-2">💡 気分を選択</p>
                  <div className="flex flex-wrap gap-2">
                    {["アクティブ", "集中", "リラックス"].map(opt => (
                      <button 
                        key={opt}
                        onClick={() => setMood(opt)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${mood === opt ? "bg-white text-orange-600 shadow-sm scale-105" : "bg-white/40 text-white hover:bg-white/60"}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button 
                onClick={generatePlan}
                disabled={isGenerating}
                className="mt-auto w-full bg-slate-900 text-white font-black py-4 rounded-2xl text-xl hover:-translate-y-1 transition-transform disabled:opacity-70 disabled:hover:translate-y-0 flex justify-center items-center gap-2"
              >
                {isGenerating ? <Loader2 className="w-6 h-6 animate-spin" /> : "プランを生成する 🚀"}
              </button>
            </div>
          </div>

          {/* Step 2: Generated Plan (Main Bento Area) */}
          <div className="md:col-span-8 md:row-span-4 bg-white border-2 border-slate-900 rounded-3xl p-6 sm:p-8 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] flex flex-col justify-between min-h-[400px]">
            {currentPlan ? (
              <div className="h-full flex flex-col">
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-2">
                    <span className="bg-yellow-100 text-yellow-700 px-4 py-1.5 rounded-full text-sm font-bold border border-yellow-200 inline-block w-fit">
                      RECOMMENDED PLAN
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {currentPlan.tags.map(tag => (
                        <span key={tag} className="text-slate-400 font-mono text-sm">{tag}</span>
                      ))}
                    </div>
                  </div>
                  
                  <h2 className="text-4xl sm:text-5xl font-black leading-tight mb-6 italic tracking-tighter">
                    🎯 <span className="text-orange-500">{currentPlan.planName}</span>
                  </h2>
                  
                  <div className="flex flex-wrap items-center gap-4 sm:gap-6 mb-8">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full border border-slate-900"></div>
                      <span className="font-bold text-slate-600">想定時間: 約{currentPlan.estimatedTimeHours}時間</span>
                    </div>
                  </div>
                  
                  <div className="p-5 sm:p-6 bg-slate-50 border-l-4 border-slate-900 rounded-r-xl mb-6">
                    <h3 className="font-black text-xs uppercase text-slate-400 mb-2">📝 具体的に何をする？</h3>
                    <p className="text-lg sm:text-xl leading-relaxed font-bold text-slate-800">
                      {currentPlan.action}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mt-auto pt-4">
                  <button 
                    onClick={handleAddToCalendar}
                    disabled={isAddingToCalendar}
                    className="flex-1 bg-green-500 text-white font-black py-4 rounded-2xl text-lg border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:-translate-y-1 transition-transform disabled:opacity-70 disabled:hover:translate-y-0 flex justify-center items-center gap-2"
                  >
                    {isAddingToCalendar ? <Loader2 className="w-5 h-5 animate-spin" /> : "カレンダーに登録 ✅"}
                  </button>
                  <button 
                    onClick={generatePlan}
                    disabled={isGenerating}
                    className="flex-1 bg-white text-slate-900 font-black py-4 rounded-2xl text-lg border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:-translate-y-1 transition-transform disabled:opacity-70 disabled:hover:translate-y-0 flex justify-center items-center gap-2"
                  >
                    {isGenerating ? <Loader2 className="w-5 h-5 animate-spin text-slate-900" /> : "別の案を見る 🔄"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-50 p-6">
                <div className="text-6xl mb-6">🏜️</div>
                <h3 className="text-2xl font-black mb-2">プラン未生成</h3>
                <p className="font-medium">左のパネルから条件を選択し、「プランを生成する」ボタンを押してください。</p>
              </div>
            )}
          </div>

          {/* Mini Cards */}
          <div className="md:col-span-4 md:row-span-2 bg-indigo-600 border-2 border-slate-900 rounded-3xl p-6 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] flex flex-col min-h-[160px]">
            <h3 className="text-white font-black text-xs uppercase mb-3 opacity-80 flex-shrink-0">🔥 AIからの激励</h3>
            <p className="text-white text-lg font-bold leading-tight my-auto line-clamp-3">
              {currentPlan ? `「${currentPlan.message}」` : "「ダラダラするのも良いけれど、何か始めたらもっと楽しい休日になるはず！」"}
            </p>
          </div>

          <div className="md:col-span-4 md:row-span-2 bg-pink-300 border-2 border-slate-900 rounded-3xl p-6 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] flex flex-col justify-center items-center text-center min-h-[160px]">
            <div className="text-3xl mb-2 italic font-black">Reward</div>
            <p className="font-bold text-slate-900 text-lg">
              終了後は近くのコンビニで<br />「一番高いアイス」を解禁！
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
