import { BrowserRouter, Routes, Route } from 'react-router';
import Layout from './components/Layout';
import Home from './pages/Home';
import RegisterPerson from './pages/RegisterPerson';
import ReportSighting from './pages/ReportSighting';
import Matches from './pages/Matches';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="register" element={<RegisterPerson />} />
          <Route path="sighting" element={<ReportSighting />} />
          <Route path="matches" element={<Matches />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
