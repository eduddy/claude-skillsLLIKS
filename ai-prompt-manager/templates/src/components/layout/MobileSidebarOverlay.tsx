import { useApp } from '../../context/AppContext';
import { Sidebar } from './Sidebar';
import { cn } from '../../lib/utils';

export function MobileSidebarOverlay() {
  const { state, dispatch } = useApp();
  const { isSidebarOpen } = state.ui;

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/40 transition-opacity lg:hidden',
          isSidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={() => dispatch({ type: 'CLOSE_SIDEBAR' })}
      />

      {/* Slide-over panel */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 ease-in-out lg:hidden',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <Sidebar />
      </div>
    </>
  );
}
