import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Chats heading', () => { 
  render(<App />);
  const linkElement = screen.getByText(/Chats/i);
  expect(linkElement).toBeInTheDocument();
});
