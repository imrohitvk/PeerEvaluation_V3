import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileMenu from '../components/User/ProfileMenu';
import { FaBook, FaClipboardList, FaLaptopCode } from 'react-icons/fa';
import { showMessage } from '../utils/Message';

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState('home');
  const [user, setUser] = useState({ name: '', email: '', role: '' });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dashboardStats, setDashboardStats] = useState({ courses: 0, pendingEvaluations: 0, activeExams: 0 });
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [availableBatches, setAvailableBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const navigate = useNavigate();


  useEffect(() => {
    // Remove body background, handled by container now
    document.body.style.background = '';
    document.body.style.margin = '0';
    document.body.style.minHeight = '100vh';
    return () => {
      document.body.style.margin = '';
      document.body.style.minHeight = '';
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');

    fetch('http://localhost:5000/api/auth/profile', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        if (data?._id) setUser(data);
        else navigate('/login');
      })
      .catch(() => navigate('/login'));
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/student/dashboard-stats', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();

        if (
          typeof data === 'object' &&
          data !== null &&
          'coursesEnrolled' in data &&
          'pendingEvaluations' in data &&
          'activeExams' in data
        ) {
          setDashboardStats({
            courses: data.coursesEnrolled,
            pendingEvaluations: data.pendingEvaluations,
            activeExams: data.activeExams,
          });
        } else {
          console.error('Invalid dashboard stats response:', data);
          setDashboardStats({ courses: 0, pendingEvaluations: 0, activeExams: 0 });
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
        setDashboardStats({ courses: 0, pendingEvaluations: 0, activeExams: 0 });
      }
    };

    fetchDashboardStats();
  }, []);

  // Fetch enrolled courses and available courses on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    // Fetch enrolled courses
    fetch('http://localhost:5000/api/student/enrolled-courses', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setEnrolledCourses(Array.isArray(data) ? data : []))
      .catch(() => setEnrolledCourses([]));
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    // Fetch all available courses
    fetch('http://localhost:5000/api/student/available-courses', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setAvailableCourses(Array.isArray(data) ? data : []))
      .catch(() => setAvailableCourses([]));
  }, []);

  // Fetch batches for selected course
  useEffect(() => {
    if (!selectedCourse) {
      setAvailableBatches([]);
      setSelectedBatch('');
      return;
    }
    const token = localStorage.getItem('token');
    fetch(`http://localhost:5000/api/student/course-batches/${selectedCourse}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setAvailableBatches(Array.isArray(data) ? data : []))
      .catch(() => setAvailableBatches([]));
  }, [selectedCourse]);

  // Handle enrollment request
  const handleEnrollmentRequest = async (e) => {
    e.preventDefault();
    // console.log('Enrollment request:', selectedCourse, selectedBatch);
    if (!selectedCourse || !selectedBatch) {
      showMessage('Please select both course and batch.');
      return;
    }
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:5000/api/student/request-enrollment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ courseId: selectedCourse, batchId: selectedBatch }),
      });
      const data = await response.json();
      if (response.ok) {
        showMessage(data.message, 'success');
      } else {
        showMessage(data.message || 'Failed to send enrollment request.', 'error');
      }
    } catch (error) {
      showMessage('Failed to send enrollment request.', 'error');
    }
    setSelectedCourse('');
    setSelectedBatch('');
  };

  const handleSidebarToggle = () => setSidebarOpen(open => !open);

  return (
    <div
      className={`student-dashboard-bg${sidebarOpen ? ' sidebar-open' : ''}`}
      style={{
        minHeight: '100vh',
        width: '100vw',
        background: 'linear-gradient(135deg, #ece9f7 0%, #c3cfe2 100%)',
        display: 'flex',
        flexDirection: 'row',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {/* Profile Icon Dropdown Top Right */}
      <div style={{
        position: 'fixed',
        top: 24,
        right: 36,
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
      }}>
        <ProfileMenu user={user} onLogout={logout} onProfile={() => setActiveTab('profile')} />
      </div>

      {/* Sidebar Toggle Button */}
      <button
        className="sidebar-toggle-btn"
        style={{
          position: 'absolute',
          top: '1rem',
          left: '1rem',
          zIndex: 1100,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '0.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.3rem',
          alignItems: 'center',
        }}
        onClick={handleSidebarToggle}
        aria-label="Toggle sidebar"
      >
        <span style={{ width: '30px', height: '3px', background: 'white', borderRadius: '2px' }}></span>
        <span style={{ width: '30px', height: '3px', background: 'white', borderRadius: '2px' }}></span>
        <span style={{ width: '30px', height: '3px', background: 'white', borderRadius: '2px' }}></span>
      </button>

      {/* Sidebar (collapsible) */}
      <div
        className={`student-dashboard-sidebar${sidebarOpen ? ' open' : ' collapsed'}`}
        style={{
          ...sidebarStyle,
          position: 'relative',
          height: 'auto',
          minHeight: '100vh',
          zIndex: 1,
          width: sidebarOpen ? '250px' : '60px',
          transition: 'width 0.3s ease',
        }}
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <h2 style={{ fontSize: sidebarOpen ? '1.6rem' : '0', fontWeight: 'bold', marginBottom: sidebarOpen ? '1rem' : '0', overflow: 'hidden', whiteSpace: 'nowrap' }}>Student Panel</h2>
        {sidebarOpen && (
          <>
            <button onClick={() => setActiveTab('home')} style={buttonStyle(activeTab === 'home')}>🏠 Home</button>
            <button onClick={() => setActiveTab('course')} style={buttonStyle(activeTab === 'course')}>📚 Courses & Enrollment</button>
            <button onClick={() => setActiveTab('exam')} style={buttonStyle(activeTab === 'exam')}>📋 Exams and Evaluation</button>
            <button onClick={logout} style={{ marginTop: 'auto', ...buttonStyle(false) }}>🚪 Logout</button>
          </>
        )}
      </div>

      {/* Main Content */}
      <main
        className={`student-dashboard-main${sidebarOpen ? ' sidebar-open' : ''}`}
        style={{
          ...mainStyle,
          marginLeft: 0,
          alignItems: 'stretch',
          justifyContent: 'center',
        }}
      >
        <div className="student-dashboard-content" style={{
          ...contentStyle,
          background: 'rgba(255,255,255,0.92)', // subtle card background
          boxShadow: '0 8px 32px rgba(60,60,120,0.18)', // slightly stronger shadow
          border: '1.5px solid #e3e6f0', // soft border for contrast
          maxWidth: 'none',
          width: '100%',
          height: '80vh',
          minHeight: '500px',
          margin: 'auto',
          display: 'block',
          padding: '3rem 4rem',
        }}>
          {activeTab === 'home' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', color: '#3f3d56' }}>
              <h2 style={{ ...sectionHeading, textAlign: 'center', marginBottom: '2rem' }}>
                Welcome to the Student Dashboard
              </h2>
              <div style={{ display: 'flex', justifyContent: 'space-around', width: '100%' }}>
                {/* Courses Enrolled Card */}
                <div style={{ textAlign: 'center', padding: '1rem', borderRadius: '12px', background: 'linear-gradient(135deg, #667eea, #764ba2)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '200px', color: '#fff' }}>
                  <FaBook size={40} style={{ marginBottom: '0.5rem' }} />
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Courses Enrolled</h3>
                  <p style={{ fontWeight: 'bold', fontSize: '1.2rem' }}> {dashboardStats.courses} </p>
                </div>
                {/* Pending Evaluations Card */}
                <div style={{ textAlign: 'center', padding: '1rem', borderRadius: '12px', background: 'linear-gradient(135deg, #32cd32, #125e12)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '230px', color: '#fff' }}>
                  <FaClipboardList size={40} style={{ marginBottom: '0.5rem' }} />
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Pending Evaluations</h3>
                  <p style={{ fontWeight: 'bold', fontSize: '1.2rem' }}> {dashboardStats.pendingEvaluations} </p>
                </div>
                {/* Active Exams Card */}
                <div style={{ textAlign: 'center', padding: '1rem', borderRadius: '12px', background: 'linear-gradient(135deg, #43cea2, #185a9d)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '200px', color: '#fff' }}>
                  <FaLaptopCode size={40} style={{ marginBottom: '0.5rem' }} />
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Active Exams</h3>
                  <p style={{ fontWeight: 'bold', fontSize: '1.2rem' }}> {dashboardStats.activeExams} </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', color: '#2d3559', height: '100%' }}>
              <h2 style={{ ...sectionHeading, marginTop: 0, marginBottom: '2rem', textAlign: 'left' }}>Profile</h2>
              <p style={{ fontSize: '1.2rem', margin: '0.5rem 0' }}><strong>Name:</strong> {user.name}</p>
              <p style={{ fontSize: '1.2rem', margin: '0.5rem 0' }}><strong>Email:</strong> {user.email}</p>
              <p style={{ fontSize: '1.2rem', margin: '0.5rem 0' }}>
                <strong>Role:</strong> {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </p>
              <div style={{ marginTop: 'auto' }}>
                <button
                  onClick={() => navigate('/change-password')}
                  style={{
                    background: ' #5c5470',
                    // background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: '1rem',
                    padding: '0.85rem 1.5rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(60,60,120,0.12)',
                    transition: 'background 0.2s',
                  }}
                >
                  Change Password
                </button>
              </div>
            </div>
          )}

          {activeTab === 'course' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#2d3559', width: '100%' }}>
              <h2 style={{ ...sectionHeading, marginTop: 0, marginBottom: '2rem', textAlign: 'left', color: ' #4b3c70', width: '100%' }}>
                Courses & Enrollment
              </h2>

              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '1rem',
                justifyContent: 'center',
                width: '100%'
              }}>
                {/* Enrolled Courses Section */}
                <div style={{
                  flex: 1,
                  minWidth: 190,
                  maxWidth: 500,
                  borderRadius: '18px',
                  boxShadow: '0 4px 16px rgba(60,60,120,0.10)',
                  padding: '2rem 2.5rem',
                  border: '1.5px solid #4b3c70',
                }}>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '1.2rem', letterSpacing: '0.5px' }}>
                    Enrolled Courses
                  </h3>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {enrolledCourses.length === 0 ? (
                      <li style={{ fontStyle: 'italic' }}>No enrolled courses found.</li>
                    ) : (
                      enrolledCourses.map((item, idx) => (
                        <li key={idx} style={{
                          marginBottom: '0.75rem',
                          padding: '0.85rem 1.2rem',
                          background: '#fff',
                          borderRadius: '8px',
                          boxShadow: '0 2px 8px #4b3c70',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          color: ' #2d3559'
                        }}>
                          <span style={{ fontWeight: 600 }}>{item.courseName}</span>
                          <span style={{
                            color: '#fff',
                            background: ' #4b3c70',
                            borderRadius: '6px',
                            padding: '0.3rem 1rem',
                            fontWeight: 500,
                            fontSize: '0.98rem'
                          }}>
                            Batch: {item.batchName}
                          </span>
                        </li>
                      ))
                    )}
                  </ul>
                </div>

                {/* Enrollment Request Section */}
                <div style={{
                  flex: 1.3,
                  minWidth: 200,
                  maxWidth: 600,
                  borderRadius: '18px',
                  boxShadow: '0 4px 16px rgba(60,60,120,0.10)',
                  padding: '2rem 2.5rem',
                  border: '1.5px solid #4b3c70',
                }}>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '1.2rem', letterSpacing: '0.5px' }}>
                    New Enrollment
                  </h3>
                  <form style={{ display: 'flex', flexDirection: 'row', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }} onSubmit={handleEnrollmentRequest}>
                    <div style={{ position: 'relative' }}>
                      <select
                        value={selectedCourse}
                        onChange={e => setSelectedCourse(e.target.value)}
                        style={{
                          padding: '0.6rem 1.2rem',
                          borderRadius: '8px',
                          border: '1.5px solid #4b3c70',
                          fontSize: '1rem',
                          background: '#fff',
                          color: '#000',
                          fontWeight: 500,
                          minWidth: '160px',
                          transition: 'background 0.2s',
                          outline: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        <option value="">Select Course</option>
                        {availableCourses.map(course => (
                          <option key={course._id} value={course._id}>
                            {course.courseName} ({course.courseId})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div style={{ position: 'relative' }}>
                      <select
                        value={selectedBatch}
                        onChange={e => setSelectedBatch(e.target.value)}
                        style={{
                          padding: '0.6rem 1.2rem',
                          borderRadius: '8px',
                          border: '1.5px solid #4b3c70',
                          fontSize: '1rem',
                          background: selectedBatch ? ' #ffffff' : ' #f5f6fa',
                          color: selectedBatch ? ' #000000' : ' #000000',
                          fontWeight: 500,
                          minWidth: '160px',
                          transition: 'background 0.2s',
                          outline: 'none',
                          cursor: selectedCourse ? 'pointer' : 'not-allowed',
                          opacity: selectedCourse ? 1 : 0.6,
                        }}
                        disabled={!selectedCourse}
                      >
                        <option value="">Select Batch</option>
                        {availableBatches.map(batch => (
                          <option key={batch._id} value={batch._id}>{batch.batchId}</option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="submit"
                      style={{
                        background: selectedCourse && selectedBatch ? ' #4b3c70' : ' #a0a0a0',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '0.7rem 1.7rem',
                        fontWeight: 600,
                        fontSize: '1rem',
                        cursor: selectedCourse && selectedBatch ? 'pointer' : 'not-allowed',
                        boxShadow: '0 2px 8px rgba(60,60,120,0.12)',
                      }}
                      disabled={!(selectedCourse && selectedBatch)}
                    >
                      Enroll
                    </button>
                  </form>

                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'exam' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', color: '#2d3559' }}>
            <h2 style={{ ...sectionHeading, marginTop: 0, marginBottom: '2rem', textAlign: 'left', color: '#3f3d56' }}>Exams & Evaluation</h2>
            <p style={{ color: '#3f3d56' }}>Implement exams listing and evaluation details here.</p>
          </div>
          )}
        </div>
      </main>

      {/* Responsive styles */}
      <style>
        {`
        html, body, #root {
          height: 100%;
          width: 100%;
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          background: none !important;
          overflow: hidden !important;
        }
        body {
          background: none !important;
        }
        .student-dashboard-bg {
          min-height: 100vh;
          width: 100vw;
          background: linear-gradient(135deg, #ece9f7 0%, #c3cfe2 100%);
          display: flex;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          box-sizing: border-box;
          overflow: hidden;
        }
        .student-dashboard-container {
          display: flex;
          min-height: 100vh;
          width: 100%;
          position: relative;
        }
        .student-dashboard-sidebar {
          position: relative;
          top: 0;
          left: 0;
          height: auto;
          min-height: 100vh;
          z-index: 1;
        }
        .sidebar-toggle-btn {
          display: none;
        }
        .student-dashboard-main {
          flex: 1;
          margin-left: 0;
          transition: margin-left 0.3s;
        }
        @media (max-width: 900px) {
          .student-dashboard-sidebar {
            width: 220px;
            padding: 1.5rem 0.75rem;
          }
          .student-dashboard-main {
            margin-left: 220px;
            padding: 1rem;
          }
        }
        @media (max-width: 700px) {
          .student-dashboard-sidebar {
            left: -260px;
            width: 220px;
            border-radius: 0 20px 20px 0;
            box-shadow: 4px 0 12px rgba(0,0,0,0.1);
            transition: left 0.3s;
          }
          .student-dashboard-sidebar.open {
            left: 0;
          }
          .sidebar-toggle-btn {
            display: block;
            position: fixed;
            top: 1.2rem;
            left: 1.2rem;
            z-index: 1100;
            background: #3f3d56;
            color: white;
            border: none;
            border-radius: 8px;
            padding: 0.5rem 0.8rem;
            cursor: pointer;
          }
          .student-dashboard-main {
            margin-left: 0;
            padding: 1rem;
            transition: margin-left 0.3s;
          }
          .student-dashboard-main.sidebar-open {
            /* Optionally add overlay effect or dim background */
          }
        }
        @media (max-width: 600px) {
          .student-dashboard-content {
            padding: 1rem;
            max-width: 100%;
          }
          .student-dashboard-sidebar {
            padding: 1rem 0.5rem;
            width: 180px;
          }
        }
      `}
      </style>
    </div>
  );
}

const containerStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  minHeight: '100vh',
  minWidth: '100vw',
  height: '100vh',
  width: '100vw',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #ece9f7 0%, #c3cfe2 100%)',
  padding: '2rem',
  boxSizing: 'border-box',
  zIndex: 0
};

const sidebarStyle = {
  width: '250px',
  // background: '#3f3d56',
  background: 'linear-gradient(90deg, #3f3d56 0%, #5c5470 100%)',
  color: 'white',
  padding: '2rem 1rem',
  borderTopRightRadius: '20px',
  borderBottomRightRadius: '20px',
  boxShadow: '4px 0 12px rgba(0,0,0,0.1)',
  display: 'flex',
  flexDirection: 'column',
  gap: '1.25rem',
  minWidth: 0,
  boxSizing: 'border-box',
  height: '100vh',
  position: 'fixed',
  top: 0,
  left: 0,
  zIndex: 1000,
};

const mainStyle = {
  flex: 1,
  padding: '3rem 2rem',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-start',
  minWidth: 0,
  boxSizing: 'border-box',
  marginLeft: '250px',
  transition: 'margin-left 0.3s',
};

const contentStyle = {
  background: '#ffffff',
  borderRadius: '20px',
  boxShadow: '0 8px 32px rgba(60,60,120,0.12)',
  padding: '2rem',
  width: '100%',
  height: '80vh',
  minHeight: '500px',
  margin: 'auto',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  boxSizing: 'border-box',
};

const sidebarToggleBtnStyle = {
  display: 'none', // will be overridden by CSS media queries
};

function buttonStyle(active) {
  return {
    background: active ? '#4a4e69' : 'transparent',
    color: 'white',
    padding: '0.75rem 1rem',
    textAlign: 'left',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 500,
    borderRadius: '8px',
    transition: 'background 0.2s ease',
    fontSize: '1rem',
    textTransform: 'capitalize',
    width: '100%',
    boxSizing: 'border-box'
  };
}

const sectionHeading = {
  fontSize: '1.8rem',
  fontWeight: 'bold',
  color: '#3f3d56',
  marginBottom: '1.25rem'
};
