import SidebarLeft from './sidebar-left';
import SidebarRight from './sidebar-right';
import FeedList from './feed-list';
export default function FeedLayout() {
  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 pt-2 lg:pt-6">
      {' '}
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        {' '}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {' '}
          {/* Left Sidebar - Sticky */}{' '}
          <aside className="hidden h-fit flex-col lg:sticky lg:top-[90px] lg:col-span-3 lg:flex">
            {' '}
            <SidebarLeft />{' '}
          </aside>{' '}
          {/* Main Feed Content */}{' '}
          <main className="lg:col-span-6">
            {' '}
            <FeedList />{' '}
          </main>{' '}
          {/* Right Sidebar - Sticky */}{' '}
          <aside className="hidden h-fit flex-col lg:sticky lg:top-[90px] lg:col-span-3 lg:flex">
            {' '}
            <SidebarRight />{' '}
          </aside>{' '}
          {/* Mobile Sidebars - Visible only on small screens if desired (typically hidden or in menu) */}{' '}
          <div className="flex flex-col gap-6 lg:hidden">
            {' '}
            {/* We'll decide later if we want to show profile/trending in mobile, usually it's better to keep it clean and only have the feed. */}{' '}
          </div>{' '}
        </div>{' '}
      </div>{' '}
    </div>
  );
}
