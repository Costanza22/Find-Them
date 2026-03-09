import { render, screen } from '@testing-library/react';
import App from './App';

test('renders app with privacy notice on load', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /Aviso de privacidade e ética/i })).toBeInTheDocument();
  expect(screen.getAllByText(/FindThem/i).length).toBeGreaterThan(0);
  expect(screen.getByRole('button', { name: /Continuar/i })).toBeInTheDocument();
});
