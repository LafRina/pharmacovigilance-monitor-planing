export default function TextAreaForm({name, placeholder, onChange}){
    return(
        <textarea 
            name={name}
            placeholder={placeholder}
            onChange={onChange} 
        />
    );
}