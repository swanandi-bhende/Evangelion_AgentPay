import './globals.css';
import '../components/ChatStyles.css';
import MainLayout from '../components/MainLayout';
import { AuthProvider } from '../components/AuthProvider';

export default function Home() {
  return (
    <AuthProvider>
      <main className="main-container">
        <div className="background-pattern"></div>
        <MainLayout />
      </main>
    </AuthProvider>
  );
}