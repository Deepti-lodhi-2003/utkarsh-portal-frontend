import React from 'react';
import Hero from '../component/Hero';
import Vision from './Vision';
import Jobcount from './Jobcount';
import VendorCount from '../component/VendorCount';
import CandidateCount from '../component/CandidateCount';
import HowItWorks from '../component/HowItWorks';
import Footer from '../component/Footer';
import KaushalSetu from '../component/KaushalSetu';
import ServiceRequirements from '../component/ServiceRequirements';
import RecentJobs from '../component/RecentJobs';

const Home = () => {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Hero Section with Carousel */}
      <Hero />

      {/* Vision Section */}
      <Vision />

      {/* Job Count Section */}
      <Jobcount />

      {/* Vendor Count Section */}
      <VendorCount />

      {/* Candidate Count Section */}
      <CandidateCount />

      {/* Kaushal Setu / Training Section */}
      <KaushalSetu />

      <RecentJobs />

      {/* Service Requirements Section */}
      <ServiceRequirements />

      {/* How It Works Section */}
      <HowItWorks />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home;
