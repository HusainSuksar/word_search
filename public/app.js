const uploadForm = document.getElementById('upload-form');
const message = document.getElementById('message');
const fileList = document.getElementById('file-list');
const loadingSpinner = document.getElementById('loading-spinner');
const searchForm = document.getElementById('search-form');
let resultsList = document.getElementById('results-list');
let pagination = document.getElementById('pagination');

uploadForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const formData = new FormData(uploadForm);
    
    const response = await fetch('/upload', {
        method: 'POST',
        body: formData
    });
    
    const data = await response.json();
    
    message.textContent = data.message;
    
    // Add uploaded files to the list
    if (data.fileNames) {
        data.fileNames.forEach((fileName) => {
            const listItem = document.createElement('li');
            const fileNameSpan = document.createElement('span');
            fileNameSpan.textContent = fileName;
            listItem.appendChild(fileNameSpan);
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.addEventListener('click', async () => {
                try {
                    loadingSpinner.style.display = 'block';
                    const response = await fetch(`/delete/${fileName}`, {
                        method: 'DELETE'
                    });
                    const message = await response.text();
                    console.log(message);
                    listItem.remove();
                } catch (error) {
                    console.error(error);
                    alert('Error deleting file');
                } finally {
                    loadingSpinner.style.display = 'none';
                }
            });
            listItem.appendChild(deleteButton);
            fileList.appendChild(listItem);
        });
    }
});

const MAX_BUTTONS_DISPLAYED = 3; // Number of pagination buttons to display before using "..."

searchForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const query = document.getElementById('query').value;
    loadingSpinner.style.display = 'block';
    const response = await fetch(`/search?q=${query}`);
    
    const results = await response.json();
    loadingSpinner.style.display = 'none';
    
    resultsList.innerHTML = '';
    pagination.innerHTML = '';

    const PAGE_SIZE = 10; // Number of results to display per page
    let currentPage = 1; // Current page number
    const numPages = Math.ceil(results.length / PAGE_SIZE); // Calculate the total number of pages


    function renderPaginationButtons(start, end) {
        pagination.innerHTML = ''; // Clear existing buttons

        for (let i = start; i <= end; i++) {
            const button = document.createElement('button');
            button.textContent = i;
            if (i === currentPage) {
                button.classList.add('active');
            }
            button.addEventListener('click', () => {
                currentPage = i;
                updateResults();
                updatePaginationButtons();
            });
            pagination.appendChild(button);
        }

        if (end < numPages) {
            const dots = document.createElement('span');
            dots.textContent = '...';
            pagination.appendChild(dots);

            const lastPageButton = document.createElement('button');
            lastPageButton.textContent = numPages;
            lastPageButton.addEventListener('click', () => {
                currentPage = numPages;
                updateResults();
                updatePaginationButtons();
            });
            pagination.appendChild(lastPageButton);

            const nextButton = document.createElement('button');
            nextButton.textContent = '>';
            nextButton.addEventListener('click', () => {
                renderPaginationButtons(start + MAX_BUTTONS_DISPLAYED, Math.min(end + MAX_BUTTONS_DISPLAYED, numPages - 1));
            });
            pagination.appendChild(nextButton);
        }
    }

    function updateResults() {
        const startIndex = (currentPage - 1) * PAGE_SIZE;
        const endIndex = startIndex + PAGE_SIZE;
        const paginatedResults = results.slice(startIndex, endIndex);
        resultsList.innerHTML = ''; // Clear existing results
    
        paginatedResults.forEach((result) => {
            const listItem = document.createElement('li');
            listItem.classList.add('search-result-item');
    
            const fileName = document.createElement('div');
            fileName.classList.add('file-name');
            fileName.textContent = `File: ${result.name}`;
            listItem.appendChild(fileName);
    
            const lineNumber = document.createElement('div');
            lineNumber.classList.add('line-number');
            lineNumber.textContent = `Line ${result.lineNumber}:`;
            listItem.appendChild(lineNumber);
    
            const content = document.createElement('div');
            content.classList.add('content');
            content.textContent = result.content;
            listItem.appendChild(content);
    
            // Highlight search query in the content
            const highlightedContent = document.createElement('div');
            highlightedContent.classList.add('highlighted-content');
            highlightedContent.innerHTML = result.content.replace(new RegExp(query, 'gi'), match => `<span class="highlight">${match}</span>`);
            listItem.appendChild(highlightedContent);
    
            resultsList.appendChild(listItem);
        });
    }
    
  

    function updatePaginationButtons() {
        const start = Math.max(1, currentPage - Math.floor(MAX_BUTTONS_DISPLAYED / 2));
        const end = Math.min(start + MAX_BUTTONS_DISPLAYED - 1, numPages - 1);
        renderPaginationButtons(start, end);
    }
    updateResults();
    updatePaginationButtons();
});

// Toggle Navbar
document.getElementById('toggle-navbar').addEventListener('click', () => {
    const navbar = document.getElementById('navbar');
    if (navbar.style.display === 'none') {
        navbar.style.display = 'block';
    } else {
        navbar.style.display = 'none';
    }
});

// Fetch the list of uploaded files and display them in the navbar
async function fetchUploadedFiles() {
    const response = await fetch('/uploaded-files');
    const files = await response.json();
    const filesList = document.getElementById('uploaded-files-list');
    filesList.innerHTML = ''; // Clear the list
    files.forEach(file => {
        const listItem = document.createElement('li');
        listItem.textContent = file;
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.className = 'delete-file-btn';
        deleteBtn.addEventListener('click', async () => {
            const deleteResponse = await fetch(`/delete/${file}`, {
                method: 'DELETE'
            });
            if (deleteResponse.ok) {
                listItem.remove();
            } else {
                alert('Error deleting file');
            }
        });
        listItem.appendChild(deleteBtn);
        filesList.appendChild(listItem);
    });
}

// Call the function to fetch and display the uploaded files
fetchUploadedFiles();
