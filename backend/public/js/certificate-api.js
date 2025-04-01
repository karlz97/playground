/**
 * Certificate Verification System API Connector
 * This script connects the existing HTML forms to the backend API.
 */

document.addEventListener('DOMContentLoaded', function() {
  // Check if we're on the index page (form submission)
  const iscrizioneform = document.querySelector('form[name="iscrizioneform"]');
  
  if (iscrizioneform) {
    // Override the form submission to use our API
    iscrizioneform.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Get form values
      const username = document.querySelector('input[name="username"]').value;
      const password = document.querySelector('input[name="password"]').value;
      const certificato = document.querySelector('input[name="certificato"]').value;
      
      // Validate form
      if (!username || !password || !certificato) {
        alert('Please fill in all fields');
        return;
      }
      
      // Send API request to verify certificate
      fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username,
          password,
          certificato
        })
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          // Store certificate data in session storage for result page
          sessionStorage.setItem('certificateData', JSON.stringify(data.certificate));
          
          // Redirect to result page
          window.location.href = 'result.html';
        } else {
          // Show error message
          alert('Certificate verification failed: ' + data.message);
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
      });
    });
  }
  
  // Check if we're on the result page
  const resultTable = document.querySelector('table[width="100%"]');
  
  if (resultTable) {
    // Get certificate data from session storage
    const certificateData = JSON.parse(sessionStorage.getItem('certificateData'));
    
    if (certificateData) {
      // Fill the result page with certificate data
      document.querySelector('td:contains("Cognome:")').nextElementSibling.textContent = certificateData.cognome;
      document.querySelector('td:contains("Nome:")').nextElementSibling.textContent = certificateData.nome;
      document.querySelector('td:contains("Data di nascita:")').nextElementSibling.textContent = certificateData.data_nascita;
      document.querySelector('td:contains("Luogo di nascita:")').nextElementSibling.textContent = certificateData.luogo_nascita;
      document.querySelector('td:contains("Nazione di nascita:")').nextElementSibling.textContent = certificateData.nazione_nascita;
      document.querySelector('td:contains("Matricola:")').nextElementSibling.textContent = certificateData.matricola;
      document.querySelector('td:contains("Data esame:")').nextElementSibling.textContent = certificateData.data_esame;
      document.querySelector('td:contains("Sede esame:")').nextElementSibling.textContent = certificateData.sede_esame;
      document.querySelector('td:contains("Livello:")').nextElementSibling.textContent = certificateData.livello;
      document.querySelector('td:contains("Risultato:")').nextElementSibling.textContent = certificateData.risultato;
    } else {
      // If no data is available, redirect back to the index page
      window.location.href = 'index.html';
    }
  }
});

// Custom jQuery-like selector for text content
Element.prototype.contains = function(text) {
  return this.textContent.includes(text);
};

// Add a selector to get elements by content
document.querySelector = (function(originalQuerySelector) {
  return function(selector) {
    // If the selector includes ":contains", use our custom method
    if (selector.includes(':contains(')) {
      const match = selector.match(/:contains\(["'](.+)["']\)/);
      if (match) {
        const textToMatch = match[1];
        const elemType = selector.split(':')[0];
        
        // Find all elements of this type
        const elements = document.querySelectorAll(elemType);
        
        // Filter to find the one containing the text
        for (let i = 0; i < elements.length; i++) {
          if (elements[i].textContent.includes(textToMatch)) {
            return elements[i];
          }
        }
        
        return null;
      }
    }
    
    // Otherwise use the original querySelector
    return originalQuerySelector.call(this, selector);
  };
})(document.querySelector); 