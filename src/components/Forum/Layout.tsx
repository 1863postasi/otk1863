
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../Layout/Header';

interface ForumLayoutProps {
    children?: React.ReactNode;
}

const ForumLayout: React.FC<ForumLayoutProps> = ({ children }) => {
    return (
        <div className="flex flex-col min-h-screen bg-stone-50">
            <Header />
            <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar (Desktop) */}
                    <aside className="hidden lg:block w-64 shrink-0">
                        {/* Sidebar content managed in specific pages or here if global */}
                    </aside>

                    {/* Main Content Area */}
                    <div className="flex-1 min-w-0">
                        {children || <Outlet />}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ForumLayout;
