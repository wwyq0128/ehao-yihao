const PET_STORAGE_KEY = 'ehao_pet_room_state';

const PETS = {
  dog: {
    kindName: '小狗',
    emoji: '🐶',
    defaultName: '小面包',
    moods: {
      feed: '尾巴摇得很快，看起来超级满足。',
      play: '围着你转了两圈，还想继续玩。',
      rest: '趴在小毯子上，呼吸都变得慢慢的。'
    }
  },
  cat: {
    kindName: '小猫',
    emoji: '🐱',
    defaultName: '奶油团',
    moods: {
      feed: '慢吞吞吃完了，还轻轻蹭了蹭你。',
      play: '追着小球拍来拍去，眼睛都亮了。',
      rest: '缩成一团打盹，耳朵偶尔轻轻抖一下。'
    }
  },
  bird: {
    kindName: '小鸟',
    emoji: '🐦',
    defaultName: '晴晴',
    moods: {
      feed: '啄了几口果子，开心地歪了歪脑袋。',
      play: '扑腾着小翅膀，在你身边轻快绕圈。',
      rest: '安安静静立在小木架上，像一小团云。'
    }
  }
};

function getDefaultPetState(type) {
  const pet = PETS[type];
  return {
    selectedPet: type,
    name: pet.defaultName,
    level: 1,
    exp: 0,
    stats: {
      hunger: 72,
      happiness: 74,
      energy: 68
    },
    moodText: '刚刚来到房间，正在偷偷熟悉这里。',
    logs: [
      {
        id: Date.now(),
        text: pet.kindName + '住进了房间，今天开始一起生活。'
      }
    ]
  };
}

function getPetState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(PET_STORAGE_KEY));
    return parsed || { selectedPet: null };
  } catch {
    return { selectedPet: null };
  }
}

function savePetState(state) {
  localStorage.setItem(PET_STORAGE_KEY, JSON.stringify(state));
}

function clampStat(value) {
  return Math.max(0, Math.min(100, value));
}

function addPetLog(state, text) {
  state.logs = state.logs || [];
  state.logs.unshift({
    id: Date.now(),
    text
  });
  state.logs = state.logs.slice(0, 6);
}

function gainExp(state, amount) {
  state.exp += amount;
  while (state.exp >= 100) {
    state.exp -= 100;
    state.level += 1;
    addPetLog(state, '长大了一点点，升到 Lv.' + state.level + ' 了。');
  }
}

function renderPetSelection(state) {
  const selection = document.getElementById('pet-selection');
  const room = document.getElementById('pet-room');
  if (!state.selectedPet) {
    selection.classList.remove('hidden');
    room.classList.add('hidden');
  } else {
    selection.classList.add('hidden');
    room.classList.remove('hidden');
  }
}

function renderPetRoom() {
  const state = getPetState();
  renderPetSelection(state);
  if (!state.selectedPet || !PETS[state.selectedPet]) return;

  const pet = PETS[state.selectedPet];
  document.getElementById('pet-avatar').textContent = pet.emoji;
  document.getElementById('pet-kind-name').textContent = state.name || pet.defaultName;
  document.getElementById('pet-level-badge').textContent = 'Lv.' + state.level;
  document.getElementById('pet-mood-line').textContent = state.moodText;
  document.getElementById('pet-name-input').value = state.name || '';
  document.getElementById('pet-bubble').textContent = state.moodText;

  const statsEl = document.getElementById('pet-stats');
  const stats = [
    { key: 'hunger', label: '饱饱值' },
    { key: 'happiness', label: '开心值' },
    { key: 'energy', label: '精神值' },
    { key: 'exp', label: '成长值', value: state.exp }
  ];
  statsEl.innerHTML = stats.map(item => {
    const value = item.value != null ? item.value : state.stats[item.key];
    return `
      <div class="pet-stat">
        <div class="pet-stat-top">
          <span>${item.label}</span>
          <span>${value}</span>
        </div>
        <div class="pet-stat-bar">
          <div class="pet-stat-fill" style="width:${value}%"></div>
        </div>
      </div>
    `;
  }).join('');

  const logEl = document.getElementById('pet-log');
  logEl.innerHTML = (state.logs || []).map(item => (
    `<div class="log-item">${item.text}</div>`
  )).join('');
}

function choosePet(type) {
  const state = getDefaultPetState(type);
  savePetState(state);
  renderPetRoom();
}

function updatePetName(name) {
  const state = getPetState();
  if (!state.selectedPet) return;
  state.name = name.trim() || PETS[state.selectedPet].defaultName;
  savePetState(state);
  renderPetRoom();
}

function doPetAction(action) {
  const state = getPetState();
  if (!state.selectedPet) return;
  const pet = PETS[state.selectedPet];

  if (action === 'feed') {
    state.stats.hunger = clampStat(state.stats.hunger + 18);
    state.stats.happiness = clampStat(state.stats.happiness + 6);
    state.stats.energy = clampStat(state.stats.energy + 3);
    state.moodText = pet.moods.feed;
    gainExp(state, 24);
  }
  if (action === 'play') {
    state.stats.happiness = clampStat(state.stats.happiness + 18);
    state.stats.energy = clampStat(state.stats.energy - 10);
    state.stats.hunger = clampStat(state.stats.hunger - 6);
    state.moodText = pet.moods.play;
    gainExp(state, 22);
  }
  if (action === 'rest') {
    state.stats.energy = clampStat(state.stats.energy + 18);
    state.stats.happiness = clampStat(state.stats.happiness + 5);
    state.stats.hunger = clampStat(state.stats.hunger - 4);
    state.moodText = pet.moods.rest;
    gainExp(state, 18);
  }

  addPetLog(state, (state.name || pet.defaultName) + '：' + state.moodText);
  savePetState(state);
  renderPetRoom();
}

function resetPetChoice() {
  const state = { selectedPet: null };
  savePetState(state);
  renderPetRoom();
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.pet-choice').forEach(btn => {
    btn.addEventListener('click', () => choosePet(btn.dataset.pet));
  });

  document.querySelectorAll('.pet-action-btn').forEach(btn => {
    btn.addEventListener('click', () => doPetAction(btn.dataset.action));
  });

  const nameInput = document.getElementById('pet-name-input');
  if (nameInput) {
    nameInput.addEventListener('change', () => updatePetName(nameInput.value));
    nameInput.addEventListener('blur', () => updatePetName(nameInput.value));
  }

  const switchBtn = document.getElementById('pet-switch-btn');
  if (switchBtn) {
    switchBtn.addEventListener('click', resetPetChoice);
  }

  renderPetRoom();
});

window.renderPetRoom = renderPetRoom;
