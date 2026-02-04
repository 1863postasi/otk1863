import React from 'react';
import { MessageCircle, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDate } from '../../lib/utils';

// Define Message interface here or import it if shared
interface Message {
    id?: string;
    fromId: string;
    fromName: string;
    toId: string;
    listingId: string;
    listingTitle: string;
    content: string;
    createdAt: any;
    read: boolean;
    contactInfo?: string;
}

interface MessagesTabProps {
    messages: Message[];
    loading: boolean;
}

const MessagesTab: React.FC<MessagesTabProps> = ({ messages, loading }) => {
    if (loading) return <div className="text-center py-16">Yükleniyor...</div>;

    return (
        <motion.div
            key="messages"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
        >
            {messages.length === 0 && (
                <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-stone-300">
                    <MessageCircle size={48} className="mx-auto text-stone-300 mb-4" />
                    <p className="text-stone-500 font-medium">Gelen kutunuz boş.</p>
                </div>
            )}

            {messages.map((msg, idx) => (
                <div key={msg.id || idx} className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm relative overflow-hidden group hover:border-emerald-200 transition-colors">
                    {/* Blue stripe for unread messages (logic can be added) */}
                    <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center shrink-0">
                            <User size={20} className="text-stone-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1">
                                <div>
                                    <h4 className="font-bold text-stone-900 text-sm">{msg.fromName}</h4>
                                    <p className="text-xs text-stone-500">
                                        İlan: <span className="font-bold text-emerald-700">{msg.listingTitle}</span>
                                    </p>
                                </div>
                                <span className="text-[10px] text-stone-400">
                                    {formatDate(msg.createdAt?.seconds ? new Date(msg.createdAt.seconds * 1000).toISOString() : new Date().toISOString())}
                                </span>
                            </div>

                            <p className="text-sm text-stone-700 bg-stone-50 p-3 rounded-lg border border-stone-100 mb-2">
                                {msg.content}
                            </p>

                            {msg.contactInfo && (
                                <div className="text-xs font-mono text-emerald-600 bg-emerald-50 px-2 py-1 rounded inline-block">
                                    İletişim: {msg.contactInfo}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </motion.div>
    );
};

export default MessagesTab;
