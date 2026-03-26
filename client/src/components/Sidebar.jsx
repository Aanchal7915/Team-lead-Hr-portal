import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  Bell,
  MessageSquare,
  BarChart3,
  UserCog,
  UsersRound,
  ClipboardList,
  Activity,
  LogOut,
  Settings,
  X,
  Target,
  History,
  File as FileIcon,
  ChevronDown,
  ChevronUp,
  Briefcase,
  Clock,
  CalendarRange,
  Award,
  User,
  Megaphone
} from 'lucide-react';
import logo from '../assets/img.jpeg';
import api from '../hr-portal/api/api.js';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, isTeamLead, isAdmin, logout } = useAuth();
  const isTeamMember = user?.role === 'team_member';
  const isHr = user?.role === 'hr';
  const isEmployee = user?.role === 'employee' || user?.role === 'team_member' || user?.role === 'team_lead';

  const [hrPortalOpen, setHrPortalOpen] = useState(false);
  const [hrAdminOpen, setHrAdminOpen] = useState(false);
  const [pendingLeavesCount, setPendingLeavesCount] = useState(0);
  const location = useLocation();

    useEffect(() => {
    const fetchPendingLeaves = async () => {
      if (isAdmin || isHr) {
        try {
          const { data } = await api.get('/hr/leaves/pending');
          setPendingLeavesCount(data.length);
        } catch (error) {
          console.error("Sidebar could not fetch pending leaves", error);
        }
      }
    };
    
    fetchPendingLeaves();
    const interval = setInterval(fetchPendingLeaves, 5000); // 5 seconds
    return () => clearInterval(interval);
  }, [isAdmin, isHr]);

  const adminMenuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/calendar', label: 'Calendar', icon: ClipboardList },
    { path: '/admin/users', label: 'User Management', icon: UserCog },
    { path: '/admin/teams', label: 'Team Management', icon: Users },
    { path: '/admin/tasks', label: 'Task Assignment', icon: CheckSquare },
    { path: '/leads', label: 'Lead Management', icon: Target },
    { path: '/admin/activities', label: 'Activity Log', icon: History },
    { path: '/reports', label: 'Reports & Analysis', icon: BarChart3 },
    { path: '/files', label: 'File Manager', icon: FileIcon }
  ];

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/calendar', label: 'Calendar', icon: ClipboardList },
    { path: '/leads', label: 'Leads', icon: Target },
    { path: '/team', label: 'Team', icon: Users },
    { path: '/tasks', label: 'Tasks', icon: CheckSquare },
    { path: '/communication', label: 'Communication', icon: MessageSquare },
    { path: '/reports', label: 'Reports & Analysis', icon: BarChart3, teamLeadOnly: true },
    { path: '/files', label: 'File Manager', icon: FileIcon }
  ];

  const hrPortalItem = {
    path: '#hr-portal',
    label: 'HR Portal',
    icon: Briefcase,
    isSubmenu: true,
    isOpen: hrPortalOpen,
    setIsOpen: setHrPortalOpen,
    subItems: [
      { path: '/hr/dashboard', label: 'Attendance', icon: Clock },
      { path: '/hr/leaves', label: 'Apply for Leave', icon: CalendarRange },
// { path: '/hr/rankings', label: 'My Rankings', icon: Award },
// { path: '/hr/leaderboard', label: 'Leaderboard', icon: Award },
      { path: '/hr/salary', label: 'Salary Slips', icon: FileIcon },
// { path: '/hr/announcements', label: 'Announcements', icon: Megaphone },
      { path: '/hr/profile', label: 'My Profile', icon: User },
    ]
  };

  const hrAdminItem = {
    path: '#hr-admin',
    label: 'HR Admin',
    icon: UsersRound,
    isSubmenu: true,
    isOpen: hrAdminOpen,
    setIsOpen: setHrAdminOpen,
    badge: pendingLeavesCount > 0 ? pendingLeavesCount : null,
    subItems: [
      { path: '/hr-admin/overview', label: 'Admin Overview', icon: BarChart3 },
      { path: '/hr-admin/analytics', label: 'HR Analytics', icon: Activity },
      { path: '/hr-admin/employees', label: 'Manage Employees', icon: Users },
      { path: '/hr-admin/leaves', label: 'Leave Approvals', icon: CheckSquare, badge: pendingLeavesCount > 0 ? pendingLeavesCount : null },
// { path: '/hr-admin/attendance', label: 'Attendance Logs', icon: Clock },
      { path: '/hr-admin/eod', label: 'EOD Reports', icon: FileIcon },
// { path: '/hr-admin/rankings', label: 'Rankings', icon: Award },
      { path: '/hr-admin/salary-calculator', label: 'Salary Calculator', icon: ClipboardList },
      { path: '/hr-admin/salary-slips', label: 'Salary Slips', icon: FileIcon },
// { path: '/hr-admin/announcements', label: 'Announcements', icon: Megaphone },
    ]
  };

  const baseDisplayMenuItems = isAdmin
    ? adminMenuItems
    : menuItems.filter(item => {
      if (item.teamLeadOnly && !isTeamLead) return false;
      if (item.teamMemberOnly && !isTeamMember) return false;
      return true;
    });

  const displayMenuItems = [...baseDisplayMenuItems];
  if ((isEmployee || isHr) && !isAdmin) {
    displayMenuItems.push(hrPortalItem);
  }
  if (isAdmin || isHr) {
    displayMenuItems.push(hrAdminItem);
  }

  const handleLinkClick = () => {
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed left-0 top-0 h-screen w-64 bg-[#1D1110] shadow-2xl z-50 flex flex-col
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `} style={{ width: '256px' }}>

        {/* Logo Section */}
        <div className="h-24 flex items-center px-6 py-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg flex-shrink-0 overflow-hidden">
              <img src={logo} alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-extrabold text-white leading-tight tracking-tight">Project and Lead Management</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto pt-6 px-4">
          <div className="space-y-1">
            {displayMenuItems.map((item) => {
              const Icon = item.icon;

              if (item.isSubmenu) {
                const isActiveSub = item.subItems.some(sub => location.pathname === sub.path);
                return (
                  <div key={item.label} className="flex flex-col mb-1">
                    <button
                      onClick={() => item.setIsOpen(!item.isOpen)}
                      className={`
                        w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group
                        ${isActiveSub || item.isOpen
                          ? 'bg-white/10 text-white shadow-xl'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm tracking-tight">{item.label}</span>
                          {item.badge && (
                            <span className="bg-red-500 text-white rounded-full px-1.5 py-0.5 text-[10px] font-bold">
                              {item.badge}
                            </span>
                          )}
                        </div>
                      </div>
                      {item.isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    {item.isOpen && (
                      <div className="ml-4 mt-1 pl-4 border-l-2 border-white/5 flex flex-col gap-1">
                        {item.subItems.map((subItem) => {
                          const SubIcon = subItem.icon;
                          const isSubActive = location.pathname === subItem.path;
                          return (
                            <NavLink
                              key={subItem.path}
                              to={subItem.path}
                              onClick={handleLinkClick}
                              className={`
                                flex items-center px-4 py-2.5 rounded-xl transition-all duration-200
                                ${isSubActive
                                  ? 'bg-white/10 text-white'
                                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }
                              `}
                            >
                              <div className="flex items-center gap-3 flex-1">
                                <SubIcon className="w-4 h-4 flex-shrink-0" />
                                <span className="font-semibold text-xs tracking-tight">{subItem.label}</span>
                              </div>
                              {subItem.badge && (
                                <span className="ml-2 bg-red-500 text-white rounded-full px-1.5 py-0.5 text-[10px] font-bold">
                                  {subItem.badge}
                                </span>
                              )}
                            </NavLink>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={handleLinkClick}
                  className={({ isActive }) => `
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group mb-1
                    ${isActive
                      ? 'bg-white/10 text-white shadow-xl'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0`} />
                  <span className="font-bold text-sm tracking-tight">{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* User Info & Footer Actions */}
        <div className="mt-auto p-4 space-y-4">
          <div className="bg-white/5 rounded-3xl p-4 border border-white/5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/10 bg-gray-100 flex items-center justify-center">
                {user?.avatar ? (
                  <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm font-bold text-[#1D1110]">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate tracking-tight">{user?.name || 'Administrator'}</p>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  {user?.role?.replace('_', ' ') || 'Admin'}
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <button
                onClick={logout}
                className="w-full flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-red-400 hover:bg-red-400/5 rounded-xl transition-all text-xs font-bold"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;