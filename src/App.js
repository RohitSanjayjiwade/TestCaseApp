import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import './App.css';

// Custom hook for debouncing
const useDebounce = (callback, delay) => {
  const debounceTimerRef = useRef(null);

  const debounce = (...args) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  };

  return debounce;
};

function App() {
  const [testCases, setTestCases] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const testCasesRef = useRef(testCases);

  useEffect(() => {
    fetchTestCases();
  }, []);

  useEffect(() => {
    testCasesRef.current = testCases;
  }, [testCases]);

  const fetchTestCases = async () => {
    try {
      const res = await axios.get('http://localhost:5000/testcases');
      setTestCases(res.data);
    } catch (error) {
      console.error('Error fetching test cases:', error);
    }
  };

  const handleChange = (e, id) => {
    const { name, value } = e.target;
    setEditingId(id); // Set the ID of the test case being edited

    // Update the test case locally
    setTestCases((prev) =>
      prev.map((tc) => (tc.id === id ? { ...tc, [name]: value, last_updated: new Date().toLocaleString() } : tc))
    );

    // Debounce the save operation
    debounceSave(id);
  };

  const handleSave = async (id) => {
    // Find the updated test case from the ref
    const updatedCase = testCasesRef.current.find((tc) => tc.id === id);

    if (updatedCase) {
      console.log('Saving:', updatedCase); // Debugging: Log the test case being saved
      try {
        await axios.put(`http://localhost:5000/testcases/${id}`, {
          test_case_name: updatedCase.test_case_name,
          description: updatedCase.description,
          status: updatedCase.status,
          estimate_time: updatedCase.estimate_time,
          module: updatedCase.module,
          priority: updatedCase.priority,
          last_updated: updatedCase.last_updated,
        });
        setEditingId(null); // Reset the ID after saving
      } catch (error) {
        console.error('Error saving test case:', error);
      }
    }
  };

  // Using the debounce hook
  const debounceSave = useDebounce(handleSave, 1000);

  return (
    <div className="container">
      <h1>Test Cases</h1>
      <div className="search-container">
        <input type="text" placeholder="Search issue..." className="search-bar" />
        <button className="search-button">🔍</button>
      </div>
      <div className='container-2'>
        <div>
          <p className="filter-bar">Filter</p>
        </div>
        <table className="testcases-table">
          <thead>
            <tr>
              <th>Test Case Name</th>
              {/* <th>Description</th> */}
              <th>Estimate Time</th>
              <th>Module</th>
              <th>Priority</th>
              <th>Status</th>
              {/* <th>Last Updated</th> */}
            </tr>
          </thead>
          <tbody>
            {testCases.map((tc) => (
              <tr key={tc.id}>
                <td>
                  <input
                    name="test_case_name"
                    value={tc.test_case_name}
                    onChange={(e) => handleChange(e, tc.id)}
                    className='testcases-table-i'
                  />
                  <div className='textarea-1'>
                    <textarea
                      name="description"
                      value={tc.description}
                      className='chat-window'
                      onChange={(e) => handleChange(e, tc.id)}
                    />
                    <h6 className='h6'>{tc.last_updated}</h6>
                  </div>
                </td>
                <td>
                  <input
                    type="text"
                    name="estimate_time"
                    value={`${tc.estimate_time} Minutes`.replace(' Minutes', '')}
                    onChange={(e) => handleChange(e, tc.id)}
                    className='testcases-table-in'
                  />
                </td>
                <td>
                  <input
                    name="module"
                    value={tc.module}
                    onChange={(e) => handleChange(e, tc.id)}
                    className='testcases-table-in'
                  />
                </td>
                <td>
                  <input
                    name="priority"
                    value={tc.priority}
                    onChange={(e) => handleChange(e, tc.id)}
                    className='testcases-table-in'
                  />
                </td>
                <td>
                  <select
                    name="status"
                    value={tc.status}
                    onChange={(e) => handleChange(e, tc.id)}
                  >
                    <option selected disabled>SELECT</option>
                    <option value="true">PASS</option>
                    <option value="false">FAIL</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
