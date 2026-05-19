(() => {
  'use strict';

  const CONFIG = window.SCHOOL_APP_CONFIG || {};
  const APP = document.getElementById('app');
  const STORAGE_USER = 'schoolDashboardUser';
  const STORAGE_LOCAL_DB = 'schoolDashboardLocalDb';
  const PAGE_SIZE = 10;
  const DEFAULT_PASSWORD = 'password123';

  const asset = (name) => `assets/${name}`;
  const roles = ['admin', 'teacher', 'student', 'parent'];

  const menuItems = [
    { key: 'dashboard', label: 'Home', icon: 'home.png', visible: roles },
    { key: 'teachers', label: 'Teachers', icon: 'teacher.png', visible: ['admin', 'teacher'] },
    { key: 'students', label: 'Students', icon: 'student.png', visible: ['admin', 'teacher', 'student', 'parent'] },
    { key: 'parents', label: 'Parents', icon: 'parent.png', visible: ['admin', 'teacher', 'parent'] },
    { key: 'subjects', label: 'Subjects', icon: 'subject.png', visible: ['admin'] },
    { key: 'classes', label: 'Classes', icon: 'class.png', visible: ['admin', 'teacher', 'student', 'parent'] },
    { key: 'lessons', label: 'Lessons', icon: 'lesson.png', visible: ['admin', 'teacher', 'student', 'parent'] },
    { key: 'exams', label: 'Exams', icon: 'exam.png', visible: roles },
    { key: 'assignments', label: 'Assignments', icon: 'assignment.png', visible: roles },
    { key: 'results', label: 'Results', icon: 'result.png', visible: roles },
    { key: 'attendances', label: 'Attendance', icon: 'attendance.png', visible: roles },
    { key: 'events', label: 'Events', icon: 'calendar.png', visible: roles },
    { key: 'announcements', label: 'Announcements', icon: 'announcement.png', visible: roles }
  ];

  const optionSource = {
    gradeId: 'grades',
    classId: 'classes',
    classIds: 'classes',
    supervisorId: 'teachers',
    subjectId: 'subjects',
    subjectIds: 'subjects',
    teacherId: 'teachers',
    teacherIds: 'teachers',
    parentId: 'parents',
    studentId: 'students',
    lessonId: 'lessons',
    examId: 'exams',
    assignmentId: 'assignments'
  };

  const sexOptions = [
    { id: 'MALE', label: 'Male' },
    { id: 'FEMALE', label: 'Female' }
  ];

  const dayOptions = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'].map((day) => ({ id: day, label: titleCase(day) }));

  const presentOptions = [
    { id: 'true', label: 'Present' },
    { id: 'false', label: 'Absent' }
  ];

  const TABLES = {
    teachers: {
      title: 'Teachers',
      singular: 'teacher',
      icon: 'teacher.png',
      createRoles: ['admin'],
      editRoles: ['admin'],
      deleteRoles: ['admin'],
      fields: [
        field('username', 'Username', 'text', { required: true }),
        field('password', 'Password', 'password', { createOnly: true, placeholder: DEFAULT_PASSWORD }),
        field('name', 'First Name', 'text', { required: true }),
        field('surname', 'Last Name', 'text', { required: true }),
        field('email', 'Email', 'email'),
        field('phone', 'Phone'),
        field('address', 'Address', 'text', { full: true }),
        field('img', 'Photo URL', 'url', { full: true }),
        field('bloodType', 'Blood Type'),
        field('sex', 'Sex', 'select', { options: sexOptions }),
        field('birthday', 'Birthday', 'date'),
        field('subjectIds', 'Subjects', 'multiselect'),
        field('classIds', 'Classes', 'multiselect')
      ],
      columns: [
        { label: 'Info', render: (r) => infoCell(fullName(r), r.email || r.username, r.img) },
        { label: 'Teacher ID', render: (r) => esc(r.username || r.id) },
        { label: 'Subjects', render: (r) => joinNames(r.subjects) },
        { label: 'Classes', render: (r) => joinNames(r.classes) },
        { label: 'Phone', render: (r) => esc(r.phone) },
        { label: 'Address', render: (r) => esc(r.address) }
      ]
    },
    students: {
      title: 'Students',
      singular: 'student',
      icon: 'student.png',
      createRoles: ['admin'],
      editRoles: ['admin'],
      deleteRoles: ['admin'],
      fields: [
        field('username', 'Username', 'text', { required: true }),
        field('password', 'Password', 'password', { createOnly: true, placeholder: DEFAULT_PASSWORD }),
        field('name', 'First Name', 'text', { required: true }),
        field('surname', 'Last Name', 'text', { required: true }),
        field('email', 'Email', 'email'),
        field('phone', 'Phone'),
        field('address', 'Address', 'text', { full: true }),
        field('img', 'Photo URL', 'url', { full: true }),
        field('bloodType', 'Blood Type'),
        field('sex', 'Sex', 'select', { options: sexOptions }),
        field('birthday', 'Birthday', 'date'),
        field('parentId', 'Parent', 'select'),
        field('gradeId', 'Grade', 'select'),
        field('classId', 'Class', 'select')
      ],
      columns: [
        { label: 'Info', render: (r) => infoCell(fullName(r), r.class?.name || r.email || r.username, r.img) },
        { label: 'Student ID', render: (r) => esc(r.username || r.id) },
        { label: 'Grade', render: (r) => esc(r.grade?.level ? `Grade ${r.grade.level}` : '') },
        { label: 'Phone', render: (r) => esc(r.phone) },
        { label: 'Address', render: (r) => esc(r.address) }
      ]
    },
    parents: {
      title: 'Parents',
      singular: 'parent',
      icon: 'parent.png',
      createRoles: ['admin'],
      editRoles: ['admin'],
      deleteRoles: ['admin'],
      fields: [
        field('username', 'Username', 'text', { required: true }),
        field('password', 'Password', 'password', { createOnly: true, placeholder: DEFAULT_PASSWORD }),
        field('name', 'First Name', 'text', { required: true }),
        field('surname', 'Last Name', 'text', { required: true }),
        field('email', 'Email', 'email'),
        field('phone', 'Phone'),
        field('address', 'Address', 'text', { full: true })
      ],
      columns: [
        { label: 'Info', render: (r) => infoCell(fullName(r), r.email || r.username, '') },
        { label: 'Student Names', render: (r) => joinNames(r.students) },
        { label: 'Phone', render: (r) => esc(r.phone) },
        { label: 'Address', render: (r) => esc(r.address) }
      ]
    },
    subjects: {
      title: 'Subjects',
      singular: 'subject',
      icon: 'subject.png',
      createRoles: ['admin'],
      editRoles: ['admin'],
      deleteRoles: ['admin'],
      fields: [
        field('name', 'Subject Name', 'text', { required: true }),
        field('teacherIds', 'Teachers', 'multiselect')
      ],
      columns: [
        { label: 'Subject Name', render: (r) => esc(r.name) },
        { label: 'Teachers', render: (r) => joinNames(r.teachers) }
      ]
    },
    classes: {
      title: 'Classes',
      singular: 'class',
      icon: 'class.png',
      createRoles: ['admin'],
      editRoles: ['admin'],
      deleteRoles: ['admin'],
      fields: [
        field('name', 'Class Name', 'text', { required: true }),
        field('capacity', 'Capacity', 'number', { required: true }),
        field('gradeId', 'Grade', 'select'),
        field('supervisorId', 'Supervisor', 'select')
      ],
      columns: [
        { label: 'Class Name', render: (r) => esc(r.name) },
        { label: 'Capacity', render: (r) => esc(r.capacity) },
        { label: 'Grade', render: (r) => esc(r.grade?.level ? `Grade ${r.grade.level}` : r.gradeId) },
        { label: 'Students', render: (r) => esc(`${r.studentCount || 0}/${r.capacity || '-'}`) },
        { label: 'Supervisor', render: (r) => esc(fullName(r.supervisor || {})) }
      ]
    },
    lessons: {
      title: 'Lessons',
      singular: 'lesson',
      icon: 'lesson.png',
      createRoles: ['admin'],
      editRoles: ['admin'],
      deleteRoles: ['admin'],
      fields: [
        field('name', 'Lesson Name', 'text', { required: true }),
        field('day', 'Day', 'select', { options: dayOptions }),
        field('startTime', 'Start Time', 'datetime-local'),
        field('endTime', 'End Time', 'datetime-local'),
        field('subjectId', 'Subject', 'select'),
        field('classId', 'Class', 'select'),
        field('teacherId', 'Teacher', 'select')
      ],
      columns: [
        { label: 'Lesson', render: (r) => esc(r.name) },
        { label: 'Subject', render: (r) => esc(r.subject?.name) },
        { label: 'Class', render: (r) => esc(r.class?.name) },
        { label: 'Teacher', render: (r) => esc(fullName(r.teacher || {})) },
        { label: 'Day', render: (r) => esc(titleCase(r.day)) },
        { label: 'Time', render: (r) => esc(`${formatTime(r.startTime)} - ${formatTime(r.endTime)}`) }
      ]
    },
    exams: {
      title: 'Exams',
      singular: 'exam',
      icon: 'exam.png',
      createRoles: ['admin', 'teacher'],
      editRoles: ['admin', 'teacher'],
      deleteRoles: ['admin', 'teacher'],
      fields: [
        field('title', 'Exam Title', 'text', { required: true }),
        field('startTime', 'Start Time', 'datetime-local'),
        field('endTime', 'End Time', 'datetime-local'),
        field('lessonId', 'Lesson', 'select')
      ],
      columns: [
        { label: 'Title', render: (r) => esc(r.title) },
        { label: 'Subject', render: (r) => esc(r.lesson?.subject?.name) },
        { label: 'Class', render: (r) => esc(r.lesson?.class?.name) },
        { label: 'Teacher', render: (r) => esc(fullName(r.lesson?.teacher || {})) },
        { label: 'Date', render: (r) => esc(formatDate(r.startTime)) }
      ]
    },
    assignments: {
      title: 'Assignments',
      singular: 'assignment',
      icon: 'assignment.png',
      createRoles: ['admin', 'teacher'],
      editRoles: ['admin', 'teacher'],
      deleteRoles: ['admin', 'teacher'],
      fields: [
        field('title', 'Assignment Title', 'text', { required: true }),
        field('startDate', 'Start Date', 'datetime-local'),
        field('dueDate', 'Due Date', 'datetime-local'),
        field('lessonId', 'Lesson', 'select')
      ],
      columns: [
        { label: 'Title', render: (r) => esc(r.title) },
        { label: 'Subject', render: (r) => esc(r.lesson?.subject?.name) },
        { label: 'Class', render: (r) => esc(r.lesson?.class?.name) },
        { label: 'Teacher', render: (r) => esc(fullName(r.lesson?.teacher || {})) },
        { label: 'Due Date', render: (r) => esc(formatDate(r.dueDate)) }
      ]
    },
    results: {
      title: 'Results',
      singular: 'result',
      icon: 'result.png',
      createRoles: ['admin', 'teacher'],
      editRoles: ['admin', 'teacher'],
      deleteRoles: ['admin', 'teacher'],
      fields: [
        field('score', 'Score', 'number', { required: true }),
        field('studentId', 'Student', 'select'),
        field('examId', 'Exam', 'select'),
        field('assignmentId', 'Assignment', 'select')
      ],
      columns: [
        { label: 'Title', render: (r) => esc(r.exam?.title || r.assignment?.title || 'Result') },
        { label: 'Student', render: (r) => esc(fullName(r.student || {})) },
        { label: 'Score', render: (r) => badge(r.score, Number(r.score) >= 70 ? 'good' : 'warn') },
        { label: 'Teacher', render: (r) => esc(fullName((r.exam?.lesson || r.assignment?.lesson || {}).teacher || {})) },
        { label: 'Class', render: (r) => esc((r.exam?.lesson || r.assignment?.lesson || {}).class?.name) },
        { label: 'Date', render: (r) => esc(formatDate(r.exam?.startTime || r.assignment?.startDate)) }
      ]
    },
    attendances: {
      title: 'Attendance',
      singular: 'attendance',
      icon: 'attendance.png',
      createRoles: ['admin', 'teacher'],
      editRoles: ['admin', 'teacher'],
      deleteRoles: ['admin', 'teacher'],
      fields: [
        field('date', 'Date', 'datetime-local'),
        field('present', 'Status', 'select', { options: presentOptions }),
        field('studentId', 'Student', 'select'),
        field('lessonId', 'Lesson', 'select')
      ],
      columns: [
        { label: 'Student', render: (r) => esc(fullName(r.student || {})) },
        { label: 'Lesson', render: (r) => esc(r.lesson?.name) },
        { label: 'Class', render: (r) => esc(r.lesson?.class?.name) },
        { label: 'Date', render: (r) => esc(formatDate(r.date)) },
        { label: 'Status', render: (r) => badge(r.present ? 'Present' : 'Absent', r.present ? 'good' : 'bad') }
      ]
    },
    events: {
      title: 'Events',
      singular: 'event',
      icon: 'calendar.png',
      createRoles: ['admin'],
      editRoles: ['admin'],
      deleteRoles: ['admin'],
      fields: [
        field('title', 'Title', 'text', { required: true }),
        field('description', 'Description', 'textarea', { full: true }),
        field('startTime', 'Start Time', 'datetime-local'),
        field('endTime', 'End Time', 'datetime-local'),
        field('classId', 'Class', 'select')
      ],
      columns: [
        { label: 'Title', render: (r) => esc(r.title) },
        { label: 'Class', render: (r) => esc(r.class?.name || '-') },
        { label: 'Date', render: (r) => esc(formatDate(r.startTime)) },
        { label: 'Start', render: (r) => esc(formatTime(r.startTime)) },
        { label: 'End', render: (r) => esc(formatTime(r.endTime)) },
        { label: 'Description', render: (r) => esc(r.description) }
      ]
    },
    announcements: {
      title: 'Announcements',
      singular: 'announcement',
      icon: 'announcement.png',
      createRoles: ['admin'],
      editRoles: ['admin'],
      deleteRoles: ['admin'],
      fields: [
        field('title', 'Title', 'text', { required: true }),
        field('description', 'Description', 'textarea', { full: true }),
        field('date', 'Date', 'datetime-local'),
        field('classId', 'Class', 'select')
      ],
      columns: [
        { label: 'Title', render: (r) => esc(r.title) },
        { label: 'Class', render: (r) => esc(r.class?.name || '-') },
        { label: 'Date', render: (r) => esc(formatDate(r.date)) },
        { label: 'Description', render: (r) => esc(r.description) }
      ]
    }
  };

  const state = {
    user: safeStorageGet(STORAGE_USER, null),
    route: 'dashboard',
    page: 1,
    search: '',
    meta: null,
    lastPayload: null,
    loading: false
  };

  function field(name, label, type = 'text', opts = {}) {
    return { name, label, type, ...opts };
  }

  function boot() {
    window.addEventListener('hashchange', () => {
      state.page = 1;
      state.search = '';
      route();
    });
    route();
  }

  async function route() {
    try {
      state.route = (location.hash || '#/dashboard').replace(/^#\/?/, '') || 'dashboard';
      if (!state.user) {
        renderLogin();
        return;
      }
      renderLayout();
      await ensureMeta();
      if (state.route === 'dashboard') await renderDashboard();
      else if (TABLES[state.route]) await renderList(state.route);
      else renderNotFound();
    } catch (error) {
      const content = $('#pageContent');
      const message = error?.message || String(error || 'Unknown startup error');
      if (content) content.innerHTML = errorBox(message);
      else showFatal(error);
    }
  }

  function renderLogin() {
    APP.innerHTML = `
      <main class="login-screen">
        <section class="login-card">
          <div class="brand"><img src="${asset('logo.png')}" alt=""><span>SchooLama</span></div>
          <h1>Sign in to your account</h1>
          <p>Use the seeded demo accounts or your own Google Sheets data.</p>
          <form id="loginForm" class="grid" style="gap:14px">
            <div class="form-field full">
              <label for="username">Username</label>
              <input id="username" name="username" autocomplete="username" value="admin1" required />
            </div>
            <div class="form-field full">
              <label for="password">Password</label>
              <input id="password" name="password" type="password" autocomplete="current-password" value="${DEFAULT_PASSWORD}" required />
            </div>
            <button class="primary-btn" type="submit">Sign In</button>
          </form>
          <div class="demo-grid">
            ${[
              ['admin1', 'Admin'], ['teacher1', 'Teacher'], ['student1', 'Student'], ['parentId1', 'Parent']
            ].map(([username, label]) => `<button type="button" class="demo-btn" data-demo="${username}">${label} demo</button>`).join('')}
          </div>
          <p class="small">Demo password: <strong>${DEFAULT_PASSWORD}</strong>. ${apiConfigured() ? 'Connected mode is enabled.' : 'Local demo mode is active until config.js has an Apps Script URL.'}</p>
        </section>
      </main>`;

    $('#loginForm').addEventListener('submit', async (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      await login(form.get('username'), form.get('password'));
    });
    $$('.demo-btn').forEach((btn) => btn.addEventListener('click', async () => {
      $('#username').value = btn.dataset.demo;
      $('#password').value = DEFAULT_PASSWORD;
      await login(btn.dataset.demo, DEFAULT_PASSWORD);
    }));
  }

  async function login(username, password) {
    try {
      const response = await api('login', { username, password });
      if (!response.success) throw new Error(response.error || 'Login failed');
      state.user = response.user;
      safeStorageSet(STORAGE_USER, JSON.stringify(state.user));
      showToast(`Welcome, ${state.user.name || state.user.username}!`);
      location.hash = '#/dashboard';
      await route();
    } catch (error) {
      showToast(error.message, 'error');
    }
  }

  function renderLayout() {
    const routeKey = state.route;
    const user = state.user || {};
    const visibleMenu = menuItems.filter((item) => item.visible.includes(user.role));
    APP.innerHTML = `
      <div class="app-shell">
        <aside class="sidebar">
          <a class="brand" href="#/dashboard"><img src="${asset('logo.png')}" alt=""><span>SchooLama</span></a>
          <div class="menu-section-title">MENU</div>
          ${visibleMenu.map((item) => `
            <a class="menu-item ${routeKey === item.key ? 'active' : ''}" href="#/${item.key}" title="${esc(item.label)}">
              <img src="${asset(item.icon)}" alt=""><span>${esc(item.label)}</span>
            </a>`).join('')}
          <div class="menu-section-title">OTHER</div>
          <button class="menu-item" id="profileBtn" title="Profile"><img src="${asset('profile.png')}" alt=""><span>Profile</span></button>
          <button class="menu-item" id="settingsBtn" title="Settings"><img src="${asset('setting.png')}" alt=""><span>Settings</span></button>
          <button class="menu-item" id="logoutBtn" title="Logout"><img src="${asset('logout.png')}" alt=""><span>Logout</span></button>
        </aside>
        <section class="main">
          <nav class="navbar">
            <div class="nav-search">
              <img src="${asset('search.png')}" alt="">
              <input id="globalSearch" placeholder="Search current page..." value="${esc(state.search)}" />
            </div>
            <div class="user-chip">
              <div><strong>${esc(user.name || user.username)}</strong><span>${esc(user.role)}</span></div>
              <img class="avatar" src="${asset('avatar.png')}" alt="">
            </div>
          </nav>
          <main class="content" id="pageContent"><div class="loader">Loading...</div></main>
        </section>
      </div>
      <div id="modalRoot"></div>
      <div class="toast-wrap" id="toastWrap"></div>`;

    $('#logoutBtn').addEventListener('click', logout);
    $('#profileBtn').addEventListener('click', () => showProfile());
    $('#settingsBtn').addEventListener('click', () => showSettings());
    const searchInput = $('#globalSearch');
    let searchTimer = null;
    searchInput.addEventListener('input', () => {
      state.search = searchInput.value;
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        state.page = 1;
        if (state.route === 'dashboard') renderDashboard();
        else if (TABLES[state.route]) renderList(state.route);
      }, 250);
    });
  }

  function logout() {
    safeStorageRemove(STORAGE_USER);
    state.user = null;
    state.meta = null;
    location.hash = '#/dashboard';
    renderLogin();
  }

  async function ensureMeta() {
    if (state.meta) return state.meta;
    const response = await api('meta', {});
    if (!response.success) throw new Error(response.error || 'Could not load metadata');
    state.meta = response;
    return state.meta;
  }

  async function renderDashboard() {
    const content = $('#pageContent');
    content.innerHTML = '<div class="loader">Loading dashboard...</div>';
    try {
      const response = await api('dashboard', { user: state.user, search: state.search });
      if (!response.success) throw new Error(response.error || 'Could not load dashboard');
      const counts = response.counts || {};
      content.innerHTML = `
        <div class="section-title"><h1>${titleForRole(state.user.role)} Dashboard</h1><span class="badge">${apiConfigured() ? 'Apps Script' : 'Local Demo'}</span></div>
        <div class="grid dashboard-grid">
          ${statCard('Students', counts.students || 0)}
          ${statCard('Teachers', counts.teachers || 0)}
          ${statCard('Parents', counts.parents || 0)}
          ${statCard('Classes', counts.classes || 0)}
        </div>
        <div class="grid two-col" style="margin-top:18px">
          <section class="card pad">
            <div class="section-title"><h2>Students by class</h2><span class="muted small">Live from backend</span></div>
            ${barList(response.studentsByClass || [])}
          </section>
          <section class="card pad">
            <div class="section-title"><h2>Student count</h2><span class="muted small">Male / Female</span></div>
            ${sexBox(response.sexCounts || {})}
          </section>
        </div>
        <div class="grid two-col" style="margin-top:18px">
          <section class="card pad">
            <div class="section-title"><h2>Events</h2><a class="badge" href="#/events">View all</a></div>
            ${timeline(response.events || [], 'event')}
          </section>
          <section class="card pad">
            <div class="section-title"><h2>Announcements</h2><a class="badge" href="#/announcements">View all</a></div>
            ${timeline(response.announcements || [], 'announcement')}
          </section>
        </div>`;
    } catch (error) {
      content.innerHTML = errorBox(error.message);
    }
  }

  async function renderList(tableKey) {
    const table = TABLES[tableKey];
    const content = $('#pageContent');
    content.innerHTML = `<div class="loader">Loading ${esc(table.title.toLowerCase())}...</div>`;
    try {
      const response = await api('list', {
        table: tableKey,
        page: state.page,
        pageSize: PAGE_SIZE,
        search: state.search,
        user: state.user
      });
      if (!response.success) throw new Error(response.error || `Could not load ${table.title}`);
      state.lastPayload = response;
      if (response.options) state.meta.options = response.options;
      const rows = response.data || [];
      const totalPages = Math.max(1, Math.ceil((response.count || 0) / (response.pageSize || PAGE_SIZE)));
      content.innerHTML = `
        <section class="table-card">
          <div class="table-toolbar">
            <h1>All ${esc(table.title)}</h1>
            <div class="toolbar-actions">
              <div class="search-box"><img src="${asset('search.png')}" alt=""><input id="tableSearch" value="${esc(state.search)}" placeholder="Search ${esc(table.title.toLowerCase())}" /></div>
              <button class="icon-btn" title="Filter"><img src="${asset('filter.png')}" alt=""></button>
              <button class="icon-btn" title="Sort"><img src="${asset('sort.png')}" alt=""></button>
              ${can(table.createRoles) ? `<button class="icon-btn" id="createBtn" title="Create ${esc(table.singular)}"><img src="${asset('create.png')}" alt=""></button>` : ''}
            </div>
          </div>
          ${rows.length ? tableHtml(tableKey, rows) : emptyBox(`No ${table.title.toLowerCase()} found.`)}
          <div class="pagination">
            <button id="prevPage" ${state.page <= 1 ? 'disabled' : ''}>Previous</button>
            <span class="small muted">Page ${state.page} of ${totalPages} · ${response.count || 0} records</span>
            <button id="nextPage" ${state.page >= totalPages ? 'disabled' : ''}>Next</button>
          </div>
        </section>`;

      const tableSearch = $('#tableSearch');
      let timer = null;
      tableSearch.addEventListener('input', () => {
        state.search = tableSearch.value;
        $('#globalSearch').value = state.search;
        clearTimeout(timer);
        timer = setTimeout(() => {
          state.page = 1;
          renderList(tableKey);
        }, 250);
      });
      const createBtn = $('#createBtn');
      if (createBtn) createBtn.addEventListener('click', () => openForm(tableKey, 'create'));
      $('#prevPage').addEventListener('click', () => {
        state.page = Math.max(1, state.page - 1);
        renderList(tableKey);
      });
      $('#nextPage').addEventListener('click', () => {
        state.page = Math.min(totalPages, state.page + 1);
        renderList(tableKey);
      });
      bindRowActions(tableKey, rows);
    } catch (error) {
      content.innerHTML = errorBox(error.message);
    }
  }

  function tableHtml(tableKey, rows) {
    const table = TABLES[tableKey];
    const actionCol = can(table.editRoles) || can(table.deleteRoles);
    return `
      <div class="table-wrap">
        <table>
          <thead><tr>${table.columns.map((c) => `<th>${esc(c.label)}</th>`).join('')}${actionCol ? '<th>Actions</th>' : ''}</tr></thead>
          <tbody>
            ${rows.map((row) => `
              <tr data-id="${esc(row.id)}">
                ${table.columns.map((col) => `<td>${col.render(row)}</td>`).join('')}
                ${actionCol ? `<td><div class="actions-cell">
                  ${can(table.editRoles) ? `<button class="icon-btn sky js-edit" title="Edit"><img src="${asset('update.png')}" alt=""></button>` : ''}
                  ${can(table.deleteRoles) ? `<button class="icon-btn purple js-delete" title="Delete"><img src="${asset('delete.png')}" alt=""></button>` : ''}
                </div></td>` : ''}
              </tr>`).join('')}
          </tbody>
        </table>
      </div>`;
  }

  function bindRowActions(tableKey, rows) {
    $$('.js-edit').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.closest('tr').dataset.id;
        const row = rows.find((item) => String(item.id) === String(id));
        openForm(tableKey, 'update', row);
      });
    });
    $$('.js-delete').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.closest('tr').dataset.id;
        const row = rows.find((item) => String(item.id) === String(id));
        openDelete(tableKey, row);
      });
    });
  }

  function openForm(tableKey, mode, row = {}) {
    const table = TABLES[tableKey];
    const fields = table.fields.filter((f) => !(mode === 'update' && f.createOnly));
    const modal = $('#modalRoot');
    modal.innerHTML = `
      <div class="modal-backdrop">
        <section class="modal">
          <div class="modal-header">
            <h2>${mode === 'create' ? 'Create' : 'Update'} ${esc(table.singular)}</h2>
            <button class="icon-btn danger" id="closeModal" title="Close"><img src="${asset('close.png')}" alt=""></button>
          </div>
          <form id="entityForm">
            <div class="form-grid">
              ${fields.map((f) => renderField(f, row)).join('')}
            </div>
            <div class="form-actions">
              <button type="button" class="secondary-btn" id="cancelForm">Cancel</button>
              <button type="submit" class="primary-btn">${mode === 'create' ? 'Create' : 'Update'}</button>
            </div>
          </form>
        </section>
      </div>`;
    $('#closeModal').addEventListener('click', closeModal);
    $('#cancelForm').addEventListener('click', closeModal);
    $('#entityForm').addEventListener('submit', async (event) => {
      event.preventDefault();
      const data = collectForm(fields, event.currentTarget);
      try {
        const response = await api(mode === 'create' ? 'create' : 'update', {
          table: tableKey,
          id: row.id,
          data
        });
        if (!response.success) throw new Error(response.error || 'Save failed');
        closeModal();
        showToast(`${table.singular} ${mode === 'create' ? 'created' : 'updated'}.`);
        await ensureMetaRefresh();
        await renderList(tableKey);
      } catch (error) {
        showToast(error.message, 'error');
      }
    });
  }

  function openDelete(tableKey, row) {
    const table = TABLES[tableKey];
    const modal = $('#modalRoot');
    modal.innerHTML = `
      <div class="modal-backdrop">
        <section class="modal" style="max-width:520px">
          <div class="modal-header">
            <h2>Delete ${esc(table.singular)}</h2>
            <button class="icon-btn danger" id="closeModal" title="Close"><img src="${asset('close.png')}" alt=""></button>
          </div>
          <p>All data for <strong>${esc(labelForRow(row))}</strong> will be removed. This cannot be undone.</p>
          <div class="form-actions">
            <button class="secondary-btn" id="cancelDelete">Cancel</button>
            <button class="danger-btn" id="confirmDelete">Delete</button>
          </div>
        </section>
      </div>`;
    $('#closeModal').addEventListener('click', closeModal);
    $('#cancelDelete').addEventListener('click', closeModal);
    $('#confirmDelete').addEventListener('click', async () => {
      try {
        const response = await api('delete', { table: tableKey, id: row.id });
        if (!response.success) throw new Error(response.error || 'Delete failed');
        closeModal();
        showToast(`${table.singular} deleted.`);
        await ensureMetaRefresh();
        await renderList(tableKey);
      } catch (error) {
        showToast(error.message, 'error');
      }
    });
  }

  function renderField(f, row) {
    const value = rowValue(row, f.name);
    const classes = `form-field ${f.full || f.type === 'textarea' ? 'full' : ''}`;
    const required = f.required ? 'required' : '';
    const placeholder = f.placeholder ? `placeholder="${esc(f.placeholder)}"` : '';
    const label = `<label for="field_${esc(f.name)}">${esc(f.label)}</label>`;
    if (f.type === 'textarea') {
      return `<div class="${classes}">${label}<textarea id="field_${esc(f.name)}" name="${esc(f.name)}" ${required}>${esc(value)}</textarea></div>`;
    }
    if (f.type === 'select' || f.type === 'multiselect') {
      const options = fieldOptions(f);
      const selected = Array.isArray(value) ? value.map(String) : [String(value ?? '')];
      return `<div class="${classes}">${label}<select id="field_${esc(f.name)}" name="${esc(f.name)}" ${f.type === 'multiselect' ? 'multiple' : ''} ${required}>
        ${f.type === 'select' ? '<option value="">Select...</option>' : ''}
        ${options.map((opt) => `<option value="${esc(opt.id)}" ${selected.includes(String(opt.id)) ? 'selected' : ''}>${esc(opt.label)}</option>`).join('')}
      </select></div>`;
    }
    const inputType = f.type === 'datetime-local' ? 'datetime-local' : f.type;
    const formatted = f.type === 'date' ? toDateInput(value) : f.type === 'datetime-local' ? toDateTimeInput(value) : value;
    return `<div class="${classes}">${label}<input id="field_${esc(f.name)}" name="${esc(f.name)}" type="${esc(inputType)}" value="${esc(formatted)}" ${placeholder} ${required} /></div>`;
  }

  function collectForm(fields, form) {
    const data = {};
    fields.forEach((f) => {
      const el = form.elements[f.name];
      if (!el) return;
      if (f.type === 'multiselect') {
        data[f.name] = Array.from(el.selectedOptions).map((opt) => coerceValue(f.name, opt.value));
      } else {
        data[f.name] = coerceValue(f.name, el.value);
      }
    });
    return data;
  }

  function coerceValue(name, value) {
    if (value === '') return '';
    if (['id', 'level', 'capacity', 'gradeId', 'classId', 'subjectId', 'lessonId', 'examId', 'assignmentId', 'score'].includes(name)) return Number(value);
    if (name === 'present') return String(value) === 'true';
    return value;
  }

  function fieldOptions(f) {
    if (f.options) return f.options;
    const source = optionSource[f.name];
    return (state.meta?.options?.[source] || []).map((o) => ({ id: o.id, label: o.label }));
  }

  async function ensureMetaRefresh() {
    state.meta = null;
    await ensureMeta();
  }

  function closeModal() {
    $('#modalRoot').innerHTML = '';
  }

  function showProfile() {
    const user = state.user || {};
    $('#modalRoot').innerHTML = `
      <div class="modal-backdrop">
        <section class="modal" style="max-width:560px">
          <div class="modal-header"><h2>Profile</h2><button class="icon-btn danger" id="closeModal"><img src="${asset('close.png')}" alt=""></button></div>
          <p><strong>Username:</strong> ${esc(user.username)}</p>
          <p><strong>Role:</strong> ${esc(user.role)}</p>
          <p><strong>Name:</strong> ${esc(`${user.name || ''} ${user.surname || ''}`.trim())}</p>
        </section>
      </div>`;
    $('#closeModal').addEventListener('click', closeModal);
  }

  function showSettings() {
    $('#modalRoot').innerHTML = `
      <div class="modal-backdrop">
        <section class="modal" style="max-width:680px">
          <div class="modal-header"><h2>Settings</h2><button class="icon-btn danger" id="closeModal"><img src="${asset('close.png')}" alt=""></button></div>
          <p><strong>Backend:</strong> ${apiConfigured() ? 'Google Apps Script Web App' : 'Local browser demo data'}</p>
          <p class="muted">Edit <code>frontend/config.js</code> to add your Apps Script URL and optional token.</p>
        </section>
      </div>`;
    $('#closeModal').addEventListener('click', closeModal);
  }

  function renderNotFound() {
    $('#pageContent').innerHTML = errorBox('Page not found.');
  }

  function statCard(label, value) {
    return `<section class="card stat-card"><div class="stat-label">${esc(label)}</div><div class="stat-value">${esc(value)}</div></section>`;
  }

  function barList(items) {
    if (!items.length) return emptyBox('No chart data yet.');
    const max = Math.max(...items.map((i) => Number(i.value) || 0), 1);
    return `<div class="chart-list">${items.map((item) => {
      const pct = Math.round(((Number(item.value) || 0) / max) * 100);
      return `<div class="bar-row"><span>${esc(item.label)}</span><div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div><strong>${esc(item.value)}</strong></div>`;
    }).join('')}</div>`;
  }

  function sexBox(counts) {
    const male = Number(counts.male || 0);
    const female = Number(counts.female || 0);
    const total = Math.max(1, male + female);
    return `
      <div class="chart-list">
        <div class="bar-row"><span>Male</span><div class="bar-track"><div class="bar-fill" style="width:${Math.round(male / total * 100)}%"></div></div><strong>${male}</strong></div>
        <div class="bar-row"><span>Female</span><div class="bar-track"><div class="bar-fill" style="width:${Math.round(female / total * 100)}%"></div></div><strong>${female}</strong></div>
      </div>`;
  }

  function timeline(items, type) {
    if (!items.length) return emptyBox(`No ${type}s found.`);
    return `<div class="timeline">${items.map((item) => `<article class="timeline-item"><h3>${esc(item.title)}</h3><p>${esc(item.description || '')}</p><p>${esc(formatDate(item.startTime || item.date))}${item.class?.name ? ` · ${esc(item.class.name)}` : ''}</p></article>`).join('')}</div>`;
  }

  function emptyBox(message) {
    return `<div class="empty">${esc(message)}</div>`;
  }

  function errorBox(message) {
    return `<div class="card pad"><h2>Something went wrong</h2><p class="muted">${esc(message)}</p></div>`;
  }

  function infoCell(title, subtitle, img) {
    const src = img || asset('noAvatar.png');
    return `<div class="info-cell"><img src="${esc(src)}" alt="" onerror="this.src='${asset('noAvatar.png')}'"><div><div class="info-title">${esc(title)}</div><div class="info-sub">${esc(subtitle)}</div></div></div>`;
  }

  function badge(text, tone = '') {
    return `<span class="badge ${esc(tone)}">${esc(text)}</span>`;
  }

  function can(allowedRoles = []) {
    return allowedRoles.includes(state.user?.role);
  }

  function titleForRole(role) {
    return role ? titleCase(role) : 'School';
  }

  async function api(action, payload = {}) {
    if (!apiConfigured()) return localApi(action, payload);
    const params = {
      action,
      payload: JSON.stringify(payload)
    };
    if (CONFIG.APP_TOKEN) params.token = CONFIG.APP_TOKEN;
    return jsonp(CONFIG.APPS_SCRIPT_URL, params);
  }

  function apiConfigured() {
    return Boolean(String(CONFIG.APPS_SCRIPT_URL || '').trim());
  }

  function jsonp(baseUrl, params) {
    return new Promise((resolve, reject) => {
      const callback = `schoolJsonp_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const url = new URL(baseUrl);
      Object.entries({ ...params, callback }).forEach(([key, value]) => url.searchParams.set(key, value));
      const script = document.createElement('script');
      const timeout = setTimeout(() => {
        cleanup();
        reject(new Error('Apps Script request timed out.'));
      }, 25000);
      function cleanup() {
        clearTimeout(timeout);
        delete window[callback];
        script.remove();
      }
      window[callback] = (data) => {
        cleanup();
        resolve(data);
      };
      script.onerror = () => {
        cleanup();
        reject(new Error('Could not reach Apps Script Web App. Check config.js and deployment access.'));
      };
      script.src = url.toString();
      document.body.appendChild(script);
    });
  }

  function localApi(action, payload) {
    if (!CONFIG.ALLOW_LOCAL_DEMO && !apiConfigured()) {
      return Promise.resolve({ success: false, error: 'APPS_SCRIPT_URL is not configured.' });
    }
    const db = getLocalDb();
    if (action === 'meta') {
      return Promise.resolve({ success: true, tables: {}, roles, options: buildOptions(db), spreadsheetUrl: '' });
    }
    if (action === 'login') {
      const user = db.users.find((u) => String(u.username) === String(payload.username) && String(u.password) === String(payload.password));
      if (!user) return Promise.resolve({ success: false, error: 'Invalid username or password.' });
      return Promise.resolve({ success: true, user: { id: user.refId || user.id, username: user.username, role: user.role, name: user.name, surname: user.surname } });
    }
    const enriched = enrichDb(db);
    if (action === 'dashboard') {
      const user = payload.user || { role: 'admin' };
      const students = filterLocalByRole('students', enriched.students, user, enriched);
      const byClass = groupCount(students, (s) => s.class?.name || 'Unassigned');
      return Promise.resolve({
        success: true,
        counts: {
          students: students.length,
          teachers: filterLocalByRole('teachers', enriched.teachers, user, enriched).length,
          parents: filterLocalByRole('parents', enriched.parents, user, enriched).length,
          classes: filterLocalByRole('classes', enriched.classes, user, enriched).length
        },
        sexCounts: {
          male: students.filter((s) => s.sex !== 'FEMALE').length,
          female: students.filter((s) => s.sex === 'FEMALE').length
        },
        studentsByClass: Object.entries(byClass).map(([label, value]) => ({ label, value })),
        events: filterLocalByRole('events', enriched.events, user, enriched).slice(0, 5),
        announcements: filterLocalByRole('announcements', enriched.announcements, user, enriched).slice(0, 5)
      });
    }
    if (action === 'list') {
      const table = payload.table;
      let rows = filterLocalByRole(table, enriched[table] || [], payload.user || { role: 'admin' }, enriched);
      const search = String(payload.search || '').toLowerCase().trim();
      if (search) rows = rows.filter((row) => JSON.stringify(row).toLowerCase().includes(search));
      rows = rows.sort((a, b) => compareIds(a.id, b.id));
      const page = Math.max(1, Number(payload.page || 1));
      const pageSize = Math.max(1, Number(payload.pageSize || PAGE_SIZE));
      const start = (page - 1) * pageSize;
      return Promise.resolve({ success: true, table, page, pageSize, count: rows.length, data: rows.slice(start, start + pageSize), options: buildOptions(db) });
    }
    if (action === 'create') {
      const table = payload.table;
      const row = { ...payload.data };
      row.id = row.id || nextLocalId(db, table);
      if (['teachers', 'students', 'parents'].includes(table)) {
        row.createdAt = row.createdAt || new Date().toISOString();
      }
      db[table].push(row);
      syncLocalUser(db, table, row, payload.data?.password);
      syncLocalRelations(db, table, row);
      saveLocalDb(db);
      return Promise.resolve({ success: true, data: row });
    }
    if (action === 'update') {
      const table = payload.table;
      const idx = db[table].findIndex((r) => String(r.id) === String(payload.id));
      if (idx < 0) return Promise.resolve({ success: false, error: 'Record not found.' });
      db[table][idx] = { ...db[table][idx], ...payload.data, id: db[table][idx].id };
      syncLocalUser(db, table, db[table][idx], payload.data?.password);
      syncLocalRelations(db, table, db[table][idx]);
      saveLocalDb(db);
      return Promise.resolve({ success: true, data: db[table][idx] });
    }
    if (action === 'delete') {
      const table = payload.table;
      db[table] = db[table].filter((r) => String(r.id) !== String(payload.id));
      if (table === 'teachers') db.users = db.users.filter((u) => String(u.refId) !== String(payload.id));
      if (table === 'students') db.users = db.users.filter((u) => String(u.refId) !== String(payload.id));
      if (table === 'parents') db.users = db.users.filter((u) => String(u.refId) !== String(payload.id));
      saveLocalDb(db);
      return Promise.resolve({ success: true });
    }
    return Promise.resolve({ success: false, error: `Unknown action ${action}` });
  }

  function getLocalDb() {
    const cached = safeStorageGet(STORAGE_LOCAL_DB, null);
    if (cached) return cached;
    const db = createLocalDemoData();
    saveLocalDb(db);
    return db;
  }

  function saveLocalDb(db) {
    safeStorageSet(STORAGE_LOCAL_DB, JSON.stringify(db));
  }

  function createLocalDemoData() {
    const now = new Date();
    const isoNow = now.toISOString();
    const oneHour = 60 * 60 * 1000;
    const oneDay = 24 * oneHour;
    const db = {
      users: [], admins: [], grades: [], classes: [], subjects: [], teachers: [], parents: [], students: [], lessons: [], exams: [], assignments: [], results: [], attendances: [], events: [], announcements: []
    };
    db.admins = [{ id: 'admin1', username: 'admin1' }, { id: 'admin2', username: 'admin2' }];
    db.admins.forEach((a) => db.users.push({ id: a.id, username: a.username, password: DEFAULT_PASSWORD, role: 'admin', refId: a.id, name: 'Admin', surname: a.username, createdAt: isoNow }));
    for (let i = 1; i <= 6; i++) db.grades.push({ id: i, level: i });
    for (let i = 1; i <= 6; i++) db.classes.push({ id: i, name: `${i}A`, gradeId: i, capacity: 15 + (i % 6), supervisorId: `teacher${i}` });
    ['Mathematics', 'Science', 'English', 'History', 'Geography', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'Art'].forEach((name, index) => db.subjects.push({ id: index + 1, name, teacherIds: [] }));
    for (let i = 1; i <= 15; i++) {
      const teacher = { id: `teacher${i}`, username: `teacher${i}`, name: `TName${i}`, surname: `TSurname${i}`, email: `teacher${i}@example.com`, phone: `123-456-789${i}`, address: `Address ${i}`, img: '', bloodType: 'A+', sex: i % 2 === 0 ? 'MALE' : 'FEMALE', createdAt: isoNow, birthday: new Date(now.getFullYear() - 30, 0, Math.min(i, 28)).toISOString(), subjectIds: [(i % 10) + 1], classIds: [(i % 6) + 1] };
      db.teachers.push(teacher);
      db.users.push({ id: teacher.id, username: teacher.username, password: DEFAULT_PASSWORD, role: 'teacher', refId: teacher.id, name: teacher.name, surname: teacher.surname, createdAt: isoNow });
    }
    db.subjects.forEach((subject) => {
      subject.teacherIds = db.teachers.filter((t) => arr(t.subjectIds).map(String).includes(String(subject.id))).map((t) => t.id);
    });
    for (let i = 1; i <= 25; i++) {
      const parent = { id: `parentId${i}`, username: `parentId${i}`, name: `PName ${i}`, surname: `PSurname ${i}`, email: `parent${i}@example.com`, phone: `123-456-789${i}`, address: `Address ${i}`, createdAt: isoNow };
      db.parents.push(parent);
      db.users.push({ id: parent.id, username: parent.username, password: DEFAULT_PASSWORD, role: 'parent', refId: parent.id, name: parent.name, surname: parent.surname, createdAt: isoNow });
    }
    for (let i = 1; i <= 50; i++) {
      const parentNumber = Math.ceil(i / 2) % 25 || 25;
      const student = { id: `student${i}`, username: `student${i}`, name: `SName${i}`, surname: `SSurname ${i}`, email: `student${i}@example.com`, phone: `987-654-321${i}`, address: `Address ${i}`, img: '', bloodType: 'O-', sex: i % 2 === 0 ? 'MALE' : 'FEMALE', createdAt: isoNow, parentId: `parentId${parentNumber}`, gradeId: (i % 6) + 1, classId: (i % 6) + 1, birthday: new Date(now.getFullYear() - 10, 0, Math.min(i, 28)).toISOString() };
      db.students.push(student);
      db.users.push({ id: student.id, username: student.username, password: DEFAULT_PASSWORD, role: 'student', refId: student.id, name: student.name, surname: student.surname, createdAt: isoNow });
    }
    const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
    for (let i = 1; i <= 30; i++) db.lessons.push({ id: i, name: `Lesson ${i}`, day: days[i % days.length], startTime: new Date(now.getTime() + oneHour).toISOString(), endTime: new Date(now.getTime() + 3 * oneHour).toISOString(), subjectId: (i % 10) + 1, classId: (i % 6) + 1, teacherId: `teacher${(i % 15) + 1}` });
    for (let i = 1; i <= 10; i++) db.exams.push({ id: i, title: `Exam ${i}`, startTime: new Date(now.getTime() + i * oneDay).toISOString(), endTime: new Date(now.getTime() + i * oneDay + oneHour).toISOString(), lessonId: (i % 30) + 1 });
    for (let i = 1; i <= 10; i++) db.assignments.push({ id: i, title: `Assignment ${i}`, startDate: isoNow, dueDate: new Date(now.getTime() + i * oneDay).toISOString(), lessonId: (i % 30) + 1 });
    for (let i = 1; i <= 10; i++) db.results.push({ id: i, score: 80 + i, examId: i <= 5 ? i : '', assignmentId: i > 5 ? i - 5 : '', studentId: `student${i}` });
    for (let i = 1; i <= 10; i++) db.attendances.push({ id: i, date: isoNow, present: true, studentId: `student${i}`, lessonId: (i % 30) + 1 });
    for (let i = 1; i <= 5; i++) db.events.push({ id: i, title: `Event ${i}`, description: `Description for Event ${i}`, startTime: new Date(now.getTime() + i * oneDay).toISOString(), endTime: new Date(now.getTime() + i * oneDay + 2 * oneHour).toISOString(), classId: (i % 5) + 1 });
    for (let i = 1; i <= 5; i++) db.announcements.push({ id: i, title: `Announcement ${i}`, description: `Description for Announcement ${i}`, date: isoNow, classId: (i % 5) + 1 });
    return db;
  }

  function enrichDb(db) {
    const out = JSON.parse(JSON.stringify(db));
    const teachers = indexBy(out.teachers);
    const subjects = indexBy(out.subjects);
    const classes = indexBy(out.classes);
    const grades = indexBy(out.grades);
    const parents = indexBy(out.parents);
    const students = indexBy(out.students);
    const lessons = indexBy(out.lessons);
    const exams = indexBy(out.exams);
    const assignments = indexBy(out.assignments);

    out.teachers = out.teachers.map((t) => ({ ...t, subjects: arr(t.subjectIds).map((id) => subjects[String(id)]).filter(Boolean), classes: arr(t.classIds).map((id) => classes[String(id)]).filter(Boolean) }));
    out.subjects = out.subjects.map((s) => ({ ...s, teachers: arr(s.teacherIds).map((id) => teachers[String(id)]).filter(Boolean) }));
    out.classes = out.classes.map((c) => ({ ...c, supervisor: teachers[String(c.supervisorId)] || null, grade: grades[String(c.gradeId)] || null, studentCount: out.students.filter((s) => String(s.classId) === String(c.id)).length }));
    out.parents = out.parents.map((p) => ({ ...p, students: out.students.filter((s) => String(s.parentId) === String(p.id)) }));
    out.students = out.students.map((s) => ({ ...s, class: classes[String(s.classId)] || null, grade: grades[String(s.gradeId)] || null, parent: parents[String(s.parentId)] || null }));
    out.lessons = out.lessons.map((l) => ({ ...l, subject: subjects[String(l.subjectId)] || null, class: classes[String(l.classId)] || null, teacher: teachers[String(l.teacherId)] || null }));
    out.exams = out.exams.map((e) => ({ ...e, lesson: out.lessons.find((l) => String(l.id) === String(e.lessonId)) || lessons[String(e.lessonId)] || null }));
    out.assignments = out.assignments.map((a) => ({ ...a, lesson: out.lessons.find((l) => String(l.id) === String(a.lessonId)) || lessons[String(a.lessonId)] || null }));
    out.results = out.results.map((r) => ({ ...r, student: students[String(r.studentId)] || null, exam: r.examId ? out.exams.find((e) => String(e.id) === String(r.examId)) || exams[String(r.examId)] : null, assignment: r.assignmentId ? out.assignments.find((a) => String(a.id) === String(r.assignmentId)) || assignments[String(r.assignmentId)] : null }));
    out.attendances = out.attendances.map((a) => ({ ...a, student: students[String(a.studentId)] || null, lesson: out.lessons.find((l) => String(l.id) === String(a.lessonId)) || null }));
    out.events = out.events.map((e) => ({ ...e, class: classes[String(e.classId)] || null }));
    out.announcements = out.announcements.map((a) => ({ ...a, class: classes[String(a.classId)] || null }));
    return out;
  }

  function filterLocalByRole(table, rows, user, db) {
    const role = user?.role || 'admin';
    const userId = user?.id || '';
    if (role === 'admin') return rows;
    if (table === 'teachers') return role === 'teacher' ? rows.filter((r) => String(r.id) === String(userId)) : rows;
    if (table === 'students') {
      if (role === 'teacher') return rows.filter((s) => teacherOwnsClassLocal(db, userId, s.classId));
      if (role === 'student') return rows.filter((s) => String(s.id) === String(userId));
      if (role === 'parent') return rows.filter((s) => String(s.parentId) === String(userId));
    }
    if (table === 'parents') {
      if (role === 'parent') return rows.filter((p) => String(p.id) === String(userId));
      if (role === 'teacher') return rows.filter((p) => (p.students || []).some((s) => teacherOwnsClassLocal(db, userId, s.classId)));
    }
    if (table === 'classes') {
      if (role === 'teacher') return rows.filter((c) => teacherOwnsClassLocal(db, userId, c.id));
      if (role === 'student') return rows.filter((c) => db.students.some((s) => String(s.id) === String(userId) && String(s.classId) === String(c.id)));
      if (role === 'parent') return rows.filter((c) => db.students.some((s) => String(s.parentId) === String(userId) && String(s.classId) === String(c.id)));
    }
    if (['lessons', 'exams', 'assignments', 'results', 'attendances'].includes(table)) {
      return rows.filter((row) => localAssessmentVisible(table, row, role, userId, db));
    }
    if (['events', 'announcements'].includes(table)) {
      return rows.filter((row) => !row.classId || classVisibleLocal(db, role, userId, row.classId));
    }
    return rows;
  }

  function localAssessmentVisible(table, row, role, userId, db) {
    if (role === 'admin') return true;
    if (table === 'results') {
      if (role === 'student') return String(row.studentId) === String(userId);
      if (role === 'parent') return row.student && String(row.student.parentId) === String(userId);
      const lesson = (row.exam || row.assignment || {}).lesson;
      return lesson ? localAssessmentVisible('lessons', lesson, role, userId, db) : false;
    }
    if (table === 'attendances') {
      if (role === 'student') return String(row.studentId) === String(userId);
      if (role === 'parent') return row.student && String(row.student.parentId) === String(userId);
      return row.lesson ? localAssessmentVisible('lessons', row.lesson, role, userId, db) : false;
    }
    const lesson = row.lesson || row;
    if (role === 'teacher') return String(lesson.teacherId) === String(userId);
    return classVisibleLocal(db, role, userId, lesson.classId);
  }

  function classVisibleLocal(db, role, userId, classId) {
    if (role === 'teacher') return teacherOwnsClassLocal(db, userId, classId);
    if (role === 'student') return db.students.some((s) => String(s.id) === String(userId) && String(s.classId) === String(classId));
    if (role === 'parent') return db.students.some((s) => String(s.parentId) === String(userId) && String(s.classId) === String(classId));
    return true;
  }

  function teacherOwnsClassLocal(db, teacherId, classId) {
    const teacher = db.teachers.find((t) => String(t.id) === String(teacherId));
    return Boolean(teacher && arr(teacher.classIds).map(String).includes(String(classId))) || db.lessons.some((l) => String(l.teacherId) === String(teacherId) && String(l.classId) === String(classId));
  }

  function syncLocalUser(db, table, row, password) {
    const roleMap = { teachers: 'teacher', students: 'student', parents: 'parent' };
    const role = roleMap[table];
    if (!role) return;
    const idx = db.users.findIndex((u) => String(u.refId) === String(row.id));
    const next = { id: row.id, username: row.username || row.id, password: password || (idx >= 0 ? db.users[idx].password : DEFAULT_PASSWORD), role, refId: row.id, name: row.name || '', surname: row.surname || '', createdAt: row.createdAt || new Date().toISOString() };
    if (idx >= 0) db.users[idx] = { ...db.users[idx], ...next };
    else db.users.push(next);
  }

  function syncLocalRelations(db, table, row) {
    if (table === 'teachers') {
      db.subjects.forEach((subject) => {
        let ids = arr(subject.teacherIds).map(String).filter((id) => id !== String(row.id));
        if (arr(row.subjectIds).map(String).includes(String(subject.id))) ids.push(String(row.id));
        subject.teacherIds = unique(ids);
      });
    }
    if (table === 'subjects') {
      db.teachers.forEach((teacher) => {
        let ids = arr(teacher.subjectIds).map(String).filter((id) => id !== String(row.id));
        if (arr(row.teacherIds).map(String).includes(String(teacher.id))) ids.push(String(row.id));
        teacher.subjectIds = unique(ids);
      });
    }
  }

  function buildOptions(db) {
    const e = enrichDb(db);
    return {
      grades: e.grades.map((g) => ({ id: g.id, label: `Grade ${g.level}` })),
      classes: e.classes.map((c) => ({ id: c.id, label: `${c.name} (${c.studentCount || 0}/${c.capacity})` })),
      subjects: e.subjects.map((s) => ({ id: s.id, label: s.name })),
      teachers: e.teachers.map((t) => ({ id: t.id, label: fullName(t) })),
      parents: e.parents.map((p) => ({ id: p.id, label: fullName(p) })),
      students: e.students.map((s) => ({ id: s.id, label: fullName(s) })),
      lessons: e.lessons.map((l) => ({ id: l.id, label: `${l.name}${l.subject ? ` - ${l.subject.name}` : ''}` })),
      exams: e.exams.map((x) => ({ id: x.id, label: x.title })),
      assignments: e.assignments.map((a) => ({ id: a.id, label: a.title }))
    };
  }

  function nextLocalId(db, table) {
    const numeric = ['grades', 'classes', 'subjects', 'lessons', 'exams', 'assignments', 'results', 'attendances', 'events', 'announcements'].includes(table);
    if (numeric) return Math.max(0, ...db[table].map((r) => Number(r.id) || 0)) + 1;
    const prefix = table.replace(/s$/, '');
    return `${prefix}-${Date.now()}`;
  }

  function groupCount(rows, keyFn) {
    return rows.reduce((acc, row) => {
      const key = keyFn(row);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }

  function indexBy(rows, key = 'id') {
    return rows.reduce((acc, row) => {
      acc[String(row[key])] = row;
      return acc;
    }, {});
  }

  function arr(value) {
    if (Array.isArray(value)) return value.filter((v) => v !== '' && v !== undefined && v !== null);
    if (value === undefined || value === null || value === '') return [];
    return String(value).split('|').join(',').split(',').map((v) => v.trim()).filter(Boolean).map((v) => /^\d+$/.test(v) ? Number(v) : v);
  }

  function unique(values) {
    return [...new Set(values.map(String))];
  }

  function compareIds(a, b) {
    const na = Number(a);
    const nb = Number(b);
    if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
    return String(a).localeCompare(String(b));
  }

  function rowValue(row, name) {
    if (name in row) return row[name];
    if (name === 'teacherIds' && row.teachers) return row.teachers.map((t) => t.id);
    return '';
  }

  function fullName(row) {
    if (!row) return '';
    return `${row.name || ''} ${row.surname || ''}`.trim() || row.username || row.title || row.name || row.id || '';
  }

  function labelForRow(row) {
    return fullName(row) || row?.title || row?.name || row?.id || 'record';
  }

  function joinNames(items = []) {
    return esc(items.map(fullName).filter(Boolean).join(', '));
  }

  function formatDate(value) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: 'numeric' }).format(date);
  }

  function formatTime(value) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }).format(date);
  }

  function toDateInput(value) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toISOString().slice(0, 10);
  }

  function toDateTimeInput(value) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
  }

  function titleCase(value = '') {
    return String(value).toLowerCase().split(/[_\s-]+/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
  }

  function safeJson(text, fallback) {
    try { return text ? JSON.parse(text) : fallback; } catch { return fallback; }
  }

  function safeStorageGet(key, fallback) {
    try { return safeJson(localStorage.getItem(key), fallback); } catch { return fallback; }
  }

  function safeStorageSet(key, value) {
    try { localStorage.setItem(key, value); } catch { /* localStorage can be disabled by browser privacy settings */ }
  }

  function safeStorageRemove(key) {
    try { localStorage.removeItem(key); } catch { /* localStorage can be disabled by browser privacy settings */ }
  }

  function showFatal(error) {
    const message = error?.message || String(error || 'Unknown error');
    const target = document.getElementById('app');
    if (!target) return;
    target.innerHTML = `
      <main class="login-screen">
        <section class="login-card">
          <div class="brand"><img src="${asset('logo.png')}" alt=""><span>SchooLama</span></div>
          <h1>Frontend failed to start</h1>
          <p class="muted">${esc(message)}</p>
          <p class="small">Most common fix: publish the contents of the <strong>frontend</strong> folder at the GitHub Pages root, so <code>index.html</code>, <code>config.js</code>, <code>js/app.js</code>, <code>css/styles.css</code>, and <code>assets/</code> are all side by side.</p>
        </section>
      </main>`;
  }

  function esc(value) {
    return String(value ?? '').replace(/[&<>'"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[ch]));
  }

  function $(selector, root = document) {
    return root.querySelector(selector);
  }

  function $$(selector, root = document) {
    return Array.from(root.querySelectorAll(selector));
  }

  function showToast(message, type = '') {
    let wrap = $('#toastWrap');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.id = 'toastWrap';
      wrap.className = 'toast-wrap';
      document.body.appendChild(wrap);
    }
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    wrap.appendChild(toast);
    setTimeout(() => toast.remove(), 4200);
  }

  window.addEventListener('error', (event) => showFatal(event.error || event.message));
  window.addEventListener('unhandledrejection', (event) => showFatal(event.reason || event.message));

  try {
    boot();
  } catch (error) {
    showFatal(error);
  }
})();
