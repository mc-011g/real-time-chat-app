import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Login heading', () => { 
  render(<App />);
  const linkElement = screen.getByText('Login');
  expect(linkElement).toBeInTheDocument();
});
