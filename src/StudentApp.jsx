import { useEffect, useState } from 'react';
// import { supabase } from './supabaseClient';
import './App.css';

// Supabase 모의 객체 (실제 환경에서는 위의 import를 사용)
const supabase = {
  from: (table) => ({
    select: (fields) => ({
      eq: (field, value) => ({
        single: () => Promise.resolve({ data: null })
      })
    }),
    insert: (data) => ({
      select: () => ({
        single: () => Promise.resolve({ data: { id: 1, user_name: data.user_name, password: data.password, cell_data: data.cell_data } })
      })
    }),
    update: (data) => ({
      eq: (field, value) => Promise.resolve()
    })
  })
};

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
    const { data } = await supabase.from('user_progress').select('*').eq('user_name', name).single();
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
    await supabase.from('user_progress').update({ cell_data: updated }).eq('id', userId);

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
    <div className="min-h-screen bg-gradient-to-b from-yellow-100 to-yellow-300 flex items-center justify-center font-['Noto_Sans_KR'] p-4">
      <div className="flex flex-col items-center justify-center w-full max-w-6xl">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-yellow-900 mb-10">⭐ Star Maker ⭐</h1>

          {showNameInput && !showTable && (
            <div className="flex flex-col items-center">
              <p className="mb-4 text-lg text-yellow-800">이름을 입력하세요</p>
              <div className="flex justify-center mb-4">
                <input
                  type="text"
                  value={inputName}
                  onChange={(e) => setInputName(e.target.value)}
                  className="p-3 border rounded-l w-64 text-center"
                  placeholder="이름을 입력하세요"
                />
                <button
                  onClick={handleNameSubmit}
                  className="px-6 py-3 bg-yellow-500 text-white rounded-r hover:bg-yellow-600 transition-colors"
                >
                  이름 조회
                </button>
              </div>
            </div>
          )}

          {showPasswordPrompt && (
            <div className="flex flex-col items-center">
              <p className="mb-4 text-lg text-yellow-800">
                {isNewUser ? '비밀번호를 설정해주세요.' : '설정한 비밀번호를 입력하세요.'}
              </p>
              <div className="flex justify-center mb-4">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="p-3 border rounded w-64 text-center"
                  placeholder="비밀번호"
                />
                <button
                  onClick={handlePasswordSubmit}
                  className="ml-2 px-6 py-3 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
                >
                  확인
                </button>
              </div>
            </div>
          )}

          {showTable && !showCongrats && (
            <div className="w-full flex flex-col items-center">
              {alreadyStar && (
                <div className="text-2xl text-yellow-800 font-bold mb-4">당신은 이미 STAR</div>
              )}
              <h2 className="text-2xl font-semibold text-yellow-900 mb-4">{userName}님의 STAR 학습표</h2>
              <p className="text-lg mb-6 text-yellow-800">⭐ 진행률: {progressCount} / 20</p>
              
              <div className="w-full flex justify-center overflow-x-auto">
                <table className="border-collapse shadow-xl bg-white rounded-lg overflow-hidden">
                  <thead>
                    <tr>
                      <th className="bg-yellow-300 p-6 border text-xl min-w-[200px]">영역</th>
                      {colTitles.map((title, idx) => (
                        <th key={idx} className="bg-yellow-300 p-6 border text-xl w-32">{title}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rowTitles.map((rowTitle, rowIdx) => (
                      <tr key={rowIdx}>
                        <td className="bg-yellow-200 border p-6 text-lg font-semibold whitespace-nowrap text-left">
                          {rowTitle}
                        </td>
                        {colTitles.map((_, colIdx) => {
                          const key = `${colIdx}-${rowIdx}`;
                          const display = cellData[key] ? "★" : cellWords[colIdx];
                          return (
                            <td
                              key={key}
                              className="border text-center p-6 text-2xl cursor-pointer hover:bg-yellow-100 transition-colors bg-white"
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
                className="mt-8 px-8 py-3 bg-gray-800 text-white rounded hover:bg-gray-900 transition-colors font-semibold"
              >
                완료
              </button>
            </div>
          )}

          {showCongrats && (
            <div className="fixed inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center z-50">
              <div className="text-yellow-400 text-[8rem] leading-none mb-4 text-center">
                🌟🌟🌟<br/>🌟🌟🌟<br/>🌟🌟🌟
              </div>
              <h1 className="text-white text-4xl font-bold mt-2 text-center">당신은 이제 STAR</h1>
              <p className="text-white text-lg mt-4 text-center">⭐ 진행률: {progressCount} / 20</p>
              <button
                onClick={handleComplete}
                className="mt-6 px-8 py-3 bg-white text-yellow-700 font-semibold rounded hover:bg-yellow-100 transition-colors"
              >
                닫기
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}