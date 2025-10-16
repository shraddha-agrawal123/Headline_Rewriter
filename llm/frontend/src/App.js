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
      gradient: 'from-blue-500 to-indigo-600',
      bgGradient: 'from-blue-50 to-indigo-50',
      borderColor: 'border-blue-200',
      iconColor: 'text-blue-600',
    },
    {
      id: 'casual',
      title: 'Casual',
      icon: MessageSquare,
      gradient: 'from-green-500 to-emerald-600',
      bgGradient: 'from-green-50 to-emerald-50',
      borderColor: 'border-green-200',
      iconColor: 'text-green-600',
    },
    {
      id: 'concise',
      title: 'Concise',
      icon: Zap,
      gradient: 'from-purple-500 to-pink-600',
      bgGradient: 'from-purple-50 to-pink-50',
      borderColor: 'border-purple-200',
      iconColor: 'text-purple-600',
    },
  ];

  return (
    <div className="app-container">
      <div className="content-wrapper">
        {/* Header */}
        <div className="header">
          <h1 className="title">
            Headline Rewriter
          </h1>
          <p className="subtitle">
            Transform your headlines into three distinct styles instantly
          </p>
        </div>

        {/* Input Section */}
        <div className="input-section">
          <label className="input-label">
            Enter Your Headline
          </label>
          <textarea
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              setError('');
            }}
            placeholder="Type your headline here..."
            className="textarea"
            rows="4"
          />
          <div className="char-counter">
            <span className={isValidInput ? 'valid' : 'invalid'}>
              {inputText.length}/500 characters {inputText.length < 5 && inputText.length > 0 && '(minimum 5)'}
            </span>
          </div>

          {/* Example Headlines */}
          <div className="examples-section">
            <p className="examples-label">Try an example:</p>
            <div className="examples-buttons">
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
            className={`submit-button ${!isValidInput || loading ? 'disabled' : ''}`}
          >
            {loading ? (
              <span className="loading-content">
                <div className="spinner"></div>
                Rewriting...
              </span>
            ) : (
              'Rewrite Headline'
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

        {/* Results Section */}
        {results && (
          <div className="results-grid">
            {styles.map((style, index) => {
              const Icon = style.icon;
              return (
                <div
                  key={style.id}
                  className={`result-card ${style.id}`}
                >
                  <div className="card-header">
                    <div className="card-title-wrapper">
                      <Icon className="card-icon" />
                      <h3 className="card-title">{style.title}</h3>
                    </div>
                    <button
                      onClick={() => handleCopy(results[style.id], index)}
                      className="copy-button"
                      title="Copy to clipboard"
                    >
                      {copiedIndex === index ? (
                        <Check className="icon" />
                      ) : (
                        <Copy className="icon" />
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