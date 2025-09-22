import { useState } from 'react'
import axios from 'axios'
import './App.css'
import "bootstrap/dist/css/bootstrap.min.css";


function App() {
  const [questions, setQuestion] = useState("");
  const [answers, setAnswers] = useState("");

 async function generateAnswers(){
  setAnswers("Loading...")
   const response = await axios({
      url: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyDkWiSorvtIEVEyj7cjT_XYfbb-QEKoino",
      method: "post",
      data: {
    "contents": [
      {
        "parts": [
          {
            "text": questions
          }
        ]
      }
    ]
  }
  });
  setAnswers((response["data"]["candidates"][0]["content"]["parts"][0]["text"]))
  }

  return (
    <>
  <div className="container mt-4" style={{ maxWidth: "1400px" }}>
  <h2 className="text-center mb-4">BUIQ AI ChatBot</h2>

  <div className="card shadow p-4 mb-3" style={{ background: "#f7f7f8" }}>
    <div className="mb-3">
      <label htmlFor="questionBox" className="form-label fw-bold">
        Ask me anything:
      </label>
      <textarea
        id="questionBox"
        className="form-control mb-3"
        value={questions}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Type your question here..."
        rows={3}
        cols={18}
      ></textarea>
      <button
        className="btn btn-primary w-100"
        onClick={generateAnswers}
      >
        Generate Answer
      </button>
    </div>

    
    {answers && (
      <div className="mt-3 d-flex">
        <div
          className="p-3 rounded"
          style={{
            background: "#e2e3ff",
            color: "#1a1a1a",
            maxWidth: "100%",
          }}
        >
          {answers}
        </div>
      </div>
    )}
  </div>
</div>


</>

  )
}

export default App


