import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import './App.css';

export default function StudentApp() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [cells, setCells] = useState({});
  const [currentUserId, setCurrentUserId] = useState(null);
  const [stage, setStage] = useState('lookup'); // lookup, setPassword, enterPassword, table
  const [tempPassword, setTempPassword] = useState('');
  const [error, setError] = useState('');

  const rowTitles = [
    "통합적 관점",
    "인간, 사회, 환경과 행복",
    "자연환경과 인간",
    "문화와 다양성",
    "생활공간과 사회"
  ];
  const colTitles = ["Study", "Try", "Apply", "Reflect"];
  const cellWords = {
    "0-0": "S", "1-0": "T", "2-0": "A", "3-0": "R",
    "0-1": "S", "1-1": "T", "2-1": "A", "3-1": "R",
    "0-2": "S", "1-2": "T", "2-2": "A", "3-2": "R",
    "0-3": "S", "1-3": "T", "2-3": "A", "3-3": "R",
    "0-4": "S", "1-4": "T", "2-4": "A", "3-4": "R",
  };

  const letterMessages = {
    S: '해당 단원의 워크북 내용을 모두 학습하였나요?',
    T: '해당 단원의 교구를 활용하여 학습에 적극적으로 참여하였나요?',
    A: '해당 단원의 슬라이딩 퍼즐 문제의 정답을 맞췄나요?',
    R: '해당 단원의 보석 십자수를 완성했나요?'
  };

  const handleLookup = async () => {
    if (!name.trim()) return;
    const { data, error } = await supabase.from('user_progress').select('*').eq('user_name', name).single();
    if (data) {
      setCurrentUserId(data.id);
      setCells(data.cell_data || {});
      setPassword(data.password || '');
      setStage('enterPassword');
    } else {
      setStage('setPassword');
    }
  };

  const handleSetPassword = async () => {
    if (!tempPassword) return;
    const { data } = await supabase.from('user_progress')
      .insert([{ user_name: name, password: tempPassword, cell_data: {} }])
      .select().single();
    setCurrentUserId(data.id);
    setCells({});
    setPassword(tempPassword);
    setStage('table');
  };

  const handleEnterPassword = () => {
    if (tempPassword === password) {
      setStage('table');
      setError('');
    } else {
      setError('비밀번호가 일치하지 않습니다.');
    }
  };

  const updateProgress = async (updatedCells) => {
    setCells(updatedCells);
    await supabase.from('user_progress')
      .update({ cell_data: updatedCells })
      .eq('id', currentUserId);
  };

  const handleCellClick = (key) => {
    const cellLetter = cellWords[key];
    const message = letterMessages[cellLetter];
    if (window.confirm(message)) {
      const updated = { ...cells, [key]: !cells[key] };
      updateProgress(updated);
    }
  };

  const handleFinish = () => {
    setName('');
    setPassword('');
    setTempPassword('');
    setStage('lookup');
    setCurrentUserId(null);
    setCells({});
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start py-12 px-4 bg-gradient-to-br from-blue-100 to-blue-300 font-['Noto_Sans_KR']">
      <h1 className="text-5xl font-extrabold text-blue-900 mb-8 drop-shadow-sm">🌟 STAR MAKER 🌟</h1>

      {stage === 'lookup' && (
        <div className="flex w-full max-w-md mb-8 shadow-md">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="이름 입력"
            className="flex-grow border border-gray-300 p-3 rounded-l-md focus:outline-none"
          />
          <button
            onClick={handleLookup}
            className="bg-blue-700 text-white px-6 py-3 rounded-r-md hover:bg-blue-800"
          >
            🔍
          </button>
        </div>
      )}

      {stage === 'setPassword' && (
        <div className="text-center">
          <p className="mb-4 text-blue-800">처음 방문하셨군요! 비밀번호를 설정해주세요.</p>
          <input
            type="password"
            value={tempPassword}
            onChange={(e) => setTempPassword(e.target.value)}
            placeholder="비밀번호 설정"
            className="border border-gray-300 p-2 rounded"
          />
          <button onClick={handleSetPassword} className="ml-2 bg-blue-600 text-white px-4 py-2 rounded">
            확인
          </button>
        </div>
      )}

      {stage === 'enterPassword' && (
        <div className="text-center">
          <p className="mb-2 text-blue-800">비밀번호를 입력해주세요.</p>
          <input
            type="password"
            value={tempPassword}
            onChange={(e) => setTempPassword(e.target.value)}
            placeholder="비밀번호 입력"
            className="border border-gray-300 p-2 rounded"
          />
          <button onClick={handleEnterPassword} className="ml-2 bg-blue-600 text-white px-4 py-2 rounded">
            확인
          </button>
          {error && <p className="mt-2 text-red-500 text-sm">{error}</p>}
        </div>
      )}

      {stage === 'table' && (
        <>
          <div className="mb-6 text-lg font-medium text-blue-800">
            현재 사용자: <span className="font-bold">{name}</span>
          </div>

          <div className="overflow-x-auto w-full max-w-5xl">
            <table className="w-full border-collapse shadow-lg">
              <thead>
                <tr>
                  <th className="bg-blue-200 text-blue-900 p-3 text-sm border">영역</th>
                  {colTitles.map((col, idx) => (
                    <th key={idx} className="bg-blue-200 text-blue-900 p-3 text-sm border">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rowTitles.map((rowTitle, rowIdx) => (
                  <tr key={rowIdx} className="bg-white hover:bg-blue-50">
                    <td className="p-2 text-sm font-medium border bg-blue-100 text-blue-800">{rowTitle}</td>
                    {colTitles.map((_, colIdx) => {
                      const key = `${colIdx}-${rowIdx}`;
                      const word = cellWords[key];
                      const isComplete = cells[key];
                      return (
                        <td
                          key={key}
                          className="border text-center p-2 text-lg font-bold cursor-pointer select-none"
                          onClick={() => word && handleCellClick(key)}
                        >
                          {word && (isComplete ? "★" : word)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-lg mt-6 text-blue-800 font-semibold">
            ⭐ 진행률: {Object.values(cells).filter(Boolean).length} / {Object.keys(cellWords).length}
          </p>

          <button
            onClick={handleFinish}
            className="mt-6 bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded"
          >
            완료
          </button>
        </>
      )}
    </div>
  );
}
