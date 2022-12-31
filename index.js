// ⚡️ Import Styles
import './style.scss';
import feather from 'feather-icons';
import { capitalStr } from './modules/capitalStr.js';
import { addZero } from './modules/addZero.js';
import { showNotification } from './modules/showNotification.js';

// ⚡️ Render Skeleton
document.querySelector('#app').innerHTML = `
<div class='app-container'>
  <div class='countdown'>
    <h1 data-title=''>Countdown</h1>
    <!--Countdown Config Display-->
    <div class='countdown__config' data-config=''>
      <form data-form=''>
        <label>
          <span class='label'>Name</span>
          <input class='input' type='text' name='name' placeholder='What are you counting down to?'>
        </label>
        <label>
          <span class='label'>Date</span>
          <input class='input' type='date' name='target' data-date=''>
        </label>
        <button type='submit'>Submit</button>
      </form>
    </div>
    <!--Countdown Display-->
    <div class='countdown__display hide' data-display=''>
      <ul>
        ${['days', 'hours', 'minutes', 'seconds'].map(i => `
          <li>
            <p class='h1' data-${i}>00</p>
            <p class='h5' >${capitalStr(i)}</p>
          </li>
        `).join('')}
      </ul>
      <button class='button' data-reset=''>Reset</button>
    </div>
    <!--Finish Display-->
    <div class='countdown__finish hide' data-finish=''>
      <p data-finish-text=''></p>
      <button data-finish-btn=''>New Countdown</button>
    </div>
  </div>

  <a class='app-author' href='https://github.com/nagoev-alim' target='_blank'>${feather.icons.github.toSvg()}</a>
</div>
`;

// Query Selector
const DOM = {
  config: document.querySelector('[data-config]'),
  display: document.querySelector('[data-display]'),
  finish: {
    self: document.querySelector('[data-finish]'),
    text: document.querySelector('[data-finish-text]'),
    btn: document.querySelector('[data-finish-btn]'),
  },
  form: {
    self: document.querySelector('[data-form]'),
    date: document.querySelector('[data-date]'),
  },
  countdown: {
    d: document.querySelector('[data-days]'),
    h: document.querySelector('[data-hours]'),
    m: document.querySelector('[data-minutes]'),
    s: document.querySelector('[data-seconds]'),
    title: document.querySelector('[data-title]'),
    btnReset: document.querySelector('[data-reset]'),
  },
};

const PROPS = {
  today: new Date().toISOString().split('T')[0],
  countdownValue: Date,
  interval: null,
  countdownName: null,
  countdownDate: null,
};

// Functions

/**
 * @function updateCountdown - Update countdown
 */
const updateCountdown = () => {
  setTimeout(() => {
    DOM.countdown.title.innerHTML = PROPS.countdownName;
    DOM.display.classList.remove('hide');
    DOM.config.classList.add('hide');
  }, 1000);

  PROPS.interval = setInterval(() => {
    const now = new Date().getTime();
    const diff = PROPS.countdownValue - now;
    if (diff < 0) {
      clearInterval(PROPS.interval);
      DOM.display.classList.add('hide');
      DOM.finish.self.classList.remove('hide');
      DOM.countdown.title.innerHTML = 'Countdown Complete 🎊';
      DOM.finish.text.innerHTML = `${PROPS.countdownName} finished on ${PROPS.countdownDate}`;
      DOM.form.self.reset();
    } else {
      DOM.countdown.d.innerHTML = addZero(Math.floor(diff / 1000 / 60 / 60 / 24));
      DOM.countdown.h.innerHTML = addZero(Math.floor(diff / 1000 / 60 / 60) % 24);
      DOM.countdown.m.innerHTML = addZero(Math.floor(diff / 1000 / 60) % 60);
      DOM.countdown.s.innerHTML = addZero(Math.floor(diff / 1000) % 60);
    }
  }, 1000);
};

/**
 * @function onSubmit - Form submit handler
 * @param event
 */
const onSubmit = (event) => {
  event.preventDefault();
  const form = event.target;
  const { name, target } = Object.fromEntries(new FormData(form).entries());

  if (!name || !target) {
    form.querySelectorAll('input').forEach(i => i.classList.add('error'));
    setTimeout(() => form.querySelectorAll('input').forEach(i => i.classList.remove('error')), 3000);
    showNotification('warning', 'Please fill the fields');
    return;
  }

  PROPS.countdownName = name;
  PROPS.countdownDate = target;
  PROPS.countdownValue = new Date(PROPS.countdownDate).getTime();

  storageAdd({
    name: PROPS.countdownName,
    date: PROPS.countdownDate,
  });

  updateCountdown();
};

/**
 * @function onReset - Reset config
 */
const onReset = () => {
  clearInterval(PROPS.interval);
  DOM.display.classList.add('hide');
  DOM.finish.self.classList.add('hide');
  DOM.config.classList.remove('hide');
  DOM.countdown.title.innerHTML = 'Countdown';
  DOM.form.self.reset();
  localStorage.clear();
};

/**
 * @function storageAdd - Add data to local storage
 * @param data
 */
const storageAdd = (data) => {
  localStorage.setItem('countdown', JSON.stringify(data));
};

/**
 * @function storageGet - Get data from local storage
 * @returns {any|null}
 */
const storageGet = () => {
  return localStorage.getItem('countdown') ? JSON.parse(localStorage.getItem('countdown')) : null;
};

/**
 * @function storageDisplay - Display data from local storage
 */
const storageDisplay = () => {
  const data = storageGet();
  if (data !== null) {
    PROPS.countdownName = data.name;
    PROPS.countdownDate = data.date;
    PROPS.countdownValue = new Date(PROPS.countdownDate).getTime();
    DOM.countdown.title.innerHTML = PROPS.countdownName;
    DOM.display.classList.remove('hide');
    DOM.config.classList.add('hide');
    updateCountdown();
  }
};

// Events
storageDisplay();

DOM.form.date.setAttribute('min', PROPS.today);
DOM.form.self.addEventListener('submit', onSubmit);
DOM.countdown.btnReset.addEventListener('click', onReset);
DOM.finish.btn.addEventListener('click', onReset);


