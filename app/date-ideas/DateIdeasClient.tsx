'use client';

import { useRef, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import PinGate from '@/components/PinGate';
import Navigation from '@/components/Navigation';
import PrayerFlags from '@/components/PrayerFlags';

const QUICK_PROMPTS = [
  'Something romantic near Pokhara',
  'A spontaneous adventure day',
  'Cozy rainy day indoors',
  'Sunset, food, and slow',
  'An honest, local cultural moment',
];

type MessagePart = { type: string; text?: string };

/* Lightweight markdown renderer */
function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let key = 0;

  for (const line of lines) {
    if (line.startsWith('### ')) {
      elements.push(
        <h3
          key={key++}
          className="text-lg font-bold italic mt-4 mb-1"
          style={{ fontFamily: 'var(--font-playfair), serif', color: 'oklch(0.25 0.05 60)' }}
        >
          {line.slice(4)}
        </h3>,
      );
    } else if (/^\*\*.*\*\*$/.test(line.trim())) {
      elements.push(
        <p key={key++} className="font-semibold text-sm mt-2" style={{ color: 'oklch(0.30 0.05 60)' }}>
          {line.replace(/^\*\*|\*\*$/g, '')}
        </p>,
      );
    } else if (line.startsWith('- ')) {
      elements.push(
        <li key={key++} className="text-sm ml-4 list-disc" style={{ color: 'oklch(0.35 0.04 60)' }}>
          {renderInline(line.slice(2))}
        </li>,
      );
    } else if (line.trim() === '') {
      elements.push(<div key={key++} className="h-2" />);
    } else {
      elements.push(
        <p key={key++} className="text-sm leading-relaxed" style={{ color: 'oklch(0.30 0.04 60)' }}>
          {renderInline(line)}
        </p>,
      );
    }
  }
  return elements;
}

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((p, i) =>
    i % 2 === 1 ? <strong key={i} className="font-semibold">{p}</strong> : p,
  );
}

export default function DateIdeasClient() {
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  });

  const [input, setInput]   = useState('');
  const textareaRef         = useRef<HTMLTextAreaElement>(null);
  const bottomRef           = useRef<HTMLDivElement>(null);
  const isLoading           = status === 'submitted' || status === 'streaming';

  function scrollToBottom() {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);
  }

  function submit() {
    const text = input.trim();
    if (!text || isLoading) return;
    sendMessage({ text });
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    scrollToBottom();
  }

  function sendQuick(prompt: string) {
    if (isLoading) return;
    sendMessage({ text: prompt });
    scrollToBottom();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      submit();
    }
  }

  function handleTextareaChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  }

  return (
    <PinGate>
      <Navigation />
      <main className="max-w-3xl mx-auto w-full px-4 sm:px-6 pb-24 sm:pb-10 pt-8 flex flex-col space-y-6">

        <PrayerFlags />

        <div>
          <h1
            className="text-3xl font-bold italic mb-1"
            style={{ fontFamily: 'var(--font-playfair), serif', color: 'oklch(0.25 0.05 60)' }}
          >
            Plan a Date ✨
          </h1>
          <p className="text-sm" style={{ color: 'oklch(0.55 0.05 60)' }}>
            Your AI Nepal date-idea companion
          </p>
        </div>

        {/* Quick prompts */}
        <div className="flex flex-wrap gap-2">
          {QUICK_PROMPTS.map(p => (
            <button
              key={p}
              onClick={() => sendQuick(p)}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-full text-xs font-medium border transition-colors hover:border-[oklch(0.55_0.15_40)] hover:text-[oklch(0.45_0.15_40)] disabled:opacity-50"
              style={{
                borderColor: 'oklch(0.85 0.04 80)',
                background: 'oklch(0.99 0.01 80)',
                color: 'oklch(0.40 0.05 60)',
              }}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Messages */}
        <div className="flex-1 space-y-4 min-h-[300px]">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <p
                className="text-2xl"
                style={{ fontFamily: 'var(--font-dancing), cursive', color: 'oklch(0.55 0.05 60)' }}
              >
                What kind of moment are you dreaming of? 🌄
              </p>
            </div>
          )}

          {messages.map(msg => {
            const textContent = (msg.parts as MessagePart[])
              .filter(p => p.type === 'text')
              .map(p => p.text ?? '')
              .join('');

            return (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'user' ? (
                  <div
                    className="max-w-[75%] px-4 py-3 rounded-2xl rounded-tr-sm text-sm font-medium"
                    style={{ background: 'oklch(0.5 0.12 220)', color: 'white' }}
                  >
                    {textContent}
                  </div>
                ) : (
                  <div className="paper-card p-5 max-w-[92%]">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-base">✨</span>
                      <span
                        className="text-xs font-semibold uppercase tracking-widest"
                        style={{ color: 'oklch(0.55 0.15 40)' }}
                      >
                        Date Ideas
                      </span>
                    </div>
                    <div>{renderMarkdown(textContent)}</div>
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex justify-start">
              <div className="paper-card px-5 py-4 flex items-center gap-2">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full"
                    style={{
                      background: 'oklch(0.55 0.15 40)',
                      animation: `pulse-dot 1.2s ease-in-out ${i * 0.2}s infinite`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div className="paper-card p-3 flex gap-2 items-end sticky bottom-20 sm:bottom-4">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Ask for a date idea… (Ctrl+Enter to send)"
            className="flex-1 bg-transparent resize-none focus:outline-none text-sm leading-relaxed py-1"
            style={{ color: 'oklch(0.25 0.05 60)', maxHeight: '160px', minHeight: '36px' }}
          />
          <button
            onClick={submit}
            disabled={isLoading || !input.trim()}
            className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50 transition-opacity"
            style={{ background: 'oklch(0.55 0.15 40)' }}
          >
            <span>✨</span> Send
          </button>
        </div>
      </main>
    </PinGate>
  );
}
