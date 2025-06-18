import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Users, 
  BookOpen, 
  FileText, 
  GraduationCap,
  ClipboardList,
  User,
  CheckSquare
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

function Sidebar() {
  const { user } = useAuth();

  const getNavItems = () => {
    switch (user?.role) {
      case 'admin':
        return [
          { icon: Home, label: 'Dashboard', path: '/' },
          { icon: Users, label: 'Users', path: '/admin/users' },
          { icon: BookOpen, label: 'Classes', path: '/admin/classes' },
          { icon: GraduationCap, label: 'Subjects', path: '/admin/subjects' },
          { icon: FileText, label: 'Assignments', path: '/admin/assignments' },
        ];
      case 'teacher':
        return [
          { icon: Home, label: 'Dashboard', path: '/' },
          { icon: CheckSquare, label: 'Submissions', path: '/teacher/submissions' },
        ];
      case 'student':
        return [
          { icon: Home, label: 'Dashboard', path: '/' },
          { icon: BookOpen, label: 'Subjects', path: '/student/subjects' },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="bg-white w-64 shadow-sm border-r border-gray-200">
      <div className="p-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">EduPortal</span>
        </div>
      </div>
      
      <nav className="mt-6">
        <div className="px-3">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-3 py-2 mt-1 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <item.icon className="mr-3 h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
      
      <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-gray-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.full_name}
            </p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;