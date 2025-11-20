
import React, { useState, useMemo, useEffect } from 'react';
import { Student, Personnel, StudentAttendance, PersonnelAttendance, TimePeriod, AttendanceStatus } from '../types';
import { STUDENT_CLASSES, STUDENT_CLASSROOMS } from '../constants';
import AttendanceStats from './AttendanceStats';

interface AttendancePageProps {
    students: Student[];
    personnel: Personnel[];
    dormitories: string[];
    studentAttendance: StudentAttendance[];
    personnelAttendance: PersonnelAttendance[];
    onSaveStudentAttendance: (data: StudentAttendance[]) => void;
    onSavePersonnelAttendance: (data: PersonnelAttendance[]) => void;
    isSaving: boolean;
}

// Helper for current Buddhist date
const getTodayBuddhist = () => {
    const date = new Date();
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear() + 543}`;
};

const getDirectDriveImageSrc = (url: string | File): string => {
    if (url instanceof File) {
        return URL.createObjectURL(url);
    }
    if (typeof url !== 'string') return '';
    const match = url.match(/file\/d\/([^/]+)/);
    if (match && match[1]) {
        const fileId = match[1];
        return `https://drive.google.com/uc?id=${fileId}`;
    }
    return url;
};

const AttendancePage: React.FC<AttendancePageProps> = ({
    students, personnel, dormitories, 
    studentAttendance, personnelAttendance,
    onSaveStudentAttendance, onSavePersonnelAttendance, isSaving
}) => {
    const [activeTab, setActiveTab] = useState<'student' | 'personnel'>('student');
    const [selectedDate, setSelectedDate] = useState(getTodayBuddhist());
    const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('morning');
    
    // Filters for Students
    const [filterClass, setFilterClass] = useState('');
    const [filterRoom, setFilterRoom] = useState('');
    const [filterDorm, setFilterDorm] = useState('');

    // Local state for editing attendance before saving
    const [localStudentAttendance, setLocalStudentAttendance] = useState<Record<number, AttendanceStatus>>({});
    const [localPersonnelAttendance, setLocalPersonnelAttendance] = useState<Record<number, AttendanceStatus>>({});
    // Local state for Personnel Dress Code
    const [localPersonnelDressCode, setLocalPersonnelDressCode] = useState<Record<number, 'tidy' | 'untidy'>>({});


    // Helper to generate composite ID
    const generateId = (date: string, period: string, id: number) => `${date}_${period}_${id}`;

    // --- Data Preparation ---

    const filteredStudents = useMemo(() => {
        return students.filter(s => {
            if (filterDorm && s.dormitory !== filterDorm) return false;
            const [cls, room] = s.studentClass.split('/');
            if (filterClass && cls !== filterClass) return false;
            if (filterRoom && room !== filterRoom) return false;
            return true;
        });
    }, [students, filterClass, filterRoom, filterDorm]);

    // Sync local state with props when date/period changes
    useEffect(() => {
        if (activeTab === 'student') {
            const newStatusMap: Record<number, AttendanceStatus> = {};
            filteredStudents.forEach(s => {
                const existing = studentAttendance.find(r => r.id === generateId(selectedDate, selectedPeriod, s.id));
                newStatusMap[s.id] = existing ? existing.status : 'present'; // Default to present
            });
            setLocalStudentAttendance(newStatusMap);
        } else {
            const newStatusMap: Record<number, AttendanceStatus> = {};
            const newDressCodeMap: Record<number, 'tidy' | 'untidy'> = {};
            personnel.forEach(p => {
                const existing = personnelAttendance.find(r => r.id === generateId(selectedDate, selectedPeriod, p.id));
                newStatusMap[p.id] = existing ? existing.status : 'present'; // Default to present (joined)
                newDressCodeMap[p.id] = existing?.dressCode || 'tidy'; // Default to tidy
            });
            setLocalPersonnelAttendance(newStatusMap);
            setLocalPersonnelDressCode(newDressCodeMap);
        }
    }, [selectedDate, selectedPeriod, activeTab, studentAttendance, personnelAttendance, filteredStudents, personnel]);

    // --- Handlers ---

    const handleStudentStatusChange = (studentId: number, status: AttendanceStatus) => {
        setLocalStudentAttendance(prev => ({ ...prev, [studentId]: status }));
    };

    const handlePersonnelStatusChange = (personnelId: number, status: AttendanceStatus) => {
        setLocalPersonnelAttendance(prev => ({ ...prev, [personnelId]: status }));
    };

    const handlePersonnelDressCodeChange = (personnelId: number, code: 'tidy' | 'untidy') => {
        setLocalPersonnelDressCode(prev => ({ ...prev, [personnelId]: code }));
    };

    const handleBulkStatusChange = (status: AttendanceStatus) => {
        if (activeTab === 'student') {
            const newMap = { ...localStudentAttendance };
            filteredStudents.forEach(s => newMap[s.id] = status);
            setLocalStudentAttendance(newMap);
        } else {
            const newMap = { ...localPersonnelAttendance };
            personnel.forEach(p => newMap[p.id] = status);
            setLocalPersonnelAttendance(newMap);
        }
    };
    
    const handleBulkDressCodeChange = (code: 'tidy' | 'untidy') => {
         const newMap = { ...localPersonnelDressCode };
         personnel.forEach(p => newMap[p.id] = code);
         setLocalPersonnelDressCode(newMap);
    }

    const handleSave = () => {
        if (activeTab === 'student') {
            const recordsToSave: StudentAttendance[] = filteredStudents.map(s => ({
                id: generateId(selectedDate, selectedPeriod, s.id),
                date: selectedDate,
                period: selectedPeriod,
                studentId: s.id,
                status: localStudentAttendance[s.id] || 'present'
            }));
            onSaveStudentAttendance(recordsToSave);
        } else {
            const recordsToSave: PersonnelAttendance[] = personnel.map(p => ({
                id: generateId(selectedDate, selectedPeriod, p.id),
                date: selectedDate,
                period: selectedPeriod,
                personnelId: p.id,
                status: localPersonnelAttendance[p.id] || 'present',
                dressCode: localPersonnelDressCode[p.id] || 'tidy'
            }));
            onSavePersonnelAttendance(recordsToSave);
        }
    };

    
    const periodOptions: { value: TimePeriod, label: string }[] = [
        { value: 'morning', label: 'ช่วงเช้า (เข้าแถว)' },
        { value: 'lunch', label: 'ช่วงกลางวัน' },
        { value: 'evening', label: 'ช่วงเย็น (กลับหอ/กลับบ้าน)' },
    ];

    return (
        <div className="space-y-6">
            
            {/* Statistics Section */}
            <div className="mb-6">
                <AttendanceStats 
                    studentAttendance={studentAttendance}
                    personnelAttendance={personnelAttendance}
                    students={students}
                    personnel={personnel}
                />
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-navy mb-6">บันทึกการมาเรียนและร่วมกิจกรรม</h2>

                {/* Controls */}
                <div className="bg-gray-50 p-4 rounded-lg mb-6 flex flex-wrap gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">วันที่ (วว/ดด/ปปปป)</label>
                        <input 
                            type="text" 
                            value={selectedDate} 
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg w-40 text-center"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ช่วงเวลา</label>
                        <select 
                            value={selectedPeriod} 
                            onChange={(e) => setSelectedPeriod(e.target.value as TimePeriod)}
                            className="px-3 py-2 border border-gray-300 rounded-lg w-48"
                        >
                            {periodOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    </div>
                    <div className="flex-grow"></div>
                    <div className="flex bg-gray-200 rounded-lg p-1">
                        <button 
                            onClick={() => setActiveTab('student')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'student' ? 'bg-white shadow text-primary-blue' : 'text-gray-600'}`}
                        >
                            เช็คชื่อนักเรียน
                        </button>
                        <button 
                            onClick={() => setActiveTab('personnel')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'personnel' ? 'bg-white shadow text-primary-blue' : 'text-gray-600'}`}
                        >
                            เช็คชื่อครู/บุคลากร
                        </button>
                    </div>
                </div>

                {/* Filters (Student Only) */}
                {activeTab === 'student' && (
                    <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">ระดับชั้น</label>
                            <select value={filterClass} onChange={(e) => setFilterClass(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                <option value="">ทั้งหมด</option>
                                {STUDENT_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">ห้อง</label>
                            <select value={filterRoom} onChange={(e) => setFilterRoom(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                <option value="">ทั้งหมด</option>
                                {STUDENT_CLASSROOMS.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">เรือนนอน</label>
                            <select value={filterDorm} onChange={(e) => setFilterDorm(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                <option value="">ทั้งหมด</option>
                                {dormitories.filter(d => d !== 'เรือนพยาบาล').map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                    </div>
                )}

                {/* Bulk Actions */}
                <div className="flex flex-wrap gap-y-2 gap-x-4 mb-4 overflow-x-auto pb-2 items-center">
                    <div className="flex gap-2 items-center">
                         <span className="text-sm font-medium text-gray-600 self-center mr-1">สถานะ:</span>
                        {activeTab === 'student' ? (
                            <>
                                <button onClick={() => handleBulkStatusChange('present')} className="px-3 py-1 bg-green-100 text-green-800 rounded-md text-sm hover:bg-green-200">มา</button>
                                <button onClick={() => handleBulkStatusChange('leave')} className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-md text-sm hover:bg-yellow-200">ลา</button>
                                <button onClick={() => handleBulkStatusChange('sick')} className="px-3 py-1 bg-orange-100 text-orange-800 rounded-md text-sm hover:bg-orange-200">ป่วย</button>
                                <button onClick={() => handleBulkStatusChange('absent')} className="px-3 py-1 bg-red-100 text-red-800 rounded-md text-sm hover:bg-red-200">ขาด</button>
                            </>
                        ) : (
                            <>
                                <button onClick={() => handleBulkStatusChange('present')} className="px-3 py-1 bg-green-100 text-green-800 rounded-md text-sm hover:bg-green-200">ร่วมกิจกรรม</button>
                                <button onClick={() => handleBulkStatusChange('absent')} className="px-3 py-1 bg-red-100 text-red-800 rounded-md text-sm hover:bg-red-200">ไม่ร่วม</button>
                            </>
                        )}
                    </div>

                    {activeTab === 'personnel' && (
                        <div className="flex gap-2 items-center border-l pl-4">
                             <span className="text-sm font-medium text-gray-600 self-center mr-1">การแต่งกาย:</span>
                             <button onClick={() => handleBulkDressCodeChange('tidy')} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-md text-sm hover:bg-blue-200">เรียบร้อยทั้งหมด</button>
                             <button onClick={() => handleBulkDressCodeChange('untidy')} className="px-3 py-1 bg-gray-200 text-gray-800 rounded-md text-sm hover:bg-gray-300">ไม่เรียบร้อยทั้งหมด</button>
                        </div>
                    )}
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-3 text-left text-sm font-semibold text-gray-600 w-16">รูป</th>
                                <th className="p-3 text-left text-sm font-semibold text-gray-600">ชื่อ-นามสกุล</th>
                                {activeTab === 'student' && <th className="p-3 text-left text-sm font-semibold text-gray-600">ชั้น/ห้อง</th>}
                                {activeTab === 'personnel' && <th className="p-3 text-left text-sm font-semibold text-gray-600">ตำแหน่ง</th>}
                                <th className="p-3 text-center text-sm font-semibold text-gray-600">สถานะ</th>
                                {activeTab === 'personnel' && <th className="p-3 text-center text-sm font-semibold text-gray-600">การแต่งกาย</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {activeTab === 'student' ? (
                                filteredStudents.length > 0 ? (
                                    filteredStudents.map(s => {
                                        const profileImg = s.studentProfileImage?.[0] ? getDirectDriveImageSrc(s.studentProfileImage[0]) : null;
                                        const status = localStudentAttendance[s.id] || 'present';
                                        return (
                                            <tr key={s.id} className="hover:bg-gray-50">
                                                <td className="p-2">
                                                     <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                                                        {profileImg ? <img src={profileImg} className="w-full h-full object-cover"/> : null}
                                                    </div>
                                                </td>
                                                <td className="p-3 text-sm">{s.studentTitle}{s.studentName}</td>
                                                <td className="p-3 text-sm text-gray-500">{s.studentClass}</td>
                                                <td className="p-3">
                                                    <div className="flex justify-center gap-2">
                                                        {['present', 'leave', 'sick', 'absent'].map((st) => (
                                                            <label key={st} className={`cursor-pointer px-3 py-1 rounded-md border text-xs sm:text-sm transition ${status === st 
                                                                ? st === 'present' ? 'bg-green-500 text-white border-green-500' 
                                                                : st === 'leave' ? 'bg-yellow-500 text-white border-yellow-500'
                                                                : st === 'sick' ? 'bg-orange-500 text-white border-orange-500'
                                                                : 'bg-red-500 text-white border-red-500'
                                                                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                                                            }`}>
                                                                <input 
                                                                    type="radio" 
                                                                    name={`status-${s.id}`} 
                                                                    checked={status === st} 
                                                                    onChange={() => handleStudentStatusChange(s.id, st as AttendanceStatus)}
                                                                    className="hidden"
                                                                />
                                                                {st === 'present' ? 'มา' : st === 'leave' ? 'ลา' : st === 'sick' ? 'ป่วย' : 'ขาด'}
                                                            </label>
                                                        ))}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : <tr><td colSpan={4} className="p-4 text-center text-gray-500">ไม่พบข้อมูลนักเรียนตามเงื่อนไข</td></tr>
                            ) : (
                                personnel.length > 0 ? (
                                    personnel.map(p => {
                                        const profileImg = p.profileImage?.[0] ? getDirectDriveImageSrc(p.profileImage[0]) : null;
                                        const status = localPersonnelAttendance[p.id] || 'present';
                                        const dressCode = localPersonnelDressCode[p.id] || 'tidy';
                                        const title = p.personnelTitle === 'อื่นๆ' ? p.personnelTitleOther : p.personnelTitle;
                                        return (
                                            <tr key={p.id} className="hover:bg-gray-50">
                                                 <td className="p-2">
                                                     <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                                                        {profileImg ? <img src={profileImg} className="w-full h-full object-cover"/> : null}
                                                    </div>
                                                </td>
                                                <td className="p-3 text-sm">{title} {p.personnelName}</td>
                                                <td className="p-3 text-sm text-gray-500">{p.position}</td>
                                                <td className="p-3">
                                                     <div className="flex justify-center gap-2">
                                                        <label className={`cursor-pointer px-4 py-1 rounded-md border text-sm transition ${status === 'present' || status === 'activity' ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-600 border-gray-300'}`}>
                                                            <input type="radio" name={`p-status-${p.id}`} checked={status === 'present' || status === 'activity'} onChange={() => handlePersonnelStatusChange(p.id, 'activity')} className="hidden" />
                                                            ร่วมกิจกรรม
                                                        </label>
                                                        <label className={`cursor-pointer px-4 py-1 rounded-md border text-sm transition ${status === 'absent' ? 'bg-red-500 text-white border-red-500' : 'bg-white text-gray-600 border-gray-300'}`}>
                                                            <input type="radio" name={`p-status-${p.id}`} checked={status === 'absent'} onChange={() => handlePersonnelStatusChange(p.id, 'absent')} className="hidden" />
                                                            ไม่ร่วม
                                                        </label>
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                     <div className="flex justify-center gap-2">
                                                        <label className={`cursor-pointer px-3 py-1 rounded-md border text-xs transition ${dressCode === 'tidy' ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-600 border-gray-300'}`}>
                                                            <input type="radio" name={`p-dress-${p.id}`} checked={dressCode === 'tidy'} onChange={() => handlePersonnelDressCodeChange(p.id, 'tidy')} className="hidden" />
                                                            เรียบร้อย
                                                        </label>
                                                        <label className={`cursor-pointer px-3 py-1 rounded-md border text-xs transition ${dressCode === 'untidy' ? 'bg-gray-500 text-white border-gray-500' : 'bg-white text-gray-600 border-gray-300'}`}>
                                                            <input type="radio" name={`p-dress-${p.id}`} checked={dressCode === 'untidy'} onChange={() => handlePersonnelDressCodeChange(p.id, 'untidy')} className="hidden" />
                                                            ไม่เรียบร้อย
                                                        </label>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })
                                ) : <tr><td colSpan={5} className="p-4 text-center text-gray-500">ไม่พบข้อมูลบุคลากร</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer Actions */}
                <div className="mt-6 flex justify-end">
                     <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-primary-blue hover:bg-primary-hover text-white font-bold py-3 px-8 rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isSaving ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                กำลังบันทึก...
                            </>
                        ) : (
                            <span>บันทึกการเช็คชื่อ</span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AttendancePage;
