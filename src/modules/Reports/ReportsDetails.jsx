import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../api/supabaseClient';
import { PDFViewer } from '@react-pdf/renderer';
import { ReportPDFDocument } from './ReportPDFDocument';

export default function ReportDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchReport() {
            const { data, error } = await supabase
                .from('reports')
                .select('*')
                .eq('id', id)
                .single();

            if (!error) setReport(data);
            setLoading(false);
        }
        fetchReport();
    }, [id]);

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
            
            {/* PDFViewer займає весь екран і показує PDF замість HTML сторінки */}
            <PDFViewer style={{ width: '100%', height: 'calc(100% - 45px)', border: 'none' }}>
                <ReportPDFDocument report={report} />
            </PDFViewer>
        </div>
    );
}