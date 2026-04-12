import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import RightPanel from '../components/layout/RightPanel';
import CreatePostModal from '../features/post/components/PostModal';

export default function MainLayout() {
  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />

      <main className="ml-20 flex flex-1 justify-center xl:ml-64">
        <div className="flex w-full max-w-5xl px-4 py-8 lg:px-8">
          <div className="flex-1">
            <Outlet />
          </div>

          <RightPanel />
        </div>
      </main>

      <CreatePostModal />
    </div>
  );
}