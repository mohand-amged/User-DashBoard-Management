import { Link, useLocation } from 'react-router-dom';
import Logo from "./defaults/Logo";

export const NAV_LINKS = [
  {
    link: "/",
    label: "Dashboard",
    icon: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2v0z"
  },
  {
    link: "/settings",
    label: "Settings",
    icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z"
  },
];

function SideBar() {
  const location = useLocation();

  return (
    <aside className="hidden md:block fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 shadow-sm">
      {/* Logo */}
      <div className="p-6 border-b border-gray-100">
        <Logo />
      </div>

      {/* Navigation */}
      <nav className="mt-6 px-3">
        <div className="space-y-1">
          {NAV_LINKS.map((item) => {
            const isActive = location.pathname === item.link;
            return (
              <Link
                key={item.label}
                to={item.link}
                className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <svg 
                  className={`mr-3 flex-shrink-0 h-5 w-5 transition-colors ${
                    isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-600'
                  }`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </aside> 
  );
}

export default SideBar;