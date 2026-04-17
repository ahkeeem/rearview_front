import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import UserMenu from './UserMenu';
import NotificationsDropdown from './NotificationsDropdown';
import SearchBar from './SearchBar';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useToastContext } from '../../context/ToastContext';
import api from '../../services/api';
import { getImageUrl } from '../../utils/imageUtils';
import './Navigation.css';

const NavLink = ({ to, icon, label, badge }) => {
  const location = useLocation();
  // Match exact for home, prefix for others
  const isActive = to === '/dashboard'
    ? location.pathname === '/dashboard'
    : location.pathname.startsWith(to);

  return (
    <Link
      to={to}
      className={`nav-link-item${isActive ? ' active' : ''}`}
      title={label}
    >
      <i className={icon} aria-hidden="true" />
      <span>{label}</span>
      {badge > 0 && (
        <span className="notification-badge" aria-label={`${badge} unread`}>
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </Link>
  );
};

/* More menu for secondary nav items */
const MoreMenu = ({ barterCount, escrowCount }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const secondaryItems = [
    { to: '/dashboard/barter',           icon: 'fas fa-rotate',          label: 'Barter',   badge: barterCount },
    { to: '/dashboard/escrow',           icon: 'fas fa-shield-halved',   label: 'Escrow',   badge: escrowCount },
    { to: '/dashboard/wallet',           icon: 'fas fa-wallet',          label: 'Wallet',   badge: 0 },
    { to: '/dashboard/register-product', icon: 'fas fa-briefcase',       label: 'Business', badge: 0 },
  ];

  const activeCount = (barterCount + escrowCount);
  const hasActiveSecondary = secondaryItems.some(i => location.pathname.startsWith(i.to));

  return (
    <div className="more-menu-wrap" ref={ref}>
      <button
        className={`nav-link-item nav-more-btn${hasActiveSecondary ? ' active' : ''}`}
        onClick={() => setOpen(v => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        title="More"
      >
        <i className="fas fa-ellipsis" aria-hidden="true" />
        <span>More</span>
        {activeCount > 0 && (
          <span className="notification-badge">{activeCount > 9 ? '9+' : activeCount}</span>
        )}
      </button>

      {open && (
        <div className="more-dropdown" role="menu">
          {secondaryItems.map(item => (
            <Link
              key={item.to}
              to={item.to}
              className={`more-item${location.pathname.startsWith(item.to) ? ' active' : ''}`}
              role="menuitem"
              onClick={() => setOpen(false)}
            >
              <i className={item.icon} aria-hidden="true" />
              <span>{item.label}</span>
              {item.badge > 0 && (
                <span className="notification-badge">{item.badge}</span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

const Navigation = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const { showToast } = useToastContext();
  const [notifications, setNotifications] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [barterCount, setBarterCount] = useState(0);
  const [escrowCount, setEscrowCount] = useState(0);

  const unreadMessagesCount = conversations.reduce((total, conv) => {
    if (conv.last_sender_id !== user?.id) {
      return total + (conv.unread_count || 0);
    }
    return total;
  }, 0);

  useEffect(() => {
    const fetchNavData = async () => {
      try {
        const notifData = await api.feed.getNotifications();
        const mappedNotifs = notifData.map(n => ({
          id: n.id,
          message: n.action_type === 'connection_request'
            ? `${n.actor_name} wants to connect with you.`
            : `New activity from ${n.actor_name}`,
          timestamp: n.created_at,
          read: n.is_read || false,
          icon: n.action_type === 'connection_request' ? 'user-plus' : 'bell',
          avatar: getImageUrl(n.actor_avatar),
          actor_id: n.actor_id
        }));
        setNotifications(mappedNotifs);

        const convData = await api.conversations.getAll();
        setConversations(convData);

        const barterLoops = await api.barter.getMyLoops();
        const pendingBarter = barterLoops.filter(loop => {
          const myLeg = loop.matrix?.find(leg => leg.from_user_id === user?.id);
          return myLeg && myLeg.status !== 'shipped' && myLeg.status !== 'received';
        }).length;
        setBarterCount(pendingBarter);

        const escrowOrders = await api.escrow.getOrders();
        const pendingEscrow = escrowOrders.filter(o => o.status === 'funded' || o.status === 'disputed').length;
        setEscrowCount(pendingEscrow);
      } catch (_) { /* silently fail */ }
    };

    fetchNavData();

    if (socket) {
      const handleNewMessage = (data) => {
        fetchNavData();
        if (data.sender_id !== user?.id && !window.location.pathname.includes('/dashboard/messages')) {
          showToast(`New message from ${data.sender_name || 'User'}`, 'info');
        }
      };
      socket.on('new-message', handleNewMessage);
      const interval = setInterval(fetchNavData, 30000);
      return () => {
        socket.off('new-message', handleNewMessage);
        clearInterval(interval);
      };
    }

    const interval = setInterval(fetchNavData, 30000);
    return () => clearInterval(interval);
  }, [socket, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <nav className="main-nav" role="navigation" aria-label="Main navigation">
      <div className="nav-container">

        {/* Left: Logo */}
        <div className="nav-left">
          <Link to="/dashboard" className="logo-wrap" aria-label="RearView home">
            <img src="/logo-shield.png" alt="" className="nav-logo-img" />
            <span className="logo-text">RearView</span>
          </Link>
        </div>

        {/* Center: Search */}
        <div className="nav-center">
          <SearchBar />
        </div>

        {/* Right: Primary links + tools */}
        <div className="nav-right">
          <div className="nav-primary-links" role="list">
            <NavLink to="/dashboard"             icon="fas fa-home"    label="Home"    badge={0} />
            <NavLink to="/dashboard/connections" icon="fas fa-users"   label="Network" badge={0} />
            <NavLink to="/dashboard/messages"    icon="fas fa-envelope" label="Messages" badge={unreadMessagesCount} />
            <NavLink to="/dashboard/reviews"     icon="fas fa-star"    label="Reviews" badge={0} />
            <MoreMenu barterCount={barterCount} escrowCount={escrowCount} />
          </div>

          <div className="nav-divider" aria-hidden="true" />

          <div className="nav-tools">
            <NotificationsDropdown notifications={notifications} />
            <UserMenu />
          </div>
        </div>

      </div>
    </nav>
  );
};

export default Navigation;