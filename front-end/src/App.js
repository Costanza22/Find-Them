import { BrowserRouter, Routes, Route } from 'react-router';
import Layout from './components/Layout';
import PrivacyEthicsNotice from './components/PrivacyEthicsNotice';
import Home from './pages/Home';
import RegisterPerson from './pages/RegisterPerson';
import ReportSighting from './pages/ReportSighting';
import Registry from './pages/Registry';
import Matches from './pages/Matches';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <PrivacyEthicsNotice>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="register" element={<RegisterPerson />} />
            <Route path="registry" element={<Registry />} />
            <Route path="sighting" element={<ReportSighting />} />
            <Route path="matches" element={<Matches />} />
          </Route>
        </Routes>
      </PrivacyEthicsNotice>
    </BrowserRouter>
  );
}

export default App;
