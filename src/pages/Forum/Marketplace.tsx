import React from 'react';
import MarketplaceView from './MarketplaceView';

const Marketplace: React.FC = () => {
    return (
        <div className="min-h-screen bg-stone-50 pt-20 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-serif font-bold text-stone-900 mb-2">Pazar Yeri</h1>
                    <p className="text-stone-500">Kampüste al, sat ve kirala</p>
                </div>

                {/* Marketplace Content */}
                <MarketplaceView />
            </div>
        </div>
    );
};

export default Marketplace;
