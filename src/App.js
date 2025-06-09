import './index.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import StudentApp from './StudentApp.jsx';
import TeacherApp from './TeacherApp.jsx';


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ✅ 기본 경로는 /student로 자동 리디렉션 */}
        <Route path="/" element={<Navigate to="/student" replace />} />
        <Route path="/student" element={<StudentApp />} />
        <Route path="/teacher" element={<TeacherApp />} />
        <Route path="*" element={<div>404 - 페이지를 찾을 수 없습니다</div>} />
      </Routes>
    </BrowserRouter>
  );
}

