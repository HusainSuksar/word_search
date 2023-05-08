const uploadForm = document.getElementById('upload-form');
const message = document.getElementById('message');

uploadForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  
  const formData = new FormData(uploadForm);
  
  const response = await fetch('/upload', {
    method: 'POST',
    body: formData
  });
  
  const data = await response.json();
  
  message.textContent = data.message;
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

  const numPages = Math.ceil(results.length / PAGE_SIZE);

  for (let i = 1; i <= numPages; i++) {
    const button = document.createElement('button');
    button.textContent = i;
    if (i === currentPage) {
      button.classList.add('active');
    }
    button.addEventListener('click', async () => {
      currentPage = i;
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
    pagination.appendChild(button);
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
