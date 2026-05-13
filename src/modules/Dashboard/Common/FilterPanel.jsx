import React from 'react';
import './FilterPanel.css';

export default function FilterPanel({ filters, onChange, options }) {
    return (
        <div className="filter-panel-row">
            {options.map((option) => (
                <div key={option.name} className="filter-item">
                    <label>{option.label}</label>
                    <select
                        value={filters[option.name] || ''}
                        onChange={(e) => onChange(option.name, e.target.value)}
                        className="filter-select-minimal"
                    >
                        <option value="all">Усі</option>
                        {option.values.map(val => (
                            <option key={val} value={val}>{val}</option>
                        ))}
                    </select>
                </div>
            ))}
            {(Object.values(filters).some(v => v !== 'all' && v !== '')) && (
                <button className="reset-filters" onClick={() => onChange('reset')}>
                    Скинути
                </button>
            )}
        </div>
    );
}