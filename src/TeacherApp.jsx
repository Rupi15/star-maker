import { useState } from 'react';
import { supabase } from './supabaseClient';
import './App.css';

export default function TeacherApp() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [deleteConfirmPassword, setDeleteConfirmPassword] = useState('');
  const [showDeletePrompt, setShowDeletePrompt] = useState(false);

  const rowTitles = [
    "통합적 관점",
    "인간, 사회, 환경과 행복",
    "자연환경과 인간",
    "문화와 다양성",
    "생활공간과 사회"
  ];
  const colTitles = ["Study", "Try", "Apply", "Reflect"];

  const fetchStudents = async () => {
    const { data, error } = await supabase
      .from('user_progress')
      .select('id, user_name, cell_data');
    if (data) setStudents(data);
  };

  const handleStudentClick = (student) => {
    setSelectedStudent(student);
  };

  const handleResetAll = async () => {
    if (!window.confirm("정말로 모든 데이터를 초기화하시겠습니까?")) return;

    const { data: existing } = await supabase.from('user_progress').select('id, user_name');
    for (const student of existing) {
      await supabase.from('user_progress').update({ cell_data: {} }).eq('id', student.id);
    }

    fetchStudents();
    setSelectedStudent(null);
  };

  const handleDeleteAll = async () => {
    if (deleteConfirmPassword !== 'geography') {
      alert('비밀번호가 틀렸습니다. 삭제가 취소되었습니다.');
      return;
    }
    const { error } = await supabase.from('user_progress').delete().not('id', 'is', null);
    if (!error) {
      alert('모든 학생 기록이 삭제되었습니다.');
      fetchStudents();
      setSelectedStudent(null);
    } else {
      alert('삭제 중 오류가 발생했습니다.');
      console.error(error);
    }
    setShowDeletePrompt(false);
    setDeleteConfirmPassword('');
  };

  const handleLogin = () => {
    if (passwordInput === 'geography') {
      setAuthenticated(true);
      fetchStudents();
    } else {
      alert('비밀번호가 틀렸습니다.');
    }
  };

  const toggleCell = async (colIdx, rowIdx) => {
    if (!selectedStudent) return;

    const cellKey = `${colIdx}-${rowIdx}`;
    const updatedCellData = { ...selectedStudent.cell_data };

    if (updatedCellData[cellKey]) {
      delete updatedCellData[cellKey];
    } else {
      updatedCellData[cellKey] = true;
    }

    const { error } = await supabase
      .from('user_progress')
      .update({ cell_data: updatedCellData })
      .eq('id', selectedStudent.id);

    if (!error) {
      setSelectedStudent({ ...selectedStudent, cell_data: updatedCellData });
      const updatedStudents = students.map(s =>
        s.id === selectedStudent.id ? { ...s, cell_data: updatedCellData } : s
      );
      setStudents(updatedStudents);
    } else {
      alert("수정 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 font-['Noto_Sans_KR']">
            <div className="bg-white/70 p-6 rounded-lg w-full max-w-5xl text-center">
              <h1 className="title font-extrabold text-purple-900 mb-8 drop-shadow-sm text-center">📚 STAR MAKER 교사용</h1>

       {!authenticated ? (
         <div className="flex flex-col items-center">
          <input
            type="password"
            placeholder="비밀번호 입력"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            className="border border-gray-300 p-6 text-2xl rounded mb-4 text-center"
          />
          <button onClick={handleLogin} className="bg-purple-700 text-white px-6 py-2 rounded hover:bg-purple-800 text-center">
            로그인
          </button>
        </div>
      ) : (
        <>
          <div className="w-full max-w-4xl mb-8">
            <div className="flex flex-col items-center mb-4">
              <h2 className="text-2xl font-semibold text-purple-800 w-full">👩‍🏫 전체 학생 목록</h2>
              <div className="space-x-2 mt-2">
                <button onClick={handleResetAll} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                  전체 리셋
                </button>
                <button onClick={() => setShowDeletePrompt(true)} className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-black">
                  저장된 데이터 삭제
                </button>
              </div>
            </div>
            <ul className="bg-white rounded shadow divide-y">
              {students.map((student) => (
                <li
                  key={student.id}
                  className="p-4 hover:bg-purple-50 cursor-pointer flex justify-between items-center"
                  onClick={() => handleStudentClick(student)}
                >
                  <span className="font-medium text-purple-900">{student.user_name}</span>
                  <span className="text-sm text-purple-600 ">
                    진행률: {Object.values(student.cell_data || {}).filter(Boolean).length} / 20
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {selectedStudent && (
            <div className="mt-8 w-full max-w-5xl">
              <h3 className="text-xl font-semibold text-indigo-700 mb-4">
                ⭐ {selectedStudent.user_name} 학생의 STAR 학습 현황
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse shadow-lg">
                  <thead>
                    <tr>
                      <th className="bg-indigo-200 text-indigo-900 p-3 text-sm border">영역</th>
                      {colTitles.map((col, idx) => (
                        <th key={idx} className="bg-indigo-200 text-indigo-900 p-3 text-sm border">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rowTitles.map((rowTitle, rowIdx) => (
                      <tr key={rowIdx} className="bg-white hover:bg-indigo-50">
                        <td className="p-2 text-sm font-medium border bg-indigo-100 text-indigo-800">{rowTitle}</td>
                        {colTitles.map((_, colIdx) => {
                          const cellKey = `${colIdx}-${rowIdx}`;
                          const cellValue = selectedStudent.cell_data?.[cellKey];
                          const displayLetter = { 0: 'S', 1: 'T', 2: 'A', 3: 'R' }[colIdx];
                          return (
                            <td
                              key={cellKey}
                              onClick={() => toggleCell(colIdx, rowIdx)}
                              className="border text-center p-2 text-lg font-bold cursor-pointer select-none hover:bg-indigo-100"
                            >
                              {cellValue ? "★" : displayLetter}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-lg mt-4 text-indigo-800 font-semibold text-center">
                ⭐ 진행률: {Object.values(selectedStudent.cell_data || {}).filter(Boolean).length} / 20
              </p>
            </div>
          )}

          {showDeletePrompt && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
              <div className="bg-white p-6 rounded shadow-xl text-center w-full max-w-md">
                <h2 className="text-lg font-semibold mb-4 text-center">⚠ 저장된 모든 데이터를 삭제하려면 비밀번호를 입력하세요</h2>
                <input
                  type="password"
                  placeholder="비밀번호 입력"
                  value={deleteConfirmPassword}
                  onChange={(e) => setDeleteConfirmPassword(e.target.value)}
                  className="border border-gray-300 p-6 text-2xl rounded w-full mb-4 text-center"
                />
                <div className="flex justify-center space-x-4">
                  <button onClick={() => setShowDeletePrompt(false)} className="bg-gray-300 px-4 py-2 rounded text-center">취소</button>
                  <button onClick={handleDeleteAll} className="bg-red-600 text-white px-4 py-2 rounded text-center">삭제</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      </div>
    </div>
  );
}
