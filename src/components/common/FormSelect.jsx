export default function FormSelect({ label, name, value, onChange, options, required = false }) {
    return (
        <div className="input-group">
            {label && <label className="input-label">{label}</label>}
            <select 
                name={name}
                value={value}
                onChange={onChange}
                className="form-select"
                required={required}
            >
                <option value="">Оберіть варіант</option>
                {options.map((opt) => (
                    <option key={opt.id || opt.value} value={opt.id || opt.value}>
                        {opt.email || opt.label || opt.name}
                    </option>
                ))}
            </select>
        </div>
    );
}