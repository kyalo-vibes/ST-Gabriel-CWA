import {
  LayoutDashboard,
  Users,
  DollarSign,
  CalendarDays,
  AlertTriangle,
  FileText,
  Bell,
  Settings,
  X,
  User,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { cn } from './ui/utils';
import { useStore } from '../store/useStore';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const adminNavigation = [
  { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { name: 'Members', to: '/members', icon: Users },
  { name: 'Contributions', to: '/contributions', icon: DollarSign },
  { name: 'Events', to: '/events', icon: CalendarDays },
  { name: 'Debt Management', to: '/debt', icon: AlertTriangle },
  { name: 'Reports', to: '/reports', icon: FileText },
  { name: 'Notifications', to: '/notifications', icon: Bell },
  { name: 'Settings', to: '/settings', icon: Settings },
];

const memberNavigation = [
  { name: 'My Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { name: 'My Profile', to: '/profile', icon: User },
  { name: 'Reports', to: '/reports', icon: FileText },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { members, user } = useStore();
  const pendingCount = members.filter(m => m.approvalStatus === 'Pending').length;
  
  // Determine navigation based on user role
  const isAdmin = user?.role === 'Administrator';
  const navigation = isAdmin ? adminNavigation : memberNavigation;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'app-sidebar bg-background/95 backdrop-blur-xl border-r border-border/40',
          isOpen && 'is-open'
        )}
      >
        <div className="flex h-14 items-center justify-between px-4 border-b border-border/40 lg:hidden">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-sm">
              <span className="text-white text-xs font-semibold">C</span>
            </div>
            <span className="font-semibold text-sm tracking-tight">CWA Thome</span>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <nav className="flex flex-col gap-1 p-3">
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => onClose()}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={cn(
                    "h-5 w-5 transition-transform duration-200",
                    !isActive && "group-hover:scale-110"
                  )} />
                  <span className="font-medium text-sm">{item.name}</span>
                  {item.name === 'Members' && pendingCount > 0 && (
                    <Badge 
                      variant="default" 
                      className="ml-auto bg-primary/20 text-primary hover:bg-primary/30 text-xs px-2 py-0.5"
                    >
                      {pendingCount}
                    </Badge>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
        
        {/* Bottom spacing */}
        <div className="absolute bottom-0 left-0 right-0 h-14 border-t border-border/40 bg-gradient-to-t from-background/50 to-transparent pointer-events-none" />
      </aside>
    </>
  );
}
