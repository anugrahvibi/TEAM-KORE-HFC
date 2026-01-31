import React from 'react';

const Card = ({ title, children, className = '' }) => {
    return (
        <div className={`bg-card-bg border border-border-muted rounded-xl shadow-sm hover:border-primary/30 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden ${className}`}>
            {title && (
                <div className="flex items-center justify-between px-6 py-4 border-b border-border-muted flex-shrink-0 bg-card-bg/50">
                    <h3 className="text-lg font-semibold text-text-main tracking-wide">
                        {title}
                    </h3>
                    <div className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--color-primary),0.8)] animate-pulse" />
                </div>
            )}
            <div className="text-text-muted p-6 space-y-4 flex-1 min-h-0">
                {children}
            </div>
        </div >
    );
};

export default Card;
