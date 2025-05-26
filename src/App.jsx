import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import {Home} from './pages/Home.jsx';
// ...existing imports...

function App() {
  return (
    <RecoilRoot>
      <Router>
        <div className="App">
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
            </Routes>
          </Layout>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
        </div>
      </Router>
    </RecoilRoot>
  );
}

export default App;
