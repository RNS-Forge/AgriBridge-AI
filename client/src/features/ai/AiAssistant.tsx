import { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/index.js';
import { Button } from '../../components/ui/Button/index.js';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export default function AiAssistant() {
  const { token } = useSelector((state: RootState) => state.auth);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'export_coach' | 'price_recommendation' | 'farmer_assistant' | 'document_generator'>('export_coach');
  const [provider, setProvider] = useState<'groq' | 'gemini' | 'claude' | 'openai' | 'mistral'>('groq');
  const [customKey, setCustomKey] = useState('');
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/v1/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-ai-provider': provider,
          ...(customKey ? { 'x-ai-api-key': customKey } : {}),
        },
        body: JSON.stringify({
          mode,
          messages: updatedMessages,
        }),
      });

      if (!response.ok) {
        throw new Error('AI request failed');
      }

      // Read SSE stream
      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');
      let done = false;
      let aiResponseText = '';

      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      if (reader) {
        while (!done) {
          const { value, done: doneReading } = await reader.read();
          done = doneReading;
          if (value) {
            const rawChunk = decoder.decode(value, { stream: true });
            
            // SSE chunks usually look like: "data: {...}\n\n"
            // We parse content deltas
            const lines = rawChunk.split('\n');
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const jsonStr = line.slice(6).trim();
                  if (jsonStr.startsWith('[ERROR]')) {
                    aiResponseText += `\n[ERROR: ${jsonStr}]`;
                    continue;
                  }
                  const parsed = JSON.parse(jsonStr);
                  const contentDelta = parsed.choices?.[0]?.delta?.content || '';
                  aiResponseText += contentDelta;

                  setMessages(prev => {
                    const list = [...prev];
                    const lastMsg = list[list.length - 1];
                    if (lastMsg && lastMsg.role === 'assistant') {
                      lastMsg.content = aiResponseText;
                    }
                    return list;
                  });
                } catch (err) {
                  // If it isn't JSON chunk, append raw text
                  if (!line.includes('[DONE]')) {
                    aiResponseText += line.replace('data: ', '');
                    setMessages(prev => {
                      const list = [...prev];
                      const lastMsg = list[list.length - 1];
                      if (lastMsg && lastMsg.role === 'assistant') {
                        lastMsg.content = aiResponseText;
                      }
                      return list;
                    });
                  }
                }
              }
            }
          }
        }
      }
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'system', content: `Failed to stream: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-950/30 to-slate-900 p-8 rounded-3xl border border-slate-800">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-500/8 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            AI-Powered Advisory
          </div>
          <h1 className="text-3xl font-extrabold text-slate-100">
            Agricultural <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-300">AI Coach</span>
          </h1>
          <p className="text-slate-400 text-sm max-w-xl">
            Consult the AI Export Coach, configure pricing recommendations, diagnose crop diseases,
            and generate export documents with real-time streaming responses.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-20rem)] space-x-6">
        {/* Settings Side Panel */}
        <div className="w-80 bg-slate-900/60 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-200">Assistant Configuration</h3>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Coach Mode</label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500/60 rounded-lg px-3 py-2.5 text-slate-100 focus:outline-none transition-colors"
              >
                <option value="export_coach">Export Coach</option>
                <option value="price_recommendation">Price Analyst</option>
                <option value="farmer_assistant">Field Assistant</option>
                <option value="document_generator">Invoice Generator</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Model Provider</label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500/60 rounded-lg px-3 py-2.5 text-slate-100 focus:outline-none transition-colors"
              >
                <option value="groq">Groq (Company Free)</option>
                <option value="gemini">Gemini</option>
                <option value="claude">Claude</option>
                <option value="openai">OpenAI GPT-4o</option>
                <option value="mistral">Mistral Large</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Override API Key</label>
              <input
                type="password"
                value={customKey}
                onChange={(e) => setCustomKey(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500/60 rounded-lg px-3 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none transition-colors"
                placeholder="Keep blank for company default"
              />
            </div>
          </div>

          <div className="text-xs text-slate-500 border-t border-slate-800/80 pt-4">
            Note: System prompts will adapt dynamically based on your selected coach mode.
          </div>
        </div>

        {/* Main Chat Panel */}
        <div className="flex-1 flex flex-col bg-slate-900/60 backdrop-blur-sm border border-slate-800 rounded-2xl overflow-hidden">
          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500">
                <div className="w-16 h-16 rounded-full bg-purple-600/10 border border-purple-500/30 flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.456-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456L18 9.75z" />
                  </svg>
                </div>
                <p className="text-sm">Ask your agricultural AI assistant a question.</p>
                <p className="text-xs text-slate-600 mt-1">Response stream is generated in real-time.</p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xl rounded-2xl px-4 py-3 text-sm leading-relaxed border ${
                    msg.role === 'user'
                      ? 'bg-purple-600 border-purple-500 text-white rounded-br-none'
                      : msg.role === 'system'
                      ? 'bg-red-950/20 border-red-900/50 text-red-400'
                      : 'bg-slate-950 border-slate-850 text-slate-100 rounded-bl-none'
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <form onSubmit={handleSend} className="p-4 border-t border-slate-800 bg-slate-950 flex items-center space-x-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="flex-1 bg-slate-900 border border-slate-800 focus:border-purple-500/60 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none disabled:opacity-50 transition-colors"
              placeholder="Describe your query or paste context metadata..."
            />
            <Button type="submit" disabled={loading}>
              {loading ? 'Streaming...' : 'Send'}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
