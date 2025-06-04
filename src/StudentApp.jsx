import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import './App.css';

export default function StudentApp() {
  const [userName, setUserName] = useState('');
  const [inputName, setInputName] = useState('');
  const [password, setPassword] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [cellData, setCellData] = useState({});
  const [userId, setUserId] = useState(null);
  const [showTable, setShowTable] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);
  const [showNameInput, setShowNameInput] = useState(true);

  const rowTitles = [
    "통합적 관점",
    "인간, 사회, 환경과 행복",
    "자연환경과 인간",
    "문화와 다양성",
    "생활공간과 사회"
  ];
  const colTitles = ["Study", "Try", "Apply", "Reflect"];

  const cellWords = {
    0: 'S', 1: 'T', 2: 'A', 3: 'R'
  };

  const cellMessages = {
    S: '해당 단원의 워크북 내용을 모두 학습하였나요?',
    T: '해당 단원의 교구를 활용하여 학습에 적극적으로 참여하였나요?',
    A: '해당 단원의 슬라이딩 퍼즐 문제의 정답을 맞췄나요?',
    R: '해당 단원의 보석 십자수를 완성했나요?'
  };

  const fetchUser = async (name) => {
    const { data } = await supabase.from('user_progress').select('*').eq('user_name', name).single();
    return data;
  };

  const handleNameSubmit = async () => {
    const existingUser = await fetchUser(inputName);
    setShowNameInput(false);
    if (existingUser) {
      setIsNewUser(false);
      setShowPasswordPrompt(true);
    } else {
      setIsNewUser(true);
      setShowPasswordPrompt(true);
    }
  };

  const handlePasswordSubmit = async () => {
    if (isNewUser) {
      const { data } = await supabase.from('user_progress').insert({
        user_name: inputName,
        password,
        cell_data: {}
      }).select().single();
      if (data) {
        setUserName(data.user_name);
        setUserId(data.id);
        setCellData(data.cell_data || {});
        setShowTable(true);
        setShowPasswordPrompt(false);
      }
    } else {
      const user = await fetchUser(inputName);
      if (user.password === password) {
        setUserName(user.user_name);
        setUserId(user.id);
        setCellData(user.cell_data || {});
        setShowTable(true);
        setShowPasswordPrompt(false);
      } else {
        alert('비밀번호가 틀렸습니다.');
      }
    }
  };

  const handleToggleCell = async (colIdx, rowIdx) => {
    const key = `${colIdx}-${rowIdx}`;
    const letter = cellWords[colIdx];
    const confirmMsg = cellMessages[letter];
    const confirmed = window.confirm(confirmMsg);
    if (!confirmed) return;

    const updated = { ...cellData };
    if (updated[key]) {
      delete updated[key];
    } else {
      updated[key] = true;
    }
    setCellData(updated);
    await supabase.from('user_progress').update({ cell_data: updated }).eq('id', userId);
  };

  const handleComplete = () => {
    setUserName('');
    setUserId(null);
    setCellData({});
    setShowTable(false);
    setShowNameInput(true);
  };

  useEffect(() => {
    if (Object.values(cellData).filter(Boolean).length === 20) {
      setTimeout(() => setShowCongrats(true), 300);
    }
  }, [cellData]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-100 to-yellow-300 flex flex-col items-center justify-center font-['Noto_Sans_KR']">
      {showNameInput && !showTable && (
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-8 text-yellow-900">⭐ Star Maker</h1>
          <input
            type="text"
            value={inputName}
            onChange={(e) => setInputName(e.target.value)}
            placeholder="이름을 입력하세요"
            className="p-3 border rounded w-64 mb-4"
          />
          <br />
          <button
            onClick={handleNameSubmit}
            className="px-6 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            이름 조회
          </button>
        </div>
      )}

      {showTable && (
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4 text-yellow-800">🌟 {userName}님의 STAR 학습표</h2>
          <div className="overflow-x-auto">
            <table className="border-collapse shadow-xl">
              <thead>
                <tr>
                  <th className="bg-yellow-300 p-2 border">영역</th>
                  {colTitles.map((title, idx) => (
                    <th key={idx} className="bg-yellow-300 p-2 border">{title}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rowTitles.map((rowTitle, rowIdx) => (
                  <tr key={rowIdx}>
                    <td className="bg-yellow-200 border p-2 font-semibold">{rowTitle}</td>
                    {colTitles.map((_, colIdx) => {
                      const key = `${colIdx}-${rowIdx}`;
                      const display = cellData[key] ? "★" : cellWords[colIdx];
                      return (
                        <td
                          key={key}
                          className="border text-center p-2 cursor-pointer hover:bg-yellow-100"
                          onClick={() => handleToggleCell(colIdx, rowIdx)}
                        >
                          {display}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-lg text-yellow-800 font-semibold">
            ⭐ 진행률: {Object.values(cellData).filter(Boolean).length} / 20
          </p>
          <button
            onClick={handleComplete}
            className="mt-6 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900"
          >
            완료
          </button>
        </div>
      )}

      {showPasswordPrompt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-sm text-center">
            <h2 className="text-lg font-semibold mb-4">
              {isNewUser ? '비밀번호 설정' : '비밀번호 입력'}
            </h2>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border p-2 w-full rounded mb-4"
              placeholder="비밀번호 입력"
            />
            <div className="flex justify-center space-x-4">
              <button onClick={() => setShowPasswordPrompt(false)} className="bg-gray-300 px-4 py-2 rounded">취소</button>
              <button onClick={handlePasswordSubmit} className="bg-yellow-500 text-white px-4 py-2 rounded">
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {showCongrats && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center z-50">
          <div className="text-yellow-400 text-8xl animate-bounce mb-6">🌟</div>
          <h1 className="text-white text-3xl font-bold">당신은 이제 STAR</h1>
          <button
            onClick={() => setShowCongrats(false)}
            className="mt-6 px-6 py-2 bg-white text-yellow-700 font-semibold rounded hover:bg-yellow-100"
          >
            닫기
          </button>
        </div>
      )}
    </div>
  );
}
