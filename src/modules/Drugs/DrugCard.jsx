import './DrugsList.css';
import { useNavigate } from 'react-router-dom';

export default function DrugCard({drug}){
    const navigate = useNavigate();

    return(
        <div className='drug-card'>
            <div className='card-content'>
                <h3>{drug.trade_name}</h3>
                <p className='active-substance'>
                    <strong>Діюча речовина:</strong> {drug.active_substance || 'Не вказано'}
                </p>
                <p className='manufacturer'>
                    <strong>Виробник:</strong> {drug.manufacturer || 'Не вказаний'}
                </p>
                {/* Додаємо форму випуску, якщо вона є у вашій таблиці */}
                {/* {drug.form_of_release && (
                    <p className='form-release'>
                        <small>{drug.form_of_release}</small>
                    </p>
                )} */}
            </div>

            <button className='details-link' onClick={()=> navigate(`/drugs/${drug.id}`)}>
                Детальніше →
            </button>
        </div>
    );
}