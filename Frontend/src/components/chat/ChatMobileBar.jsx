import axios from "axios";
import "./ChatLayout.css";
import "./ChatMobileBar.css";

const ChatMobileBar = ({ onToggleSidebar, onNewChat }) => {
  const handleLogout = async () => {
    if (!window.confirm("Are you sure you want to logout?")) {
      return;
    }

    try {
      await axios.post(
        "https://aichat-buddy.onrender.com/api/auth/logout",
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

  return (
    <header className="chat-mobile-bar">
      <button
        className="chat-icon-btn"
        onClick={onToggleSidebar}
        aria-label="Toggle chat history"
      >
        ☰
      </button>
      <h1 className="chat-app-title">Chat</h1>
      <div className="mobile-bar-actions">
        <button
          className="chat-icon-btn"
          onClick={onNewChat}
          aria-label="New chat"
        >
          ＋
        </button>
        <button
          className="chat-icon-btn logout-mobile"
          onClick={handleLogout}
          aria-label="Logout"
        >
          ⏻
        </button>
      </div>
    </header>
  );
};

export default ChatMobileBar;
