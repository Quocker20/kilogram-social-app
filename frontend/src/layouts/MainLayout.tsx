import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import RightPanel from '../components/layout/RightPanel';

/**
 * Standard layout wrapper for authenticated users.
 */
export default function MainLayout() {
  return (
    <div className="flex min-h-screen bg-white">
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="ml-20 flex flex-1 justify-center xl:ml-64">
        <div className="flex w-full max-w-5xl px-4 py-8 lg:px-8">
          {/* Central Feed/Page Content */}
          <div className="flex-1">
            <Outlet />
          </div>

          {/* Contextual Right Panel */}
          <RightPanel />
        </div>
      </main>
    </div>
  );
}