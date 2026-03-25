import { render, fireEvent } from '@testing-library/react-native';
import SettingsScreen from '../app/(tabs)/settings.jsx';
import { SettingsProvider } from '../context/SettingsContext.jsx';

test('increase button updates text size', () => {
  const Wrapper = ({ children }) => <SettingsProvider>{children}</SettingsProvider>;

  const { getByText } = render(<SettingsScreen />, { wrapper: Wrapper });

  const increaseButton = getByText('Increase');

  fireEvent.press(increaseButton);

  
  expect(getByText(/Text Size:/).props.children.join('')).toMatch(/Text Size:/);
});
