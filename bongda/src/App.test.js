import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import App from './App';
import { NoticeProvider } from './context/NoticeContext';
import { ThemeProvider } from './context/ThemeContext';
import { setMatches } from './features/matchesSlice';
import store from './store';
import sampleMatches from '../public/data/matches.json';

test('loads the sample schedule inside its providers', async () => {
  store.dispatch(setMatches([]));
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(sampleMatches),
  });

  render(
    <ThemeProvider>
      <NoticeProvider>
        <Provider store={store}>
          <App />
        </Provider>
      </NoticeProvider>
    </ThemeProvider>,
  );

  expect(await screen.findByText('Đội nhà thắng: 4')).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Giải bóng đá khoa' })).toBeInTheDocument();
});
