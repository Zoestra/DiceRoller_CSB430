import { render, fireEvent } from '@testing-library/react-native';
import DiceCollectionScreen from '../app/(tabs)/dice-collection.jsx';
import { DiceProvider, useDiceContext } from '../DiceContext';

// mock router so navigation doesn't break tests
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

test('pressing a die updates activeDieType', () => {
  const Wrapper = ({ children }) => <DiceProvider>{children}</DiceProvider>;

  const { getByTestId } = render(<DiceCollectionScreen />, { wrapper: Wrapper });

  const d20 = getByTestId('die-20');
  fireEvent.press(d20);

  const { activeDieType } = useDiceContext();
  expect(activeDieType).toBe(20);
});
