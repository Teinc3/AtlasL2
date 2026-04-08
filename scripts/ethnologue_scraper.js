// Vibecoded ethnologue DOM scraper
function scrapeLanguageDemographics(langPrefix = null) {
  // --- NEW: Extract language prefix from URL if not provided ---
  let prefix = langPrefix;
  if (!prefix) {
    const match = window.location.pathname.match(/\/language\/([a-z]{3})/i);
    if (match) {
      prefix = match[1].toLowerCase();
      console.log(`Auto-detected language prefix: ${prefix}`);
    } else {
      console.error("ERROR: Could not extract language prefix from URL. Please provide it manually.");
      return;
    }
  }

  const scrapedData = {};

  // --- 1. Intercept the Top-Level Primary Country Data ---
  const mainDescriptionList = document.querySelector('section#language-fields dl.description-list');
  if (mainDescriptionList) {
    const dtElements = mainDescriptionList.querySelectorAll('dt.entry__label');
    for (let dt of dtElements) {
      if (dt.textContent.toLowerCase().includes('population')) {
        const dd = dt.nextElementSibling;
        if (dd && dd.tagName.toLowerCase() === 'dd') {
          scrapedData['PRIMARY_COUNTRY_DATA'] = dd.textContent.replace(/\s+/g, ' ').trim();
          break;
        }
      }
    }
  } else {
    scrapedData['PRIMARY_COUNTRY_DATA'] = "ERROR: Main language-fields section not found.";
  }

  // --- 2. Loop through all secondary country panels ---
  const selector = `div.panel[role="region"][aria-labelledby^="29-${prefix}-"]`;
  const countryPanels = document.querySelectorAll(selector);

  if (countryPanels.length === 0) {
    console.warn(`No country panels found for prefix: ${prefix}.`);
  } else {
    countryPanels.forEach(panel => {
      const ariaLabel = panel.getAttribute('aria-labelledby');
      const parts = ariaLabel.split('-');
      const countryCode = parts[parts.length - 1].toUpperCase();

      // PATH A: Secondary "Also Spoken" structure
      const dlEntry = panel.querySelector('.contentInner > dl.entry');
      if (dlEntry) {
        const targetNodes = dlEntry.querySelectorAll('dd.entry__content--alsospoken');
        if (targetNodes.length >= 2) {
          scrapedData[countryCode] = targetNodes[1].textContent.replace(/\s+/g, ' ').trim();
          return; 
        } else if (targetNodes.length === 1) {
          scrapedData[countryCode] = "ERROR: Only one alsospoken node found. Raw: " + targetNodes[0].textContent.trim();
          return;
        }
      }

      // PATH B: Primary "Indigenous" structure inside a panel
      const dlDescriptionList = panel.querySelector('.contentInner section.language-fields dl.description-list');
      if (dlDescriptionList) {
        let foundPop = false;
        const dtElements = dlDescriptionList.querySelectorAll('dt.entry__label');
        for (let dt of dtElements) {
          if (dt.textContent.toLowerCase().includes('population')) {
            scrapedData[countryCode] = dt.nextElementSibling.textContent.replace(/\s+/g, ' ').trim();
            foundPop = true;
            break;
          }
        }
        
        if (!foundPop) {
          const ddElements = dlDescriptionList.querySelectorAll('dd.entry__content');
          for (let dd of ddElements) {
            const txt = dd.textContent.trim();
            if (/^[\d,]+\s+in/.test(txt) || txt.includes('all users') || txt.includes('L1 users')) {
              scrapedData[countryCode] = txt.replace(/\s+/g, ' ').trim();
              foundPop = true;
              break;
            }
          }
        }
        if (foundPop) return; 
      }

      scrapedData[countryCode] = "ERROR: Target nodes not found for either DOM structure.";
    });
  }

  // Stringify and copy to clipboard
  const finalJsonString = JSON.stringify(scrapedData, null, 2);
  copy(finalJsonString); 
  
  console.log(`Success: Scraped primary data + ${countryPanels.length} countries for '${prefix}'. JSON copied to clipboard.`);
}

// Execute without passing an argument to use the auto-detect feature
scrapeLanguageDemographics();