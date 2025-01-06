// pages/_app.js

import '../styles/globals.css';
import Layout from '../components/Layout';
import Loader from '../components/Loader';
import { useState, useEffect } from 'react';
import Router from 'next/router';

function MyApp({ Component, pageProps }) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleStart = () => {
      setLoading(true);
    };
    const handleComplete = () => {
      setLoading(false);
    };

    Router.events.on('routeChangeStart', handleStart);
    Router.events.on('routeChangeComplete', handleComplete);
    Router.events.on('routeChangeError', handleComplete);

    return () => {
      Router.events.off('routeChangeStart', handleStart);
      Router.events.off('routeChangeComplete', handleComplete);
      Router.events.off('routeChangeError', handleComplete);
    };
  }, []);

  return (
    <Layout>
      {loading && <Loader />}
      <Component {...pageProps} />
    </Layout>
  );
}

export default MyApp;
