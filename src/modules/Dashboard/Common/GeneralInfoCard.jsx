import './Cards.css';

export default function GeneralInfoCard({title, value, icon}){
    return(
        <div>
             <p>{icon}</p>
            <p>{value}</p>
            <h4>{title}</h4>
        </div>
    )
}