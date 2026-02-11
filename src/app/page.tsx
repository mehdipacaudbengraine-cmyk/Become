 import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import QASection from '@/components/landing/QASection';
import Features from '@/components/landing/Features';
import Quote from '@/components/landing/Quote';
import Footer from '@/components/landing/Footer';

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-black be-landing-grid">
      <Navbar />
      <main>
        <Hero />
        <QASection />
        <Features />
        <Quote />
      </main>
      <Footer />
    </div>
  );
}
