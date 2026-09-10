import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, CheckCircle2, CircleDashed, ArrowRight } from 'lucide-react';

export default function AiAnalysis() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [assetName, setAssetName] = useState('Industrial Machine #M-401');

  useEffect(() => {
    const saved = sessionStorage.getItem('currentInspection');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.assetName) {
          setAssetName(parsed.assetName);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const steps = [
    "Image received",
    "Voice converted to text",
    "Defects detected",
    "Assessing severity",
    "Generating recommendations",
    "Preparing report"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < steps.length - 1) {
          return prev + 1;
        } else {
          clearInterval(timer);
          setTimeout(() => navigate('/result'), 800);
          return prev;
        }
      });
    }, 1200);

    return () => clearInterval(timer);
  }, [navigate, steps.length]);

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="card max-w-lg w-full p-8 md:p-12 flex flex-col items-center border-ai/20 shadow-xl shadow-ai/10 bg-white relative overflow-hidden">
        
        {/* Glow behind */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-ai/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative mb-8 mt-2">
          <div className="w-24 h-24 rounded-3xl bg-ai/10 flex items-center justify-center text-ai animate-pulse">
            <Sparkles className="w-12 h-12" />
          </div>
          <div className="absolute -inset-1.5 border-4 border-ai border-t-transparent rounded-3xl animate-spin"></div>
        </div>

        <div className="text-center mb-8">
          <span className="text-xs font-black uppercase tracking-widest text-ai bg-ai/10 px-3 py-1 rounded-full">
            Real-time Neural Engine
          </span>
          <h2 className="text-2xl font-black text-slate-800 mt-2">
            Your asset is being analyzed...
          </h2>
          <p className="text-slate-500 font-bold text-sm mt-1">
            Analyzing <span className="text-slate-800 font-extrabold">{assetName}</span>
          </p>
        </div>

        <div className="w-full space-y-4">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            const isPending = index > currentStep;

            return (
              <div 
                key={index} 
                className={`flex items-center gap-4 transition-all duration-300 p-2.5 rounded-xl ${
                  isCurrent ? 'bg-ai/5' : ''
                } ${isPending ? 'opacity-35' : 'opacity-100'}`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-6 h-6 text-healthy shrink-0" />
                ) : isCurrent ? (
                  <CircleDashed className="w-6 h-6 text-ai shrink-0 animate-spin" />
                ) : (
                  <div className="w-6 h-6 rounded-full border-2 border-slate-300 shrink-0"></div>
                )}
                
                <span className={`text-base font-semibold ${
                  isCompleted ? 'text-slate-700' : isCurrent ? 'text-ai font-bold' : 'text-slate-400'
                }`}>
                  {step}
                </span>
              </div>
            );
          })}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-2.5 rounded-full mt-8 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-ai to-purple-400 transition-all duration-500 ease-out"
            style={{ width: `${Math.max(10, ((currentStep + 1) / steps.length) * 100)}%` }}
          ></div>
        </div>

        <button
          onClick={() => navigate('/result')}
          className="mt-6 text-xs font-bold text-slate-400 hover:text-ai flex items-center gap-1 transition-colors cursor-pointer"
        >
          Skip animation and view result <ArrowRight className="w-3.5 h-3.5" />
        </button>

      </div>
    </div>
  );
}
