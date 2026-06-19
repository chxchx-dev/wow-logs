import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { HomePage } from '../pages/HomePage';
import { ReportPage } from '../pages/ReportPage';
import { FightPage } from '../pages/FightPage';
import { PlayerPage } from '../pages/PlayerPage';

const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/report/:reportCode', element: <ReportPage /> },
  { path: '/report/:reportCode/fight/:fightId', element: <FightPage /> },
  { path: '/player/:reportCode/:playerId', element: <PlayerPage /> },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
