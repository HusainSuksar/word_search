const uploadForm = document.getElementById('upload-form');
const message = document.getElementById('message');
const fileList = document.getElementById('file-list');
const loadingSpinner = document.getElementById('loading-spinner');

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


const searchForm = document.getElementById('search-form');
let resultsList = document.getElementById('results-list');
let pagination = document.getElementById('pagination');


searchForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  
  const query = document.getElementById('query').value;
  
  const response = await fetch(`/search?q=${query}`);
  
  const results = await response.json();
  if (!resultsList) {
    resultsList = document.getElementById('results-list');
  }
  
  if (!pagination) {
    pagination = document.getElementById('pagination');
  }
  
  resultsList.innerHTML = '';
  pagination.innerHTML = '';

  const PAGE_SIZE = 10; // Number of results to display per page
  let currentPage = 1; // Current page number

  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const paginatedResults = results.slice(startIndex, endIndex);

  paginatedResults.forEach((result) => {
    const listItem = document.createElement('li');
    
    const fileNameLine = document.createElement('div');
    fileNameLine.style.fontWeight = 'bold';

    const fileName = document.createElement('span');
    fileName.textContent = result.name; 
    fileNameLine.appendChild(fileName);

    const lineNumber = document.createElement('span');
    lineNumber.textContent = `Line ${result.lineNumber}: `;
    fileNameLine.appendChild(lineNumber);

    listItem.appendChild(fileNameLine);

    const content = document.createElement('span');
    content.textContent = result.content;
    listItem.appendChild(content);

    
    const highlightedContent = document.createElement('span');
    highlightedContent.innerHTML = content.innerHTML.replace(new RegExp(query, 'gi'), '<span class="highlight">$&</span>');
    listItem.replaceChild(highlightedContent, content);
    
    resultsList.appendChild(listItem);
  });

  const numPages = Math.ceil(results.length / PAGE_SIZE);
  const numButtonRows = Math.ceil(numPages / 10);

  for (let i = 1; i <= numButtonRows; i++) {
  const buttonRow = document.createElement('div');
  buttonRow.classList.add('button-row');
  pagination.appendChild(buttonRow);

  for (let j = (i - 1) * 10 + 1; j <= Math.min(i * 10, numPages); j++) {
    const button = document.createElement('button');
    button.textContent = j;
    if (j === currentPage) {
      button.classList.add('active');
    }
    button.addEventListener('click', async () => {
      currentPage = j;
      const startIndex = (currentPage - 1) * PAGE_SIZE;
      const endIndex = startIndex + PAGE_SIZE;
      const paginatedResults = results.slice(startIndex, endIndex);
      resultsList.innerHTML = '';
      paginatedResults.forEach((result) => {
        const listItem = document.createElement('li');
        
        const fileName = document.createElement('span');
        fileName.textContent = result.name;
        listItem.appendChild(fileName);
        
        const lineNumber = document.createElement('span');
        lineNumber.textContent = `Line ${result.lineNumber}: `;
        listItem.appendChild(lineNumber);
        
        const content = document.createElement('span');
        content.textContent = result.content;
        listItem.appendChild(content);
        
        const highlightedContent = document.createElement('span');
        highlightedContent.innerHTML = content.innerHTML.replace(new RegExp(query, 'gi'), '<span class="highlight">$&</span>');
        listItem.replaceChild(highlightedContent, content);
        
        resultsList.appendChild(listItem);
      });
      updatePaginationButtons();
    });
    buttonRow.appendChild(button);
  }
}

  function updatePaginationButtons() {
    const buttons = pagination.querySelectorAll('button');
    buttons.forEach((button, index) => {
      if (index === currentPage - 1) {
        button.classList.add('active');
      } else {
        button.classList.remove('active');
      }
    });
  }

  updatePaginationButtons();
});

const deleteButtons = document.querySelectorAll('.delete-button');

deleteButtons.forEach((button) => {
  button.addEventListener('click', (event) => {
    const filename = event.target.dataset.filename;
    fetch(`/delete/${filename}`, {
      method: 'DELETE',
    })
      .then((response) => {
        if (response.ok) {
          console.log('File deleted successfully');
          // Reload the page to update the file list
          location.reload();
        } else {
          console.error('Error deleting file');
        }
      })
      .catch((error) => {
        console.error(error);
      });
  });
});
