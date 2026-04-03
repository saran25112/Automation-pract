// ========================================
// AUTOMATION LEARN - Learn Page JS
// ========================================

const TOPIC_LABELS = {
  java: 'Java Basics',
  selenium: 'Selenium WebDriver',
  testng: 'TestNG Framework',
  maven: 'Maven',
  extent: 'Extent Reports',
  eclipse: 'Eclipse IDE',
  pom: 'POM Design Pattern',
};

const BLOCK_PRESETS = {
  heading: {
    content: 'New Heading',
    fontSize: 32,
    textAlign: 'left',
    textColor: 'white',
  },
  subheading: {
    content: 'New subheading text',
    fontSize: 24,
    textAlign: 'left',
    textColor: 'gray',
  },
  content: {
    content: 'Write your learning content here.',
    fontSize: 18,
    textAlign: 'left',
    textColor: 'black',
  },
  code: {
    content: '// If-else for conditional checks\nif (driver.getTitle().contains("Login")) {\n  System.out.println("On login page");\n} else {\n  System.out.println("Not on login page");\n}',
    fontSize: 16,
    textAlign: 'left',
    textColor: 'white',
  },
};

const learnBlocksCache = {};
const LEARN_PAGE_REQUESTS_SYNC_KEY = 'automatelearn:learn-request-sync';
const learnEditorState = {
  user: null,
  isEditor: false,
  isAdmin: false,
  mode: 'create',
  editingBlockId: '',
  pendingAction: null,
  pendingRequest: null,
};
const LEARN_LIVE_REFRESH_MS = 10000;

let currentTopicId = 'java';

document.addEventListener('DOMContentLoaded', async () => {
  ensureCustomBlockMounts();
  initLearnAdminEditor();
  initLearnRequestModal();
  initLearnAdminModalDrag();

  const pendingTopic = sessionStorage.getItem('pendingLearnTopic');
  if (pendingTopic && TOPIC_LABELS[pendingTopic]) {
    switchTopic(pendingTopic);
  } else {
    switchTopic('java');
  }
  sessionStorage.removeItem('pendingLearnTopic');

  initLearnLiveRefresh();
  await refreshEditorState();
});

function fetchJsonNoStore(url, options = {}) {
  return fetch(url, {
    cache: 'no-store',
    ...options,
    headers: {
      'Cache-Control': 'no-cache',
      ...(options.headers || {}),
    },
  });
}

function initLearnLiveRefresh() {
  setInterval(() => {
    if (document.hidden) {
      return;
    }

    loadLearnBlocks(currentTopicId, true);
    refreshEditorState(false);
  }, LEARN_LIVE_REFRESH_MS);

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      loadLearnBlocks(currentTopicId, true);
      refreshEditorState(false);
    }
  });

  window.addEventListener('focus', () => {
    loadLearnBlocks(currentTopicId, true);
    refreshEditorState(false);
  });

  window.addEventListener('storage', (event) => {
    if (event.key !== LEARN_PAGE_REQUESTS_SYNC_KEY) {
      return;
    }

    loadLearnBlocks(currentTopicId, true);
    refreshEditorState(false);
  });
}

function notifyLearnRequestSync(source, extra = {}) {
  try {
    localStorage.setItem(LEARN_PAGE_REQUESTS_SYNC_KEY, JSON.stringify({
      source,
      topicId: currentTopicId,
      at: Date.now(),
      ...extra,
    }));
    window.dispatchEvent(new CustomEvent('learn-request-sync', {
      detail: {
        source,
        topicId: currentTopicId,
        ...extra,
      },
    }));
  } catch (error) {
    console.error('Could not notify learn request sync.', error);
  }
}

function switchTopic(topicId) {
  if (!TOPIC_LABELS[topicId]) {
    return;
  }

  currentTopicId = topicId;

  document.querySelectorAll('.topic-content').forEach((el) => {
    el.style.display = 'none';
  });

  const target = document.getElementById(`topic-${topicId}`);
  if (target) {
    target.style.display = 'block';
    target.style.animation = 'fadeInUp 0.4s ease';
  }

  document.querySelectorAll('.sidebar-link').forEach((link) => {
    link.classList.toggle('active', link.dataset.topic === topicId);
  });

  const sidebar = document.getElementById('learnSidebar');
  if (sidebar) {
    sidebar.classList.remove('open');
  }

  updateEditorTopicLabel();
  loadLearnBlocks(topicId);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleSidebar() {
  const sidebar = document.getElementById('learnSidebar');
  if (sidebar) {
    sidebar.classList.toggle('open');
  }
}

function copyCode(btn) {
  const codeBlock = btn.closest('.code-block');
  const pre = codeBlock?.querySelector('pre');
  const text = pre?.innerText || '';

  navigator.clipboard.writeText(text).then(() => {
    btn.textContent = 'Copied!';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.textContent = 'Copy';
      btn.classList.remove('copied');
    }, 2000);
  }).catch(() => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    btn.textContent = 'Copied!';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.textContent = 'Copy';
      btn.classList.remove('copied');
    }, 2000);
  });
}

function ensureCustomBlockMounts() {
  document.querySelectorAll('.topic-content').forEach((topicSection) => {
    if (topicSection.querySelector('.learn-custom-blocks')) {
      return;
    }

    const mount = document.createElement('div');
    mount.className = 'learn-custom-blocks';
    mount.dataset.topic = topicSection.id.replace('topic-', '');
    topicSection.appendChild(mount);
  });
}

async function loadLearnBlocks(topicId, forceReload = false) {
  const mount = getCustomBlockMount(topicId);
  if (!mount) {
    return;
  }

  if (!forceReload && learnBlocksCache[topicId]) {
    renderLearnBlocks(topicId, learnBlocksCache[topicId]);
    return;
  }

  if (!learnBlocksCache[topicId]) {
    mount.innerHTML = '';
  }

  try {
    const response = await fetchJsonNoStore(`/api/learn/blocks?topic=${encodeURIComponent(topicId)}`, {
      credentials: 'include',
    });
    if (!response.ok) {
      return;
    }

    const data = await response.json();
    const blocks = Array.isArray(data.blocks) ? data.blocks : [];
    learnBlocksCache[topicId] = blocks;
    renderLearnBlocks(topicId, blocks);
  } catch (error) {
    console.error('Could not load learn blocks.', error);
  }
}

function renderLearnBlocks(topicId, blocks) {
  const mount = getCustomBlockMount(topicId);
  if (!mount) {
    return;
  }

  if (!blocks.length) {
    mount.innerHTML = '';
    return;
  }

  mount.innerHTML = blocks.map((block) => {
    const blockType = escapeHtml(block.block_type || 'content');
    const content = blockType === 'code'
      ? renderLearnCodeContent(block.content || '')
      : formatLearnBlockContent(block.content || '');
    const color = blockType === 'code' ? '' : resolveThemeColorToken(block.text_color);
    const fontSize = blockType === 'code' ? 16 : sanitizeFontSize(block.font_size);
    const textAlign = sanitizeAlignment(block.text_align);
    const actions = renderBlockActions(block);
    const meta = renderBlockMeta(block);

    return `
      <div class="learn-custom-block is-${blockType}" style="${blockType === 'code' ? '' : `color: ${color};`} font-size: ${fontSize}px; text-align: ${textAlign};">
        ${actions}
        ${blockType === 'code'
          ? content
          : `<div class="learn-custom-block-body">${content}</div>`}
        ${meta}
      </div>
    `;
  }).join('');

  mount.querySelectorAll('.code-block-copy').forEach((button) => {
    button.addEventListener('click', () => copyCode(button));
  });
}

function renderBlockActions(block) {
  const items = [];
  const notices = [];
  const editRequest = block.edit_request_detail || {};
  const deleteRequest = block.delete_request_detail || {};

  if (block.can_edit) {
    items.push(`<button class="learn-custom-icon-btn" type="button" onclick="openEditLearnBlock('${block.id}')">Edit</button>`);
  } else if (block.edit_request_status === 'pending') {
    items.push('<span class="learn-request-pill pending">Edit Request Pending</span>');
  } else if (block.edit_request_status === 'rejected') {
    items.push(`<button class="learn-custom-icon-btn request" type="button" onclick="openLearnRequestModal('${block.id}', 'edit')">Request Edit</button>`);
    notices.push(renderRequestNotice('edit', editRequest));
  } else if (block.can_request_edit) {
    items.push(`<button class="learn-custom-icon-btn request" type="button" onclick="openLearnRequestModal('${block.id}', 'edit')">Request Edit</button>`);
  }

  if (block.can_delete) {
    items.push(`<button class="learn-custom-icon-btn delete" type="button" onclick="confirmDeleteLearnBlock('${block.id}')">Delete</button>`);
  } else if (block.delete_request_status === 'pending') {
    items.push('<span class="learn-request-pill pending delete">Delete Request Pending</span>');
  } else if (block.delete_request_status === 'rejected') {
    items.push(`<button class="learn-custom-icon-btn request danger" type="button" onclick="openLearnRequestModal('${block.id}', 'delete')">Request Delete</button>`);
    notices.push(renderRequestNotice('delete', deleteRequest));
  } else if (block.can_request_delete) {
    items.push(`<button class="learn-custom-icon-btn request danger" type="button" onclick="openLearnRequestModal('${block.id}', 'delete')">Request Delete</button>`);
  }

  if (!items.length) {
    return '';
  }

  return `
    <div class="learn-custom-block-toolbar learn-custom-block-toolbar-request">
      ${items.join('')}
    </div>
    ${notices.join('')}
  `;
}

function renderBlockMeta(block) {
  const createdBy = escapeHtml(block.created_by_name || 'Unknown');
  const editedBy = escapeHtml(block.last_edited_by_name || block.created_by_name || 'Unknown');
  const editedAt = formatDateTime(block.last_edited_at || block.created_at);
  const ownership = block.is_owner ? '<span class="learn-block-chip owner">Owner</span>' : '';

  return `
    <div class="learn-block-meta">
      <button
        class="learn-block-meta-trigger"
        type="button"
        aria-label="Show content information"
      >i</button>
      <div class="learn-block-meta-tooltip" role="tooltip">
        <span>Created by: ${createdBy}</span>
        <span>Last edited by: ${editedBy}</span>
        <span>Last updated: ${escapeHtml(editedAt)}</span>
        ${ownership}
      </div>
    </div>
  `;
}

function initLearnAdminEditor() {
  const addBtn = document.getElementById('learnAdminAddBtn');
  const modal = document.getElementById('learnAdminModal');
  const closeBtn = document.getElementById('learnAdminCloseBtn');
  const cancelBtn = document.getElementById('learnAdminCancelBtn');
  const saveBtn = document.getElementById('learnAdminSaveBtn');
  const addCodeBtn = document.getElementById('learnAddCodeBtn');
  const confirmYesBtn = document.getElementById('learnAdminConfirmYesBtn');
  const confirmNoBtn = document.getElementById('learnAdminConfirmNoBtn');
  const blockType = document.getElementById('learnBlockType');
  const content = document.getElementById('learnBlockContent');
  const color = document.getElementById('learnBlockColor');
  const fontSize = document.getElementById('learnBlockFontSize');
  const align = document.getElementById('learnBlockAlign');

  if (!addBtn || !modal || !saveBtn || !confirmYesBtn || !confirmNoBtn || !blockType || !content || !color || !fontSize || !align) {
    return;
  }

  addBtn.addEventListener('click', startCreateLearnBlock);
  addCodeBtn.addEventListener('click', () => {
    document.getElementById('learnBlockType').value = 'code';
    applyPreset('code');
    syncLearnEditorFields();
    updatePreview();
  });

  closeBtn.addEventListener('click', closeLearnAdminModal);
  cancelBtn.addEventListener('click', closeLearnAdminModal);
  saveBtn.addEventListener('click', handleLearnEditorPrimaryAction);
  confirmYesBtn.addEventListener('click', runConfirmedLearnAction);
  confirmNoBtn.addEventListener('click', closeLearnAdminConfirmModal);

  blockType.addEventListener('change', () => {
    if (learnEditorState.mode === 'create') {
      applyPreset(blockType.value);
    }
    syncLearnEditorFields();
    updatePreview();
  });

  [content, color, fontSize, align].forEach((field) => {
    field.addEventListener('input', updatePreview);
    field.addEventListener('change', updatePreview);
  });

  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      closeLearnAdminModal();
    }
  });

  document.getElementById('learnAdminConfirmModal').addEventListener('click', (event) => {
    if (event.target.id === 'learnAdminConfirmModal') {
      closeLearnAdminConfirmModal();
    }
  });

  applyPreset('heading');
  syncLearnEditorFields();
  updateEditorTopicLabel();
  updatePreview();
}

function initLearnRequestModal() {
  const modal = document.getElementById('learnRequestModal');
  const sendBtn = document.getElementById('learnRequestSendBtn');
  const cancelBtn = document.getElementById('learnRequestCancelBtn');

  if (!modal || !sendBtn || !cancelBtn) {
    return;
  }

  sendBtn.addEventListener('click', submitLearnRequest);
  cancelBtn.addEventListener('click', closeLearnRequestModal);
  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      closeLearnRequestModal();
    }
  });
}

function initLearnAdminModalDrag() {
  const modalCard = document.querySelector('#learnAdminModal .learn-admin-modal-card');
  const modalHeader = document.querySelector('#learnAdminModal .learn-admin-modal-head');
  if (!modalCard || !modalHeader) {
    return;
  }

  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let offsetX = 0;
  let offsetY = 0;

  modalHeader.addEventListener('pointerdown', (event) => {
    if (window.innerWidth < 769) {
      return;
    }

    isDragging = true;
    startX = event.clientX - offsetX;
    startY = event.clientY - offsetY;
    modalHeader.setPointerCapture(event.pointerId);
  });

  modalHeader.addEventListener('pointermove', (event) => {
    if (!isDragging) {
      return;
    }

    offsetX = event.clientX - startX;
    offsetY = event.clientY - startY;
    modalCard.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
  });

  function stopDragging(event) {
    if (!isDragging) {
      return;
    }

    isDragging = false;
    if (event) {
      modalHeader.releasePointerCapture(event.pointerId);
    }
  }

  modalHeader.addEventListener('pointerup', stopDragging);
  modalHeader.addEventListener('pointercancel', stopDragging);
}

async function refreshEditorState(forceBlockReload = true) {
  const cachedUser = getCachedAuthUser();
  if (cachedUser) {
    applyEditorUser(cachedUser);
  }

  try {
    const response = await fetchJsonNoStore('/api/auth/session', { credentials: 'include' });
    if (!response.ok) {
      localStorage.removeItem('authUser');
      applyEditorUser(null);
      return;
    }

    const data = await response.json();
    if (data.authenticated && data.user) {
      localStorage.setItem('authUser', JSON.stringify(data.user));
      applyEditorUser(data.user);
      if (forceBlockReload) {
        await loadLearnBlocks(currentTopicId, true);
      }
      return;
    }
  } catch (error) {
    console.error('Could not verify editor state on learn page.', error);
  }

  applyEditorUser(cachedUser);
}

function applyEditorUser(user) {
  learnEditorState.user = user || null;
  learnEditorState.isAdmin = Boolean(user && user.role === 'admin');
  learnEditorState.isEditor = Boolean(user && ['admin', 'staff'].includes(user.role));
  toggleLearnEditorButton(learnEditorState.isEditor);
  if (learnBlocksCache[currentTopicId]) {
    renderLearnBlocks(currentTopicId, learnBlocksCache[currentTopicId]);
  }
}

function toggleLearnEditorButton(show) {
  const addBtn = document.getElementById('learnAdminAddBtn');
  if (addBtn) {
    addBtn.hidden = !show;
  }
}

function updateEditorTopicLabel() {
  const label = document.getElementById('learnAdminTopicLabel');
  if (label) {
    label.textContent = `Topic: ${TOPIC_LABELS[currentTopicId] || 'Learn'}`;
  }
}

function startCreateLearnBlock() {
  if (!learnEditorState.isEditor) {
    return;
  }

  learnEditorState.mode = 'create';
  learnEditorState.editingBlockId = '';
  document.getElementById('learnBlockType').value = 'heading';
  applyPreset('heading');
  document.getElementById('learnAdminSaveBtn').textContent = 'Save';
  document.querySelector('#learnAdminModal h3').textContent = 'Add Learn Content';
  updateEditorTopicLabel();
  syncLearnEditorFields();
  updatePreview();
  setLearnAdminStatus('', 'info');
  document.getElementById('learnAdminModal').hidden = false;
}

function openEditLearnBlock(blockId) {
  const block = findLearnBlock(blockId);
  if (!block || !block.can_edit) {
    return;
  }

  learnEditorState.mode = 'edit';
  learnEditorState.editingBlockId = blockId;
  document.getElementById('learnBlockType').value = block.block_type || 'content';
  document.getElementById('learnBlockContent').value = block.content || '';
  document.getElementById('learnBlockColor').value = sanitizeColorToken(block.text_color);
  document.getElementById('learnBlockFontSize').value = String(sanitizeFontSize(block.font_size));
  document.getElementById('learnBlockAlign').value = sanitizeAlignment(block.text_align);
  document.getElementById('learnAdminSaveBtn').textContent = 'Done';
  document.querySelector('#learnAdminModal h3').textContent = 'Edit Learn Content';
  updateEditorTopicLabel();
  syncLearnEditorFields();
  updatePreview();
  setLearnAdminStatus('', 'info');
  document.getElementById('learnAdminModal').hidden = false;
}

function handleLearnEditorPrimaryAction() {
  const payload = buildLearnEditorPayload();
  if (!payload) {
    return;
  }

  if (learnEditorState.mode === 'edit') {
    openLearnConfirmModal(
      'Confirm Update',
      'Save the latest changes to this content block?',
      async () => {
        await updateLearnBlock(payload);
      }
    );
    return;
  }

  saveLearnBlock(payload);
}

function buildLearnEditorPayload() {
  const blockType = document.getElementById('learnBlockType').value;
  const payload = {
    topic: currentTopicId,
    block_type: blockType,
    content: normalizeLearnContent(document.getElementById('learnBlockContent').value),
    text_color: blockType === 'code' ? 'white' : sanitizeColorToken(document.getElementById('learnBlockColor').value),
    font_size: blockType === 'code' ? 16 : sanitizeFontSize(document.getElementById('learnBlockFontSize').value),
    text_align: sanitizeAlignment(document.getElementById('learnBlockAlign').value),
  };

  if (payload.content.length < 2) {
    setLearnAdminStatus('Please enter at least 2 characters.', 'error');
    return null;
  }

  return payload;
}

async function saveLearnBlock(payload) {
  const saveBtn = document.getElementById('learnAdminSaveBtn');
  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving...';
  setLearnAdminStatus('Saving content...', 'info');

  try {
    const response = await fetch('/api/editor/learn/blocks', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || 'Could not save learn content');
    }

    await loadLearnBlocks(currentTopicId, true);
    closeLearnAdminModal();
  } catch (error) {
    setLearnAdminStatus(error.message, 'error');
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = learnEditorState.mode === 'edit' ? 'Done' : 'Save';
  }
}

async function updateLearnBlock(payload) {
  const saveBtn = document.getElementById('learnAdminSaveBtn');
  saveBtn.disabled = true;
  saveBtn.textContent = 'Updating...';
  setLearnAdminStatus('Updating content...', 'info');

  try {
    const response = await fetch(`/api/editor/learn/blocks/${learnEditorState.editingBlockId}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || 'Could not update learn content');
    }

    closeLearnAdminConfirmModal();
    await loadLearnBlocks(currentTopicId, true);
    closeLearnAdminModal();
  } catch (error) {
    setLearnAdminStatus(error.message, 'error');
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = 'Done';
  }
}

function confirmDeleteLearnBlock(blockId) {
  const block = findLearnBlock(blockId);
  if (!block || !block.can_delete) {
    return;
  }

  openLearnConfirmModal(
    'Delete Content',
    'This will permanently delete the content block. Continue?',
    async () => {
      await deleteLearnBlock(blockId);
    }
  );
}

async function deleteLearnBlock(blockId) {
  setLearnConfirmStatus('Deleting content...', 'info');

  try {
    const response = await fetch(`/api/editor/learn/blocks/${blockId}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || 'Could not delete learn content');
    }

    closeLearnAdminConfirmModal();
    await loadLearnBlocks(currentTopicId, true);
  } catch (error) {
    setLearnConfirmStatus(error.message, 'error');
  }
}

function openLearnRequestModal(blockId, requestType) {
  const block = findLearnBlock(blockId);
  const canRequest = requestType === 'delete' ? block?.can_request_delete || block?.delete_request_status === 'rejected' : block?.can_request_edit || block?.edit_request_status === 'rejected';
  if (!block || !canRequest) {
    return;
  }

  learnEditorState.pendingRequest = { blockId, requestType };
  document.getElementById('learnRequestTitle').textContent = requestType === 'delete' ? 'Request Delete Permission' : 'Request Edit Permission';
  document.getElementById('learnRequestText').textContent = `This request will be sent to ${block.created_by_name || 'the content owner'}.`;
  document.getElementById('learnRequestComment').value = '';
  setLearnRequestStatus('', 'info');
  document.getElementById('learnRequestModal').hidden = false;
}

async function submitLearnRequest() {
  const pendingRequest = learnEditorState.pendingRequest;
  if (!pendingRequest) {
    return;
  }

  const comment = normalizeLearnContent(document.getElementById('learnRequestComment').value);
  if (comment.length < 10) {
    setLearnRequestStatus('Please enter at least 10 characters for the request comment.', 'error');
    return;
  }

  const sendBtn = document.getElementById('learnRequestSendBtn');
  sendBtn.disabled = true;
  sendBtn.textContent = 'Sending...';
  setLearnRequestStatus('Sending request...', 'info');

  try {
    const response = await fetch('/api/staff/learn/requests', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        block_id: pendingRequest.blockId,
        request_type: pendingRequest.requestType,
        requested_comment: comment,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || 'Could not send request.');
    }

    setLearnRequestStatus(data.message || 'Request sent successfully.', 'success');
    notifyLearnRequestSync('learn-request-created', {
      blockId: pendingRequest.blockId,
      requestType: pendingRequest.requestType,
    });
    setTimeout(() => {
      closeLearnRequestModal();
      loadLearnBlocks(currentTopicId, true);
    }, 700);
  } catch (error) {
    setLearnRequestStatus(error.message, 'error');
  } finally {
    sendBtn.disabled = false;
    sendBtn.textContent = 'Send Request';
  }
}

function openLearnConfirmModal(title, text, action) {
  learnEditorState.pendingAction = action;
  document.getElementById('learnAdminConfirmTitle').textContent = title;
  document.getElementById('learnAdminConfirmText').textContent = text;
  setLearnConfirmStatus('', 'info');
  document.getElementById('learnAdminConfirmModal').hidden = false;
}

async function runConfirmedLearnAction() {
  const action = learnEditorState.pendingAction;
  if (!action) {
    return;
  }

  const confirmBtn = document.getElementById('learnAdminConfirmYesBtn');
  confirmBtn.disabled = true;
  confirmBtn.textContent = 'Processing...';

  try {
    await action();
  } finally {
    confirmBtn.disabled = false;
    confirmBtn.textContent = 'Confirm';
  }
}

function closeLearnAdminModal() {
  document.getElementById('learnAdminModal').hidden = true;
  document.querySelector('#learnAdminModal .learn-admin-modal-card').style.transform = '';
  setLearnAdminStatus('', 'info');
}

function closeLearnAdminConfirmModal() {
  learnEditorState.pendingAction = null;
  document.getElementById('learnAdminConfirmModal').hidden = true;
  setLearnConfirmStatus('', 'info');
}

function closeLearnRequestModal() {
  learnEditorState.pendingRequest = null;
  document.getElementById('learnRequestModal').hidden = true;
  setLearnRequestStatus('', 'info');
}

function setLearnAdminStatus(message, type) {
  setStatusText('learnAdminStatus', message, type);
}

function setLearnConfirmStatus(message, type) {
  setStatusText('learnAdminConfirmStatus', message, type);
}

function setLearnRequestStatus(message, type) {
  setStatusText('learnRequestStatus', message, type);
}

function setStatusText(elementId, message, type) {
  const status = document.getElementById(elementId);
  if (!status) {
    return;
  }

  status.textContent = message;
  if (type === 'error') {
    status.style.color = '#fb923c';
    return;
  }

  if (type === 'success') {
    status.style.color = '#00ff88';
    return;
  }

  status.style.color = '#38bdf8';
}

function renderRequestNotice(requestType, detail) {
  if (!detail || detail.status !== 'rejected') {
    return '';
  }

  const label = requestType === 'delete' ? 'Delete' : 'Edit';
  const decisionComment = escapeHtml(detail.decision_comment || 'No reason was added.');
  const decidedAt = detail.decided_at ? escapeHtml(formatDateTime(detail.decided_at)) : 'Recently';

  return `
    <div class="learn-request-feedback rejected">
      <strong>${label} request rejected.</strong> ${decisionComment}
      <span class="learn-request-feedback-time">Rejected: ${decidedAt}</span>
    </div>
  `;
}

function applyPreset(blockType) {
  const preset = BLOCK_PRESETS[blockType] || BLOCK_PRESETS.content;
  document.getElementById('learnBlockContent').value = preset.content;
  document.getElementById('learnBlockColor').value = preset.textColor;
  document.getElementById('learnBlockFontSize').value = String(preset.fontSize);
  document.getElementById('learnBlockAlign').value = preset.textAlign;
}

function updatePreview() {
  const preview = document.getElementById('learnAdminPreview');
  const blockType = document.getElementById('learnBlockType').value;
  const content = normalizeLearnContent(document.getElementById('learnBlockContent').value) || 'Your styled content will appear here.';
  const color = blockType === 'code' ? '' : resolveThemeColorToken(document.getElementById('learnBlockColor').value);
  const fontSize = blockType === 'code' ? 16 : sanitizeFontSize(document.getElementById('learnBlockFontSize').value);
  const textAlign = sanitizeAlignment(document.getElementById('learnBlockAlign').value);

  preview.className = `learn-admin-preview learn-custom-block is-${blockType}`;
  preview.style.color = color;
  preview.style.fontSize = `${fontSize}px`;
  preview.style.textAlign = textAlign;

  if (blockType === 'code') {
    preview.innerHTML = renderLearnCodeContent(content, true);
    return;
  }

  preview.textContent = content;
}

function syncLearnEditorFields() {
  const blockType = document.getElementById('learnBlockType').value;
  const colorGroup = document.getElementById('learnBlockColorGroup');
  const fontSizeGroup = document.getElementById('learnBlockFontSizeGroup');
  const colorInput = document.getElementById('learnBlockColor');
  const fontSizeInput = document.getElementById('learnBlockFontSize');
  const isCode = blockType === 'code';

  colorGroup.hidden = isCode;
  fontSizeGroup.hidden = isCode;
  colorInput.disabled = isCode;
  fontSizeInput.disabled = isCode;

  if (isCode) {
    colorInput.value = 'white';
    fontSizeInput.value = '16';
  }
}

function findLearnBlock(blockId) {
  const blocks = learnBlocksCache[currentTopicId] || [];
  return blocks.find((block) => String(block.id) === String(blockId)) || null;
}

function getCachedAuthUser() {
  try {
    const cachedUser = JSON.parse(localStorage.getItem('authUser') || 'null');
    if (!cachedUser || !cachedUser.email) {
      return null;
    }
    return cachedUser;
  } catch {
    return null;
  }
}

function getCustomBlockMount(topicId) {
  return document.querySelector(`.learn-custom-blocks[data-topic="${topicId}"]`);
}

function sanitizeColorToken(value) {
  const normalized = String(value || '').trim().toLowerCase();
  const allowedColors = ['black', 'white', 'blue', 'red', 'green', 'yellow', 'orange', 'purple', 'pink', 'gray'];
  return allowedColors.includes(normalized) ? normalized : 'black';
}

function resolveThemeColorToken(value) {
  return `var(--learn-color-${sanitizeColorToken(value)})`;
}

function sanitizeFontSize(value) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    return 18;
  }
  return Math.max(12, Math.min(parsed, 72));
}

function sanitizeAlignment(value) {
  return ['left', 'center', 'right'].includes(value) ? value : 'left';
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function formatLearnBlockContent(value) {
  return escapeHtml(normalizeLearnContent(value)).replaceAll('\n', '<br>');
}

function normalizeLearnContent(value) {
  return String(value || '')
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function renderLearnCodeContent(value, isPreview = false) {
  const highlightedCode = highlightCodeTokens(normalizeLearnContent(value));
  const actionLabel = isPreview ? 'Preview' : 'Copy';
  const toggleLabel = 'Show All';

  return `
    <div class="code-block learn-code-panel is-collapsed" style="margin: 0;">
      <div class="code-block-header">
        <span class="code-block-lang">Java</span>
        <div class="learn-code-block-actions">
          <button class="learn-code-toggle" type="button" onclick="toggleLearnCodeBlock(this)">${toggleLabel}</button>
          <button class="code-block-copy" type="button">${actionLabel}</button>
        </div>
      </div>
      <pre class="learn-code-block-body"><code>${highlightedCode}</code></pre>
    </div>
  `;
}

function toggleLearnCodeBlock(button) {
  const codePanel = button.closest('.learn-code-panel');
  if (!codePanel) {
    return;
  }

  const isCollapsed = codePanel.classList.toggle('is-collapsed');
  button.textContent = isCollapsed ? 'Show All' : 'Show Less';
}

function highlightCodeTokens(value) {
  let html = escapeHtml(value);

  html = html.replace(/(\/\/[^\n<]*)/g, '<span class="code-comment">$1</span>');
  html = html.replace(/("(?:[^"\\]|\\.)*")/g, '<span class="code-string">$1</span>');
  html = html.replace(/\b(\d+)\b/g, '<span class="code-string">$1</span>');
  html = html.replace(/\b(public|private|protected|class|void|return|new|static|if|else|for|while|true|false|boolean)\b/g, '<span class="code-keyword">$1</span>');
  html = html.replace(/\b(By|String|WebElement|WebDriver|Select|List|Set|Duration|Alert|ChromeDriver|ExpectedConditions|WebDriverWait)\b/g, '<span class="code-class">$1</span>');
  html = html.replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)\s*(?=\()/g, '<span class="code-method">$1</span>');
  return html.replace(/\n/g, '<br>');
}

function formatDateTime(value) {
  if (!value) {
    return 'Not available';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString();
}
