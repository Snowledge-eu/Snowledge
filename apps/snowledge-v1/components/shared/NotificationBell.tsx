"use client";

import { useState, useEffect, useRef } from "react";
import {
  Bell,
  UserPlus,
  MessageCircle,
  Award,
  AlertCircle,
  Check,
  X,
  CheckCircle,
  AlertTriangle,
  Send,
  XCircle,
  FileText,
  Clock,
  RefreshCw,
  MessageSquare,
  Reply,
  Megaphone,
  Users,
  Crown,
  Ban,
  FileEdit,
  ThumbsUp,
  ThumbsDown,
  Info,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { Notification, NotificationType } from "@/types/notification";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/firebaseConfig";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
  writeBatch,
} from "firebase/firestore";
import { useTranslation } from "react-i18next";

export default function NotificationBell() {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!session?.user?.id) return;

    const q = query(
      collection(db, "notifications"),
      where("userId", "==", parseInt(session.user.id)),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Notification[];

      setNotifications(notifs);
      setUnreadCount(notifs.filter((n) => !n.read).length);
    });

    return () => unsubscribe();
  }, [session?.user?.id]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = async (notificationId: string) => {
    try {
      const notifRef = doc(db, "notifications", notificationId);
      await updateDoc(notifRef, { read: true });
    } catch (error) {
      console.error(t("notifications.error_marking"), error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const batch = writeBatch(db);
      notifications
        .filter((n) => !n.read)
        .forEach((notification) => {
          const notifRef = doc(db, "notifications", notification.id);
          batch.update(notifRef, { read: true });
        });
      await batch.commit();
    } catch (error) {
      console.error(t("notifications.error_marking_all"), error);
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.NEW_POST:
        return <FileText className="h-5 w-5 text-blue-500" />;
      case NotificationType.NEW_POST_PENDING:
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case NotificationType.NEW_ENRICHMENT_PENDING:
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case NotificationType.ENRICHMENT_UPDATED:
        return <RefreshCw className="h-5 w-5 text-blue-500" />;
      case NotificationType.ENRICHMENT_APPROVED:
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case NotificationType.ENRICHMENT_REJECTED:
        return <XCircle className="h-5 w-5 text-red-500" />;
      case NotificationType.COMMENT_ON_POST:
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case NotificationType.REPLY_TO_COMMENT:
        return <Reply className="h-5 w-5 text-blue-500" />;
      case NotificationType.MENTION:
        return <Megaphone className="h-5 w-5 text-purple-500" />;
      case NotificationType.COMMUNITY_INVITATION:
        return <Users className="h-5 w-5 text-green-500" />;
      case NotificationType.ROLE_CHANGE:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case NotificationType.BAN:
        return <Ban className="h-5 w-5 text-red-600" />;
      case NotificationType.CONTRIBUTOR_ACCEPTED:
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case NotificationType.CONTRIBUTOR_REFUSED:
        return <XCircle className="h-5 w-5 text-red-500" />;
      case NotificationType.CONTRIBUTOR_REQUEST:
        return <UserPlus className="h-5 w-5 text-blue-500" />;
      case NotificationType.NEW_PROPOSAL:
        return <FileEdit className="h-5 w-5 text-blue-500" />;
      case NotificationType.PROPOSAL_APPROVED:
        return <ThumbsUp className="h-5 w-5 text-green-500" />;
      case NotificationType.PROPOSAL_REJECTED:
        return <ThumbsDown className="h-5 w-5 text-red-500" />;
      case NotificationType.REVIEW_VOTE:
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case NotificationType.APPROVAL:
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case NotificationType.WARNING:
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case NotificationType.FEEDBACK:
        return <MessageCircle className="h-5 w-5 text-blue-500" />;
      case NotificationType.POST_READY_PUBLISH:
        return <Send className="h-5 w-5 text-purple-500" />;
      case NotificationType.POST_REJECTED:
        return <XCircle className="h-5 w-5 text-red-500" />;
      case NotificationType.INFO:
        return <Info className="h-5 w-5 text-blue-500" />;
      case NotificationType.VOTE_APPROVED:
        return <ThumbsUp className="h-5 w-5 text-green-500" />;
      case NotificationType.VOTE_REJECTED:
        return <ThumbsDown className="h-5 w-5 text-red-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  if (!session) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
        aria-label={t("notifications.aria_label")}
      >
        <Bell className="h-6 w-6 text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-50 max-h-[80vh] overflow-y-auto">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              {t("notifications.title")}
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {t("notifications.mark_all_read")}
              </button>
            )}
          </div>

          <div className="divide-y divide-gray-200">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {t("notifications.empty")}
              </div>
            ) : (
              notifications.map((notification) => (
                <Link
                  href={notification.link || "#"}
                  key={notification.id}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div
                    className={`p-4 hover:bg-gray-50 transition-colors flex items-start space-x-3 ${
                      !notification.read ? "bg-blue-50" : ""
                    }`}
                  >
                    <div className="flex-shrink-0 text-2xl">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-500 line-clamp-3">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {typeof notification.createdAt === "string"
                          ? formatDistanceToNow(
                              new Date(notification.createdAt),
                              {
                                addSuffix: true,
                                locale: fr,
                              }
                            )
                          : formatDistanceToNow(
                              (notification.createdAt as any).toDate(),
                              { addSuffix: true, locale: fr }
                            )}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                    )}
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
