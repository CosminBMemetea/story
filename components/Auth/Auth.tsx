// Your authentication component in your frontend project
'use client';
import axios from 'axios';
import { useState } from 'react';
import styles from './styles.module.css'; 
import { useRouter } from 'next/navigation'

export const Auth =  () => {

 const router = useRouter();


  const [message, setMessage] = useState('');
  const handleGoogleSignIn = async () => {
    router.push('hero');
    try {

      // Make a POST request to the '/api/auth' endpoint
     const response = await axios.post('http://localhost:8000/upload', { provider: 'google' });

      // Check the response and update the UI accordingly
      if (response.status === 200) {
        setMessage('Authentication successful');
        // Redirect to the main page or handle it as needed
      } else {
        setMessage('Authentication failed');
      }
      //TODO
    } catch (error) {
      console.error('Error during authentication:', error);
      setMessage('Internal Server Error');
    }
  };

  const handleFacebookSignIn = async () => {
    try {
      // Make a POST request to the '/api/auth' endpoint
      const response = await axios.post('http://localhost:8000/upload', { provider: 'facebook' });

      // Check the response and update the UI accordingly
      if (response.status === 200) {
        setMessage('Authentication successful');
        // Redirect to the main page or handle it as needed
      } else {
        setMessage('Authentication failed');
      }
    } catch (error) {
      console.error('Error during authentication:', error);
      setMessage('Internal Server Error');
    }
  };

  return (
    <div className={styles.row}>
      <div className={`${styles.item} ${styles.flex}`}>
        <button className={`${styles.button} ${styles.secondarybutton}`} onClick={()=>router.push('/hero')}>
          Sign In with Google
        </button>
        <p className={styles.p}>{message}</p>
      </div>
      <div className={`${styles.item} ${styles.flex}`}>
        <button className={`${styles.button} ${styles.secondarybutton}`} onClick={()=>{router.push('/hero')}}>
          Sign In with Facebook
        </button>
        <p className={styles.p}>{message}</p>
      </div>
    </div>
  );
};

