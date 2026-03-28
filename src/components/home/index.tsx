'use client'; import FloatingNav from './floating-nav';
import About from './sections/about';
import Announcements from './sections/announcements';
import Benefits from './sections/benefits';
import Events from './sections/events';
import FAQ from './sections/faq';
import Features from './sections/features';
import Feed from './sections/feed';
import Footer from './sections/footer';
import Founder from './sections/founder';
import Gallery from './sections/gallery';
import Hero from './sections/hero';
import HowItWorks from './sections/how-it-works';
import Partners from './sections/partners';
import SportsClub from './sections/sports-club';
import Stats from './sections/stats';
import Testimonials from './sections/testimonials'; export default function LandingPage() { return ( <div className="min-h-screen w-full bg-background font-inter"> {/* <FloatingNav /> */} <Hero /> <About /> <Features /> <Announcements /> <Gallery /> <Feed /> <Events /> <Stats /> <Partners /> <HowItWorks /> <Benefits /> <Testimonials /> <Founder /> <SportsClub /> <FAQ /> <Footer /> </div> );
}