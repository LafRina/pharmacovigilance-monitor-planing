import React from 'react';
import './SearchBar.css';

export default function SearchBar({ value, onChange, placeholder }) {
    return (
        <div className="search-panel">
            <div className="search-container">
                <span className="search-icon">🔍</span>
                <input
                    type="text"
                    className="search-input"
                    placeholder={placeholder || "Пошук..."}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                />
                {value && (
                    <button className="clear-search" onClick={() => onChange('')}>
                        &times;
                    </button>
                )}
            </div>
        </div>
    );
}