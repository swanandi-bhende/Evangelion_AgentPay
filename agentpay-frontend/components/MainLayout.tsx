'use client';

import React from 'react';
import Sidebar from './Sidebar';
import ChatInterface from './ChatInterface';
import './MainLayout.css';

export default function MainLayout(){
  return (
    <div className="main-app-grid container">
      <Sidebar />
      <div className="main-panel">
        <ChatInterface />
      </div>
    </div>
  );
}
