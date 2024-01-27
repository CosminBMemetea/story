import React from 'react';
import Head from 'next/head';
import styles from '../styles/data-protection.module.css';

const DataProtection = () => {
  return (
    <>
      <Head>
        <title>Nomad Nexus - Data Protection</title>
      </Head>
      <div className={styles.pageBackground}>
      <div className={styles.container}>
        <h1>Data Protection Policy</h1>
        <p>
          At Nomad Nexus, we prioritize the privacy and security of our users. Our data protection policy is designed to ensure the utmost care and respect for your personal information.
        </p>
        <h2>User Anonymization</h2>
        <p>
          We employ user anonymization techniques for all uploaded images. This process ensures that personal data cannot be traced back to any individual, safeguarding your privacy.
        </p>
        <h2>Data Deletion</h2>
        <p>
          Should you decide to leave our platform or refresh the page, we attempt to delete any stored data from our database immediately. Our system is also set up to periodically purge data, ensuring no information is stored longer than necessary.
        </p>
        <h2>No Data Processing</h2>
        <p>
          Beyond determining the annotated country from your images, we do not process your data for any other purposes. Your privacy is our top concern, and we are committed to maintaining a secure environment for all users.
        </p>
        <p>
          For further inquiries or concerns about our data protection practices, please do not hesitate to contact us.
        </p>
      </div>
     </div>
    </>
  );
};

export default DataProtection;
