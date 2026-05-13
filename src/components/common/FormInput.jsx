export default function FormInput({ label, type = "text", name, value, onChange, placeholder, required = false }) {
    return (
        <div className="input-group">
            {label && <label className="input-label">{label}</label>}
            <input 
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="form-input"
                required={required}
            />
        </div>
    );
}