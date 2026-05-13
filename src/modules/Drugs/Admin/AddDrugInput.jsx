import './AddDrugInput.css';

export default function AddDrugInput({label, name, type = "text", placeholder, value, onChange, required=false}){
    return(
        <div className="form-group-wrapper">
            {label && <label className="input-label">
                {label}
            </label>}
            <input 
                type={type}
                name={name}
                // value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                className="form-input-line"
            />
        </div>
    );
}