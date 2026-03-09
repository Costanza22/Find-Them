import { render, screen, waitFor } from '@testing-library/react';
import Matches from './Matches';

const originalFetch = global.fetch;

afterEach(() => {
  global.fetch = originalFetch;
});

test('shows loading then empty state when API returns no matches', async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({ ok: true, json: () => Promise.resolve({ matches: [] }) })
  );
  render(<Matches />);
  expect(screen.getByText(/Carregando/i)).toBeInTheDocument();
  await waitFor(() => {
    expect(screen.getByText(/No matches on file/i)).toBeInTheDocument();
  });
  expect(screen.getByText(/Register cases and file sighting/i)).toBeInTheDocument();
});

test('shows match cards when API returns matches', async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          matches: [
            {
              id: 'm1',
              missing_person_id: 'mp1',
              sighting_id: 's1',
              similarity_score: 0.85,
              missing_person: { id: 'mp1', name: 'Jane', photo_url: null },
              sighting: { id: 's1', image_url: 'https://example.com/s.jpg', uploadedAt: '2025-01-01' },
            },
          ],
        }),
    })
  );
  render(<Matches />);
  await waitFor(() => {
    expect(screen.getByText('Jane')).toBeInTheDocument();
  });
  expect(screen.getByText(/85/)).toBeInTheDocument();
});

test('renders filters for min score and sort', async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({ ok: true, json: () => Promise.resolve({ matches: [] }) })
  );
  render(<Matches />);
  await waitFor(() => {
    expect(screen.getByLabelText(/Score mínimo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Ordenar/i)).toBeInTheDocument();
  });
});
