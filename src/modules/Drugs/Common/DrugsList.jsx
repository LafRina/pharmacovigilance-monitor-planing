import { useNavigate } from 'react-router-dom';
// import { supabase } from '../../../api/supabaseClient';
import { useState } from 'react';
import { useDrugs } from '../../../hooks/useDrugs';
import DrugCard from './DrugCard';
import SearchBar from './SearchBar';
import './DrugsList.css';


export default function DrugsList({ userRole }) {
    const navigate = useNavigate();
    const { drugs, loading } = useDrugs();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredDrugs = drugs.filter(drug => 
        drug.trade_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        drug.active_substance?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return <div className='loading-state'>Завантаження...</div>;

    return (
        <div className='drugs-container'>
            <div className='drugs-header'>
                <h2>Реєстр препаратів</h2>
                <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Введіть назву..." />
                {userRole === 'admin' && (
                    <button className='add-drugs-btn' onClick={() => navigate('/adddrug')}>+</button> 
                )}
            </div>
            <div className='drugs-grid'>
                {filteredDrugs.length > 0 ? (
                    filteredDrugs.map((drug) => <DrugCard key={drug.id} drug={drug} />)
                ) : (
                    <p className='empty-msg'>Нічого не знайдено</p>
                )}
            </div>
        </div>
    );
}


// export default function DrugsList({userRole}){
//     console.log("Поточна роль користувача:", userRole);
//     const navigate = useNavigate();
//     const [loading, setLoading] = useState(true);
//     const [drugs, setDrugs] = useState([]);
//     const [searchQuery, setSearchQuery] = useState('');

//     // Логіка фільтрації (шукаємо за назвою або діючою речовиною)
//     const filteredDrugs = drugs.filter(drug => 
//         drug.trade_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         drug.active_substance?.toLowerCase().includes(searchQuery.toLowerCase())
//     );

//     useEffect(()=>{
//         fetchDrugs();
//     }, []);

//     async function fetchDrugs() {
//         setLoading(true);
//         const {data, error} = await supabase
//             .from('drugs')
//             .select('*') // Витягує всі поля: trade_name, manufacturer, active_substance тощо
//             .order('trade_name', {ascending: true});

//         if (error) {
//             console.error('Помилка завантаження:', error);
//         } else {
//             setDrugs(data);
//         }
//         setLoading(false);
//     }

//     return(
//         <div className='drugs-container'>
//             <div className='drugs-header'>
//                 <h2>Реєстр препаратів</h2>
//                 <SearchBar 
//                     value={searchQuery} 
//                     onChange={setSearchQuery} 
//                     placeholder="Введіть назву препарату..."
//                 />
//                 {/* Відображати кнопку тільки якщо роль користувача 'admin' */}
//                 {userRole === 'admin' && (
//                     <button className='add-drugs-btn' onClick={()=> navigate('/adddrug')}>
//                     +
//                     </button> 
//                 )}
//             </div>
//             {loading ? (
//                 <div className='loading-state'>Завантаження...</div>
//                 ) : (
//                     <div className='drugs-grid'>
//                         {filteredDrugs.length > 0 ? (
//                             filteredDrugs.map((drug) => (
//                                 <DrugCard key={drug.id} drug={drug}/>
//                             ))
//                         ) : (
//                             <p className='empty-msg'>Нічого не знайдено за запитом "{searchQuery}"</p>
//                         )}
//                     </div>
//                 )}

//         </div>
//     );
// }