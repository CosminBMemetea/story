// pages/privacy-policy.tsx
import React from 'react';
import styles from '../styles/privacy-policy-local.module.css'; // Ensure you have this CSS module for styling
import Head from 'next/head';

const PrivacyPolicyLocal = () => {
  return (
    <>
    <Head>
        <title>Nomad Nexus - Privacy Policy</title>
    </Head>

    <div className={styles.pageBackground}>
    <div className={styles.container}>
      <main className={styles.main}>
        <h1>Privacy Policy</h1>
        <h2>Introduction</h2>
        <p>Welcome to Nomad Nexus. We are committed to protecting your privacy and handling your data in an open and transparent manner. This privacy policy outlines how we collect, use, process, and disclose your information, including personal data, in conjunction with your access to and use of our services.</p>
        
        <h2>Information Collection and Use</h2>
        <p>We collect information that you provide directly to us, information generated during your use of our services, and information from third-party platforms. This may include but is not limited to your name, email address, device information, usage data, and location information.</p>
        <h2>Data Sharing and Disclosure</h2>

        <p>We do not share or disclose your personal information to third parties except as described in this policy, including for the purposes of providing our services, complying with the law, protecting our rights, or with your explicit consent.</p>

        <h2>Data Security</h2>
        <p>We implement a variety of security measures designed to maintain the safety of your personal information. However, no method of transmission over the Internet or method of electronic storage is 100% secure.</p>

        <h2>Your Rights</h2>
        <p>You have certain rights regarding your personal data, including the right to access, correct, or delete the data we hold about you.</p>

        <h2>Changes to This Privacy Policy</h2>
        <p>We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page.</p>

        <h2>Contact Us</h2>
        <p>If you have any questions about this privacy policy, please contact us at nomad-nexus@mail.com.</p>
      </main>
    </div>
    </div>
    </>
  );
};

export default PrivacyPolicyLocal;
