export default function Input({ label, invalid, ...props }) {
    const inputClasses = `auth-input ${invalid ? 'invalid' : ''}`;

    return (
        <p>
            {label && <label className="auth-label">{label}</label>}
            <input className={inputClasses} {...props} />
        </p>
    );
  }