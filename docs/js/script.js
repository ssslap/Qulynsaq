/**
 * Основной JavaScript файл для сайта детского сада "Құлыншақ 2019"
 * Обработка навигации по документам и просмотр файлов
 */

document.addEventListener('DOMContentLoaded', function() {
    // Элементы DOM
    const foldersList = document.getElementById('folders-list');
    const filesView = document.getElementById('files-view');
    const filesList = document.getElementById('files-list');
    const currentFolderName = document.getElementById('current-folder-name');
    const backButton = document.getElementById('back-button');
    const documentModal = document.getElementById('document-modal');
    const closeModal = document.getElementById('close-modal');
    const modalTitle = document.getElementById('modal-title');
    const pdfViewer = document.getElementById('pdf-viewer');
    const imageViewer = document.getElementById('image-viewer');
    const unsupportedViewer = document.getElementById('unsupported-viewer');
    const downloadLink = document.getElementById('download-link');
    
    // Данные о документах
    let documentsData = null;
    let currentFolder = null;
    
    // Инициализация
    init();
    
    /**
     * Инициализация приложения
     */
    async function init() {
        try {
            // Загружаем данные о документах
            await loadDocumentsData();
            
            // Показываем папки
            renderFolders();
            
            // Назначаем обработчики событий
            setupEventListeners();
            
            console.log('Приложение инициализировано успешно');
        } catch (error) {
            console.error('Ошибка при инициализации:', error);
            showError('Деректерді жүктеу кезінде қате пайда болды. Бетті жаңартыңыз.');
        }
    }
    
    /**
     * Загружает данные о документах из JSON файла
     */
    async function loadDocumentsData() {
        try {
            const response = await fetch('js/documents.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            documentsData = await response.json();
            console.log('Данные документов загружены:', documentsData);
        } catch (error) {
            console.error('Ошибка загрузки documents.json:', error);
            // Создаем заглушку, если файл не загрузился
            documentsData = {
                folders: [],
                total_folders: 0,
                total_files: 0
            };
        }
    }
    
    /**
     * Отображает список папок
     */
    function renderFolders() {
        if (!documentsData || !documentsData.folders) {
            foldersList.innerHTML = '<p class="no-data">Деректер жоқ</p>';
            return;
        }
        
        if (documentsData.folders.length === 0) {
            foldersList.innerHTML = '<p class="no-data">Ешқандай құжаттар табылмады</p>';
            return;
        }
        
        foldersList.innerHTML = '';
        
        documentsData.folders.forEach(folder => {
            const folderCard = createFolderCard(folder);
            foldersList.appendChild(folderCard);
        });
    }
    
    /**
     * Создает карточку папки
     */
    function createFolderCard(folder) {
        const card = document.createElement('div');
        card.className = 'folder-card';
        card.dataset.folderName = folder.name;
        
        // Определяем иконку в зависимости от типа папки
        let iconClass = 'fas fa-folder';
        let description = `${folder.files.length} файл`;
        
        if (folder.name.includes('дене')) {
            iconClass = 'fas fa-running';
            description = 'Дене шынықтыру құжаттары';
        } else if (folder.name.includes('Қазақ тілі')) {
            iconClass = 'fas fa-language';
            description = 'Қазақ тілі құжаттары';
        } else if (folder.name.includes('перспектива')) {
            iconClass = 'fas fa-chart-line';
            description = 'Перспективалық жоспарлар';
        } else if (folder.name.includes('МУЗЫКА')) {
            iconClass = 'fas fa-music';
            description = 'Музыка құжаттары';
        } else if (folder.name.includes('құжаттары')) {
            iconClass = 'fas fa-archive';
            description = 'Негізгі құжаттар';
        } else if (folder.name.includes('2024-2025') || folder.name.includes('2025-2026')) {
            iconClass = 'fas fa-calendar-alt';
            description = 'Оқу жылына арналған құжаттар';
        }
        
        card.innerHTML = `
            <div class="folder-icon">
                <i class="${iconClass}"></i>
            </div>
            <div class="folder-info">
                <h3>${folder.name}</h3>
                <p>${description} • ${folder.files.length} файл</p>
            </div>
        `;
        
        card.addEventListener('click', () => openFolder(folder));
        
        return card;
    }
    
    /**
     * Открывает папку и показывает ее файлы
     */
    function openFolder(folder) {
        currentFolder = folder;
        
        // Показываем заголовок папки
        currentFolderName.textContent = folder.name;
        
        // Скрываем список папок, показываем файлы
        foldersList.style.display = 'none';
        filesView.style.display = 'block';
        
        // Отображаем файлы
        renderFiles(folder.files);
        
        // Прокручиваем к началу секции
        document.getElementById('documents').scrollIntoView({ behavior: 'smooth' });
    }
    
    /**
     * Отображает список файлов в папке
     */
    function renderFiles(files) {
        filesList.innerHTML = '';
        
        if (!files || files.length === 0) {
            filesList.innerHTML = '<p class="no-data">Бұл қапшықта ешқандай файл жоқ</p>';
            return;
        }
        
        files.forEach(file => {
            const fileCard = createFileCard(file);
            filesList.appendChild(fileCard);
        });
    }
    
    /**
     * Создает карточку файла
     */
    function createFileCard(file) {
        const card = document.createElement('div');
        card.className = 'file-card';
        card.dataset.fileName = file.name;
        card.dataset.filePath = file.path;
        
        // Определяем иконку по типу файла
        let iconClass = 'fas fa-file';
        let fileTypeText = 'Файл';
        
        switch (file.type) {
            case 'pdf':
                iconClass = 'fas fa-file-pdf';
                fileTypeText = 'PDF құжаты';
                break;
            case 'image':
                iconClass = 'fas fa-file-image';
                fileTypeText = 'Сурет';
                break;
            case 'document':
                iconClass = 'fas fa-file-word';
                fileTypeText = 'Документ';
                break;
            case 'text':
                iconClass = 'fas fa-file-alt';
                fileTypeText = 'Мәтін файлы';
                break;
            case 'archive':
                iconClass = 'fas fa-file-archive';
                fileTypeText = 'Архив';
                break;
        }
        
        // Форматируем размер файла
        const fileSize = formatFileSize(file.size);
        
        card.innerHTML = `
            <div class="file-icon">
                <i class="${iconClass}"></i>
            </div>
            <div class="file-info">
                <h4>${file.name}</h4>
                <p>${fileTypeText} • ${fileSize}</p>
            </div>
        `;
        
        card.addEventListener('click', () => openFile(file));
        
        return card;
    }
    
    /**
     * Открывает файл для просмотра
     */
    function openFile(file) {
        modalTitle.textContent = file.name;
        
        // Скрываем все вьюверы
        pdfViewer.style.display = 'none';
        imageViewer.style.display = 'none';
        unsupportedViewer.style.display = 'none';
        
        // Настраиваем ссылку для скачивания — удаляем лишний префикс `docs/`
        // если он случайно попал в `documents.json`, чтобы путь был
        // относительный от корня сайта.
        const fileUrl = encodeURI(file.path.replace(/^docs\//, ''));
        downloadLink.href = fileUrl;
        downloadLink.download = file.name;
        
        // В зависимости от типа файла показываем соответствующий вьювер
        if (file.type === 'pdf') {
            // Для PDF используем iframe
            pdfViewer.src = fileUrl;
            pdfViewer.style.display = 'block';
        } else if (file.type === 'image') {
            // Для изображений используем img
            imageViewer.src = fileUrl;
            imageViewer.alt = file.name;
            imageViewer.style.display = 'block';
        } else {
            // Для остальных файлов предлагаем скачать
            unsupportedViewer.style.display = 'block';
        }
        
        // Показываем модальное окно
        documentModal.style.display = 'flex';
        
        // Блокируем прокрутку основного контента
        document.body.style.overflow = 'hidden';
    }
    
    /**
     * Возвращает к списку папок
     */
    function goBackToFolders() {
        foldersList.style.display = 'grid';
        filesView.style.display = 'none';
        currentFolder = null;
    }
    
    /**
     * Форматирует размер файла в читаемый вид
     */
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Б';
        
        const k = 1024;
        const sizes = ['Б', 'КБ', 'МБ', 'ГБ'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }
    
    /**
     * Показывает сообщение об ошибке
     */
    function showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <p>${message}</p>
        `;
        
        // Вставляем в начало основного контента
        const main = document.querySelector('main');
        if (main.firstChild) {
            main.insertBefore(errorDiv, main.firstChild);
        } else {
            main.appendChild(errorDiv);
        }
        
        // Автоматически скрываем через 5 секунд
        setTimeout(() => {
            errorDiv.style.opacity = '0';
            setTimeout(() => {
                if (errorDiv.parentNode) {
                    errorDiv.parentNode.removeChild(errorDiv);
                }
            }, 300);
        }, 5000);
    }
    
    /**
     * Назначает обработчики событий
     */
    function setupEventListeners() {
        // Кнопка "Назад"
        backButton.addEventListener('click', goBackToFolders);
        
        // Закрытие модального окна
        closeModal.addEventListener('click', () => {
            documentModal.style.display = 'none';
            document.body.style.overflow = 'auto';
            
            // Очищаем вьюверы
            pdfViewer.src = '';
            imageViewer.src = '';
        });
        
        // Закрытие модального окна при клике на затемненную область
        documentModal.addEventListener('click', (e) => {
            if (e.target === documentModal) {
                documentModal.style.display = 'none';
                document.body.style.overflow = 'auto';
                
                // Очищаем вьюверы
                pdfViewer.src = '';
                imageViewer.src = '';
            }
        });
        
        // Закрытие модального окна по клавише Esc
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && documentModal.style.display === 'flex') {
                documentModal.style.display = 'none';
                document.body.style.overflow = 'auto';
                
                // Очищаем вьюверы
                pdfViewer.src = '';
                imageViewer.src = '';
            }
        });
        
        // Плавная прокрутка для навигационных ссылок
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
    
    // Добавляем стили для сообщений об ошибке
    const style = document.createElement('style');
    style.textContent = `
        .no-data {
            text-align: center;
            padding: 2rem;
            color: var(--gray-color);
            font-style: italic;
            grid-column: 1 / -1;
        }
        
        .error-message {
            background-color: #ffeaea;
            border-left: 4px solid #e74c3c;
            padding: 1rem;
            margin-bottom: 1.5rem;
            border-radius: var(--radius);
            display: flex;
            align-items: center;
            gap: 10px;
            animation: fadeIn 0.3s ease;
            transition: opacity 0.3s ease;
        }
        
        .error-message i {
            color: #e74c3c;
            font-size: 1.2rem;
        }
        
        .error-message p {
            margin: 0;
            color: #c0392b;
        }
    `;
    document.head.appendChild(style);
});
