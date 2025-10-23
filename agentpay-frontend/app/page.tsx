import ChatInterface from '../components/ChatInterface';
import './globals.css';
import '../components/ChatStyles.css';

export default function Home() {
  return (
    <main className="main-container">
      <div className="background-pattern"></div>
      <ChatInterface />
    </main>
  );
}