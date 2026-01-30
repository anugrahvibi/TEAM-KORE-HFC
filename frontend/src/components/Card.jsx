import React from 'react';

const Card = ({ title, children, className = '' }) => {
    return (
        <div className={`bg-card-bg border border-border-muted rounded-xl p-6 shadow-sm hover:border-primary/30 transition-all duration-300 ${className}`}>
            {title && (
                <div className="flex items-center justify-between mb-4 border-b border-border-muted pb-3">
                    <h3 className="text-lg font-semibold text-text-main tracking-wide">
                        {title}
                    </h3>
                    <div className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--color-primary),0.8)] animate-pulse" />
                </div>
            )}
            <div className="text-text-muted space-y-4">
                {children}
            </div>
        </div >
    );
};

export default Card;
