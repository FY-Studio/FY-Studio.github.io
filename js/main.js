document.addEventListener('DOMContentLoaded', function() {
    let selectedFiles = new Set();
    let currentPath = 'uploads';
    let allFiles = [];
    let currentFiles = [];

    const fileList = document.getElementById('fileList');
    const fileListContainer = document.getElementById('fileListContainer');
    const loading = document.getElementById('loading');
    const emptyState = document.getElementById('emptyState');
    const breadcrumb = document.getElementById('breadcrumb');
    const contextMenu = document.getElementById('contextMenu');
    const backBtn = document.getElementById('backBtn');
    const refreshBtn = document.getElementById('refreshBtn');
    const selectAllCheckbox = document.getElementById('selectAllCheckbox');
    const downloadSelectedBtn = document.getElementById('downloadSelectedBtn');

    const fileIcons = {
        'folder': 'bi-folder-fill',
        'zip': 'bi-file-earmark-zip-fill',
        'rar': 'bi-file-earmark-zip-fill',
        '7z': 'bi-file-earmark-zip-fill',
        'pdf': 'bi-file-earmark-pdf-fill',
        'jpg': 'bi-file-image-fill',
        'jpeg': 'bi-file-image-fill',
        'png': 'bi-file-image-fill',
        'gif': 'bi-file-image-fill',
        'txt': 'bi-file-text-fill',
        'md': 'bi-file-text-fill',
        'doc': 'bi-file-earmark-word-fill',
        'docx': 'bi-file-earmark-word-fill',
        'xls': 'bi-file-earmark-excel-fill',
        'xlsx': 'bi-file-earmark-excel-fill',
        'ppt': 'bi-file-earmark-ppt-fill',
        'pptx': 'bi-file-earmark-ppt-fill',
        'mp3': 'bi-file-music-fill',
        'wav': 'bi-file-music-fill',
        'mp4': 'bi-file-play-fill',
        'avi': 'bi-file-play-fill',
        'mov': 'bi-file-play-fill',
        'html': 'bi-file-code-fill',
        'css': 'bi-file-code-fill',
        'js': 'bi-file-code-fill',
        'json': 'bi-file-code-fill',
        'php': 'bi-file-code-fill',
        'py': 'bi-file-code-fill',
        'java': 'bi-file-code-fill',
        'cpp': 'bi-file-code-fill',
        'c': 'bi-file-code-fill',
        'default': 'bi-file-earmark-fill'
    };

    const fileTypeColors = {
        'folder': 'folder-icon',
        'zip': 'file-icon-zip',
        'rar': 'file-icon-zip',
        '7z': 'file-icon-zip',
        'pdf': 'file-icon-pdf',
        'jpg': 'file-icon-image',
        'jpeg': 'file-icon-image',
        'png': 'file-icon-image',
        'gif': 'file-icon-image',
        'mp3': 'file-icon-audio',
        'wav': 'file-icon-audio',
        'mp4': 'file-icon-video',
        'avi': 'file-icon-video',
        'mov': 'file-icon-video',
        'txt': 'file-icon-text',
        'md': 'file-icon-text',
        'doc': 'file-icon-office',
        'docx': 'file-icon-office',
        'xls': 'file-icon-office',
        'xlsx': 'file-icon-office',
        'ppt': 'file-icon-office',
        'pptx': 'file-icon-office',
        'html': 'file-icon-code',
        'css': 'file-icon-code',
        'js': 'file-icon-code',
        'json': 'file-icon-code',
        'php': 'file-icon-code',
        'py': 'file-icon-code',
        'java': 'file-icon-code',
        'cpp': 'file-icon-code',
        'c': 'file-icon-code',
        'default': 'file-icon-default'
    };

    init();

    async function init() {
        setupEventListeners();
        await loadFiles(currentPath);
    }

    function setupEventListeners() {
        backBtn.addEventListener('click', goBack);
        refreshBtn.addEventListener('click', () => loadFiles(currentPath));
        selectAllCheckbox.addEventListener('change', toggleSelectAll);
        downloadSelectedBtn.addEventListener('click', downloadSelectedFiles);
        document.getElementById('menuDownload').addEventListener('click', () => {
            downloadSelectedFiles();
            hideContextMenu();
        });
        document.addEventListener('click', hideContextMenu);
        document.addEventListener('keydown', handleKeyDown);
    }

    async function loadFiles(path = 'uploads') {
        showLoading();
        currentPath = path;
        try {
            const files = await fetchFilesFromGitHub(path);
            allFiles = files;
            currentFiles = files;
            displayFiles(files);
            updateBreadcrumb(path);
            hideLoading();
            updateDownloadButton();
        } catch (error) {
            console.error('Error loading files:', error);
            hideLoading();
            showEmptyState();
        }
    }

    async function fetchFilesFromGitHub(path) {
        const apiUrl = `https://api.github.com/repos/FY-Studio/fystudio.github.io/contents/${path === 'uploads' ? 'uploads' : path}`;
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`);
        }
        const data = await response.json();
        return data.map(item => {
            const isDir = item.type === 'dir';
            const ext = isDir ? '' : getFileExtension(item.name);
            return {
                name: item.name,
                type: isDir ? 'folder' : 'file',
                path: item.path,
                size: formatFileSize(item.size || 0),
                        downloadUrl: item.download_url,
                        ext: ext
            };
        });
    }

    function displayFiles(files) {
        fileList.innerHTML = '';
        clearSelection(); // 清除选中状态

        if (files.length === 0) {
            showEmptyState();
            return;
        }
        hideEmptyState();
        files.forEach((file, index) => {
            const row = createFileRow(file, index);
            fileList.appendChild(row);
        });
        updateSelectAllCheckbox();
    }

    function createFileRow(file, index) {
        const row = document.createElement('tr');
        row.className = 'file-item';
        row.dataset.path = file.path;
        row.dataset.type = file.type;
        row.dataset.index = index;

        const fileIcon = getFileIcon(file);
        const fileIconClass = getFileIconClass(file);

        row.innerHTML = `
        <td>
        <input type="checkbox" class="form-check-input file-checkbox"
        data-path="${file.path}">
        </td>
        <td class="text-center">
        <span class="file-icon ${fileIconClass}">
        <i class="bi ${fileIcon}"></i>
        </span>
        </td>
        <td>
        <div class="d-flex align-items-center">
        <span class="file-name">${file.name}</span>
        </div>
        </td>
        <td class="text-center"><small class="text-muted">${file.size}</small></td>
        <td class="text-center">
        ${file.type === 'folder' ?
            `<button class="btn btn-sm btn-outline-primary open-btn" data-path="${file.path}">
            <i class="bi bi-folder2-open"></i>
            </button>` :
            `<button class="btn btn-sm btn-outline-primary download-btn" data-path="${file.path}">
            <i class="bi bi-download"></i>
            </button>`
        }
        </td>
        `;

        row.addEventListener('click', (e) => {
            if (e.target.type === 'checkbox' || e.target.classList.contains('file-checkbox')) {
                return;
            }
            if (e.target.tagName === 'BUTTON') {
                return;
            }
            toggleFileSelection(file.path);
        });

        row.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            clearSelection();
            selectFile(file.path);
            showContextMenu(e, file);
        });

        const openBtn = row.querySelector('.open-btn');
        if (openBtn) {
            openBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                loadFiles(file.path);
            });
        }

        const downloadBtn = row.querySelector('.download-btn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                downloadFile(file);
            });
        }

        const checkbox = row.querySelector('.file-checkbox');
        checkbox.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFileSelection(file.path, checkbox.checked);
        });

        return row;
    }

    function toggleFileSelection(filePath, checked = null) {
        const checkbox = document.querySelector(`.file-checkbox[data-path="${filePath}"]`);
        const row = document.querySelector(`.file-item[data-path="${filePath}"]`);

        if (checked === null) {
            checked = !selectedFiles.has(filePath);
        }

        if (checked) {
            selectedFiles.add(filePath);
            if (row) row.classList.add('selected');
            if (checkbox) checkbox.checked = true;
        } else {
            selectedFiles.delete(filePath);
            if (row) row.classList.remove('selected');
            if (checkbox) checkbox.checked = false;
        }

        updateSelectAllCheckbox();
        updateDownloadButton();
    }

    function selectFile(filePath) {
        selectedFiles.add(filePath);
        const row = document.querySelector(`.file-item[data-path="${filePath}"]`);
        if (row) row.classList.add('selected');
        const checkbox = document.querySelector(`.file-checkbox[data-path="${filePath}"]`);
        if (checkbox) checkbox.checked = true;
        updateDownloadButton();
    }

    function clearSelection() {
        selectedFiles.forEach(path => {
            const row = document.querySelector(`.file-item[data-path="${path}"]`);
            if (row) row.classList.remove('selected');
            const checkbox = document.querySelector(`.file-checkbox[data-path="${path}"]`);
            if (checkbox) checkbox.checked = false;
        });
            selectedFiles.clear();
            updateDownloadButton();
    }

    function toggleSelectAll() {
        const checked = selectAllCheckbox.checked;
        if (checked) {
            currentFiles.forEach(file => {
                selectedFiles.add(file.path);
                const row = document.querySelector(`.file-item[data-path="${file.path}"]`);
                if (row) row.classList.add('selected');
                const checkbox = document.querySelector(`.file-checkbox[data-path="${file.path}"]`);
                if (checkbox) checkbox.checked = true;
            });
        } else {
            clearSelection();
        }
        updateDownloadButton();
    }

    function updateSelectAllCheckbox() {
        const checkboxes = document.querySelectorAll('.file-checkbox');
        const allChecked = checkboxes.length > 0 &&
        Array.from(checkboxes).every(cb => cb.checked);
        selectAllCheckbox.checked = allChecked;
    }

    function updateDownloadButton() {
        const hasSelectedFiles = selectedFiles.size > 0;
        downloadSelectedBtn.disabled = !hasSelectedFiles;
        if (hasSelectedFiles) {
            downloadSelectedBtn.innerHTML = `<i class="bi bi-download me-1"></i>Download (${selectedFiles.size})`;
        } else {
            downloadSelectedBtn.innerHTML = '<i class="bi bi-download me-1"></i>Download';
        }
    }

    async function downloadFile(file) {
        if (file.type === 'folder') {
            loadFiles(file.path);
            return;
        }
        let downloadUrl = file.downloadUrl;
        if (!downloadUrl) {
            downloadUrl = `https://raw.githubusercontent.com/FY-Studio/fystudio.github.io/main/${file.path}`;
        }
        window.open(downloadUrl, '_blank');
        showToast(`Downloading: ${file.name}`);
    }

    async function downloadSelectedFiles() {
        if (selectedFiles.size === 0) {
            showToast('Please select files to download', 'warning');
            return;
        }
        if (selectedFiles.size === 1) {
            const path = Array.from(selectedFiles)[0];
            const file = allFiles.find(f => f.path === path);
            if (file) {
                downloadFile(file);
            }
            return;
        }
        showToast('Creating zip file...', 'info');
        const zip = new JSZip();
        let fileCount = 0;
        for (const path of selectedFiles) {
            const file = allFiles.find(f => f.path === path);
            if (file) {
                if (file.type === 'folder') {
                    await addFolderToZip(zip, file.path, file.path);
                } else {
                    await addFileToZip(zip, file);
                }
                fileCount++;
            }
        }
        zip.generateAsync({ type: 'blob' }).then(content => {
            saveAs(content, 'download.zip');
            showToast(`Downloading ${fileCount} files as zip`);
        });
    }

    async function addFolderToZip(zip, folderPath, basePath) {
        try {
            const files = await fetchFilesFromGitHub(folderPath);
            for (const file of files) {
                const relativePath = file.path.replace(basePath + '/', '');
                if (file.type === 'folder') {
                    await addFolderToZip(zip.folder(file.name), file.path, basePath);
                } else {
                    await addFileToZip(zip, file, relativePath);
                }
            }
        } catch (error) {
            console.error('Error adding folder to zip:', error);
        }
    }

    async function addFileToZip(zip, file, relativePath = null) {
        try {
            let downloadUrl = file.downloadUrl;
            if (!downloadUrl) {
                downloadUrl = `https://raw.githubusercontent.com/FY-Studio/fystudio.github.io/main/${file.path}`;
            }
            const response = await fetch(downloadUrl);
            if (!response.ok) throw new Error('Failed to fetch file');
            const blob = await response.blob();
            const filename = relativePath || file.name;
            zip.file(filename, blob);
        } catch (error) {
            console.error('Error adding file to zip:', error);
        }
    }

    function showContextMenu(event, file) {
        contextMenu.style.left = event.pageX + 'px';
        contextMenu.style.top = event.pageY + 'px';
        contextMenu.style.display = 'block';
    }

    function hideContextMenu() {
        contextMenu.style.display = 'none';
    }

    function goBack() {
        if (currentPath === 'uploads') {
            showToast('Already at root', 'info');
            return;
        }
        const parentPath = getParentPath(currentPath);
        loadFiles(parentPath);
    }

    function updateBreadcrumb(path) {
        breadcrumb.innerHTML = '<li class="breadcrumb-item"><a href="#" data-path="uploads">Root</a></li>';
        if (path === 'uploads') return;
        const parts = path.split('/');
        let current = 'uploads';
        parts.forEach((part, index) => {
            if (part === 'uploads' || part === '') return;
            current += (current ? '/' : '') + part;
            const isLast = index === parts.length - 1;
            const li = document.createElement('li');
            li.className = `breadcrumb-item ${isLast ? 'active' : ''}`;
            if (isLast) {
                li.textContent = part;
            } else {
                const link = document.createElement('a');
                link.href = '#';
                link.textContent = part;
                link.dataset.path = current;
                li.appendChild(link);
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    loadFiles(current);
                });
            }
            breadcrumb.appendChild(li);
        });
    }

    function handleKeyDown(e) {
        if (e.ctrlKey && e.key === 'a') {
            e.preventDefault();
            currentFiles.forEach(file => selectFile(file.path));
        }
        if (e.ctrlKey && e.key === 'd') {
            e.preventDefault();
            clearSelection();
        }
        if (e.key === 'Backspace' && !e.target.matches('input, textarea')) {
            e.preventDefault();
            goBack();
        }
        if (e.key === 'F5') {
            e.preventDefault();
            loadFiles(currentPath);
        }
    }

    function getFileExtension(filename) {
        return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2).toLowerCase();
    }

    function getFileIcon(file) {
        if (file.type === 'folder') {
            return fileIcons.folder;
        }
        const ext = getFileExtension(file.name);
        return fileIcons[ext] || fileIcons.default;
    }

    function getFileIconClass(file) {
        if (file.type === 'folder') {
            return fileTypeColors.folder;
        }
        const ext = getFileExtension(file.name);
        return fileTypeColors[ext] || fileTypeColors.default;
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const units = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + units[i];
    }

    function getParentPath(path) {
        if (path === 'uploads') return 'uploads';
        const parts = path.split('/');
        parts.pop();
        return parts.length === 0 ? 'uploads' : parts.join('/');
    }

    function showLoading() {
        loading.style.display = 'block';
        fileListContainer.style.display = 'none';
        emptyState.style.display = 'none';
    }

    function hideLoading() {
        loading.style.display = 'none';
        fileListContainer.style.display = 'block';
    }

    function showEmptyState() {
        fileListContainer.style.display = 'none';
        emptyState.style.display = 'block';
    }

    function hideEmptyState() {
        emptyState.style.display = 'none';
    }

    function showToast(message, type = 'success') {
        const oldToast = document.querySelector('.toast-notification');
        if (oldToast) oldToast.remove();
        const colors = {
            success: 'linear-gradient(135deg, #4dabf7, #339af0)',
                          error: 'linear-gradient(135deg, #ff6b6b, #ff8e8e)',
                          warning: 'linear-gradient(135deg, #ffd166, #ffb347)',
                          info: 'linear-gradient(135deg, #a8edea, #fed6e3)'
        };
        const toast = document.createElement('div');
        toast.className = 'toast-notification position-fixed text-white';
        toast.style.cssText = `
        bottom: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 12px;
        z-index: 1050;
        animation: slideIn 0.3s ease-out;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        background: ${colors[type] || colors.success};
        `;
        toast.innerHTML = message;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        }, 3000);
        if (!document.querySelector('#toast-animations')) {
            const style = document.createElement('style');
            style.id = 'toast-animations';
            style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
            `;
            document.head.appendChild(style);
        }
    }
});
