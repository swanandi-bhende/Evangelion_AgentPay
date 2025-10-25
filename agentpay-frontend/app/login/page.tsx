"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthProvider, useAuth } from '../../components/AuthProvider';
import './login.css';

function LoginForm(){
  const { signIn } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [account, setAccount] = useState('');

  const onSubmit = (e:any) => {
    e.preventDefault();
    signIn({name, email, hedraAccount: account, preferredCurrencies: ['USD','INR'], kycVerified: false});
    router.push('/');
  };

  return (
    <div className="login-box container">
      <h1>Sign in to Evangelion AgentPay</h1>
      <form onSubmit={onSubmit} className="login-form">
        <label>Name</label>
        <input value={name} onChange={e=>setName(e.target.value)} required />
        <label>Email</label>
        <input type="email" value={email} onChange={e=>setEmail(e.target.value)} />
        <label>Hedera Account (optional)</label>
        <input value={account} onChange={e=>setAccount(e.target.value)} placeholder="0.0.1234567" />
        <button className="primary-button" type="submit">Continue</button>
      </form>
    </div>
  );
}

export default function LoginPage(){
  return (
    <AuthProvider>
      <LoginForm />
    </AuthProvider>
  );
}
