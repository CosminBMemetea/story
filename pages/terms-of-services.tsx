// pages/privacy-policy.tsx
import React from 'react';
import styles from '../styles/terms-of-service.module.css'; // Ensure you have this CSS module for styling
import Head from 'next/head';

const TermsOfService = () => {
  return (
    <>
    <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"></meta>
        <title>Nomad Nexus - Privacy Policy</title>
    </Head>

    <div className={styles.pageBackground}>
    <div className={styles.container}>
      <main className={styles.main}>
        <h1>Terms of Service</h1>
        <h2>Introduction</h2>
        <p>Welcome to Nomad Nexus. By accessing or using our services, you agree to be bound by these terms of service. If you disagree with any part of the terms, you may not access the service.</p>     
       
        <h2>Use of Service</h2>
        <p><strong>Nomad Nexus</strong> grants you a limited, non-exclusive, non-transferable, and revocable license to use our services subject to the terms and conditions outlined in this document.</p>

        <h2>User Obligations</h2>
        <p>You agree not to misuse the services or help anyone else do so. You are solely responsible for your conduct and your content on the service.</p>

        <h2>Intellectual Property</h2>
        <p>The service and its original content, features, and functionality are and will remain the exclusive property of <strong>[Your Company Name]</strong> and its licensors.</p>

        <h2>Termination</h2>
        <p>We may terminate or suspend your access to our service immediately, without prior notice or liability, for any reason whatsoever, including, without limitation, if you breach the terms.</p>

        <h2>Limitation of Liability</h2>
        <p>In no event shall <strong>[Your Company Name]</strong>, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of our services.</p>

        <h2>Governing Law</h2>
        <p>These terms shall be governed by and construed in accordance with the laws of <strong>[Your Jurisdiction]</strong>, without regard to its conflict of law provisions.</p>

        <h2>Changes</h2>
        <p>We reserve the right, at our sole discretion, to modify or replace these terms at any time.</p>
        <h2>Contact Us</h2>
        <p>If you have any questions about this privacy policy, please contact us at nomad-nexus@mail.com.</p>
      </main>
    </div>
    </div>
    </>

  );
};

export default TermsOfService;
