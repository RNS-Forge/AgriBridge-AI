import { useState, useEffect } from 'react';
import {
  LOGO_DETAILS,
  LogoOptionId,
  setGlobalLogoChoice,
  LogoIconOption1,
  LogoIconOption2,
  LogoIconOption3,
} from './Logo';
import { CloseIcon, CheckIcon } from '../icons/Icons';

interface LogoSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LogoSelectorModal({ isOpen, onClose }: LogoSelectorModalProps) {
  const [selected, setSelected] = useState<LogoOptionId>('option1');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const current = (localStorage.getItem('agribridge_logo_choice') as LogoOptionId) || 'option1';
      setSelected(current);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleApply = (id: LogoOptionId) => {
    setSelected(id);
    setGlobalLogoChoice(id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-md shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
              AgriBridge AI — Professional Brand Identity Selection
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Select your preferred logo identity. The chosen logo will immediately be applied across the sidebar, header, and auth portals.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
            title="Close"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - 3 Logo Cards */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {(Object.keys(LOGO_DETAILS) as LogoOptionId[]).map((key) => {
              const item = LOGO_DETAILS[key];
              const isCurrent = selected === key;

              return (
                <div
                  key={key}
                  className={`bg-white border rounded-md p-4 transition-all flex flex-col justify-between relative ${
                    isCurrent
                      ? 'border-emerald-600 ring-2 ring-emerald-600/20 shadow-md'
                      : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  {/* Current Active Badge */}
                  {isCurrent && (
                    <div className="absolute -top-2.5 right-3 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs flex items-center gap-1">
                      <CheckIcon className="w-3 h-3" />
                      Active Logo
                    </div>
                  )}

                  <div>
                    {/* Rendered Visual Graphic Mockup */}
                    <div className="aspect-square bg-white border border-slate-100 rounded-md overflow-hidden flex items-center justify-center p-2 mb-3 shadow-inner">
                      <img
                        src={item.imageSrc}
                        alt={item.title}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    {/* Vector SVG Live Preview */}
                    <div className="mb-3 p-2.5 bg-slate-900 rounded-md border border-slate-800 flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-slate-400">Dark Sidebar Vector:</span>
                      <div className="flex items-center gap-2">
                        {key === 'option1' && <LogoIconOption1 className="w-6 h-6" />}
                        {key === 'option2' && <LogoIconOption2 className="w-6 h-6" />}
                        {key === 'option3' && <LogoIconOption3 className="w-6 h-6" />}
                        <span className="text-xs font-bold text-white tracking-tight">
                          AgriBridge<span className="text-emerald-400">AI</span>
                        </span>
                      </div>
                    </div>

                    {/* Title & Concept */}
                    <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                    <p className="text-[11px] font-semibold text-emerald-700 mt-0.5">{item.subtitle}</p>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">{item.description}</p>
                  </div>

                  {/* Action Button */}
                  <div className="pt-4 mt-4 border-t border-slate-100">
                    <button
                      onClick={() => handleApply(key)}
                      className={`w-full py-2 px-3 rounded-md text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                        isCurrent
                          ? 'bg-emerald-600 text-white shadow-xs cursor-default'
                          : 'bg-white border border-slate-300 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300'
                      }`}
                    >
                      {isCurrent ? (
                        <>
                          <CheckIcon className="w-3.5 h-3.5" />
                          Currently Applied
                        </>
                      ) : (
                        'Choose & Apply This Logo'
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-white flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Selected: <strong className="text-slate-800 font-semibold">{LOGO_DETAILS[selected].title}</strong>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-md transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
