//search 
const searchInput = document.getElementById('search');
searchInput.addEventListener('input', searchSavedTexts);

// Function to refresh the list of saved texts
function refreshSavedTexts() {
  showSavedTexts();
}

// Function to save text to local storage or update if it already exists
function saveText() {
  const headingInput = document.getElementById('headingInput').value;
  const inputText = document.getElementById('textInput').value;
  const dueDate = document.getElementById('dueDateInput').value;
  const assignto = document.getElementById('assignto').value;
  const password = document.getElementById('passwordInput').value;

  if (headingInput.trim() === ''|| inputText.trim() === '' || dueDate.trim() === '' || assignto.trim() === '') {
    showMessage("All field are required!");
    return;
  }
  

  const savedTexts = JSON.parse(localStorage.getItem('savedTexts')) || [];
  const existingIndex = savedTexts.findIndex(textObj => textObj.heading == headingInput);

  // Get the current date and time
  const currentDate = new Date();
  const saveDate = currentDate.toLocaleString();

  if (existingIndex !== -1) {
    // If heading already exists, update the existing entry
    savedTexts[existingIndex] = { heading: headingInput, text: inputText, assignto: assignto, password: password, saveDate: saveDate, dueDate: dueDate };
  } else {
    // If heading doesn't exist, add a new entry
    savedTexts.push({ heading: headingInput, text: inputText, assignto: assignto, password: password, saveDate: saveDate, dueDate: dueDate, });
  }

  localStorage.setItem('savedTexts', JSON.stringify(savedTexts));

  showSavedTexts();
  showSuccessMessage("Text has been saved to the browser's local storage.");
  document.getElementById('headingInput').value = '';
  document.getElementById('textInput').value = '';
  document.getElementById('assignto').value = '';
  document.getElementById('passwordInput').value = '';
  document.getElementById('dueDateInput').value = '';
}



// Function to create a list item with "Show More" link and buttons for a saved text
function createSavedTextListItem(savedText) {
  if (!savedText || typeof savedText !== 'object') {
    return null;
  }

  const { heading, text, assignto, password, dueDate } = savedText;

  const listItem = document.createElement('li');
  listItem.className = 'list-group-item';

  // Set a random background color
  listItem.classList.add('task-highlight');
  listItem.style.backgroundColor = getRandomLightColor();

  const headingDiv = document.createElement('div');
  headingDiv.className = 'fw-bold';
  headingDiv.innerHTML = `<b>Task:</b> ` + heading;

  const textSpan = document.createElement('span');

  const dateSpan = document.createElement('span');
  dateSpan.className = 'text-muted';
  dateSpan.style.display = 'block';
  dateSpan.innerHTML  = `<b>Saved on</b>: ${savedText.saveDate}`; // Display the saved date and time


  if (password) {
    textSpan.textContent = 'XXXXXXXXXXXXXXX'; // Displaying XXXX for password-protected texts
    const eyeIcon = document.createElement('i');
    eyeIcon.className = 'fas fa-eye ml-2 text-primary ms-2';
    eyeIcon.style.cursor = 'pointer';
    eyeIcon.onclick = function () {
      if (prompt('Enter password to view the text:') === password) {
        textSpan.innerHTML = `<b>Desc:</b> ` + text;
        document.getElementById('downloadButton').style.display = 'block';
      } else {
        alert('Incorrect password. The text cannot be displayed.');
      }
    };
    headingDiv.appendChild(eyeIcon);
  } else {
    if (text.length > 100) {
      const shortenedText = text.substring(0, 100);
      textSpan.textContent = shortenedText + '... ';
      textSpan.style.display = "block";

      const showMoreLink = document.createElement('a');
      showMoreLink.href = '#';
      showMoreLink.textContent = 'Show More';
      showMoreLink.style.float = "right";
      showMoreLink.style.marginBottom = "10px";
      showMoreLink.onclick = function () {
        textSpan.innerHTML = `<b>Desc:</b> ` + text;
        listItem.appendChild(showLessLink);
        listItem.removeChild(showMoreLink);
      };

      const showLessLink = document.createElement('a');
      showLessLink.href = '#';
      showLessLink.textContent = 'Show Less';
      showLessLink.onclick = function () {
        textSpan.textContent = shortenedText + '... ';
        showMoreLink.style.float = "left";
        listItem.appendChild(showMoreLink);
        listItem.removeChild(showLessLink);
      };

      listItem.appendChild(showMoreLink);
    } else {
      textSpan.innerHTML = `<b>Desc:</b> ` + text;
    }
  }

  listItem.appendChild(headingDiv);
  listItem.appendChild(textSpan);
  listItem.appendChild(dateSpan); // Add the date span to the list item

  
  

  if (dueDate) {
    const dueDateSpan = document.createElement('span');
    dueDateSpan.className = 'text-muted';

    // Parse the due date as a Date object
    const dueDateObj = new Date(dueDate);

    // Format the due date as "YYYY-MM-DD"
    const formattedDueDate = formatDueDate(dueDateObj);

    dueDateSpan.innerHTML  = `<b>Due Date:</b> ${formattedDueDate}`;
    listItem.appendChild(dueDateSpan);
  }


  if (assignto) {
    const assigntoSpan = document.createElement('span');
    assigntoSpan.className = 'text-muted';
    assigntoSpan.style.display = 'block';
    assigntoSpan.innerHTML = '<b>Assign to:</b> '+ assignto;
    listItem.appendChild(assigntoSpan);
  }

  // Delete button
  const deleteButton = document.createElement('button');
  deleteButton.className = 'btn btn-danger btn-sm ms-2 float-end';
  deleteButton.innerHTML  = '<i class="fas fa-times-circle"></i> Delete';
  deleteButton.onclick = function () {
    deleteSavedText(heading, listItem);
  };

  // Edit button
  if (!password) {
    const editButton = document.createElement('button');
    editButton.className = 'btn btn-primary btn-sm ms-2 float-end';
    editButton.innerHTML = '<i class="fas fa-edit"></i> Edit';
    editButton.onclick = function () {
      document.documentElement.scrollTop = 0;
      editSavedText(heading, text, assignto, password, dueDate);
    };
    listItem.appendChild(editButton);
  }


  // Download button
  const downloadButton = document.createElement('button');
  downloadButton.id = 'downloadButton';
  downloadButton.className = 'btn btn-success btn-sm ms-2 float-end';
  downloadButton.innerHTML  = '<i class="fas fa-download"></i> Download';
  downloadButton.onclick = function () {
    downloadSingleText(heading, text, dueDate, assignto);
  };

  if (password) {
    downloadButton.style.display = 'none';
  }

  listItem.appendChild(deleteButton);
  listItem.appendChild(downloadButton);

  return listItem;
}

// Function to format the due date
function formatDueDate(dateTimeString) {
  const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
  const formattedDate = new Date(dateTimeString).toLocaleDateString('en-US', options);
  return `${formattedDate}`;
}

// Function to create a "Show Less" link for a saved text
function createShowLessLink(text) {
  const showLessLink = document.createElement('a');
  showLessLink.href = '#';
  showLessLink.textContent = 'Show Less';
  showLessLink.onclick = function () {
    textSpan.textContent = text.substring(0, 100) + '... ';
    listItem.appendChild(showMoreLink);
    listItem.removeChild(showLessLink);
  };
  return showLessLink;
}

// Function to edit a saved text
function editSavedText(heading, text, assignto, password, dueDate) {
  document.getElementById('headingInput').value = heading;
  document.getElementById('textInput').value = text;
  document.getElementById('assignto').value = assignto;
  document.getElementById('passwordInput').value = password || '';
  document.getElementById('dueDateInput').value = dueDate;

}

// Function to delete a saved text
function deleteSavedText(heading, listItem) {
  if (confirm('Are you sure you want to delete this Task?')) {
    const savedTexts = JSON.parse(localStorage.getItem('savedTexts')) || [];
    const index = savedTexts.findIndex(textObj => textObj.heading === heading);

    if (index !== -1) {
      savedTexts.splice(index, 1);
      localStorage.setItem('savedTexts', JSON.stringify(savedTexts));
      listItem.remove();
    }
  }
}

// Function to download a single text as a .txt file
function downloadSingleText(heading, text, exp, assign) {
  const element = document.createElement('a');
  const fileContent = `Task:${heading}\nDesc:${text}\nAssign:${assign}\nDue:${exp}`;
  const file = new Blob([fileContent], { type: 'text/plain' });
  element.href = URL.createObjectURL(file);
  element.download = 'saved_text.txt';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

// Function to display saved texts on the side
function showSavedTexts(pageNumber = 1, itemsPerPage = 5) {
  const savedTexts = JSON.parse(localStorage.getItem('savedTexts')) || [];
  const savedTextsList = document.getElementById('savedTexts');
  const pagination = document.getElementById('pagination');
  const messageDiv = document.getElementById('message');
  const recentlist = document.getElementById('recentlist');

  savedTextsList.innerHTML = '';
  pagination.innerHTML = '';

  // Check if savedTexts is not an array
  if (!Array.isArray(savedTexts) || savedTexts.length === 0) {
    // Display default message if there are no saved texts
    messageDiv.innerHTML = '<div class="alert alert-info">No saved Tasks found.</div>';
    recentlist.style.display = "none";
    return;
  } else {
    recentlist.style.display = "block";
  }


  const totalPages = Math.ceil(savedTexts.length / itemsPerPage);

  const startIndex = (pageNumber - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  for (let i = startIndex; i < endIndex && i < savedTexts.length; i++) {
    const listItem = createSavedTextListItem(savedTexts[i]);
    if (listItem) {
      savedTextsList.appendChild(listItem);
    }
  }

  // Create pagination buttons
  for (let i = 1; i <= totalPages; i++) {
    const pageButton = document.createElement('li');
    pageButton.className = 'page-item';
    pageButton.innerHTML = `<a class="page-link" href="#" onclick="showSavedTexts(${i}, ${itemsPerPage})">${i}</a>`;
    pagination.appendChild(pageButton);
  }
}

// Function to display messages
function showMessage(message) {
  const messageDiv = document.getElementById('message');
  messageDiv.innerHTML = `<div class="alert alert-danger">${message}</div>`;
}

function showSuccessMessage(message) {
  const messageDiv = document.getElementById('message');
  messageDiv.innerHTML = `<div class="alert alert-success">${message}</div>`;
}

// Show previously saved texts on page load
showSavedTexts();

// Function to perform a fuzzy search
function fuzzySearch(keyword, text) {
  // Lowercase the keyword and text for case-insensitive search
  keyword = keyword.toLowerCase();
  text = text.toLowerCase();

  // Split the text into words
  const textWords = text.split(' ');

  // Check if any word in the text contains the keyword
  for (const word of textWords) {
    if (word.includes(keyword)) {
      return true;
    }
  }

  return false;
}

// Function to search saved texts based on the input
function searchSavedTexts() {
  const searchKeyword = searchInput.value.toLowerCase();

  const savedTexts = JSON.parse(localStorage.getItem('savedTexts')) || [];

  // Filter saved texts based on the search keyword
  const results = savedTexts.filter((entry) => {
    const text = entry.text || '';
    return fuzzySearch(searchKeyword, text);
  });

  // Display the results
  document.getElementById('recentlist').style.display = 'block';
  showSearchResults(results);
}

// Function to display the search results
function showSearchResults(results) {
  const savedTextsList = document.getElementById('savedTexts');
  savedTextsList.innerHTML = ''; // Clear the existing list

  const pagination = document.getElementById('pagination');
  pagination.innerHTML = ''; // Clear the existing pagination

  const messageDiv = document.getElementById('message');
  messageDiv.innerHTML = ''; // Clear the existing message

  if (results.length === 0) {
    showMessage("No matching texts found.");
    document.getElementById('recentlist').style.display = 'none';

  } else {
    for (let i = 0; i < results.length; i++) {
      const listItem = createSavedTextListItem(results[i]);
      if (listItem) {
        savedTextsList.appendChild(listItem);
      }
    }
  }
}
//Generate random light RBG color
function getRandomLightColor() {
  const randomChannel = () => Math.floor(Math.random() * 156 + 100); // Generates a value between 100 and 255 for R, G, and B channels
  const r = randomChannel();
  const g = randomChannel();
  const b = randomChannel();
  return `rgb(${r}, ${g}, ${b})`;
}