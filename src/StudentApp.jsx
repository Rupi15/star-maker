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
    // ... 기존 UI 렌더링은 그대로 유지 ...
    <></>
  );
}
