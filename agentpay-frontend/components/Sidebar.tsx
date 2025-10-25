'use client';

import React from 'react';
import './Sidebar.css';
import { useAuth } from './AuthProvider';

export default function Sidebar() {
  const { user, signOut } = useAuth();

  const chats = JSON.parse(localStorage.getItem('agentpay_chats') || '[]');
  const transactions = JSON.parse(localStorage.getItem('agentpay_txns') || '[]');

  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <div className="brand">
          <h2>Evangelion</h2>
          <span className="sub">AgentPay</span>
        </div>
        <div className="profile">
          <div className="avatar">{user?.name?.charAt(0) || 'A'}</div>
          <div className="meta">
            <div className="name">{user?.name || 'Guest'}</div>
            <div className="email">{user?.email || '-'}</div>
          </div>
        </div>
      </div>

      <div className="sidebar-section">
        <h4>Chats</h4>
        <ul className="list">
          {chats.length === 0 && <li className="muted">No chats yet</li>}
          {chats.slice(0,5).map((c:any, i:number)=>(
            <li key={i}>{c.title || 'Chat ' + (i+1)}</li>
          ))}
        </ul>
      </div>

      <div className="sidebar-section">
        <h4>Transactions</h4>
        <ul className="list">
          {transactions.length === 0 && <li className="muted">No transactions</li>}
          {transactions.slice(0,5).map((t:any, i:number)=>(
            <li key={i}>Txn: {t.txnId || t.id || '—'}</li>
          ))}
        </ul>
      </div>

      <div className="sidebar-bottom">
        <button className="primary-button" onClick={() => window.location.href = '/login'}>Profile / Settings</button>
        <button className="primary-button" onClick={() => { signOut(); window.location.href = '/login'; }}>Sign out</button>
      </div>
    </aside>
  );
}
