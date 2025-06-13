import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';
import { showMessage } from '../utils/Message'; // Assuming you have a utility for showing messages
import { AppContext } from '../utils/AppContext';
import { useContext } from 'react';
import ProfileMenu from '../components/ProfileMenu';
import ScheduleExamOverlay from '../components/ScheduleExamOverlay';
import EnrollStudentsOverlay from '../components/EnrollStudentsOverlay';

export default function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState('home');
  const [user, setUser] = useState({ name: '', email: '', role: '' });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [coursesAndBatches, setCoursesAndBatches] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [filteredBatches, setFilteredBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [examOverlayOpen, setExamOverlayOpen] = useState(false);
  const [enrollOverlayOpen, setEnrollOverlayOpen] = useState(false); // State for enroll students overlay
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [exams, setExams] = useState([]); // State to manage exams
  const navigate = useNavigate();
  const { setRefreshApp } = useContext(AppContext);

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

  useEffect(() => {
    const fetchCoursesAndBatches = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/teacher/teacher-courses-batches', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();

        // Ensure the response is an array before setting state
        if (Array.isArray(data)) {
          setCoursesAndBatches(data);
        } else {
          console.error('Invalid response format:', data);
          setCoursesAndBatches([]); // Fallback to empty array
        }
      } catch (error) {
        console.error('Failed to fetch courses and batches:', error);
        setCoursesAndBatches([]); // Fallback to empty array
      }
    };

    fetchCoursesAndBatches();
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      const selectedCourse = coursesAndBatches.find(
        (course) => course.id === selectedCourseId
      );
      const batches = selectedCourse ? selectedCourse.batches : [];
      setFilteredBatches(batches);
      setSelectedBatchId(""); // Reset batch selection when course changes
    } else {
      setFilteredBatches([]);
      setSelectedBatchId("");
    }
  }, [selectedCourseId, coursesAndBatches]);

  // Fetch exams whenever the active tab is 'exam'
  useEffect(() => {
    if (activeTab === 'exam') {
      const fetchExams = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch('http://localhost:5000/api/teacher/teacher-exams', {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const data = await response.json();

          if (Array.isArray(data.exams)) {
            setExams(data.exams);
          } else {
            console.error('Invalid response format for exams:', data);
            setExams([]);
          }
        } catch (error) {
          console.error('Failed to fetch exams:', error);
          setExams([]);
        }
      };

      fetchExams();
    }
  }, [activeTab]);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  const handleSidebarToggle = () => setSidebarOpen(open => !open);
  
  // Added functionality to handle the role update request.
  const handleRoleUpdate = async (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const role = document.getElementById('role').value;

    if (!email || !role) {
      showMessage('Please provide both email and role.', 'error');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/update-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email, role }),
      });

      const data = await response.json();

      if (response.ok) {
        showMessage('Role updated successfully!', 'success');
        // Optionally, you can reset the form fields after successful update
        document.getElementById('email').value = '';
        document.getElementById('role').value = '';
        // setTimeout(() => setRefreshApp(true), 1000); // Adds a 1-second delay before refreshing the app
      } else {
        showMessage(`Error! ${data.message || 'Failed to update role.'}`, 'error');
      }
    } catch (error) {
      showMessage('An error occurred while updating the role.', 'error');
      console.error(error);
    }
  };

  const handleScheduleExam = () => {
    setExamOverlayOpen(true);
  };

  const handleExamOverlayClose = () => {
    setExamOverlayOpen(false);
  };

  // New handler for enrolling students
  const handleEnrollStudents = async ({ csvFile, course, batch }) => {
    const formData = new FormData();
    formData.append('file', csvFile);
    formData.append('course', course.id);
    formData.append('batch', batch.id);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/teacher/students-enroll', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        showMessage(`Success: ${data.message}`, 'success');
      } else if (response.status === 409) {
        const errorData = await response.json();
        showMessage(`Info: ${errorData.message}`, 'info'); // Display informational message
      } else {
        const errorData = await response.json();
        showMessage(`Error!  ${errorData.message}`, 'error');
      }
    } catch (error) {
      showMessage('An error occurred while enrolling students.', 'error');
      console.error(error);
    }

    setEnrollOverlayOpen(false);
  };

  // Handler for downloading the student list
  const downloadEnrolledStudents = async (courseId, batchId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/teacher/enrolled-students?courseId=${courseId}&batchId=${batchId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `students_${batchId}_${courseId}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        const errorData = await response.json();
        showMessage(`Error! ${errorData.message}`, 'error');
      }
    } catch (error) {
      showMessage('An error occurred while downloading the student list.', 'error');
      console.error(error);
    }
  };

  // Handler for submitting the exam schedule overlay
  const handleExamSubmit = async (formData) => {
    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('batch', formData.batch);
      formDataToSend.append('date', formData.date);
      formDataToSend.append('time', formData.time);
      formDataToSend.append('number_of_questions', formData.number_of_questions);
      formDataToSend.append('duration', formData.duration);
      formDataToSend.append('totalMarks', formData.totalMarks);
      formDataToSend.append('k', formData.k);
      if (formData.solutions) {
        formDataToSend.append('solutions', formData.solutions);
      }
      const response = await fetch('http://localhost:5000/api/teacher/exam-schedule', {
        method: 'POST',
        headers: {
          // 'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (response.ok) {
        const data = await response.json();
        showMessage(`Exam scheduled successfully: ${data.message}`, 'success');
      } else {
        const errorData = await response.json();
        showMessage(`Failed to schedule exam: ${errorData.message}`, 'error');
      }
    } catch (error) {
      showMessage('An error occurred while scheduling the exam.', 'error');
      console.error(error);
    }

    setExamOverlayOpen(false);
    // After scheduling, fetch the updated list of exams so the new one appears
    try {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:5000/api/teacher/teacher-exams', {
      method: 'GET',
      headers: {
      Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    if (Array.isArray(data.exams)) {
      setExams(data.exams);
    }
    } catch (error) {
    // Optionally handle error
    }
  };

  // Handler for editing an exam
  const handleEditExam = (exam) => {
    setSelectedCourseId(exam.course._id);
    setSelectedBatchId(exam.batch._id);
    setExamOverlayOpen(true);
    // Optionally, you can pre-fill the form fields with the exam data
    // For example:
    // setFormData({
    //   name: exam.name,
    //   date: exam.date.split('T')[0],
    //   time: exam.time,
    //   number_of_questions: exam.number_of_questions,
    //   duration: exam.duration,
    //   totalMarks: exam.totalMarks,
    //   k: exam.k,
    // });
  };

  function showDeleteExamDialog() {
    return new Promise((resolve) => {
      // Create overlay
      const overlay = document.createElement('div');
      overlay.style.position = 'fixed';
      overlay.style.top = 0;
      overlay.style.left = 0;
      overlay.style.width = '100vw';
      overlay.style.height = '100vh';
      overlay.style.background = 'rgba(0,0,0,0.45)';
      overlay.style.display = 'flex';
      overlay.style.alignItems = 'center';
      overlay.style.justifyContent = 'center';
      overlay.style.zIndex = 9999;

      // Create dialog
      const dialog = document.createElement('div');
      dialog.style.background = '#fff';
      dialog.style.borderRadius = '14px';
      dialog.style.boxShadow = '0 8px 32px rgba(192,57,43,0.18)';
      dialog.style.padding = '2rem 2.5rem';
      dialog.style.display = 'flex';
      dialog.style.flexDirection = 'column';
      dialog.style.alignItems = 'center';
      dialog.style.minWidth = '320px';

      const title = document.createElement('div');
      title.innerText = 'Delete Exam?';
      title.style.fontWeight = 'bold';
      title.style.fontSize = '1.3rem';
      title.style.color = '#c0392b';
      title.style.marginBottom = '0.7rem';

      const msg = document.createElement('div');
      msg.innerText = 'Are you sure you want to delete this exam? This action cannot be undone.';
      msg.style.color = '#3f3d56';
      msg.style.fontSize = '1.05rem';
      msg.style.marginBottom = '1.5rem';
      msg.style.textAlign = 'center';

      const btnRow = document.createElement('div');
      btnRow.style.display = 'flex';
      btnRow.style.gap = '1.5rem';

      const yesBtn = document.createElement('button');
      yesBtn.innerText = 'Delete';
      yesBtn.style.background = '#c0392b';
      yesBtn.style.color = '#fff';
      yesBtn.style.border = 'none';
      yesBtn.style.padding = '0.6rem 1.5rem';
      yesBtn.style.borderRadius = '8px';
      yesBtn.style.fontWeight = 'bold';
      yesBtn.style.cursor = 'pointer';
      yesBtn.style.fontSize = '1rem';

      const noBtn = document.createElement('button');
      noBtn.innerText = 'Cancel';
      noBtn.style.background = '#e3e6f0';
      noBtn.style.color = '#3f3d56';
      noBtn.style.border = 'none';
      noBtn.style.padding = '0.6rem 1.5rem';
      noBtn.style.borderRadius = '8px';
      noBtn.style.fontWeight = 'bold';
      noBtn.style.cursor = 'pointer';
      noBtn.style.fontSize = '1rem';

      yesBtn.onclick = () => {
        document.body.removeChild(overlay);
        resolve(true);
      };
      noBtn.onclick = () => {
        document.body.removeChild(overlay);
        resolve(false);
      };

      btnRow.appendChild(yesBtn);
      btnRow.appendChild(noBtn);

      dialog.appendChild(title);
      dialog.appendChild(msg);
      dialog.appendChild(btnRow);

      overlay.appendChild(dialog);
      document.body.appendChild(overlay);
    });
  }

  // Handler for deleting an exam
  const handleDeleteExam = async (examId) => {
    const confirmDelete = await showDeleteExamDialog();

    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/teacher/delete-exam/${examId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        showMessage('Exam deleted successfully!', 'success');
        setExams(exams.filter(exam => exam._id !== examId)); // Remove the deleted exam from the state
      } else {
        const errorData = await response.json();
        showMessage(`Error! ${errorData.message}`, 'error');
      }
    } catch (error) {
      showMessage('An error occurred while deleting the exam.', 'error');
      console.error(error);
    }
  };

  return (
    <div
      className={`teacher-dashboard-bg${sidebarOpen ? ' sidebar-open' : ''}`}
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
        className={`teacher-dashboard-sidebar${sidebarOpen ? ' open' : ' collapsed'}`}
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
        <h2 style={{ fontSize: sidebarOpen ? '1.6rem' : '0', fontWeight: 'bold', marginBottom: sidebarOpen ? '1rem' : '0', overflow: 'hidden', whiteSpace: 'nowrap' }}>Teacher Panel</h2>
        {sidebarOpen && (
          <>
            <button onClick={() => setActiveTab('home')} style={buttonStyle(activeTab === 'home')}>🏠 Home</button>
            <button onClick={() => setActiveTab('role')} style={buttonStyle(activeTab === 'role')}>🧑‍💼 Role Manager</button>
            <button onClick={() => setActiveTab('course')} style={buttonStyle(activeTab === 'course')}>📚 Courses</button>
            <button onClick={() => setActiveTab('exam')} style={buttonStyle(activeTab === 'exam')}>📝 Exams</button>
            <button onClick={logout} style={{ marginTop: 'auto', ...buttonStyle(false) }}>🚪 Logout</button>
          </>
        )}
      </div>

      {/* Main Content */}
      <main
        className={`teacher-dashboard-main${sidebarOpen ? ' sidebar-open' : ''}`}
        style={{
          ...mainStyle,
          marginLeft: 0,
          alignItems: 'stretch',
          justifyContent: 'center',
        }}
      >
        <div className="teacher-dashboard-content" style={{
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
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#3f3d56' }}>
              <h2 style={{ ...sectionHeading, marginBottom: '2rem' }}>Welcome to the Teacher Dashboard</h2>
            </div>
          )}

          {activeTab === 'profile' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', color: '#2d3559', height: '100%' }}>
              <h2 style={{ ...sectionHeading, marginTop: 0, marginBottom: '2rem', textAlign: 'left', color: '#3f3d56' }}>Profile</h2>
              <p style={{ fontSize: '1.2rem', margin: '0.5rem 0', color: '#3f3d56' }}><strong>Name:</strong> {user.name}</p>
              <p style={{ fontSize: '1.2rem', margin: '0.5rem 0', color: '#3f3d56' }}><strong>Email:</strong> {user.email}</p>
              <p style={{ fontSize: '1.2rem', margin: '0.5rem 0', color: '#3f3d56' }}>
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

          {activeTab === 'role' && (
            <div style={{ display: 'flex', flexDirection: 'column', color: '#2d3559' }}>
              <h2 style={{ ...sectionHeading, marginTop: 0, marginBottom: '2rem', textAlign: 'center', color: '#3f3d56' }}>Role Manager</h2>
              <p style={{textAlign: 'left', color: '#3f3d56' }}>Update the role of a user by providing their email ID and selecting a role.</p>
              <form onSubmit={handleRoleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%' }}>
                  <label style={{ color: '#3f3d56', fontWeight: 'bold', whiteSpace: 'nowrap', width: '150px', textAlign: 'left' }} htmlFor="email">Email ID</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Enter user email ID"
                    style={{
                      padding: '0.5rem',
                      borderRadius: '12px',
                      border: '1px solid #5c5470',
                      fontSize: '1rem',
                      width: '300px',
                      boxSizing: 'border-box',
                      background: '#ffffff',
                      color: ' #4b3c70',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%' }}>
                  <label style={{ color: '#3f3d56', fontWeight: 'bold', whiteSpace: 'nowrap', width: '150px', textAlign: 'left' }} htmlFor="role">Select Role</label>
                  <select
                    id="role"
                    name="role"
                    style={{
                      padding: '0.5rem',
                      borderRadius: '12px',
                      border: '1px solid #5c5470',
                      fontSize: '1rem',
                      width: '300px',
                      boxSizing: 'border-box',
                      background: '#ffffff',
                      color: ' #4b3c70',
                    }}
                  >
                    {/* <option value="admin">Admin</option> */}
                    {/* <option value="teacher">Teacher</option> */}
                    <option value="student">Student</option>
                    <option value="ta">TA</option>
                  </select>
                </div>

                <div style={{ display: 'flex', width: '100%', marginLeft: '150px' }}>
                  <button
                    type="submit"
                    style={{
                      background: '#5c5470',
                      border: 'none',
                      color: '#fff',
                      fontWeight: 600,
                      fontSize: '1rem',
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(60,60,120,0.12)',
                      transition: 'background 0.2s',
                    }}
                  >
                    Update Role
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'course' && (
            <div style={{ display: 'flex', flexDirection: 'column', color: '#2d3559', width: '100%' }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '2rem', color: '#3f3d56' }}>
                Courses and Batches
              </h2>

              <table style={{ width: '100%', borderCollapse: 'collapse', borderRadius: '12px', overflow: 'hidden' }}>
                <thead style={{ backgroundColor: '#4b3c70', color: '#ffffff' }}>
                  <tr>
                    <th style={{ padding: '12px', textAlign: 'center' }}>Course Name</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>Batch Name</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {coursesAndBatches.map((course) =>
                    course.batches.map((batch) => (
                      <tr key={batch.id} style={{ borderBottom: '1px solid #ddd' }}>
                        <td style={{ padding: '12px', color: '#3f3d56' }}>{course.name}</td>
                        <td style={{ padding: '12px', color: '#3f3d56' }}>{batch.name}</td>
                        <td style={{ padding: '12px' }}>
                          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button
                              onClick={() => {
                                setSelectedCourse(course);  // or course if you want full object
                                setSelectedBatch(batch);
                                setEnrollOverlayOpen(true);
                              }}
                              style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '8px',
                                backgroundColor: '#4b3c70',
                                color: '#ffffff',
                                border: 'none',
                                fontSize: '0.95rem',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                              }}
                            >
                              Enroll Students
                            </button>
                            <button
                              onClick={() => downloadEnrolledStudents(course.id, batch.id)}
                              style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '8px',
                                backgroundColor: '#4b3c70',
                                color: '#ffffff',
                                border: 'none',
                                fontSize: '0.95rem',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                              }}
                            >
                              Download List
                            </button>
                          </div>
                          
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
          
          {activeTab === 'exam' && (
            <div style={{ display: 'flex', flexDirection: 'column', color: '#2d3559', width: '100%' }}>
              <h2 style={{ ...sectionHeading, marginBottom: '2rem', textAlign: 'center', color: '#3f3d56' }}>
                Exam Management
              </h2>

              {/* Inline Row for Course, Batch Dropdowns, and Schedule Exam Button */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', width: '100%' }}>
                {/* Course Dropdown */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1 1 auto' }}>
                  <label style={{ color: '#3f3d56', fontWeight: 'bold', whiteSpace: 'nowrap' }} htmlFor="courseDropdown">Course</label>
                  <select
                    id="courseDropdown"
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    style={{
                      padding: '0.5rem',
                      borderRadius: '12px',
                      border: '1px solid #5c5470',
                      fontSize: '1rem',
                      width: '250px',
                      background: '#ffffff',
                      color: '#4b3c70',
                    }}
                  >
                    <option value="">Select Course</option>
                    {coursesAndBatches.map(course => (
                      <option key={course.id} value={course.id}>{course.name}</option>
                    ))}
                  </select>
                </div>

                {/* Batch Dropdown */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1 1 auto' }}>
                  <label style={{ color: '#3f3d56', fontWeight: 'bold', whiteSpace: 'nowrap' }} htmlFor="batchDropdown">Batch</label>
                  <select
                    id="batchDropdown"
                    value={selectedBatchId}
                    onChange={(e) => setSelectedBatchId(e.target.value)}
                    disabled={filteredBatches.length === 0}
                    style={{
                      padding: '0.5rem',
                      borderRadius: '12px',
                      border: '1px solid #5c5470',
                      fontSize: '1rem',
                      width: '250px',
                      background: filteredBatches.length > 0 ? '#ffffff' : '#f0f0f0',
                      color: filteredBatches.length > 0 ? '#4b3c70' : '#a0a0a0',
                    }}
                  >
                    <option value="">{filteredBatches.length > 0 ? 'Select Batch' : 'No Batches Available'}</option>
                    {filteredBatches.map(batch => (
                      <option key={batch.id} value={batch.id}>{batch.name}</option>
                    ))}
                  </select>
                </div>

                {/* Schedule Exam Button */}
                <button
                  onClick={handleScheduleExam}
                  disabled={!selectedCourseId || !selectedBatchId} // Button is disabled if either course or batch is not selected
                  style={{
                    padding: '0.6rem 1.2rem',
                    borderRadius: '12px',
                    backgroundColor: selectedCourseId && selectedBatchId ? '#4b3c70' : '#a0a0a0', // Change color based on enabled/disabled state
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    cursor: selectedCourseId && selectedBatchId ? 'pointer' : 'not-allowed', // Change cursor based on enabled/disabled state
                  }}
                >
                  Schedule Exam
                </button>
              </div>

              {/* List of Exams */}
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
                      {exams.map(exam => (
                        <tr key={exam._id} style={{ borderBottom: '1px solid #ddd' }}>
                          <td style={{ padding: '12px', color: '#3f3d56' }}>{exam.name}</td>
                          <td style={{ padding: '12px', color: '#3f3d56' }}>{exam.batch}</td>
                          <td style={{ padding: '12px', color: '#3f3d56' }}>{exam.date}</td>
                          <td style={{ padding: '12px', color: '#3f3d56' }}>{exam.time}</td>
                          <td style={{ padding: '12px', color: '#3f3d56' }}>{exam.number_of_questions}</td>
                          <td style={{ padding: '12px', color: '#3f3d56' }}>{exam.duration} mins</td>
                          <td style={{ padding: '12px', color: '#3f3d56' }}>{exam.totalMarks}</td>
                          <td style={{ padding: '12px', color: '#3f3d56' }}>{exam.k}</td>
                          <td style={{ padding: '12px', color: '#3f3d56' }}>{exam.total_students}</td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            {typeof exam.solutions === 'string' && exam.solutions.trim() !== '' ? (
                              <a href={`http://localhost:5000/${exam.solutions}`} target="_blank" rel="noopener noreferrer">View Solutions</a>
                            ) : (
                              'No Solutions Available'
                            )}
                          </td>
                          <td style={{ padding: '12px' }}>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                              <button
                                onClick={() => handleEditExam(exam)}
                                style={{
                                  padding: '0.5rem 1rem',
                                  borderRadius: '8px',
                                  color: ' #ffffff',
                                  background: 'none',
                                  border: '#2c3e50 1px solid',
                                  fontSize: '0.95rem',
                                  fontWeight: 'bold',
                                  cursor: 'pointer',
                                }}
                              >
                                <FaEdit style={{ color: 'rgb(2, 75, 30)', fontSize: '1.2rem' }}  />
                              </button>
                              <button
                                onClick={() => handleDeleteExam(exam._id)}
                                style={{
                                  padding: '0.5rem 1rem',
                                  borderRadius: '8px',
                                  color: ' #ffffff',
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
            </div>
          )}
          
        </div>
      </main>

      {/* Schedule Exam Overlay */}
      <ScheduleExamOverlay
        isOpen={examOverlayOpen}
        onClose={handleExamOverlayClose}
        onSubmit={handleExamSubmit}
        batch={selectedBatchId}
      />

      {/* Enroll Students Overlay */}
      <EnrollStudentsOverlay
        isOpen={enrollOverlayOpen}
        onClose={() => setEnrollOverlayOpen(false)}
        onSubmit={handleEnrollStudents}
        course={selectedCourse}
        batch={selectedBatch}
        closeOnOutsideClick={true} // Added prop to enable closing on outside click
      />

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
        .teacher-dashboard-bg {
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
        .teacher-dashboard-container {
          display: flex;
          min-height: 100vh;
          width: 100%;
          position: relative;
        }
        .teacher-dashboard-sidebar {
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
        .teacher-dashboard-main {
          flex: 1;
          margin-left: 0;
          transition: margin-left 0.3s;
        }
        @media (max-width: 900px) {
          .teacher-dashboard-sidebar {
            width: 220px;
            padding: 1.5rem 0.75rem;
          }
          .teacher-dashboard-main {
            margin-left: 220px;
            padding: 1rem;
          }
        }
        @media (max-width: 700px) {
          .teacher-dashboard-sidebar {
            left: -260px;
            width: 220px;
            border-radius: 0 20px 20px 0;
            box-shadow: 4px 0 12px rgba(0,0,0,0.1);
            transition: left 0.3s;
          }
          .teacher-dashboard-sidebar.open {
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
          .teacher-dashboard-main {
            margin-left: 0;
            padding: 1rem;
            transition: margin-left 0.3s;
          }
          .teacher-dashboard-main.sidebar-open {
            /* Optionally add overlay effect or dim background */
          }
        }
        @media (max-width: 600px) {
          .teacher-dashboard-content {
            padding: 1rem;
            max-width: 100%;
          }
          .teacher-dashboard-sidebar {
            padding: 1rem 0.5rem;
            width: 180px;
          }
        }
        @media (max-width: 700px) {
          div[style*="overflowY: 'auto'"]::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }

          div[style*="overflowY: 'auto'"]::-webkit-scrollbar-thumb {
            background-color: #d3d3d3; /* Light color for scrollbar thumb */
            border-radius: 4px;
          }

          div[style*="overflowY: 'auto'"]::-webkit-scrollbar-track {
            background-color: #f0f0f0; /* Light color for scrollbar track */
            border-radius: 4px;
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