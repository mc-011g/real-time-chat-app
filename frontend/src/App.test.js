import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Register link', () => { 
  render(<App />);
  const linkElement = screen.getByText('Register');
  expect(linkElement).toBeInTheDocument();
});
