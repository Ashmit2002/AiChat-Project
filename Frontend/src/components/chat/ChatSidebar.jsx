import axios from "axios";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { deleteChat, renameChat } from "../store/chatSlice";
import "./ChatSidebar.css";

const ChatSidebar = ({
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
  open,
  onClose,
}) => {
  const dispatch = useDispatch();
  const [activeMenu, setActiveMenu] = useState(null);
  const [renamingChatId, setRenamingChatId] = useState(null);
  const [renameValue, setRenameValue] = useState("");

  const handleDeleteChat = async (chatId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this chat? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await axios.delete(`http://localhost:3000/api/chat/${chatId}`, {
        withCredentials: true,
      });

      dispatch(deleteChat(chatId));
      setActiveMenu(null);
    } catch (error) {
      console.error("Failed to delete chat:", error);
      alert("Failed to delete chat. Please try again.");
    }
  };

  const handleRenameChat = async (chatId) => {
    if (!renameValue.trim()) {
      alert("Please enter a valid chat title");
      return;
    }

    try {
      await axios.put(
        `http://localhost:3000/api/chat/${chatId}`,
        {
          title: renameValue.trim(),
        },
        {
          withCredentials: true,
        }
      );

      dispatch(renameChat({ chatId, newTitle: renameValue.trim() }));
      setRenamingChatId(null);
      setRenameValue("");
      setActiveMenu(null);
    } catch (error) {
      console.error("Failed to rename chat:", error);
      alert("Failed to rename chat. Please try again.");
    }
  };

  const startRename = (chatId, currentTitle) => {
    setRenamingChatId(chatId);
    setRenameValue(currentTitle);
    setActiveMenu(null);
  };

  const cancelRename = () => {
    setRenamingChatId(null);
    setRenameValue("");
  };

  const handleLogout = async () => {
    if (!window.confirm("Are you sure you want to logout?")) {
      return;
    }

    try {
      await axios.post(
        "http://localhost:3000/api/auth/logout",
        {},
        {
          withCredentials: true,
        }
      );

      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed:", error);
      window.location.href = "/login";
    }
  };

  // Close menu when clicking outside
  const handleClickOutside = (e) => {
    if (!e.target.closest(".chat-menu-container")) {
      setActiveMenu(null);
    }
  };

  React.useEffect(() => {
    if (activeMenu) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [activeMenu]);

  return (
    <aside
      className={"chat-sidebar " + (open ? "open" : "")}
      aria-label="Previous chats"
    >
      <div className="sidebar-header">
        <h2>Chats</h2>
        <div className="sidebar-header-actions">
          <button className="small-btn" onClick={onNewChat}>
            New
          </button>
          {/* Close button for mobile */}
          <button
            className="close-sidebar-btn"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>
      </div>
      <nav className="chat-list" aria-live="polite">
        {chats.map((c) => (
          <div key={c._id} className="chat-item-container">
            {renamingChatId === c._id ? (
              <div className="rename-input-container">
                <input
                  type="text"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleRenameChat(c._id);
                    } else if (e.key === "Escape") {
                      cancelRename();
                    }
                  }}
                  className="rename-input"
                  autoFocus
                />
                <div className="rename-actions">
                  <button
                    className="rename-save-btn"
                    onClick={() => handleRenameChat(c._id)}
                  >
                    ✓
                  </button>
                  <button className="rename-cancel-btn" onClick={cancelRename}>
                    ✕
                  </button>
                </div>
              </div>
            ) : (
              <>
                <button
                  className={
                    "chat-list-item " + (c._id === activeChatId ? "active" : "")
                  }
                  onClick={() => onSelectChat(c._id)}
                >
                  <span className="title-line">{c.title}</span>
                </button>
                <div className="chat-menu-container">
                  <button
                    className="chat-menu-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenu(activeMenu === c._id ? null : c._id);
                    }}
                    aria-label={`Chat options for ${c.title}`}
                  >
                    ⋮
                  </button>
                  {activeMenu === c._id && (
                    <div className="chat-menu">
                      <button
                        className="chat-menu-item"
                        onClick={() => startRename(c._id, c.title)}
                      >
                        Rename
                      </button>
                      <button
                        className="chat-menu-item delete"
                        onClick={() => handleDeleteChat(c._id)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
        {chats.length === 0 && <p className="empty-hint">No chats yet.</p>}
      </nav>
      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </aside>
  );
};

export default ChatSidebar;
