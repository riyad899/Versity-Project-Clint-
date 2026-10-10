import {useEffect,useState} from 'react';
import AssignmentDashboard from './components/AssignmentDashboard';
import "./App.css";

const API_URL = 'http://localhost:5009/api/v1'
function App() {
  const[mode,setMode]=useState('login');
  const[name,setName]=useState('');
  const[email,setEmail]=useState('');
  const[password,setPassword]=useState('');
  const[message,setMessage]=useState('');
  const[error,setError]=useState('');
  const[loading,setLoading]=useState(false);
const[user,setUser]=useState(null);
const [checkingSession, setCheckingSession]=useState(true);


useEffect(() => {
  async function checkSession() {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        method: 'GET',
        credentials: 'include',
      });

      console.log('Session status:', response.status);

      const result = await response.json();

      if (response.ok && result.success) {
        const currentUser = result.data?.user ?? result.data;

        if (currentUser?.email) {
          setUser(currentUser);
        }
      }
    } catch (err) {
      console.error('Session check failed:', err);
    } finally {
      setCheckingSession(false);
    }
  }

  checkSession();
}, []);

const isRegisterMode = mode === 'register';

async function handleSubmit(e){
  e.preventDefault();
  setMessage('');
  setError('');
  setLoading(true);

  try{
    const endpoint = isRegisterMode ? '/auth/register' : '/auth/login';

    const payload = isRegisterMode ? {name: name.trim(),email: email.trim(),password} : {email: email.trim(),password};
    const response = await fetch(`${API_URL}${endpoint}`,{
      method:'POST',
      headers:{
        'Content-Type':'application/json'
      },
      credentials:'include',
      body:JSON.stringify(payload)
    });

    const result = await response.json(); 
    
    if(!response.ok || result.success === false){
      throw new Error(result.message || 'Something went wrong');
    }

    const currentUser = result.data?.user;
    if(!currentUser){
      throw new Error('Request succeeded but no user data was returned');}
      setUser(currentUser);
      setMessage(isRegisterMode ? 'Account created successfully!' : 'Logged in successfully!');
      setPassword('');}
      catch(err){
        setError(err.message === 'Failed to fetch' ? 'Cannot connect to the server. Please try again later.' : err.message);
  } finally{ setLoading(false); }
}

function switchMode(nextMode){
  setMode(nextMode);
  setMessage('');
  setError('');
  setPassword('');
}

  

async function logout() {
  setError('');
  setMessage('');

  try {
    const response = await fetch(
      `${API_URL}/auth/sign-out`,
      {
        method: 'POST',
        credentials: 'include',
      }
    );

    console.log('Logout status:', response.status);

   if (!response.ok) {
  const errorText = await response.text();
  console.error('Logout response body:', errorText);
  throw new Error(`Logout failed: HTTP ${response.status}`);
}

    setUser(null);
    setName('');
    setEmail('');
    setPassword('');
    setMode('login');
    setMessage('Logged out successfully!');
  } catch (err) {
    console.error('Logout error:', err);
    setError(err.message || 'Unable to log out.');
  }
}




if(user){
  return(
    <main className='app-shell'>
      <header className='topbar'>
        <a className='brand' href='/'><span className="brand-icon">C</span>
        <span>CampusMove</span></a>
        <button className='text-button' onClick={logout}>Back to login</button>
      </header>
      <section className='dashboard-card'>
        <span className='eyebrow'>AUTHENTICATION SUCCESSFUL</span>
        <h1>Welcome, {user.name}!</h1>
        <p className='subtitle'>
          Your account is connected to the campus Transportation system.
        </p>

        <div className='profile-row'>
          <div className='avatar'>{user.name.charAt(0).toUpperCase()}</div>
          <div>
            <strong>{user.name}</strong>
            <p>{user.email}</p>
          </div>
          <span className='role-badge'>{user.role || 'User'}</span>
        </div>
        
{user.role === 'transportation-manager' || user.role === 'admin' ? (
  <AssignmentDashboard />
) : (
  <div className="notice">
    <strong>Transportation Dashboard</strong>
    <p>
      Your account is connected to the campus transportation system.
    </p>
  </div>
)}

        <button className='primary-button' onClick={logout}>Logout</button>
      </section>
    </main>
  );
}
  return (
    <main className='app-shell'>
      <header className='topbar'>
        <a className='brand' href='/'><span className="brand-icon">C</span>
        <span>CampusMove</span></a>
        <span className='topbar-label'>Campus Transportation </span>
      </header>
      <section className='hero-grid'>
        <div className='hero-copy'>
          <span className='eyebrow'>YOUR CAMPUS. YOUR JOURNEY. </span>
          <h1>Getting around campus, made <span>simpler</span></h1>
          <p className='subtitle'>
            Sign in to access your campus routes, bus schedules, and transportation services updated from one place.</p>
            <div className='feature-list'>
              <div className='feature-item'>
                <span className='feature-icon'>🚌</span>
                <p>Find campus routes and stops with less hassle</p>
              </div>
              <div className='feature-item'>
                <span className='feature-icon'>📅</span>
                <div>
                  <strong>Better trip planning</strong>
                  <p>Access transportation information when you need it.</p>
        
                </div>
              </div>
              <div className='feature-item'>
                <span className='feature-icon'>🔔</span>
                <div>
                  <strong>One campus community</strong>
                  <p>Passenger, driver, and manager access in one place.</p>
                </div>
              </div>
            </div>
          </div>
          <section className='auth-card'>
            <div className='auth-heading'>
              <span className='eyebrow'>GET STARTED</span>
              <h2>{isRegisterMode ? 'Create your account' : 'Welcome back'}</h2>
              <p>
                {isRegisterMode ? 'Create a passenger account to get started.' : 'Enter your details to continue.'}
              </p>
              </div>

              <div className='auth-tabs'>
                <button className={mode === 'login' ? 'active' : ''} onClick={() => switchMode('login')}>Login</button>
                <button className={mode === 'register' ? 'active' : ''} onClick={() => switchMode('register')}>Register</button>
              </div>

              <form onSubmit={handleSubmit}>
                {isRegisterMode && (
                  <label>
                    FUll Name
                    <input type='text' value={name} onChange={(e) => setName(e.target.value)}
                    placeholder="Full Name"
                    minLength={2}
                    autoComplete="name"
                    required />
                  </label>
                )}
                <label>
                  Email
                  <input type='email' value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required />
                </label>
                <label>
                  Password
                  <input type='password' value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  minLength={6}
                  autoComplete={isRegisterMode ? "new-password" : "current-password"}
                  required />
                </label>

                {error && <p className='feedback error'>{error}</p>}
                {message && <p className='feedback success'>{message}</p>}
                <button className='primary-button' type='submit' disabled={loading}>
                  {loading ? 'Please wait...' : isRegisterMode ? 'Create passenger account' : 'Sign in'}
                </button>
              </form>

              <p className='Security-note'>
                New public account are registered as passengers. Drivers and managers access must be assigned securely.
              </p>
            </section>
          </section>
        
        <footer className='footer'>
          CampusMove . Campus Transportation &amp; Route Optimization System </footer>
    </main>

    );
  }


  export default App;
