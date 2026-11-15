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
        <p>Nomad Nexus is designed so that your photos stay on your device. This page explains exactly what happens to your data.</p>

        <h2>What we process</h2>
        <p>When you add a photo, your browser reads its GPS metadata (EXIF) and looks up the matching country using a map dataset bundled with the app. The photo itself, its metadata and its location are never uploaded to a server.</p>

        <h2>What we store</h2>
        <p>Nothing. The list of detected countries lives in your browser&apos;s memory and disappears when you refresh or close the page. We use no cookies, analytics or accounts.</p>

        <h2>Third parties</h2>
        <p>The demo is a static site (GitHub Pages) and loads fonts from Google Fonts. These providers may log standard request data such as your IP address, as described in their own privacy policies.</p>

        <h2>Changes to This Privacy Policy</h2>
        <p>We may update this policy from time to time. Changes are visible in the project&apos;s public Git history.</p>

        <h2>Contact Us</h2>
        <p>Questions? Open an issue on <a href="https://github.com/CosminBMemetea/story/issues">GitHub issues</a>.</p>
      </main>
    </div>
    </div>
    </>
  );
};

export default PrivacyPolicyLocal;
