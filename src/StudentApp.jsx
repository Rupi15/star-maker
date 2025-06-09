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
  const [alreadyStar, setAlreadyStar] = useState(false);

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
    const { data, error } = await supabase.from('user_progress').select('*').eq('user_name', name).maybeSingle();
    if (error) {
      console.error('Error fetching user:', error);
    }
    return data;
  };

  const handleNameSubmit = async () => {
    const existingUser = await fetchUser(inputName);
    setShowNameInput(false);
    if (existingUser) {
      setIsNewUser(false);
      setPassword('');
      setShowPasswordPrompt(true);
    } else {
      setIsNewUser(true);
      setPassword('');
      setShowPasswordPrompt(true);
    }
  };

  const handlePasswordSubmit = async () => {
    if (isNewUser) {
      const { data, error } = await supabase.from('user_progress')
        .insert({ user_name: inputName, password, cell_data: {} })
        .select()
        .single();
      if (error) {
        console.error('Error inserting new user:', error);
        return;
      }
      setUserName(data.user_name);
      setUserId(data.id);
      setCellData(data.cell_data || {});
      setShowTable(true);
      setShowPasswordPrompt(false);
    } else {
      const user = await fetchUser(inputName);
      if (user && user.password === password) {
        setUserName(user.user_name);
        setUserId(user.id);
        setCellData(user.cell_data || {});
        setShowTable(true);
        setShowPasswordPrompt(false);
        if (Object.values(user.cell_data || {}).filter(Boolean).length === 20) {
          setAlreadyStar(true);
        }
      } else {
        alert('비밀번호가 틀렸습니다.');
      }
    }
  };

  const handleToggleCell = async (colIdx, rowIdx) => {
    const key = `${colIdx}-${rowIdx}`;
    const letter = cellWords[colIdx];

    if (cellData[key]) {
      const confirmed = window.confirm('재학습하시겠습니까?');
      if (!confirmed) return;
    } else {
      const confirmMsg = cellMessages[letter];
      const confirmed = window.confirm(confirmMsg);
      if (!confirmed) return;
    }

    const updated = { ...cellData };
    if (updated[key]) {
      delete updated[key];
    } else {
      updated[key] = true;
    }
    setCellData(updated);

    const { error } = await supabase.from('user_progress').update({ cell_data: updated }).eq('id', userId);
    if (error) {
      console.error('Error updating cell data:', error);
    }

    if (Object.values(updated).filter(Boolean).length === 20) {
      setShowCongrats(true);
    } else {
      setAlreadyStar(false);
    }
  };

  const handleComplete = () => {
    setUserName('');
    setUserId(null);
    setCellData({});
    setShowTable(false);
    setShowNameInput(true);
    setShowCongrats(false);
    setShowPasswordPrompt(false);
    setAlreadyStar(false);
    setInputName('');
    setPassword('');
  };

  const progressCount = Object.values(cellData).filter(Boolean).length;

  return (
    <div className="min-h-screen flex items-center justify-center font-['Noto_Sans_KR'] p-4">
      <div className="flex flex-col items-center justify-center w-full max-w-6xl text-center">
        <h1 className="text-5xl font-bold text-yellow-900 mb-10">⭐ Star Maker ⭐</h1>

        {showNameInput && !showTable && (
          <div>
            <p className="mb-2 text-yellow-800">이름을 입력하세요</p>
            <div className="flex justify-center mb-4">
              <input
                type="text"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                className="p-3 border rounded-l w-64"
              />
              <button
                onClick={handleNameSubmit}
                className="px-6 py-3 bg-yellow-500 text-white rounded-r hover:bg-yellow-600"
              >
                이름 조회
              </button>
            </div>
          </div>
        )}

        {showPasswordPrompt && (
          <div>
            <p className="mb-2 text-yellow-800">
              {isNewUser ? '비밀번호를 설정해주세요.' : '설정한 비밀번호를 입력하세요.'}
            </p>
            <div className="flex justify-center mb-4">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="p-3 border rounded"
              />
              <button
                onClick={handlePasswordSubmit}
                className="ml-2 px-6 py-3 bg-yellow-500 text-white rounded hover:bg-yellow-600"
              >
                확인
              </button>
            </div>
          </div>
        )}

        {showTable && !showCongrats && (
          <div className="w-full px-4">
            {alreadyStar && (
              <div className="text-2xl text-yellow-800 font-bold mb-2">당신은 이미 STAR</div>
            )}
            <h2 className="text-2xl font-semibold text-yellow-900 mb-4">{userName}님의 STAR 학습표</h2>
            <p className="text-lg mb-4 text-yellow-800">⭐ 진행률: {progressCount} / 20</p>
            <div className="overflow-x-auto max-w-5xl mx-auto">
               <table
                className="border-separate shadow-xl w-full border border-black text-center"
                style={{ borderSpacing: '3mm' }}
              >
                <thead>
                  <tr>
                    <th className="bg-yellow-300 p-6 border text-xl">영역</th>
                    {colTitles.map((title, idx) => (
                      <th key={idx} className="bg-yellow-300 p-6 border text-xl">{title}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rowTitles.map((rowTitle, rowIdx) => (
                    <tr key={rowIdx}>
                      <td className="bg-yellow-200 border p-6 text-lg font-semibold whitespace-nowrap">{rowTitle}</td>
                      {colTitles.map((_, colIdx) => {
                        const key = `${colIdx}-${rowIdx}`;
                        const display = cellData[key] ? "★" : cellWords[colIdx];
                        return (
                          <td
                            key={key}
                            className="border text-center p-6 text-2xl cursor-pointer hover:bg-yellow-100"
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
            <button
              onClick={handleComplete}
              className="mt-6 px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-900"
            >
              완료
            </button>
          </div>
        )}

        {showCongrats && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center z-50 text-center">
            <div
              className="text-yellow-400 text-8xl leading-tight mb-4 font-mono"
              style={{ whiteSpace: 'pre' }}
            >
              {`      ☆
☆ ☆ ☆ ☆
  ☆ ☆ ☆
☆         ☆`}
            </div>
            <h1 className="text-white text-4xl font-bold mt-2">당신은 이제 STAR</h1>
            <p className="text-white text-lg mt-4">⭐ 진행률: {progressCount} / 20</p>
            <button
              onClick={handleComplete}
              className="mt-6 px-6 py-2 bg-white text-yellow-700 font-semibold rounded hover:bg-yellow-100"
            >
              닫기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
