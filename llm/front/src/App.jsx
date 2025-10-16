import React, { useState } from 'react';
import { Sparkles, MessageSquare, Zap, Copy, Check, AlertCircle } from 'lucide-react';
import './App.css';

function App() {
  const [inputText, setInputText] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedIndex, setCopiedIndex] = useState(null);

  const exampleHeadlines = [
    "AI is transforming businesses worldwide",
    "New study shows coffee is healthy",
    "Climate change affects global food supply"
  ];

  const handleRewrite = async () => {
    if (inputText.length < 5 || inputText.length > 500) {
      setError('Text must be between 5 and 500 characters');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);

    try {
      const response = await fetch('http://localhost:5000/api/rewrite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: inputText }),
      });

      const data = await response.json();

      if (data.success) {
        setResults(data.results);
      } else {
        setError(data.error || 'Failed to rewrite headline');
      }
    } catch (err) {
      setError('Unable to connect to server. Make sure the backend is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleExampleClick = (example) => {
    setInputText(example);
    setError('');
    setResults(null);
  };

  const isValidInput = inputText.length >= 5 && inputText.length <= 500;

  const styles = [
    {
      id: 'formal',
      title: 'Formal',
      icon: Sparkles,
      gradient: 'from-blue-500 to-cyan-500',
      color: 'text-blue-500'
    },
    {
      id: 'casual',
      title: 'Casual',
      icon: MessageSquare,
      gradient: 'from-emerald-500 to-teal-500',
      color: 'text-emerald-500'
    },
    {
      id: 'concise',
      title: 'Concise',
      icon: Zap,
      gradient: 'from-purple-500 to-pink-500',
      color: 'text-purple-500'
    },
  ];

  return (
    <div className="app-container">
      {/* Animated background elements */}
      <div className="background-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      <div className="content-wrapper">
        {/* Header */}
        <div className="header">
          <div className="header-icon">
            <Sparkles className="sparkles-icon" />
          </div>
          <h1 className="title">
            Headline Rewriter
          </h1>
          <p className="subtitle">
            Transform your headlines into three distinct styles with AI-powered magic ✨
          </p>
        </div>

        {/* Main Input Card */}
        <div className="input-card">
          <label className="input-label">
            Enter Your Headline
          </label>
          <textarea
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              setError('');
            }}
            placeholder="Type your headline here and watch the magic happen..."
            className="textarea"
            rows="4"
          />
          <div className="char-counter-wrapper">
            <div className={`char-counter ${isValidInput ? 'valid' : 'invalid'}`}>
              {inputText.length}/500 characters {inputText.length < 5 && inputText.length > 0 && '(minimum 5)'}
            </div>
          </div>

          {/* Example Headlines */}
          <div className="examples-section">
            <p className="examples-label">Try an example:</p>
            <div className="examples-grid">
              {exampleHeadlines.map((example, idx) => (
                <button
                  key={idx}
                  onClick={() => handleExampleClick(example)}
                  className="example-button"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleRewrite}
            disabled={!isValidInput || loading}
            className={`submit-button ${(!isValidInput || loading) ? 'disabled' : ''}`}
          >
            {loading ? (
              <span className="loading-content">
                <div className="spinner"></div>
                Rewriting Magic...
              </span>
            ) : (
              <span className="button-content">
                <Sparkles className="button-icon" />
                Rewrite Headline
              </span>
            )}
          </button>

          {/* Error Message */}
          {error && (
            <div className="error-message">
              <AlertCircle className="error-icon" />
              <p>{error}</p>
            </div>
          )}
        </div>

        {/* Results Grid */}
        {results && (
          <div className="results-grid">
            {styles.map((style, index) => {
              const Icon = style.icon;
              return (
                <div
                  key={style.id}
                  className={`result-card ${style.id}`}
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="card-header">
                    <div className="card-title-wrapper">
                      <div className={`card-icon-wrapper ${style.id}`}>
                        <Icon className="card-icon" />
                      </div>
                      <h3 className={`card-title ${style.id}`}>
                        {style.title}
                      </h3>
                    </div>
                    <button
                      onClick={() => handleCopy(results[style.id], index)}
                      className="copy-button"
                      title="Copy to clipboard"
                    >
                      {copiedIndex === index ? (
                        <Check className="copy-icon success" />
                      ) : (
                        <Copy className="copy-icon" />
                      )}
                    </button>
                  </div>
                  <p className="card-text">
                    {results[style.id]}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;