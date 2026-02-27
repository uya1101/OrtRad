import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { T } from '../../constants/tokens';
import { useSearchHistory } from '../../hooks/useSearch';
import { useTrends } from '../../hooks/useTrends';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
}

export default function SearchBar({
  value,
  onChange,
  onSearch,
  placeholder,
  autoFocus = false,
  className = '',
}: SearchBarProps) {
  const { t } = useTranslation();
  const { history, addHistory, clearHistory, removeHistory } = useSearchHistory();
  const { trends } = useTrends();

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Suggestions from history and trends
  const suggestions = useMemo(() => {
    const allSuggestions = [
      ...history.map(h => ({ type: 'history' as const, text: h })),
      ...trends.slice(0, 5).map(trend => ({ type: 'trend' as const, text: trend.keyword_en })),
    ];

    // Remove duplicates and filter by current input
    const unique = Array.from(new Map(allSuggestions.map(s => [s.text, s])).values());
    const filtered = value
      ? unique.filter(s => s.text.toLowerCase().includes(value.toLowerCase()))
      : unique;

    return filtered.slice(0, 8);
  }, [history, trends, value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setShowSuggestions(true);
    setFocusedIndex(-1);
  };

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (focusedIndex >= 0 && suggestions[focusedIndex]) {
        onSearch(suggestions[focusedIndex].text);
      } else if (value.trim()) {
        onSearch(value);
      }
      setShowSuggestions(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex(prev => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setFocusedIndex(-1);
    }
  }, [focusedIndex, suggestions, value, onSearch]);

  const handleSearch = useCallback(() => {
    if (value.trim()) {
      onSearch(value);
      addHistory(value);
      setShowSuggestions(false);
    }
  }, [value, onSearch, addHistory]);

  const handleClear = useCallback(() => {
    onChange('');
    inputRef.current?.focus();
  }, [onChange]);

  const handleSuggestionClick = useCallback((text: string) => {
    onSearch(text);
    addHistory(text);
    setShowSuggestions(false);
  }, [onSearch, addHistory]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto focus
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  return (
    <div
      ref={containerRef}
      className={`search-bar ${className}`}
      style={{ position: 'relative', width: '100%' }}
    >
      {/* Mobile toggle button */}
      <button
        className="search-mobile-toggle"
        onClick={() => setIsMobileExpanded(!isMobileExpanded)}
        style={{
          display: 'none',
          alignItems: 'center',
          justifyContent: 'center',
          width: 40,
          height: 40,
          background: 'rgba(56,189,248,0.1)',
          border: `1px solid ${T.border}`,
          borderRadius: 8,
          color: T.neonBlue,
          cursor: 'pointer',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      </button>

      <motion.div
        initial={false}
        animate={{
          width: isMobileExpanded ? '100%' : 'auto',
          opacity: isMobileExpanded ? 1 : 1,
        }}
        transition={{ duration: 0.2 }}
        style={{
          display: isMobileExpanded ? 'block' : 'block',
          width: '100%',
        }}
      >
        <div style={{ position: 'relative' }}>
          {/* Search icon */}
          <div style={{
            position: 'absolute',
            left: 14,
            top: '50%',
            transform: 'translateY(-50%)',
            color: T.textDim,
            pointerEvents: 'none',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>

          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(true)}
            placeholder={placeholder || t('search.placeholder')}
            style={{
              width: '100%',
              padding: '12px 16px 12px 44px',
              background: 'rgba(8,15,30,0.80)',
              border: `1px solid ${T.border}`,
              borderRadius: 8,
              color: T.textPrimary,
              fontFamily: "'Noto Sans JP',sans-serif",
              fontSize: '0.95rem',
              outline: 'none',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = T.neonBlue;
            }}
            onMouseLeave={(e) => {
              if (document.activeElement !== e.currentTarget) {
                e.currentTarget.style.borderColor = T.border;
              }
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = T.neonBlue;
              e.currentTarget.style.background = 'rgba(8,15,30,0.95)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = T.border;
              e.currentTarget.style.background = 'rgba(8,15,30,0.80)';
            }}
          />

          {/* Clear button */}
          {value && (
            <button
              onClick={handleClear}
              style={{
                position: 'absolute',
                right: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: T.textDim,
                cursor: 'pointer',
                padding: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = T.neonBlue;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = T.textDim;
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Suggestions dropdown */}
        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: 4,
                background: 'rgba(5,11,20,0.98)',
                border: `1px solid ${T.border}`,
                borderRadius: 8,
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                overflow: 'hidden',
                zIndex: 100,
              }}
            >
              {/* Section headers */}
              {history.length > 0 && !value && (
                <div style={{
                  padding: '8px 14px',
                  fontFamily: "'Share Tech Mono',monospace",
                  fontSize: '0.5rem',
                  color: T.textDim,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  borderBottom: `1px solid ${T.border}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <span>{t('search.recent_searches')}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      clearHistory();
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: T.neonBlue,
                      fontSize: '0.5rem',
                      cursor: 'pointer',
                      fontFamily: "'Share Tech Mono',monospace",
                    }}
                  >
                    {t('search.clear')}
                  </button>
                </div>
              )}

              {/* Suggestions list */}
              {suggestions.map((suggestion, index) => (
                <motion.button
                  key={`${suggestion.type}-${suggestion.text}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => handleSuggestionClick(suggestion.text)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: focusedIndex === index ? 'rgba(56,189,248,0.12)' : 'transparent',
                    border: 'none',
                    color: T.textSecond,
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    fontFamily: "'Noto Sans JP',sans-serif",
                    fontSize: '0.88rem',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(56,189,248,0.12)';
                  }}
                  onMouseLeave={(e) => {
                    if (focusedIndex !== index) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  {suggestion.type === 'history' && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.textDim} strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12,6 12,12 16,14" />
                    </svg>
                  )}
                  {suggestion.type === 'trend' && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.neonTeal} strokeWidth="2">
                      <polyline points="22,7 13.5,15.5 8.5,10.5 2,17" />
                      <polyline points="16,7 22,7 22,13" />
                    </svg>
                  )}
                  <span style={{ flex: 1 }}>{suggestion.text}</span>
                  {suggestion.type === 'history' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeHistory(suggestion.text);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: T.textDim,
                        padding: 2,
                        cursor: 'pointer',
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Mobile styles */}
      <style>{`
        @media (max-width: 768px) {
          .search-bar .search-mobile-toggle {
            display: flex !important;
          }
          .search-mobile-toggle svg {
            display: ${isMobileExpanded ? 'none' : 'block'};
          }
          .search-mobile-toggle span {
            display: ${isMobileExpanded ? 'block' : 'none'};
          }
        }
      `}</style>
    </div>
  );
}
