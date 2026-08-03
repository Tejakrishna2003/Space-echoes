import React from 'react';
import { SPACE_DATA } from '../data/spaceData';

export default function RealmSwitcher({ selectedBodyKey, onSelectBody }) {
  return (
    <aside
      className="fixed right-0 top-1/2 -translate-y-1/2 h-auto flex flex-col items-center space-y-sm pr-edge-margin z-50 hud-animate"
      style={{ animationDelay: '0.5s' }}
    >
      {Object.values(SPACE_DATA).map(body => {
        const isActive = selectedBodyKey === body.key;
        return (
          <div
            key={body.key}
            onClick={() => onSelectBody(body.key)}
            className="group relative flex items-center justify-end vertical-pip-interaction cursor-pointer"
          >
            <span className="mr-4 font-label-sm text-[10px] tracking-widest text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300 uppercase whitespace-nowrap">
              {body.name}
            </span>
            <div
              className={`rounded-full transition-all duration-300 ${
                isActive
                  ? 'w-3 h-3 scale-125 shadow-[0_0_12px_rgba(0,225,171,0.9)] ring-2 ring-white/40'
                  : 'w-2 h-2 opacity-50 group-hover:opacity-100 group-hover:scale-110'
              }`}
              style={{
                backgroundColor: body.colorHex,
                boxShadow: isActive ? `0 0 12px ${body.colorHex}` : undefined
              }}
            />
          </div>
        );
      })}
    </aside>
  );
}
