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
          Nomad Nexus follows a simple rule: your photos never leave your device.
        </p>
        <h2>On-device processing</h2>
        <p>
          Photos are read locally in your browser. Only the GPS coordinates in their metadata are used, and they are matched to a country with a bundled map dataset, without calling any geocoding service.
        </p>
        <h2>No storage</h2>
        <p>
          Nothing is uploaded or saved. Refreshing or closing the page clears every detected country.
        </p>
        <h2>Video rendering</h2>
        <p>
          Cloud video export (Remotion Lambda) is not enabled yet. When it is, it will receive only the video settings, never your photos.
        </p>
        <p>
          Questions or concerns? Open an issue on <a href="https://github.com/CosminBMemetea/story/issues">GitHub issues</a>.
        </p>
      </div>
     </div>
    </>
  );
};

export default DataProtection;
