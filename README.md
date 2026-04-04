# 🛡️ RainShield AI  
### Smart Income Protection for Gig Economy Workers  

---

## 📌 Overview  

RainShield AI is an AI-powered parametric insurance platform designed to protect gig workers—especially delivery partners—from income loss caused by environmental disruptions such as heavy rainfall, extreme heat, and pollution.  

The system eliminates manual claim processes by using real-time data and automated triggers to ensure **instant payouts**.

---

## 🎯 Problem Statement  

Gig workers depend on daily earnings, which are highly affected by:

- 🌧️ Heavy rainfall  
- 🌡️ Extreme temperature conditions  
- 🌫️ High pollution levels  
- 📉 Reduced demand during disruptions  

### ❗ Current Challenges  

- ❌ No system compensates income loss  
- ❌ Traditional insurance is slow and complex  

---

## 💡 Solution  

RainShield AI introduces **parametric insurance**, where claims are automatically triggered based on predefined environmental conditions.

### ✅ Key Benefits  

- No paperwork  
- No manual claims  
- Instant compensation  

---

## ⚙️ How It Works  

1. 👤 User registers as a delivery partner  
2. 📅 Selects a weekly insurance plan  
3. 🤖 System calculates risk-based premium  
4. 🌐 Platform monitors environmental data  
5. 🚨 Threshold crossed → claim triggered automatically  
6. 💸 Payout credited instantly  

---

## 🌦️ Parametric Triggers  

| Condition        | Threshold          | Payout |
|-----------------|-------------------|--------|
| Heavy Rain      | > 50 mm rainfall  | ₹300   |
| Extreme Heat    | > 40°C            | ₹200   |
| High Pollution  | AQI > 300         | ₹250   |

---

## 🤖 AI/ML Integration  

### 🔹 Risk Prediction  
Identifies high-risk zones using historical weather data  

### 🔹 Dynamic Pricing  
Adjusts premium based on location and environmental risk  

### 🔹 Fraud Detection  
- GPS validation  
- Duplicate claim prevention  
- Behavioral pattern analysis  

---

## 💰 Weekly Pricing Model  

| Risk Level | Weekly Premium |
|-----------|---------------|
| Low Risk   | ₹39          |
| Medium Risk| ₹49          |
| High Risk  | ₹69          |

---

## 🚀 Features  

- ⚡ Automated claim processing  
- 🌐 Real-time weather monitoring  
- 💸 Instant payout simulation  
- 📊 User dashboard  
- 📈 Scalable architecture  

---

## 🛠️ Tech Stack  

- **Frontend:** React.js / HTML  
- **Backend:** Node.js, Express  
- **Database:** Firebase / MongoDB  
- **APIs:** OpenWeather API  
- **Payments:** Razorpay (simulated)  

---

## 🧪 Prototype Scope (Phase 1)  

- Basic UI prototype  
- Simulated backend logic  
- AI-based decision explanation  
- Concept validation  

---

## 📊 System Architecture  


User → Frontend → Backend → External APIs → AI Logic → Claim Trigger → Payment


---

## 🔍 Challenges  

- Designing accurate trigger conditions  
- Creating fair pricing models  
- Simulating AI logic  
- Keeping system simple and scalable  

---

## 🏆 Accomplishments  

- Automated insurance workflow  
- Eliminated manual claims  
- Built scalable architecture  
- Integrated AI concepts  

---

## 📚 Learnings  

- Parametric insurance  
- AI in financial systems  
- API integration  
- System design  

---

## 🔮 Future Scope  

- Integration with delivery platforms  
- Real-time GPS tracking  
- Advanced ML models  
- Mobile application  

---

## ⚡ Running the Project  

### 🔹 Frontend Setup  

```bash
cd frontend
npm install
npm start
🔹 Backend Setup
cd backend
npm install
node server.js
🔐 Environment Variables

Create a .env file:

WEATHER_API_KEY=your_api_key
💻 Sample Backend Code
const express = require("express");
const app = express();

app.get("/check-claim", (req, res) => {
    let rainfall = 60;

    if (rainfall > 50) {
        return res.json({
            claim: true,
            payout: 300
        });
    }

    res.json({
        claim: false
    });
});

app.listen(3000);
💻 Sample Frontend Code
<h1>RainShield Dashboard</h1>
<button onclick="checkClaim()">Check Claim</button>

<script>
function checkClaim() {
    fetch("http://localhost:3000/check-claim")
    .then(res => res.json())
    .then(data => alert(JSON.stringify(data)));
}
</script>
🤝 Team

Team Name: CYBER SPARTANS

| Name    | Role |
|---------|------|
| BHAGRAV | AI & Security Specialist |
| GANESH  | Lead Developer & System Architect |
| PAVAN   | Frontend Developer & UI/UX |
| ROHITH  | Backend Developer & DB Engineer |
| RAHUL   | UI Developer |

🔗 Links
🔗 GitHub Repository: https://github.com/SivaChandraGanesh/rainshield-ai.git
🎥 Final Project Demo: https://youtu.be/cwLpRxUFuI0
📌 Conclusion

RainShield AI transforms insurance for gig workers by making it:

⚡ Instant
🤖 Automated
🔍 Transparent
💰 Affordable
