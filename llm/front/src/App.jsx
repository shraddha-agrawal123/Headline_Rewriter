import React, { useState } from 'react';
import { Sparkles, MessageSquare, Zap, Copy, Check, AlertCircle, FileText, Heart } from 'lucide-react';
import './App.css';

function App() {
  const [inputText, setInputText] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedIndex, setCopiedIndex] = useState(null);
  
  // New state for summarization and sentiment
  const [summaryResult, setSummaryResult] = useState(null);
  const [sentimentResult, setSentimentResult] = useState(null);
  const [activeFeature, setActiveFeature] = useState('rewrite'); // 'rewrite', 'summarize', 'sentiment'

  const exampleHeadlines = [
    "AI is transforming businesses worldwide",
    "New study shows coffee is healthy",
    "Climate change affects global food supply"
  ];

  const exampleParagraphs = [
    "Artificial intelligence has revolutionized the way businesses operate across the globe. From automating routine tasks to providing deep insights through data analytics, AI technologies are enabling companies to work more efficiently and make better decisions. This transformation is not limited to large corporations; small and medium-sized enterprises are also benefiting from AI-powered tools that were once accessible only to tech giants.",
    "A recent comprehensive study published in a leading medical journal has revealed that moderate coffee consumption can have several health benefits. The research, which followed thousands of participants over a decade, found that drinking 2-3 cups of coffee daily was associated with reduced risks of heart disease, type 2 diabetes, and certain neurological conditions. Scientists attribute these benefits to coffee's rich antioxidant content and bioactive compounds."
  ];

  // Handle headline rewriting
  const handleRewrite = async () => {
    if (inputText.length < 5 || inputText.length > 500) {
      setError('Text must be between 5 and 500 characters');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);
    setSummaryResult(null);
    setSentimentResult(null);
    setActiveFeature('rewrite');

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

  // NEW FUNCTION: Handle text summarization
  const handleSummarize = async () => {
    if (inputText.length < 10 || inputText.length > 1000) {
      setError('Text must be between 10 and 1000 characters for summarization');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);
    setSummaryResult(null);
    setSentimentResult(null);
    setActiveFeature('summarize');

    try {
      const response = await fetch('http://localhost:5000/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: inputText }),
      });

      const data = await response.json();

      if (data.success) {
        setSummaryResult(data.summary);
      } else {
        setError(data.error || 'Failed to summarize text');
      }
    } catch (err) {
      setError('Unable to connect to server. Make sure the backend is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  // NEW FUNCTION: Handle sentiment analysis
  const handleSentiment = async () => {
    if (inputText.length < 5 || inputText.length > 1000) {
      setError('Text must be between 5 and 1000 characters for sentiment analysis');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);
    setSummaryResult(null);
    setSentimentResult(null);
    setActiveFeature('sentiment');

    try {
      const response = await fetch('http://localhost:5000/api/sentiment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: inputText }),
      });

      const data = await response.json();

      if (data.success) {
        setSentimentResult(data.sentiment);
      } else {
        setError(data.error || 'Failed to analyze sentiment');
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
    setSummaryResult(null);
    setSentimentResult(null);
  };

  const isValidInput = inputText.length >= 5 && inputText.length <= 500;
  const isValidForSummarize = inputText.length >= 10 && inputText.length <= 1000;
  const isValidForSentiment = inputText.length >= 5 && inputText.length <= 1000;

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

  // Helper function to get sentiment color
  const getSentimentColor = (label) => {
    if (label === 'Positive') return 'text-green-400';
    if (label === 'Negative') return 'text-red-400';
    return 'text-gray-400';
  };

  const getSentimentEmoji = (label) => {
    if (label === 'Positive') return '😊';
    if (label === 'Negative') return '😞';
    return '😐';
  };

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
            AI Text Toolkit
          </h1>
          <p className="subtitle">
            Rewrite headlines, summarize text, and analyze sentiment with AI-powered magic ✨
          </p>
        </div>

        {/* Main Input Card */}
        <div className="input-card">
          <label className="input-label">
            Enter Your Text
          </label>
          <textarea
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              setError('');
            }}
            placeholder="Type your text here and choose an action below..."
            className="textarea"
            rows="4"
          />
          <div className="char-counter-wrapper">
            <div className={`char-counter ${isValidInput ? 'valid' : 'invalid'}`}>
              {inputText.length}/1000 characters
            </div>
          </div>

          {/* Example Headlines/Paragraphs */}
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
            <p className="examples-label" style={{ marginTop: '1rem' }}>Or try a longer paragraph:</p>
            <div className="examples-grid">
              {exampleParagraphs.map((example, idx) => (
                <button
                  key={`para-${idx}`}
                  onClick={() => handleExampleClick(example)}
                  className="example-button"
                  style={{ fontSize: '0.85rem', lineHeight: '1.4' }}
                >
                  {example.substring(0, 100)}...
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button
              onClick={handleRewrite}
              disabled={!isValidInput || loading}
              className={`action-button primary ${(!isValidInput || loading) ? 'disabled' : ''}`}
            >
              {loading && activeFeature === 'rewrite' ? (
                <span className="loading-content">
                  <div className="spinner"></div>
                  Rewriting...
                </span>
              ) : (
                <span className="button-content">
                  <Sparkles className="button-icon" />
                  Rewrite Headline
                </span>
              )}
            </button>

            <button
              onClick={handleSummarize}
              disabled={!isValidForSummarize || loading}
              className={`action-button secondary ${(!isValidForSummarize || loading) ? 'disabled' : ''}`}
            >
              {loading && activeFeature === 'summarize' ? (
                <span className="loading-content">
                  <div className="spinner"></div>
                  Summarizing...
                </span>
              ) : (
                <span className="button-content">
                  <FileText className="button-icon" />
                  Summarize Text
                </span>
              )}
            </button>

            <button
              onClick={handleSentiment}
              disabled={!isValidForSentiment || loading}
              className={`action-button tertiary ${(!isValidForSentiment || loading) ? 'disabled' : ''}`}
            >
              {loading && activeFeature === 'sentiment' ? (
                <span className="loading-content">
                  <div className="spinner"></div>
                  Analyzing...
                </span>
              ) : (
                <span className="button-content">
                  <Heart className="button-icon" />
                  Analyze Sentiment
                </span>
              )}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-message">
              <AlertCircle className="error-icon" />
              <p>{error}</p>
            </div>
          )}
        </div>

        {/* Results Grid for Rewrite */}
        {results && activeFeature === 'rewrite' && (
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

        {/* Summary Result */}
        {summaryResult && activeFeature === 'summarize' && (
          <div className="single-result-card" style={{ animationDelay: '0ms' }}>
            <div className="card-header">
              <div className="card-title-wrapper">
                <div className="card-icon-wrapper summary">
                  <FileText className="card-icon" />
                </div>
                <h3 className="card-title summary">
                  Summary
                </h3>
              </div>
              <button
                onClick={() => handleCopy(summaryResult, 'summary')}
                className="copy-button"
                title="Copy to clipboard"
              >
                {copiedIndex === 'summary' ? (
                  <Check className="copy-icon success" />
                ) : (
                  <Copy className="copy-icon" />
                )}
              </button>
            </div>
            <p className="card-text">
              {summaryResult}
            </p>
          </div>
        )}

        {/* Sentiment Result */}
        {sentimentResult && activeFeature === 'sentiment' && (
          <div className="single-result-card sentiment-card" style={{ animationDelay: '0ms' }}>
            <div className="card-header">
              <div className="card-title-wrapper">
                <div className="card-icon-wrapper sentiment">
                  <Heart className="card-icon" />
                </div>
                <h3 className="card-title sentiment">
                  Sentiment Analysis
                </h3>
              </div>
            </div>
            <div className="sentiment-result">
              <div className="sentiment-emoji">
                {getSentimentEmoji(sentimentResult.label)}
              </div>
              <div className="sentiment-details">
                <p className={`sentiment-label ${getSentimentColor(sentimentResult.label)}`}>
                  {sentimentResult.label}
                </p>
                <div className="confidence-bar-container">
                  <div className="confidence-label">
                    Confidence: {(sentimentResult.score * 100).toFixed(1)}%
                  </div>
                  <div className="confidence-bar">
                    <div 
                      className="confidence-fill"
                      style={{ width: `${sentimentResult.score * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;