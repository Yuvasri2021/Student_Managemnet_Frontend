import { useEffect, useState } from 'react';
import API from '../api/axios';

const Students = () => {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    API.get('/students').then(res => setStudents(res.data));
  }, []);

  return (
    <div>
      <h2>Students</h2>
      {students.map(s => (
        <p key={s._id}>{s.name} - {s.department}</p>
      ))}
    </div>
  );
};

export default Students;
