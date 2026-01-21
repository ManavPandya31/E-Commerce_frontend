import { Outlet } from 'react-router-dom';
import React from 'react';

export default function Layout() {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <Outlet />
      </div>
    </div>
  )
}
