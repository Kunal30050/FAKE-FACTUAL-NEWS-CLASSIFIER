import { useState } from 'react';

const API_PROXY_URL = '/api/verify';

// === GLOBAL STYLES ===
const appContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
  width: '100%',
  fontFamily: 'Poppins, sans-serif',
  color: 'white',
  backgroundImage: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)', // Dark gradient bg
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundAttachment: 'fixed',
};

// === NAVBAR ===
const navbarStyle = {
  width: '100%',
  position: 'fixed',
  top: 0,
  left: 0,
  padding: '1rem 2rem',
  background: 'rgba(15, 15, 30, 0.65)',
  backdropFilter: 'blur(15px)',
  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  zIndex: 1000,
};

const navbarContainerStyle = {
  width: '100%',
  maxWidth: '1200px',
  margin: '0 auto',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const navLogoStyle = {
  fontSize: '1.6rem',
  fontWeight: '700',
  background: 'linear-gradient(45deg, #06b6d4, #9333ea)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  textDecoration: 'none',
};

const navMenuStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '1.5rem',
};

const navItemStyle = {
  color: '#d1d5db',
  textDecoration: 'none',
  fontWeight: '400',
  transition: 'color 0.3s ease',
};
const navButtonRegisterStyle = {
  padding: '0.5rem 1rem',
  background: 'linear-gradient(45deg, #ec4899, #8b5cf6)',
  color: '#fff',
  borderRadius: '8px',
  transition: 'all 0.3s ease',
  fontWeight: '600',
  cursor: 'pointer',
};

// === MAIN CONTAINER ===
const mainContainerStyle = {
  display: "flex",
  justifyContent: "center",  // horizontally center
  alignItems: "center",      // vertically center
  width: "100%",
  minHeight: "100vh",
  paddingTop: "80px",        // still leaves gap below navbar
  boxSizing: "border-box",
};

const detectorContainerStyle = {
  width: "100%",
  maxWidth: "900px", // 👈 wider like your screenshot
  background: "rgba(25, 25, 40, 0.9)",
  border: "1px solid rgba(255, 255, 255, 0.15)",
  borderRadius: "16px",
  padding: "2rem",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.37)",
  backdropFilter: "blur(15px)",
  WebkitBackdropFilter: "blur(15px)",
  textAlign: "left", // 👈 left-aligned like Streamlit
  margin: "0 auto",
};

// === TITLES ===
const titleStyle = {
  fontSize: '2.7rem',
  fontWeight: '800',
  marginBottom: '0.8rem',
  background: 'linear-gradient(90deg, #06b6d4, #3b82f6, #9333ea)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
};

const subtitleStyle = {
  color: '#9ca3af',
  marginBottom: '2rem',
  fontWeight: '300',
};

// === INPUT AREA ===
const inputAreaStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
};

const textareaStyle = {
  width: '100%',
  minHeight: '160px',
  background: 'rgba(45, 45, 70, 0.6)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '10px',
  padding: '1rem',
  color: 'white',
  fontFamily: 'Poppins, sans-serif',
  fontSize: '1rem',
  resize: 'vertical',
  outline: 'none',
};

const buttonStyle = {
  padding: '1rem 1.5rem',
  fontSize: '1.1rem',
  fontWeight: '600',
  color: '#fff',
  background: 'linear-gradient(45deg, #9333ea, #3b82f6)',
  border: 'none',
  borderRadius: '10px',
  cursor: 'pointer',
  transition: 'transform 0.2s ease, opacity 0.3s ease',
};

const buttonDisabledStyle = {
  background: 'linear-gradient(45deg, #4b5563, #374151)',
  cursor: 'not-allowed',
  opacity: 0.6,
};

// === RESULT STYLES ===
const resultCardStyle = {
  marginTop: '2rem',
  padding: '1.5rem',
  borderRadius: '16px',
  textAlign: 'left',
  borderLeft: '5px solid',
};

const resultCardFactualStyle = {
  backgroundColor: 'rgba(16, 185, 129, 0.15)',
  borderColor: '#10b981',
  color: 'white',
};

const resultCardFakeStyle = {
  backgroundColor: 'rgba(239, 68, 68, 0.15)',
  borderColor: '#ef4444',
  color: 'white',
};

const resultTitleStyle = {
  marginBottom: '0.5rem',
  fontSize: '1.5rem',
  fontWeight: '700',
};

const resultDetailsStyle = {
  color: '#e5e7eb',
};

const detailsSectionStyle = {
  marginTop: '1.5rem',
  borderTop: '1px solid rgba(255, 255, 255, 0.15)',
  paddingTop: '1.5rem',
};

const detailTitleStyle = {
  fontSize: '1.2rem',
  fontWeight: '600',
  marginBottom: '0.5rem',
  color: '#fff',
};

const evidenceBoxStyle = {
  padding: '1rem',
  backgroundColor: 'rgba(30, 41, 59, 0.7)',
  borderRadius: '8px',
  fontSize: '0.9rem',
  color: '#d1d5db',
  marginTop: '0.5rem',
};

const errorCardStyle = {
  marginTop: '1rem',
  padding: '1rem',
  borderRadius: '12px',
  backgroundColor: 'rgba(239, 68, 68, 0.15)',
  border: '1px solid #ef4444',
  color: '#ef4444',
  textAlign: 'center',
};

function App() {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleAnalyzeClick = async () => {
    if (inputText.trim().length === 0) {
      setError("Please enter some text to verify.");
      return;
    }

    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch(API_PROXY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ news_text: inputText }),
      });

      if (!response.ok) throw new Error(`Server responded with status: ${response.status}`);

      const data = await response.json();
      if (data.verdict.toLowerCase() === 'true') {
        setResult({ title: "The claim appears to be FACTUAL.", verdict: "true", entities: data.entities, evidence: data.evidence });
      } else if (data.verdict.toLowerCase() === 'false') {
        setResult({ title: "The claim appears to be FAKE.", verdict: "false", entities: data.entities, evidence: data.evidence });
      } else {
        setResult({ title: "The verdict was inconclusive.", verdict: "inconclusive", entities: data.entities, evidence: data.evidence });
      }
    } catch (err) {
      console.error("Error calling the analysis API:", err);
      setError("Could not connect to the analysis server. Please ensure it's running.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={appContainerStyle}>
      {/* NAVBAR */}
      <header style={navbarStyle}>
        <div style={navbarContainerStyle}>
          <a href="#" style={navLogoStyle}>Singularity</a>
          <nav style={navMenuStyle}>
            <a href="#" style={navItemStyle}>Guide</a>
            <a href="#" style={navItemStyle}>About</a>
            <a href="#" style={navItemStyle}>Login</a>
            <a href="#" style={navButtonRegisterStyle}>Register</a>
          </nav>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main style={mainContainerStyle}>
        <div style={detectorContainerStyle}>
          <h1 style={titleStyle}>Fake or Factual?</h1>
          <p style={subtitleStyle}>Enter the news headline or text below to check its authenticity.</p>

          <div style={inputAreaStyle}>
            <textarea
              placeholder="Paste your news article or headline here..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isLoading}
              style={textareaStyle}
            />
            <button
              onClick={handleAnalyzeClick}
              disabled={isLoading}
              style={{ ...buttonStyle, ...(isLoading && buttonDisabledStyle) }}
            >
              {isLoading ? 'Analyzing...' : 'Analyze'}
            </button>
          </div>

          {error && <div style={errorCardStyle}><p>Error: {error}</p></div>}

          {result && (
            <div style={{ ...resultCardStyle, ...(result.verdict === 'true' ? resultCardFactualStyle : resultCardFakeStyle) }}>
              <h2 style={resultTitleStyle}>{result.verdict === 'true' ? '✅' : '❌'} {result.title}</h2>
              <div style={detailsSectionStyle}>
                <h3 style={detailTitleStyle}>1. Extracted Entities</h3>
                <p style={resultDetailsStyle}>{result.entities.join(', ') || 'No specific entities found.'}</p>

                <h3 style={detailTitleStyle}>2. Gathered Evidence</h3>
                <div style={evidenceBoxStyle}>
                  <p style={resultDetailsStyle}>{result.evidence || 'No relevant search results were found.'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
