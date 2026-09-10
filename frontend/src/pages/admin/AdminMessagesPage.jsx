// src/pages/admin/AdminMessagesPage.jsx
import { useEffect, useState } from 'react';
import { FiMail } from 'react-icons/fi';
import { contactService } from '../../services/contactService';
import { formatDate } from '../../utils/format';
import { FullPageSpinner } from '../../components/common/Spinner';

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = () => {
    setLoading(true);
    contactService.getAllMessages().then((res) => setMessages(res.data.messages)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchMessages(); }, []);

  const handleMarkRead = async (msg) => {
    if (msg.is_read) return;
    await contactService.markRead(msg.message_id);
    setMessages((msgs) => msgs.map((m) => (m.message_id === msg.message_id ? { ...m, is_read: true } : m)));
  };

  if (loading) return <FullPageSpinner />;

  return (
    <div>
      <h1 className="font-display text-2xl text-brown mb-6">Contact Messages</h1>

      {messages.length === 0 ? (
        <p className="text-brown-light">No messages yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {messages.map((msg) => (
            <div
              key={msg.message_id}
              onClick={() => handleMarkRead(msg)}
              className={`bg-white border rounded-sm p-5 cursor-pointer ${msg.is_read ? 'border-beige-dark' : 'border-maroon'}`}
            >
              <div className="flex items-start justify-between mb-2 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <FiMail className={msg.is_read ? 'text-brown-light' : 'text-maroon'} size={16} />
                  <span className={`font-medium ${msg.is_read ? 'text-brown-light' : 'text-brown'}`}>{msg.name}</span>
                  <span className="text-xs text-brown-light">({msg.email})</span>
                </div>
                <span className="text-xs text-brown-light">{formatDate(msg.created_at)}</span>
              </div>
              {msg.subject && <p className="text-sm font-medium text-brown mb-1">{msg.subject}</p>}
              <p className="text-sm text-brown-light">{msg.message}</p>
              {msg.phone && <p className="text-xs text-brown-light mt-2">📞 {msg.phone}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
