/*
    Name: Ricky Le
    File: MIS3371hw4Rlscript.js
    Date Created: 2026-05-1
    Date Updated: 2026-05-8
    Purpose: MIS 3371 Homework 4, javascript functionality for the patient registration form
*/

document.addEventListener('DOMContentLoaded', () => {
    loadExternalData();
    checkCookie();
    updateClock();
    setInterval(updateClock, 1000);

    // Salary Slider
    const salary = document.getElementById('salaryRange');
    salary.oninput = () => {
        document.getElementById('salaryDisplay').innerText = "$" + Number(salary.value).toLocaleString();
    };

    // Validation Listeners
    document.getElementById('firstname').oninput = validateName;
    document.getElementById('lastname').oninput = validateName;
    document.getElementById('userid').oninput = validateUserID;
    document.getElementById('ssn').oninput = formatSSN;
    document.getElementById('pw1').oninput = validatePasswords;
    document.getElementById('pw2').oninput = validatePasswords;

    // Local Storage: Save on blur
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', () => {
            if (document.getElementById('rememberMe').checked && input.id && input.type !== 'password' && input.id !== 'ssn') {
                localStorage.setItem(input.id, input.value);
            }
        });
    });
});


function formatSSN(e) {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 3 && val.length <= 5) {
        val = val.slice(0, 3) + '-' + val.slice(3);
    } else if (val.length > 5) {
        val = val.slice(0, 3) + '-' + val.slice(3, 5) + '-' + val.slice(5, 9);
    }
    e.target.value = val;
}

function validateName() {
    const fName = document.getElementById('firstname').value.trim();
    const lName = document.getElementById('lastname').value.trim();
    const errorDiv = document.getElementById('name-error');
    const regex = /^[A-Za-z'-]+$/;
    if (!fName || !lName) { errorDiv.innerText = "First and Last names are required."; return false; }
    if (!regex.test(fName) || !regex.test(lName)) { errorDiv.innerText = "Names: Letters, apostrophes, and dashes only."; return false; }
    errorDiv.innerText = ""; return true;
}

function validateUserID() {
    const uid = document.getElementById('userid').value.trim();
    const errorDiv = document.getElementById('uid-error');
    if (!uid) { errorDiv.innerText = "User ID is required."; return false; }
    if (/^\d/.test(uid)) { errorDiv.innerText = "User ID cannot start with a number."; return false; }
    const regex = /^[A-Za-z0-9-_]{5,20}$/;
    if (!regex.test(uid)) { errorDiv.innerText = "5-20 chars. Only letters, numbers, dash, and underscore."; return false; }
    errorDiv.innerText = ""; return true;
}

function validatePasswords() {
    const p1 = document.getElementById('pw1').value;
    const p2 = document.getElementById('pw2').value;
    const uid = document.getElementById('userid').value.trim();
    const errorDiv = document.getElementById('pw-error');
    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}$/;
    if (!p1 || !p2) { errorDiv.innerText = "Both password fields are required."; return false; }
    if (!strongRegex.test(p1)) { errorDiv.innerText = "8+ chars, must have 1 Upper, 1 Lower, and 1 Number."; return false; }
    if (p1 === uid) { errorDiv.innerText = "Password cannot be your User ID."; return false; }
    if (p1 !== p2) { errorDiv.innerText = "Passwords do not match."; return false; }
    errorDiv.innerText = ""; return true;
}

// HW4 FEATURES: FETCH, COOKIE, LOCALSTORAGE 
async function loadExternalData() {
    try {
        const [stateRes, condRes] = await Promise.all([fetch('states.json'), fetch('conditions.json')]);
        const states = await stateRes.json();
        const conditions = await condRes.json();

        const stateSelect = document.getElementById('state');
        stateSelect.innerHTML = '<option value="">Select State</option>';
        states.forEach(s => stateSelect.add(new Option(s, s)));

        const historyDiv = document.getElementById('history-container');
        conditions.forEach(c => {
            historyDiv.innerHTML += `<input type="checkbox" name="history" id="${c.id}" value="${c.id}"> ${c.label} `;
        });
        loadLocalStorage();
    } catch (err) { console.error("Fetch failed", err); }
}

function setCookie(name, value, hours) {
    const d = new Date();
    d.setTime(d.getTime() + (hours * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${d.toUTCString()};path=/`;
}

function getCookie(name) {
    let nameEQ = name + "=";
    let ca = document.cookie.split(';');
    for(let i=0; i < ca.length; i++) {
        let c = ca[i].trim();
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return "";
}

function checkCookie() {
    const user = getCookie("firstName");
    const welcome = document.getElementById('welcome-msg');
    if (user) {
        welcome.innerHTML = `Hello ${user}! <a href="#" onclick="clearUserData()">Not ${user}? Click here to start as NEW USER.</a>`;
        document.getElementById('firstname').value = user;
    } else {
        welcome.innerText = "Welcome New User";
    }
}

function loadLocalStorage() {
    if (getCookie("firstName")) {
        const inputs = document.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (localStorage.getItem(input.id)) input.value = localStorage.getItem(input.id);
        });
    }
}

function clearUserData() {
    setCookie("firstName", "", -1);
    localStorage.clear();
    document.getElementById('patientForm').reset();
    location.reload();
}

function updateClock() {
    document.getElementById('date-display').innerText = new Date().toLocaleString();
}

function validateEntireForm() {
    const nameOk = validateName();
    const uidOk = validateUserID();
    const pwOk = validatePasswords();
    const genderOk = document.querySelector('input[name="gender"]:checked') !== null;

    if (nameOk && uidOk && pwOk && genderOk) {
        if (document.getElementById('rememberMe').checked) {
            setCookie("firstName", document.getElementById('firstname').value, 48);
        }
        document.getElementById('submitBtn').style.display = 'inline-block';
        alert("Validation Successful! You may submit.");
    } else {
        alert("Validation Failed. Please check all required fields.");
    }
}