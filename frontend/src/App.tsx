import React, { useState } from 'react';
import { supabase } from './supabase';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from 'recharts';

export default function App() {
  const [email, setEmail] = useState('');
  const [isAuth, setIsAuth] = useState(false);
  const [calls, setCalls] = useState(100);
  const [prevValue, setPrevValue] = useState<number | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    // Fetch previous values against email 
    const { data } = await supabase.from('analytics').select('val').eq('email', email).maybeSingle();
    if (data) {
      setPrevValue(data.val);
      setCalls(data.val);
    }
    setIsAuth(true);
  };

  const updateData = async () => {
    // 1. Requirement: Ask if OK to overwrite previous value [cite: 128]
    if (prevValue !== null && prevValue !== calls) {
      const ok = window.confirm(`System Alert: Previous data entry found (${prevValue}). Authorize overwrite?`);
      if (!ok) return;
    }
  
    // 2. Persistent Storage Update 
    const { error } = await supabase
      .from('analytics')
      .upsert({ 
        email: email, 
        val: calls, 
        updated_at: new Date().toISOString() 
      }, { onConflict: 'email' });
  
    if (error) {
      alert("Terminal Error: " + error.message);
    } else {
      setPrevValue(calls);
      alert("Data Uplink Successful");
    }
  };

  // Futurist Styles
  const glassStyle = {
    background: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '2px', // Sharper corners look more professional/robotic
  };

  if (!isAuth) return (
    <div style={{ backgroundColor: '#050505', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'monospace' }}>
      <form onSubmit={handleLogin} style={{ ...glassStyle, padding: '50px', width: '400px', textAlign: 'center' }}>
        <div style={{ fontSize: '10px', letterSpacing: '4px', color: '#666', marginBottom: '10px' }}>SYSTEM ACCESS</div>
        <h2 style={{ marginBottom: '30px', fontWeight: 'lighter', letterSpacing: '2px' }}>VOICE_ANALYTICS_V1</h2>
        <input 
            type="email" required placeholder="IDENTIFY_USER@EMAIL.COM" onChange={e => setEmail(e.target.value)} 
            style={{ background: 'transparent', color: '#fff', padding: '15px', width: '100%', marginBottom: '20px', border: 'none', borderBottom: '1px solid #333', outline: 'none', textAlign: 'center', fontSize: '14px' }} 
        />
        <button type="submit" style={{ background: '#fff', color: '#000', width: '100%', padding: '15px', fontWeight: 'bold', border: 'none', cursor: 'pointer', letterSpacing: '2px' }}>INITIALIZE</button>
      </form>
    </div>
  );

  return (
    <div style={{ backgroundColor: '#050505', minHeight: '100vh', color: '#fff', padding: '60px', fontFamily: 'monospace' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', maxWidth: '1100px', margin: '0 auto 60px auto', borderLeft: '2px solid #fff', paddingLeft: '20px' }}>
        <div>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>SESSION_ID: {email.split('@')[0].toUpperCase()}</div>
          <h1 style={{ fontSize: '38px', fontWeight: 'lighter', margin: 0, letterSpacing: '-1px' }}>CALL_DURATION_ANALYSIS</h1>
        </div>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '10px', color: '#666' }}>ADJUST_PARAMETER</div>
            <input type="number" value={calls} onChange={e => setCalls(Number(e.target.value))} 
                   style={{ background: 'transparent', color: '#fff', border: 'none', fontSize: '24px', width: '80px', textAlign: 'right', outline: 'none' }} />
          </div>
          <button onClick={updateData} style={{ background: '#fff', color: '#000', padding: '15px 30px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>SYNC_DATA</button>
        </div>
      </header>

      {/* THE CHART CONTAINER */}
      <div style={{ ...glassStyle, height: '500px', maxWidth: '1100px', margin: '0 auto', padding: '40px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={[
            {day:'01', v:calls - 20}, {day:'02', v:calls}, {day:'03', v:calls + 15}, 
            {day:'04', v:calls + 5}, {day:'05', v:calls + 25}
          ]}>
            <CartesianGrid strokeDasharray="2 2" stroke="#1a1a1a" vertical={false} />
            <XAxis dataKey="day" stroke="#333" fontSize={10} tickLine={false} axisLine={false} dy={10} />
            <YAxis stroke="#333" fontSize={10} tickLine={false} axisLine={false} dx={-10} />
            <Tooltip 
                cursor={{ stroke: '#fff', strokeWidth: 1 }}
                contentStyle={{backgroundColor: '#050505', border: '1px solid #333', borderRadius: '0px', color: '#fff', fontSize: '10px'}} 
            />
            <Line 
                type="stepAfter" // Robotic step-style line
                dataKey="v" 
                stroke="#fff" 
                strokeWidth={2} 
                dot={{fill:'#050505', stroke: '#fff', strokeWidth: 2, r: 4}} 
                activeDot={{ r: 6, fill: '#fff' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <footer style={{ maxWidth: '1100px', margin: '40px auto 0 auto', fontSize: '10px', color: '#333', display: 'flex', justifyContent: 'space-between' }}>
        <div>CORE_SYSTEM_ACTIVE_V.2.0.4</div>
        <div>STABLE_UPLINK_ESTABLISHED</div>
      </footer>
    </div>
  );
}