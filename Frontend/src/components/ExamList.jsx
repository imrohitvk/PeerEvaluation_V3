import React from 'react';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';

const ExamList = ({ exams, handleEditClick, handleDeleteExam }) => {
  return (
    <div style={{ marginTop: '2rem', maxHeight: '350px', border: '1px solid #ddd', borderRadius: '12px' }}>
      <h3 style={{ color: '#3f3d56', fontWeight: 'bold', marginBottom: '1rem' }}>Exams</h3>
      <div style={{ maxHeight: '300px', overflowY: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <table style={{ width: '100%', overflowX: 'auto', overflowY: 'auto', borderCollapse: 'collapse', borderRadius: '12px' }}>
          <thead style={{ backgroundColor: '#4b3c70', color: '#ffffff', position: 'sticky', top: 0, zIndex: 1 }}>
            <tr>
              <th style={{ padding: '12px', textAlign: 'center' }}>Exam Name</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Batch</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Date</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Time</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>No. of questions</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Duration</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Total Marks</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>K</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Total Students</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Solutions</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {exams.map((exam) => (
              <tr key={exam._id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '12px', color: '#3f3d56' }}>{exam.name}</td>
                <td style={{ padding: '12px', color: '#3f3d56' }}>{exam.batch}</td>
                <td style={{ padding: '12px', color: '#3f3d56' }}>
                  {new Date(exam.date).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                  })}
                </td>
                <td style={{ padding: '12px', color: '#3f3d56' }}>{exam.time}</td>
                <td style={{ padding: '12px', color: '#3f3d56' }}>{exam.number_of_questions}</td>
                <td style={{ padding: '12px', color: '#3f3d56' }}>{exam.duration} mins</td>
                <td style={{ padding: '12px', color: '#3f3d56' }}>{exam.totalMarks}</td>
                <td style={{ padding: '12px', color: '#3f3d56' }}>{exam.k}</td>
                <td style={{ padding: '12px', color: '#3f3d56' }}>{exam.total_students}</td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  {typeof exam.solutions === 'string' && exam.solutions.trim() !== '' ? (
                    <a href={`http://localhost:5000/${exam.solutions}`} target="_blank" rel="noopener noreferrer">
                      View Solutions
                    </a>
                  ) : (
                    'No Solutions Available'
                  )}
                </td>
                <td style={{ padding: '12px' }}>
                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button
                      onClick={() => handleEditClick(exam)}
                      style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        color: '#ffffff',
                        background: 'none',
                        border: '#2c3e50 1px solid',
                        fontSize: '0.95rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                      }}
                    >
                      <FaEdit style={{ color: 'rgb(2, 75, 30)', fontSize: '1.2rem' }} />
                    </button>
                    <button
                      onClick={() => handleDeleteExam(exam._id)}
                      style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        color: '#ffffff',
                        background: 'none',
                        border: '#c0392b 1px solid',
                        fontSize: '0.95rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                      }}
                      title="Delete"
                    >
                      <FaTrashAlt style={{ color: '#c0392b', fontSize: '1.2rem' }} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExamList;