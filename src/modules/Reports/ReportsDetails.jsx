import { useParams, useNavigate } from 'react-router-dom';
import { PDFViewer } from '@react-pdf/renderer';
import { ReportPDFDocument } from './ReportPDFDocument';
import { useReports } from '../../hooks/useReports'; 

export default function ReportDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    
    // Використовуємо хук, передаючи ID звіту
    const { report, loading } = useReports(id); 

    if (loading) return <div>Генерація PDF документа...</div>;
    if (!report) return <div>Звіт не знайдено</div>;

    return (
        <div style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 9999, background: 'white' }}>
            <div style={{ padding: '10px', background: '#2d3748', display: 'flex', justifyContent: 'space-between' }}>
                <button 
                    onClick={() => navigate('/reports')}
                    style={{ color: 'white', background: 'none', border: '1px solid white', padding: '5px 15px', cursor: 'pointer', borderRadius: '5px' }}
                >
                    ← Назад до системи
                </button>
                <span style={{ color: 'white' }}>Режим перегляду звіту</span>
            </div>
            
            <PDFViewer style={{ width: '100%', height: 'calc(100% - 45px)', border: 'none' }}>
                <ReportPDFDocument report={report} />
            </PDFViewer>
        </div>
    );
}

