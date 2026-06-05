import { NavLink, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import api from './api';
import { useEffect, useMemo, useState, useRef } from 'react';

function AuthGate({ children }) {
  const { loading, user } = useAuth();
  if (loading) return <div className="loader-screen">Loading Dragon Tiger Royale...</div>;
  return user ? children : <Navigate to="/auth" replace />;
}

function GuestGate({ children }) {
  const { loading, user } = useAuth();
  if (loading) return <div className="loader-screen">Loading Dragon Tiger Royale...</div>;
  return user ? <Navigate to="/" replace /> : children;
}

function Layout({ page, children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = [
    { to: '/', label: 'Home' },
    { to: '/wallet', label: 'Wallet' },
    { to: '/game', label: 'Game' },
    { to: '/profile', label: 'Profile' },
  ];
  if (user?.role === 'admin') links.push({ to: '/admin', label: 'Admin' });

  return (
    <div className={`app-shell ${page === 'game' ? 'game-page-mode' : ''}`}>
      <aside className="sidebar-panel">
        <div>
          <div className="chip-label gold">ROYAL FLOOR</div>
          <h1>Dragon Tiger</h1>
          <p>Modern mobile-first casino starter with admin controls.</p>
        </div>

        <nav className="sidebar-nav">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.to === '/'} className="nav-link">
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="profile-box">
          <div className="avatar-circle">{user?.avatar ? <img src={user.avatar} alt={user.name} /> : (user?.name?.[0] || 'U')}</div>
          <div>
            <strong>{user?.name}</strong>
            <p>{user?.email}</p>
            <span className="mini-role">{user?.role}</span>
          </div>
          <button className="action-btn red" onClick={() => { logout(); navigate('/auth'); }}>
            Logout
          </button>
        </div>
      </aside>

      <main className="main-shell">
        <header className="top-header">
          <div>
            <div className="chip-label">LIVE LOBBY</div>
            <h2>{page === 'game' ? 'Dragon vs Tiger Table' : 'Premium Dashboard'}</h2>
          </div>
          <div className="header-pills">
            <span className="stat-pill">Wallet 🪙 {user?.balance ?? 0}</span>
            <span className="stat-pill soft">Ref Code: {user?.referralCode}</span>
          </div>
        </header>
        <section className={`main-content ${page === 'game' ? 'main-content-game' : ''}`}>{children}</section>
        <div className="mobile-nav">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.to === '/'} className="mobile-link">
              {link.label}
            </NavLink>
          ))}
        </div>
      </main>
    </div>
  );
}

function AuthPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', referralCode: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (mode === 'login') {
        await login({ email: form.email, password: form.password });
      } else {
        await register(form);
      }
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-showcase">
        <div className="chip-label gold">ADVANCED VERSION</div>
        <h1>Secure Dashboard & Mobile-First UI</h1>
        <p>Features include a secure backend, approval-based wallet requests, a referral system, avatar profiles, and an optimized mobile game layout.</p>
        <div className="showcase-grid">
          <div className="showcase-card">Admin Approval System</div>
          <div className="showcase-card">Secure Transactions</div>
          <div className="showcase-card">Referral Rewards</div>
          <div className="showcase-card">Compact Mobile Table</div>
        </div>
      </div>

      <form className="auth-card" onSubmit={submit}>
        <div className="tabs-row">
          <button type="button" className={mode === 'login' ? 'tab-btn active' : 'tab-btn'} onClick={() => setMode('login')}>Login</button>
          <button type="button" className={mode === 'register' ? 'tab-btn active' : 'tab-btn'} onClick={() => setMode('register')}>Register</button>
        </div>

        {mode === 'register' && (
          <label>
            Full Name
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Enter your full name" required />
          </label>
        )}
        <label>
          Email Address
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Enter your email" required />
        </label>
        <label>
          Password
          <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Enter your password" required />
        </label>
        {mode === 'register' && (
          <label>
            Referral Code (Optional)
            <input value={form.referralCode} onChange={(e) => setForm({ ...form, referralCode: e.target.value })} placeholder="Enter referral code if you have one" />
          </label>
        )}

        {error ? <div className="message-box error">{error}</div> : null}
        <button className="action-btn gold full" type="submit" disabled={busy}>{busy ? 'Please wait...' : mode === 'login' ? 'Login to Dashboard' : 'Create Account'}</button>
      </form>
    </div>
  );
}

function HomePage() {
  const [data, setData] = useState({ balance: 0, totalGames: 0, totalWins: 0, pendingWallets: 0, history: [], transactions: [] });
  const { user } = useAuth();

  useEffect(() => {
    api.get('/dashboard/summary').then((res) => setData(res.data));
  }, []);

  const stats = [
    ['Wallet Balance', `🪙 ${data.balance}`],
    ['Rounds Played', data.totalGames],
    ['Rounds Won', data.totalWins],
    ['Pending Requests', data.pendingWallets],
  ];

  return (
    <Layout page="home">
      <div className="dashboard-grid">
        <section className="hero-panel premium-bg">
          <div>
            <div className="chip-label">WELCOME</div>
            <h3>Welcome, {user?.name}. Your premium casino dashboard is ready.</h3>
            <p>Manage your funds securely. Enjoy referral rewards, profile customization, and a fast, seamless gaming experience.</p>
          </div>
          <div className="hero-actions">
            <NavLink className="action-btn gold" to="/game">Play Dragon Tiger</NavLink>
            <NavLink className="action-btn soft" to="/wallet">Wallet Requests</NavLink>
          </div>
        </section>

        <section className="stats-grid">
          {stats.map(([title, value]) => (
            <div className="stat-card" key={title}>
              <span>{title}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </section>

        <section className="two-col-grid">
          <div className="panel-card">
            <div className="panel-head"><h4>Recent Wallet Activity</h4></div>
            <div className="list-wrap">
              {data.transactions.length ? data.transactions.map((item) => (
                <div className="row-card" key={item._id}>
                  <span>{item.type}</span>
                  <strong>{item.amount}</strong>
                </div>
              )) : <div className="empty-state">No recent wallet activity.</div>}
            </div>
          </div>
          <div className="panel-card">
            <div className="panel-head"><h4>Recent Game Results</h4></div>
            <div className="list-wrap">
              {data.history.length ? data.history.map((item) => (
                <div className="row-card" key={item._id}>
                  <span>D {item.dragonCard} vs T {item.tigerCard}</span>
                  <strong>{item.winner}</strong>
                </div>
              )) : <div className="empty-state">No game rounds played yet.</div>}
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}

function WalletPage() {
  const { refreshUser } = useAuth();
  const [wallet, setWallet] = useState({ balance: 0, requests: [], transactions: [] });
  const [form, setForm] = useState({ type: 'deposit', amount: 500, method: 'JazzCash', accountTitle: '', accountNumber: '', note: '' });
  const [message, setMessage] = useState('Please fill out the form below to submit your request.');

  const load = async () => {
    const { data } = await api.get('/wallet');
    setWallet(data);
  };

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    
    // --- AMOUNT VALIDATION LOGIC ---
    const amt = Number(form.amount);
    
    if (form.type === 'deposit') {
      if (amt < 100) return setMessage('❌ Minimum deposit amount is 100 Rs.');
      if (amt > 1500) return setMessage('❌ Maximum deposit limit is 1500 Rs.');
    } else if (form.type === 'withdraw') {
      if (amt < 200) return setMessage('❌ Minimum withdrawal amount is 200 Rs.');
      if (amt > 1500) return setMessage('❌ Maximum withdrawal limit is 1500 Rs.');
      if (amt > wallet.balance) return setMessage('❌ Insufficient wallet balance.');
    }
    // -------------------------------

    try {
      const combinedNote = `Method: ${form.method} | Title: ${form.accountTitle} | A/C: ${form.accountNumber} | Note: ${form.note}`;
      
      const payload = {
        type: form.type,
        amount: amt,
        note: combinedNote
      };

      const { data } = await api.post('/wallet/request', payload);
      setMessage(`✅ ${data.message}`);
      
      setForm({ ...form, accountTitle: '', accountNumber: '', note: '' });
      await load();
      await refreshUser();
    } catch (err) {
      setMessage(`❌ ${err.response?.data?.message || 'Request failed. Please try again.'}`);
    }
  };

  return (
    <Layout page="wallet">
      <div className="wallet-grid">
        
        <section className="panel-card wallet-highlight">
          <div className="chip-label">MY WALLET</div>
          <h3>Manage Your Funds</h3>
          
          <div style={{ background: 'rgba(249, 222, 122, 0.08)', border: '1px solid var(--gold1)', padding: '15px', borderRadius: '12px', marginTop: '15px', marginBottom: '20px' }}>
            <strong style={{ color: 'var(--gold1)', display: 'block', marginBottom: '8px', fontSize: '1.05rem' }}>
              ⚠️ Deposit Instructions
            </strong>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '12px' }}>
              Please transfer your funds to the account below, then fill out the form to submit your request.
            </p>
            
            <div style={{ display: 'grid', gap: '8px', fontSize: '0.95rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>
                <span style={{ color: 'var(--muted)' }}>Bank / Wallet:</span> 
                <strong>JazzCash</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>
                <span style={{ color: 'var(--muted)' }}>Account Title:</span> 
                <strong>Dragon Tiger</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--muted)' }}>Account Number:</span> 
                <strong style={{ color: 'var(--gold1)', fontSize: '1.1rem', letterSpacing: '1px' }}>0336-1540147</strong>
              </div>
            </div>
          </div>

          <div className="balance-big">Balance: 🪙 {wallet.balance}</div>
        </section>

        <form className="panel-card request-form" onSubmit={submit}>
          <div className="panel-head"><h4>Create Wallet Request</h4></div>
          <div className="form-grid-two">
            
            <label className="premium-dropdown">
              Transaction Type
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="deposit">Deposit</option>
                <option value="withdraw">Withdraw</option>
              </select>
            </label>
            
            <label className="premium-dropdown">
              Payment Method
              <select value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}>
                <option value="JazzCash">JazzCash</option>
                <option value="Easypaisa">Easypaisa</option>
              </select>
            </label>

            <label>
              Amount (Rs)
              <input 
                type="number" 
                value={form.amount} 
                onChange={(e) => setForm({ ...form, amount: e.target.value })} 
                min={form.type === 'deposit' ? 100 : 200}
                max={1500}
                required 
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--gold1)', marginTop: '-4px' }}>
                Allowed Limit: {form.type === 'deposit' ? '100 - 1500' : '200 - 1500'}
              </span>
            </label>

            <label>
              Your Account Title
              <input value={form.accountTitle} onChange={(e) => setForm({ ...form, accountTitle: e.target.value })} placeholder="Enter your full account name" required />
            </label>

            <label>
              Your Account Number
              <input value={form.accountNumber} onChange={(e) => setForm({ ...form, accountNumber: e.target.value })} placeholder="e.g., 03xxxxxxxxx" required />
            </label>

            <label>
              Transaction ID / Remarks
              <input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Enter TID or additional details" />
            </label>
          </div>
          
          <div className="message-box">{message}</div>
          <button className="action-btn gold full" type="submit">Submit Request</button>
        </form>

        <section className="panel-card split-panel">
          <div className="panel-head"><h4>Pending & Past Requests</h4></div>
          <div className="list-wrap compact-scroll">
            {wallet.requests?.length ? wallet.requests.map((item) => (
              <div className="row-card stacked" key={item._id}>
                <strong>{item.type.toUpperCase()}</strong>
                <span>Amount: {item.amount}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '4px' }}>{item.note}</span>
                <span style={{ marginTop: '4px' }}>Status: {item.status.charAt(0).toUpperCase() + item.status.slice(1)}</span>
              </div>
            )) : <div className="empty-state">No wallet requests found.</div>}
          </div>
        </section>

        <section className="panel-card split-panel">
          <div className="panel-head"><h4>Transaction History</h4></div>
          <div className="list-wrap compact-scroll">
            {wallet.transactions?.length ? wallet.transactions.map((item) => (
              <div className="row-card" key={item._id}>
                <span>{item.type}</span>
                <strong>{item.amount}</strong>
              </div>
            )) : <div className="empty-state">No transactions yet.</div>}
          </div>
        </section>
        
      </div>
    </Layout>
  );
}

function ProfilePage() {
  const { user, refreshUser, setUser } = useAuth();
  const [form, setForm] = useState({ name: '', avatar: '' });
  const [referrals, setReferrals] = useState({ referralCode: '', invitedUsers: [] });
  const [message, setMessage] = useState('Update your personal details below.');

  useEffect(() => {
    if (user) setForm({ name: user.name || '', avatar: user.avatar || '' });
    api.get('/referrals').then((res) => setReferrals(res.data));
  }, [user]);

  const save = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.put('/profile', form);
      setUser(data.user);
      await refreshUser();
      setMessage('Profile updated successfully.');
    } catch {
      setMessage('Failed to update profile. Please try again.');
    }
  };

  return (
    <Layout page="profile">
      <div className="profile-grid">
        <section className="panel-card profile-card-large">
          <div className="avatar-hero">{form.avatar ? <img src={form.avatar} alt="avatar" /> : (user?.name?.[0] || 'U')}</div>
          <div>
            <div className="chip-label">MY PROFILE</div>
            <h3>{user?.name}</h3>
            <p>{user?.email}</p>
            <p>Referral Code: <strong>{user?.referralCode}</strong></p>
            <p>Total Referrals: <strong>{user?.referrals || 0}</strong></p>
          </div>
        </section>

        <form className="panel-card" onSubmit={save}>
          <div className="panel-head"><h4>Edit Profile</h4></div>
          <label>Full Name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your Full Name" /></label>
          <label>Avatar Image URL<input value={form.avatar} onChange={(e) => setForm({ ...form, avatar: e.target.value })} placeholder="https://example.com/avatar.png" /></label>
          <div className="message-box">{message}</div>
          <button className="action-btn gold full">Save Changes</button>
        </form>

        <section className="panel-card">
          <div className="panel-head"><h4>Referred Users</h4></div>
          <div className="list-wrap compact-scroll">
            {referrals.invitedUsers.length ? referrals.invitedUsers.map((item) => (
              <div className="row-card stacked" key={item._id}>
                <strong>{item.name}</strong>
                <span>{item.email}</span>
              </div>
            )) : <div className="empty-state">No users referred yet.</div>}
          </div>
        </section>
      </div>
    </Layout>
  );
}

function AdminPage() {
  const [data, setData] = useState({ counts: { totalUsers: 0, pendingRequests: 0, totalVolume: 0 }, pendingRequests: [], latestUsers: [] });
  const [note, setNote] = useState('');
  const [message, setMessage] = useState('Manage all pending user requests here.');

  const load = async () => {
    const { data } = await api.get('/admin/overview');
    setData(data);
  };

  useEffect(() => { load(); }, []);

  const decide = async (id, decision) => {
    try {
      const { data } = await api.post(`/admin/requests/${id}/decision`, { decision, adminNote: note });
      setMessage(data.message);
      setNote('');
      await load();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to process decision.');
    }
  };

  return (
    <Layout page="admin">
      <div className="dashboard-grid">
        <section className="stats-grid">
          <div className="stat-card"><span>Total Users</span><strong>{data.counts.totalUsers}</strong></div>
          <div className="stat-card"><span>Pending Requests</span><strong>{data.counts.pendingRequests}</strong></div>
          <div className="stat-card"><span>Total Volume</span><strong>{data.counts.totalVolume}</strong></div>
        </section>

        <section className="two-col-grid">
          <div className="panel-card">
            <div className="panel-head"><h4>Pending Wallet Requests</h4></div>
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add admin note (optional)" />
            <div className="message-box">{message}</div>
            <div className="list-wrap compact-scroll">
              {data.pendingRequests.length ? data.pendingRequests.map((item) => (
                <div className="row-card stacked" key={item._id}>
                  <strong>{item.userId?.name} • {item.type.toUpperCase()}</strong>
                  <span>{item.amount} Rs</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{item.note}</span>
                  <div className="inline-actions" style={{ marginTop: '8px' }}>
                    <button className="action-btn gold small" onClick={() => decide(item._id, 'approve')}>Approve</button>
                    <button className="action-btn red small" onClick={() => decide(item._id, 'reject')}>Reject</button>
                  </div>
                </div>
              )) : <div className="empty-state">All caught up! No pending requests.</div>}
            </div>
          </div>

          <div className="panel-card">
            <div className="panel-head"><h4>Newly Registered Users</h4></div>
            <div className="list-wrap compact-scroll">
              {data.latestUsers.map((item) => (
                <div className="row-card stacked" key={item._id}>
                  <strong>{item.name}</strong>
                  <span>{item.email}</span>
                  <span>{item.role.toUpperCase()} • Balance: 🪙 {item.balance}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}

function GamePage() {
  const { refreshUser } = useAuth();
  const [balance, setBalance] = useState(0);
  const [betAmount, setBetAmount] = useState(50);
  const [placedBet, setPlacedBet] = useState(null);
  const [phase, setPhase] = useState('BETTING');
  const [timer, setTimer] = useState(10);
  const [dragonCard, setDragonCard] = useState(null);
  const [tigerCard, setTigerCard] = useState(null);
  const [winner, setWinner] = useState('');
  const [message, setMessage] = useState('Betting is open! Place your bet on Dragon or Tiger.');
  const [round, setRound] = useState(1);
  const [history, setHistory] = useState([]);
  
  const [musicPlaying, setMusicPlaying] = useState(false);
  const bgmAudio = useRef(null);
  const chips = [10, 50, 100, 200, 500, 1000];

  useEffect(() => {
    bgmAudio.current = new Audio('/bgm.mp3');
    bgmAudio.current.loop = true;
    bgmAudio.current.volume = 0.3; 
    
    const boot = async () => {
      const [walletRes, historyRes] = await Promise.all([api.get('/wallet'), api.get('/game/history')]);
      setBalance(walletRes.data.balance);
      setHistory(historyRes.data.history.map((item) => item.winner));
    };
    boot();

    return () => {
      if (bgmAudio.current) {
        bgmAudio.current.pause();
        bgmAudio.current = null;
      }
    };
  }, []);

  useEffect(() => {
    let interval;
    if (phase === 'BETTING' && timer > 0) interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    if (phase === 'BETTING' && timer === 0) dealRound();
    return () => clearInterval(interval);
  }, [phase, timer]);

  const toggleMusic = () => {
    if (musicPlaying) {
      bgmAudio.current.pause();
    } else {
      bgmAudio.current.play().catch(e => console.log("Autoplay blocked. User interaction required."));
    }
    setMusicPlaying(!musicPlaying);
  };

  const announceWinner = (winnerSide) => {
    if ('speechSynthesis' in window) {
      const text = winnerSide === 'Tie' ? 'Match is a Tie!' : `${winnerSide} is the winner!`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.1;
      utterance.volume = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const statusText = useMemo(() => phase === 'BETTING' ? 'BETTING OPEN' : phase === 'DEALING' ? 'DEALING' : 'RESULT', [phase]);

  const placeBet = (side) => {
    if (phase !== 'BETTING') return setMessage('Betting is currently closed.');
    if (placedBet) return setMessage('You have already placed a bet for this round.');
    if (betAmount > balance) return setMessage('Insufficient wallet balance.');
    
    if (!musicPlaying && bgmAudio.current) {
      bgmAudio.current.play().catch(() => {});
      setMusicPlaying(true);
    }

    setPlacedBet({ side, amount: betAmount });
    setMessage(`Bet of ${betAmount} coins placed on ${side}.`);
  };

  const dealRound = async () => {
    setPhase('DEALING');
    setMessage('Revealing cards...');
    try {
      const { data } = await api.post('/game/play', { side: placedBet?.side || null, amount: placedBet?.amount || 0 });
      setDragonCard(data.round.dragonCard);
      setTigerCard(data.round.tigerCard);
      
      setTimeout(async () => {
        setWinner(data.round.winner);
        setPhase('RESULT');
        setBalance(data.balance);
        setHistory(data.history.map((item) => item.winner));
        setMessage(data.message);
        
        announceWinner(data.round.winner);
        
        await refreshUser();
        setTimeout(() => resetRound(), 3500); 
      }, 900);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Round failed. Retrying...');
      resetRound();
    }
  };

  const resetRound = () => {
    setPhase('BETTING');
    setTimer(10);
    setPlacedBet(null);
    setDragonCard(null);
    setTigerCard(null);
    setWinner('');
    setRound((r) => r + 1);
    setMessage('New round started. Please place your bets.');
  };

  const renderCard = (n) => {
    if (!n) return <div className="card-back-pattern"></div>;
    const suits = ['♥', '♠', '♦', '♣'];
    const suit = suits[n % 4]; 
    const color = (suit === '♥' || suit === '♦') ? 'red' : 'black';
    const label = n === 1 ? 'A' : n === 11 ? 'J' : n === 12 ? 'Q' : n === 13 ? 'K' : n;

    return (
      <div className={`card-face-real ${color}`}>
        <div className="card-corner top-left">
          <span>{label}</span><span className="mini-suit">{suit}</span>
        </div>
        <div className="card-center-suit">{suit}</div>
        <div className="card-corner bottom-right">
          <span>{label}</span><span className="mini-suit">{suit}</span>
        </div>
      </div>
    );
  };

  return (
    <Layout page="game">
      <div className="game-screen">
        <div className="game-topbar compact">
          <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
            <div className="chip-label gold">TABLE #{round}</div>
            <h3 className="game-heading">Dragon <span>VS</span> Tiger</h3>
          </div>
          <div className="game-top-right">
            <button className={`chip-btn ${musicPlaying ? 'active' : ''}`} onClick={toggleMusic} style={{minWidth: '40px', padding: '0 10px'}}>
              {musicPlaying ? '🔊' : '🔈'}
            </button>
            <div className="round-timer">{phase === 'BETTING' ? timer : 0}</div>
            <div className={`phase-chip ${phase.toLowerCase()}`}>{statusText}</div>
          </div>
        </div>

        <div className="history-strip">
          {history.slice(0, 10).length ? history.slice(0, 10).map((item, i) => <span key={`${item}-${i}`} className={`history-dot ${item.toLowerCase()}`}>{item[0]}</span>) : <span className="muted">No history yet</span>}
        </div>

        <div className="game-stage">
          <div className={`battle-card dragon-zone ${winner === 'Dragon' ? 'winner-glow' : ''}`}>
            <div className="battle-head"><strong className="dragon-text">🐉 DRAGON</strong><span className="multiplier">2x</span></div>
            <div className="card-slot">{renderCard(dragonCard)}</div>
            <button className={`bet-select dragon-btn ${placedBet?.side === 'Dragon' ? 'active' : ''}`} onClick={() => placeBet('Dragon')} disabled={phase !== 'BETTING'}>BET DRAGON</button>
          </div>

          <div className="arena-core">
            <div className="vs-badge">VS</div>
            <div className="live-note">{message}</div>
            <div className="bet-preview">{placedBet ? `Bet: ${placedBet.side} • ${placedBet.amount}` : `Wallet: ${balance}`}</div>
          </div>

          <div className={`battle-card tiger-zone ${winner === 'Tiger' ? 'winner-glow' : ''}`}>
            <div className="battle-head"><strong className="tiger-text">🐅 TIGER</strong><span className="multiplier">2x</span></div>
            <div className="card-slot">{renderCard(tigerCard)}</div>
            <button className={`bet-select tiger-btn ${placedBet?.side === 'Tiger' ? 'active' : ''}`} onClick={() => placeBet('Tiger')} disabled={phase !== 'BETTING'}>BET TIGER</button>
          </div>
        </div>

        <div className="controls-panel">
          <div className="chips-wrap">
            {chips.map((chip) => <button key={chip} className={`chip-btn ${chip === betAmount ? 'active' : ''}`} onClick={() => setBetAmount(chip)} disabled={phase !== 'BETTING'}>{chip}</button>)}
          </div>
          <button className={`bet-select tie-btn ${placedBet?.side === 'Tie' ? 'active' : ''}`} onClick={() => placeBet('Tie')} disabled={phase !== 'BETTING'}>Tie 8x</button>
        </div>
      </div>
    </Layout>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/auth" element={<GuestGate><AuthPage /></GuestGate>} />
      <Route path="/" element={<AuthGate><HomePage /></AuthGate>} />
      <Route path="/wallet" element={<AuthGate><WalletPage /></AuthGate>} />
      <Route path="/profile" element={<AuthGate><ProfilePage /></AuthGate>} />
      <Route path="/game" element={<AuthGate><GamePage /></AuthGate>} />
      <Route path="/admin" element={<AuthGate><AdminPage /></AuthGate>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}